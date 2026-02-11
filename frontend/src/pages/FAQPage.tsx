import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useSettings } from '@/store/SettingsContext'

interface FAQItem {
  question: string
  answer: string
  category: string
}

export function FAQPage() {
  const { settings } = useSettings()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs: FAQItem[] = [
    {
      category: 'Orders & Shipping',
      question: 'How long does shipping take?',
      answer: 'Standard shipping typically takes 3-5 business days within the continental US. Express shipping (1-2 business days) is also available at checkout. International shipping times vary by destination, typically 7-14 business days.'
    },
    {
      category: 'Orders & Shipping',
      question: 'Do you ship internationally?',
      answer: 'Yes! We ship to most countries worldwide. Shipping costs and delivery times vary by location. International customers are responsible for any customs duties or import taxes.'
    },
    {
      category: 'Orders & Shipping',
      question: 'Is your shipping really carbon neutral?',
      answer: 'Absolutely. We offset 100% of our shipping emissions through verified carbon reduction projects. This includes reforestation initiatives and renewable energy programs. You can learn more on our Sustainability page.'
    },
    {
      category: 'Orders & Shipping',
      question: 'Can I track my order?',
      answer: 'Yes! Once your order ships, you\'ll receive a tracking number via email. You can also view your order status by logging into your account and visiting the Orders page.'
    },
    {
      category: 'Returns & Exchanges',
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for most items. Products must be unused, in original packaging, and in resalable condition. Some items (personal care, perishables) are final sale for hygiene reasons.'
    },
    {
      category: 'Returns & Exchanges',
      question: 'How do I return an item?',
      answer: 'Log into your account, go to your order history, and select "Request Return" for the item you\'d like to return. We\'ll provide you with a prepaid return label and instructions.'
    },
    {
      category: 'Returns & Exchanges',
      question: 'When will I receive my refund?',
      answer: 'Refunds are processed within 5-7 business days of receiving your return. The refund will be issued to your original payment method. Please allow an additional 3-5 business days for the credit to appear.'
    },
    {
      category: 'Products',
      question: 'How do you verify products are sustainable?',
      answer: 'We have a rigorous vetting process that examines materials, production methods, labor practices, and environmental impact. We look for certifications (B Corp, Fair Trade, etc.) and work directly with brands to verify their claims.'
    },
    {
      category: 'Products',
      question: 'Are all products eco-friendly?',
      answer: 'Yes! Every product in our store meets our sustainability standards. This includes considerations for materials, manufacturing, packaging, and end-of-life disposal or recyclability.'
    },
    {
      category: 'Products',
      question: 'Do you have a product suggestion program?',
      answer: 'We love hearing from our community! If you know of a sustainable brand or product we should carry, please contact us through our Contact page with your suggestion.'
    },
    {
      category: 'Account & Payment',
      question: 'Do I need an account to place an order?',
      answer: 'No, you can checkout as a guest. However, creating an account allows you to track orders, save addresses, view order history, and receive exclusive offers.'
    },
    {
      category: 'Account & Payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, Apple Pay, and Google Pay. All transactions are secure and encrypted.'
    },
    {
      category: 'Account & Payment',
      question: 'Is my payment information secure?',
      answer: 'Yes! We use industry-standard SSL encryption to protect your payment information. We never store your complete credit card details on our servers.'
    },
    {
      category: 'Sustainability',
      question: 'What makes your packaging sustainable?',
      answer: 'All our packaging is 100% plastic-free, made from recycled and/or biodegradable materials. This includes boxes, mailers, tape, and protective materials. Everything can be recycled or composted.'
    },
    {
      category: 'Sustainability',
      question: 'How can I recycle product packaging?',
      answer: 'Most of our packaging can go directly in your curbside recycling. For items that require special handling, we include recycling instructions with your order. Some products also qualify for our take-back program.'
    }
  ]

  const categories = Array.from(new Set(faqs.map(faq => faq.category)))

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Find answers to common questions about shopping with {settings?.site_name || 'EcoShop'}.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 md:py-24">
        <div className="container-wide max-w-4xl mx-auto">
          {categories.map((category) => (
            <div key={category} className="mb-12">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                {category}
              </h2>
              <div className="space-y-4">
                {faqs
                  .filter(faq => faq.category === category)
                  .map((faq, index) => {
                    const globalIndex = faqs.indexOf(faq)
                    const isOpen = openIndex === globalIndex
                    return (
                      <div key={index} className="border border-border rounded-lg overflow-hidden">
                        <button
                          onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-secondary/30 transition-colors"
                        >
                          <span className="font-semibold text-foreground pr-4">
                            {faq.question}
                          </span>
                          <ChevronDown
                            className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform ${
                              isOpen ? 'transform rotate-180' : ''
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-4 text-muted-foreground">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Still have questions */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container-wide max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            Still Have Questions?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Can't find the answer you're looking for? Our customer support team is here to help.
          </p>
          <a
            href="/contact"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </section>
    </div>
  )
}
