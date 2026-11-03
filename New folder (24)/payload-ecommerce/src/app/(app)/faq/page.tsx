import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export const metadata = {
  title: 'FAQ | Payload Commerce',
  description: 'Frequently asked questions.',
}

const faqs = [
  {
    question: "What is your return policy?",
    answer: "We offer a 30-day money-back guarantee. If you are not 100% satisfied with your purchase, you can return it for a full refund or exchange within 30 days of the original purchase date."
  },
  {
    question: "How long does shipping take?",
    answer: "Domestic orders typically arrive within 3-5 business days. International shipping can take between 7-14 business days depending on the destination."
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes, we ship to over 100 countries worldwide. Shipping costs will apply and will be added at checkout."
  },
  {
    question: "How can I track my order?",
    answer: "Once your order has shipped, you will receive an email with a tracking number and a link to track your package online."
  }
]

export default function FAQPage() {
  return (
    <div className="container py-24 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground">
            Find answers to common questions about our products and services.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-2xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-white/10 last:border-0">
                <AccordionTrigger className="text-lg font-medium hover:text-primary transition-colors py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  )
}
