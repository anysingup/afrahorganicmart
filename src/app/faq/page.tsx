'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
    {
        question: "Are your products 100% organic?",
        answer: "Yes, all our products are sourced from certified organic farms and trusted suppliers. We are committed to providing only the purest and most natural products to our customers."
    },
    {
        question: "What is your delivery process?",
        answer: "We offer fast and reliable delivery across Bangladesh. Once you place an order, we process it within 24 hours and our delivery partner ensures it reaches you as quickly as possible, typically within 2-5 business days depending on your location."
    },
    {
        question: "What is your return policy?",
        answer: "We have a customer-friendly return policy. If you are not satisfied with the quality of a product or if it's damaged, you can return it within 7 days of delivery. Please visit our Refund & Return Policy page for more details."
    },
    {
        question: "How can I pay for my order?",
        answer: "We offer multiple payment options for your convenience, including Cash on Delivery (COD) and mobile banking services like bKash, Nagad, and Rocket."
    },
    {
        question: "How do I store the products to maintain freshness?",
        answer: "Each product comes with storage instructions. Generally, we recommend storing dry items like dates, nuts, and seeds in a cool, dry place in an airtight container. Perishable items should be refrigerated."
    }
]

export default function FaqPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Frequently Asked Questions</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
          Have questions? We've got answers. If you can't find what you're looking for, feel free to contact us.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-left font-semibold text-lg">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
      </div>

    </div>
  );
}
