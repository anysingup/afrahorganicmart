'use client';

import { useState } from 'react';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { Loader2, Trash2, User, Mail, Phone, MessageSquare } from 'lucide-react';

import { useFirestore, useCollection } from '@/firebase';
import type { ContactMessage } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button, buttonVariants } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


export default function MessagesPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const messagesCollection = firestore ? collection(firestore, 'contacts') : null;
  const { data: messages, loading } = useCollection<ContactMessage>(messagesCollection);

  const [messageToDelete, setMessageToDelete] = useState<ContactMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteMessage = async () => {
    if (!firestore || !messageToDelete) return;

    setIsDeleting(true);
    const messageRef = doc(firestore, 'contacts', messageToDelete.id);

    deleteDoc(messageRef)
      .then(() => {
        toast({
          title: 'Message Deleted',
          description: `The message from "${messageToDelete.name}" has been deleted.`,
        });
        setMessageToDelete(null);
      })
      .catch((e) => {
         const permissionError = new FirestorePermissionError({
            path: messageRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
          <CardDescription>Messages from your website contact form.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {!loading && messages && messages.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {[...messages].sort((a, b) => b.createdAt.seconds - a.createdAt.seconds).map((message) => (
                <AccordionItem value={message.id} key={message.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex justify-between items-center w-full pr-4">
                        <div className="flex flex-col text-left">
                            <span className="font-semibold">{message.subject}</span>
                            <span className="text-sm text-muted-foreground">from: {message.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {message.createdAt?.seconds ? format(new Date(message.createdAt.seconds * 1000), 'PP') : 'N/A'}
                        </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 bg-muted/50 rounded-md">
                     <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground"/> <strong>Name:</strong> {message.name}
                        </div>
                         <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground"/> <strong>Email:</strong> 
                            <a href={`mailto:${message.email}`} className="text-primary hover:underline">{message.email}</a>
                        </div>
                        {message.phone && (
                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground"/> <strong>Phone:</strong> {message.phone}
                            </div>
                        )}
                        <div className="flex items-start gap-2 pt-2">
                             <MessageSquare className="h-4 w-4 mt-1 text-muted-foreground"/>
                             <p className="whitespace-pre-wrap flex-1">{message.message}</p>
                        </div>
                     </div>
                     <div className="text-right mt-4">
                        <Button variant="destructive" size="sm" onClick={() => setMessageToDelete(message)}>
                            <Trash2 className="mr-2 h-4 w-4"/> Delete
                        </Button>
                     </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            !loading && (
               <div className="text-center py-12 text-muted-foreground">
                    You have no new messages.
               </div>
            )
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!messageToDelete} onOpenChange={(open) => !open && setMessageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this message?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the message from
              <span className="font-semibold"> {messageToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMessage} disabled={isDeleting} className={buttonVariants({ variant: "destructive" })}>
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
