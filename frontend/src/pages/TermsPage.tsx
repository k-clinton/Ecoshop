import { useSettings } from '@/store/SettingsContext'

export function TermsPage() {
  const { settings } = useSettings()

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Terms of Service
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Last updated: January 1, 2024
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16 md:py-24">
        <div className="container-wide max-w-4xl mx-auto prose prose-lg">
          <div className="space-y-8 text-muted-foreground">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Agreement to Terms</h2>
              <p>
                These Terms of Service constitute a legally binding agreement between you and {settings?.site_name || 'EcoShop'} 
                regarding your use of our website and services. By accessing or using our website, you agree to be bound by these terms.
              </p>
              <p>
                If you do not agree with these terms, you must not access or use our website.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Use of Our Website</h2>
              
              <h3 className="font-semibold text-lg text-foreground mb-2">Eligibility</h3>
              <p>
                By using our website, you represent and warrant that you are at least 18 years of age and have the legal 
                capacity to enter into these Terms. If you are under 18, you may only use our website with the involvement 
                of a parent or guardian.
              </p>

              <h3 className="font-semibold text-lg text-foreground mb-2 mt-6">Account Registration</h3>
              <p>To access certain features, you may be required to create an account. When creating an account, you must:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Maintain the security of your password</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>

              <h3 className="font-semibold text-lg text-foreground mb-2 mt-6">Prohibited Activities</h3>
              <p>You may not access or use our website for any purpose other than that for which we make it available. Prohibited uses include:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Using the website in any way that violates applicable laws or regulations</li>
                <li>Engaging in unauthorized framing of or linking to the website</li>
                <li>Uploading or transmitting viruses, malware, or any other malicious code</li>
                <li>Attempting to bypass any security measures</li>
                <li>Engaging in any automated use of the system (bots, scrapers, etc.)</li>
                <li>Interfering with or disrupting the website or servers</li>
                <li>Impersonating another person or entity</li>
                <li>Harassing, annoying, or intimidating other users</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Purchases and Payment</h2>
              
              <h3 className="font-semibold text-lg text-foreground mb-2">Product Information</h3>
              <p>
                We strive to provide accurate product descriptions, pricing, and availability information. However, we do 
                not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free.
              </p>

              <h3 className="font-semibold text-lg text-foreground mb-2 mt-4">Pricing</h3>
              <p>
                All prices are in USD unless otherwise stated and are subject to change without notice. We reserve the right 
                to correct any pricing errors on our website and to cancel orders containing pricing errors, even after an 
                order confirmation has been sent.
              </p>

              <h3 className="font-semibold text-lg text-foreground mb-2 mt-4">Payment</h3>
              <p>
                We accept various payment methods as indicated on our website. By providing payment information, you represent 
                and warrant that you are authorized to use the payment method. You agree to pay all charges incurred by you or 
                on your behalf through the website, at the prices in effect when such charges are incurred.
              </p>

              <h3 className="font-semibold text-lg text-foreground mb-2 mt-4">Order Acceptance</h3>
              <p>
                We reserve the right to refuse or cancel any order for any reason, including limitations on quantities available 
                for purchase, inaccuracies in product or pricing information, or problems identified by our fraud detection systems.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Shipping and Returns</h2>
              <p>
                Our shipping and return policies are detailed on our <a href="/shipping" className="text-primary hover:underline">Shipping & Returns</a> page. 
                By making a purchase, you agree to these policies.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Intellectual Property Rights</h2>
              <p>
                The website and its entire contents, features, and functionality (including but not limited to all information, 
                software, text, displays, images, video, and audio) are owned by {settings?.site_name || 'EcoShop'}, its licensors, 
                or other providers of such material and are protected by copyright, trademark, patent, trade secret, and other 
                intellectual property laws.
              </p>
              <p>
                You may not reproduce, distribute, modify, create derivative works of, publicly display, or exploit any of our 
                content without our express written permission.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">User-Generated Content</h2>
              <p>
                Our website may allow you to post reviews, comments, and other content. By posting content, you grant us a 
                non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and display such content.
              </p>
              <p>You represent and warrant that:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You own or have the necessary rights to post the content</li>
                <li>The content does not violate any third-party rights</li>
                <li>The content is not defamatory, obscene, or otherwise objectionable</li>
              </ul>
              <p className="mt-4">
                We reserve the right to remove any content that violates these Terms or that we find objectionable.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Disclaimer of Warranties</h2>
              <p>
                THE WEBSITE AND ALL CONTENT, PRODUCTS, AND SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS 
                WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF 
                MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>
              <p>
                We do not warrant that the website will be uninterrupted, error-free, or free from viruses or other harmful components.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Limitation of Liability</h2>
              <p>
                TO THE FULLEST EXTENT PERMITTED BY LAW, {settings?.site_name || 'ECOSHOP'} SHALL NOT BE LIABLE FOR ANY 
                INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, 
                WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
              <p>
                IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL DAMAGES EXCEED THE AMOUNT YOU PAID TO US IN THE 
                TWELVE (12) MONTHS PRIOR TO THE EVENT GIVING RISE TO THE LIABILITY.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless {settings?.site_name || 'EcoShop'} and its officers, 
                directors, employees, and agents from any claims, liabilities, damages, losses, and expenses (including 
                reasonable attorneys' fees) arising out of or in any way connected with:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your access to or use of the website</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
                <li>Any content you post on the website</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Governing Law and Dispute Resolution</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the United States, without 
                regard to its conflict of law provisions.
              </p>
              <p>
                Any disputes arising out of or relating to these Terms or your use of the website shall be resolved through 
                binding arbitration, except that either party may seek injunctive relief in court for any actual or threatened 
                infringement of intellectual property rights.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Termination</h2>
              <p>
                We may terminate or suspend your account and access to the website immediately, without prior notice or liability, 
                for any reason, including if you breach these Terms.
              </p>
              <p>
                Upon termination, your right to use the website will immediately cease. All provisions of these Terms that by 
                their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, 
                and limitations of liability.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new 
                Terms on this page and updating the "Last updated" date. Your continued use of the website after such changes 
                constitutes your acceptance of the new Terms.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Severability</h2>
              <p>
                If any provision of these Terms is held to be invalid or unenforceable, such provision shall be struck and the 
                remaining provisions shall remain in full force and effect.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Entire Agreement</h2>
              <p>
                These Terms, together with our Privacy Policy and any other legal notices published by us on the website, 
                constitute the entire agreement between you and {settings?.site_name || 'EcoShop'} regarding your use of the website.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Contact Information</h2>
              <p>If you have any questions about these Terms, please contact us:</p>
              <ul className="list-none pl-0 space-y-2 mt-4">
                <li>Email: {settings?.contact_email || 'legal@ecoshop.com'}</li>
                <li>Phone: +1 (555) 123-4567</li>
                <li>Address: 123 Eco Street, Green City, GC 12345, United States</li>
              </ul>
            </div>

            <div className="mt-12 p-6 bg-secondary/30 rounded-lg">
              <p className="text-sm">
                By using our website, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
