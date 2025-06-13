"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    question: "How do I place an order?",
    answer:
      "To place an order, simply browse our restaurant listings, select your desired items, add them to your cart, and proceed to checkout. You can pay using various payment methods including credit/debit cards, digital wallets, or cash on delivery where available.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept a wide range of payment methods including major credit and debit cards (Visa, MasterCard, American Express), digital wallets (Apple Pay, Google Pay), and cash on delivery in select areas. All online payments are processed securely through our encrypted payment gateway.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Once your order is confirmed, you'll receive a tracking link via email and SMS. You can also track your order status in real-time through your account dashboard. Our system provides live updates on order preparation, dispatch, and delivery status.",
  },
  {
    question: "What is your delivery time?",
    answer:
      "Delivery times vary depending on the restaurant's preparation time and your location. Typically, orders are delivered within 30-45 minutes. You can see the estimated delivery time before placing your order. During peak hours, delivery times may be slightly longer.",
  },
  {
    question: "Can I modify or cancel my order?",
    answer:
      "You can modify or cancel your order within 5 minutes of placing it, provided the restaurant hasn't started preparing it. After this window, please contact our customer support team for assistance. We'll do our best to accommodate your request.",
  },
  {
    question: "How do I become a restaurant partner?",
    answer:
      "To become a restaurant partner, visit our 'Partner with Us' page and fill out the application form. Our team will review your application and contact you within 2-3 business days. We welcome restaurants of all sizes and cuisines to join our platform.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about our food delivery service,
            ordering process, and more.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-card rounded-lg border border-border overflow-hidden"
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-left">
                  {faq.question}
                </h3>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-200 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`px-6 overflow-hidden transition-all duration-200 ${
                  openIndex === index ? "max-h-96 py-4" : "max-h-0"
                }`}
              >
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-6">
            Can&apos;t find the answer you&apos;re looking for? Our support team
            is here to help.
          </p>
          <Button asChild>
            <a href="/contact">Contact Support</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
