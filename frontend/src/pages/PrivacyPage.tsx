import { useSettings } from '@/store/SettingsContext'

export function PrivacyPage() {
  const { settings } = useSettings()

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Privacy Policy
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Last updated: January 1, 2024
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-16 md:py-24">
        <div className="container-wide max-w-4xl mx-auto prose prose-lg">
          <div className="space-y-8 text-muted-foreground">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Introduction</h2>
              <p>
                At {settings?.site_name || 'EcoShop'}, we take your privacy seriously. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you visit our 
                website and use our services.
              </p>
              <p>
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy 
                policy, please do not access the site.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Information We Collect</h2>
              
              <h3 className="font-semibold text-lg text-foreground mb-2">Personal Information</h3>
              <p>We may collect personal information that you voluntarily provide to us when you:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Register for an account</li>
                <li>Make a purchase</li>
                <li>Subscribe to our newsletter</li>
                <li>Contact customer support</li>
                <li>Participate in surveys or promotions</li>
              </ul>
              <p>This information may include:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name</li>
                <li>Email address</li>
                <li>Mailing address</li>
                <li>Phone number</li>
                <li>Payment information</li>
                <li>Order history</li>
              </ul>

              <h3 className="font-semibold text-lg text-foreground mb-2 mt-6">Automatically Collected Information</h3>
              <p>When you visit our website, we automatically collect certain information about your device, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>IP address</li>
                <li>Browser type</li>
                <li>Operating system</li>
                <li>Access times</li>
                <li>Pages viewed</li>
                <li>Referring website addresses</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process and fulfill your orders</li>
                <li>Send order confirmations and shipping updates</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Improve our website and services</li>
                <li>Detect and prevent fraud</li>
                <li>Comply with legal obligations</li>
                <li>Analyze website usage and trends</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Sharing Your Information</h2>
              <p>We may share your information with:</p>
              
              <h3 className="font-semibold text-lg text-foreground mb-2">Service Providers</h3>
              <p>
                We work with third-party service providers who perform services on our behalf, such as payment 
                processing, shipping, email delivery, and analytics. These providers have access to your 
                information only to perform specific tasks and are obligated to protect your data.
              </p>

              <h3 className="font-semibold text-lg text-foreground mb-2 mt-4">Legal Requirements</h3>
              <p>
                We may disclose your information if required to do so by law or in response to valid requests 
                by public authorities (e.g., a court or government agency).
              </p>

              <h3 className="font-semibold text-lg text-foreground mb-2 mt-4">Business Transfers</h3>
              <p>
                If we are involved in a merger, acquisition, or sale of assets, your information may be 
                transferred as part of that transaction.
              </p>

              <p className="mt-4">
                <strong>We do not sell or rent your personal information to third parties.</strong>
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar tracking technologies to track activity on our website and store 
                certain information. Cookies are files with a small amount of data that are sent to your browser 
                and stored on your device.
              </p>
              <p>You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.</p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Data Security</h2>
              <p>
                We implement appropriate technical and organizational security measures to protect your personal 
                information. However, no method of transmission over the Internet or electronic storage is 100% 
                secure. While we strive to use commercially acceptable means to protect your information, we 
                cannot guarantee its absolute security.
              </p>
              <p>Your account is protected by a password. It is important that you protect against unauthorized access by choosing a strong password and keeping it confidential.</p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Your Privacy Rights</h2>
              <p>Depending on your location, you may have certain rights regarding your personal information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Object:</strong> Object to certain processing of your information</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us at {settings?.contact_email || 'privacy@ecoshop.com'}. 
                We will respond to your request within 30 days.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Children's Privacy</h2>
              <p>
                Our website is not intended for children under 13 years of age. We do not knowingly collect 
                personal information from children under 13. If you become aware that a child has provided us 
                with personal information, please contact us.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Third-Party Links</h2>
              <p>
                Our website may contain links to third-party websites. We are not responsible for the privacy 
                practices of these websites. We encourage you to read the privacy policies of any third-party 
                sites you visit.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">International Data Transfers</h2>
              <p>
                Your information may be transferred to and maintained on computers located outside of your state, 
                province, country, or other governmental jurisdiction where data protection laws may differ. 
                We take steps to ensure that your data is treated securely and in accordance with this Privacy Policy.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
                the new Privacy Policy on this page and updating the "Last updated" date. You are advised to 
                review this Privacy Policy periodically for any changes.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Contact Us</h2>
              <p>If you have questions about this Privacy Policy, please contact us:</p>
              <ul className="list-none pl-0 space-y-2 mt-4">
                <li>Email: {settings?.contact_email || 'privacy@ecoshop.com'}</li>
                <li>Phone: +1 (555) 123-4567</li>
                <li>Address: 123 Eco Street, Green City, GC 12345, United States</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
