import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service - Mealz & Dealz",
  description:
    "Read our terms and conditions for using our food delivery platform",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Introduction */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Introduction</h2>
            <p className="text-muted-foreground">
              Welcome to Mealz & Dealz. By accessing or using our platform, you
              agree to be bound by these Terms of Service. Please read them
              carefully before using our services.
            </p>
          </section>

          {/* Account Terms */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Account Terms</h2>
            <div className="bg-card p-6 rounded-lg">
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>You must be at least 18 years old to use our services</li>
                <li>
                  You are responsible for maintaining the security of your
                  account
                </li>
                <li>You must provide accurate and complete information</li>
                <li>
                  You are responsible for all activities under your account
                </li>
              </ul>
            </div>
          </section>

          {/* Ordering and Delivery */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Ordering and Delivery</h2>
            <div className="bg-card p-6 rounded-lg">
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>All orders are subject to restaurant availability</li>
                <li>Delivery times are estimates and not guaranteed</li>
                <li>Prices may vary from in-restaurant prices</li>
                <li>We reserve the right to cancel orders at our discretion</li>
              </ul>
            </div>
          </section>

          {/* Payment Terms */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Payment Terms</h2>
            <div className="bg-card p-6 rounded-lg">
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>All payments are processed securely</li>
                <li>Prices are inclusive of applicable taxes</li>
                <li>Additional delivery fees may apply</li>
                <li>Refunds are subject to our refund policy</li>
              </ul>
            </div>
          </section>

          {/* User Conduct */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">User Conduct</h2>
            <div className="bg-card p-6 rounded-lg">
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>You agree not to misuse our services</li>
                <li>You will not attempt to bypass any security measures</li>
                <li>You will not use our platform for any illegal purposes</li>
                <li>You will respect other users and restaurant partners</li>
              </ul>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Intellectual Property</h2>
            <p className="text-muted-foreground">
              All content on our platform, including logos, text, and images, is
              the property of Mealz & Dealz or our partners and is protected by
              intellectual property laws.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Mealz & Dealz is not liable for any indirect, incidental, or
              consequential damages arising from your use of our services. Our
              liability is limited to the amount you paid for the service in
              question.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. We will
              notify users of any significant changes. Continued use of our
              services after changes constitutes acceptance of the new terms.
            </p>
          </section>

          {/* Contact */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about these Terms of Service, please
              contact us at{" "}
              <Link
                href="mailto:legal@mealzdealz.com"
                className="text-primary hover:underline"
              >
                legal@mealzdealz.com
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
