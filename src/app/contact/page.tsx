'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, Mail, MapPin, Phone, Send } from 'lucide-react';

import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { siteConfig } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().optional(),
  subject: z.string().min(5, { message: 'Subject must be at least 5 characters.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});


export default function ContactPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: '',
        },
    });

    async function onSubmit(data: z.infer<typeof formSchema>) {
        if (!firestore) {
            toast({
                variant: 'destructive',
                title: 'Database service not available.',
            });
            return;
        }
        setIsSubmitting(true);

        const contactMessage = {
            ...data,
            createdAt: serverTimestamp(),
        };

        const contactsCollection = collection(firestore, 'contacts');

        addDoc(contactsCollection, contactMessage)
            .then(() => {
                toast({
                    title: 'Message Sent!',
                    description: "Thank you for reaching out. We'll get back to you soon.",
                });
                form.reset();
            })
            .catch((e) => {
                 const permissionError = new FirestorePermissionError({
                    path: 'contacts',
                    operation: 'create',
                    requestResourceData: contactMessage,
                });
                errorEmitter.emit('permission-error', permissionError);
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    }

    return (
        <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="text-center mb-12">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Get in Touch</h1>
                <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
                    Have a question, feedback, or just want to say hello? We'd love to hear from you.
                    Fill out the form below or use our contact details.
                </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-start">
                {/* Contact Form */}
                <Card>
                    <CardContent className="p-6 md:p-8">
                        <h2 className="text-2xl font-bold font-headline mb-6">Send Us a Message</h2>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl><Input placeholder="Your Name" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Address</FormLabel>
                                            <FormControl><Input type="email" placeholder="your.email@example.com" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number (Optional)</FormLabel>
                                        <FormControl><Input placeholder="Your Phone Number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="subject"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subject</FormLabel>
                                        <FormControl><Input placeholder="What's this about?" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="message"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Your Message</FormLabel>
                                        <FormControl><Textarea placeholder="Write your message here..." {...field} rows={5} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...</>
                                    ) : (
                                        <><Send className="mr-2 h-5 w-5" /> Send Message</>
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {/* Contact Info */}
                <div className="space-y-8">
                     <div className="p-6 rounded-lg bg-card border">
                        <h3 className="font-headline text-2xl font-bold mb-4">Contact Information</h3>
                        <ul className="space-y-4 text-muted-foreground">
                            <li className="flex items-start">
                                <MapPin className="h-5 w-5 mr-4 mt-1 shrink-0 text-primary" />
                                <span>{siteConfig.address}</span>
                            </li>
                            <li className="flex items-center">
                                <Phone className="h-5 w-5 mr-4 shrink-0 text-primary" />
                                <a href={`tel:${siteConfig.phone}`} className="hover:text-primary transition-colors">{siteConfig.phone}</a>
                            </li>
                            <li className="flex items-center">
                                <Mail className="h-5 w-5 mr-4 shrink-0 text-primary" />
                                <a href={`mailto:${siteConfig.email}`} className="hover:text-primary transition-colors">{siteConfig.email}</a>
                            </li>
                        </ul>
                     </div>
                     <div className="relative h-64 w-full rounded-lg overflow-hidden border">
                         <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d116834.01522851838!2d90.33294814330107!3d23.78077774457497!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8b087026b81%3A0x8fa563bbdd5904c2!2sDhaka!5e0!3m2!1sen!2sbd!4v1700000000000"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen={false}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Dhaka Map"
                        ></iframe>
                     </div>
                </div>
            </div>
        </div>
    );
}
