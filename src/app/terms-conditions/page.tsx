import { siteConfig } from '@/lib/data';

export default function TermsAndConditionsPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="prose lg:prose-lg mx-auto">
        <h1 className="font-headline text-4xl font-bold">Terms & Conditions</h1>
        <p className="lead">Please read these terms and conditions carefully before using our website.</p>

        <h2>1. Introduction</h2>
        <p>These Website Standard Terms and Conditions written on this webpage shall manage your use of our website, {siteConfig.name}, accessible at [your website URL].</p>

        <h2>2. Intellectual Property Rights</h2>
        <p>Other than the content you own, under these Terms, {siteConfig.name} and/or its licensors own all the intellectual property rights and materials contained in this Website.</p>

        <h2>3. Restrictions</h2>
        <p>You are specifically restricted from all of the following:</p>
        <ul>
          <li>publishing any Website material in any other media;</li>
          <li>selling, sublicensing and/or otherwise commercializing any Website material;</li>
          <li>publicly performing and/or showing any Website material;</li>
          <li>using this Website in any way that is or may be damaging to this Website;</li>
          <li>using this Website contrary to applicable laws and regulations, or in any way may cause harm to the Website, or to any person or business entity;</li>
        </ul>

        <h2>4. Your Content</h2>
        <p>In these Website Standard Terms and Conditions, “Your Content” shall mean any audio, video text, images or other material you choose to display on this Website. By displaying Your Content, you grant {siteConfig.name} a non-exclusive, worldwide irrevocable, sub-licensable license to use, reproduce, adapt, publish, translate and distribute it in any and all media.</p>
        
        <h2>5. Limitation of liability</h2>
        <p>In no event shall {siteConfig.name}, nor any of its officers, directors and employees, shall be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract. {siteConfig.name}, including its officers, directors and employees shall not be held liable for any indirect, consequential or special liability arising out of or in any way related to your use of this Website.</p>

        <h2>6. Governing Law & Jurisdiction</h2>
        <p>These Terms will be governed by and interpreted in accordance with the laws of Bangladesh, and you submit to the non-exclusive jurisdiction of the state and federal courts located in Bangladesh for the resolution of any disputes.</p>
      </div>
    </div>
  );
}
