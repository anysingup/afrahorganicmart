import { siteConfig } from '@/lib/data';

export default function RefundPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="prose lg:prose-lg mx-auto">
        <h1 className="font-headline text-4xl font-bold">Refund & Return Policy</h1>
        <p className="lead">We strive to ensure our customers are 100% satisfied with their purchase. If you have any issues with your order, please contact us immediately.</p>

        <h2>1. Returns</h2>
        <p>We have a 7-day return policy, which means you have 7 days after receiving your item to request a return. To be eligible for a return, your item must be in the same condition that you received it, unused, and in its original packaging. You’ll also need the receipt or proof of purchase.</p>
        <p>To start a return, you can contact us at {siteConfig.email}. If your return is accepted, we’ll send you instructions on how and where to send your package.</p>
        
        <h2>2. Damages and Issues</h2>
        <p>Please inspect your order upon reception and contact us immediately if the item is defective, damaged or if you receive the wrong item, so that we can evaluate the issue and make it right.</p>

        <h2>3. Exceptions / Non-returnable items</h2>
        <p>Certain types of items cannot be returned, like perishable goods (such as food, flowers, or plants). Please get in touch if you have questions or concerns about your specific item.</p>

        <h2>4. Refunds</h2>
        <p>We will notify you once we’ve received and inspected your return, and let you know if the refund was approved or not. If approved, you’ll be automatically refunded on your original payment method or through a suitable alternative. Please remember it can take some time for your bank or credit card company to process and post the refund too.</p>

        <h2>Contact Us</h2>
        <p>For any questions regarding our refund and return policy, please contact us at {siteConfig.email}.</p>
      </div>
    </div>
  );
}
