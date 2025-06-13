import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - Hot Meal N Dealz",
  description: "Learn about how we protect your privacy and handle your data",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Last updated: May 06, 2025
          </p>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Introduction */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Introduction</h2>
            <p className="text-muted-foreground">
              Hot Meal N Dealz is owned and operated by Blazor Technologies Inc.
              These Terms of Service apply to the Site, located at
              https://www.hotmealndealz.com, as well as to any mobile or similar
              versions of the site that hotmealndealz.com operates. By using the
              site, you hereby agree that you are at least eighteen (18) years
              of age and you acknowledge that you have read and agree to be
              bound by these terms of service and the Meal N Dealz Privacy
              Statement and applicable privacy laws.
            </p>
          </section>

          {/* Service Description */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Service Description</h2>
            <p className="text-muted-foreground">
              Hot Meal N Dealz is a dining establishment offering a range of
              food meals and dining, take away & delivery experiences. Meal N
              Dealz operates the site as an online platform for restaurant
              information, reservations, and reviews. Meal N Dealz does not
              handle transactions directly and is not responsible for any
              bookings made through third-party services linked from our site.
              As a result, Mealz N Dealz does not (a) guarantee or ensure any
              reservation or transaction through third-party services, (b)
              collect or process payments directly, or (c) handle the delivery
              of food or other services.
            </p>
          </section>

          {/* Site Content */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Site Content</h2>
            <p className="text-muted-foreground">
              All information and content available on this site (collectively,
              &quot;Content&quot;) is protected by copyright and other
              intellectual property laws. The Content is owned by Meal N Dealz,
              its affiliates, and/or their respective licensors and suppliers
              (collectively, &quot;Licensors&quot;). The Content is intended for
              personal and noncommercial use only. While you may interact with
              or download a single copy of any portion of the Content for your
              personal and noncommercial entertainment, information, or use, you
              may not reproduce, sell, publish, distribute, modify, display,
              perform, re-post, or otherwise use any portion of the Content in
              any other way or for any other purpose without the prior written
              consent of mealndealz.com. Requests regarding use of the Content
              for any purpose other than personal, noncommercial use should be
              directed to info@hotmealndealz.com.
            </p>
            <div className="bg-card p-6 rounded-lg">
              <p className="text-muted-foreground">
                NOTICE: Certain images or videos contained herein are owned by
                Blazor Technologes Inc. and are protected under copyright laws.
                Access to and use of these images or videos are restricted by
                the terms and conditions of a license agreement. Unauthorized
                use, reproduction, creation of derivative works, transmission,
                display, or distribution of these images or videos is strictly
                prohibited. Blazor Technologes Inc. reserves the right to pursue
                all legal and equitable remedies against unauthorized use of
                data available on hotmealndealz.com.
              </p>
            </div>
          </section>

          {/* Account Management */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Account Management</h2>
            <div className="bg-card p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-2">
                To quit your account or delete your personal data, use the
                following options:
              </h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>
                  Unsubscribe from our web application: Use the link available
                  at the bottom of our home page.
                </li>
                <li>
                  Unsubscribe from our mobile apps: The unsubscribe option is
                  available on the app&apos;s settings screen.
                </li>
                <li>
                  Send an email: From the email account associated with your
                  account, send a request to &quot;info@hotmealndealz.com&quot;
                  describing your request to delete your account. You will be
                  informed about the deletion of your data and account within
                  2-3 business days.
                </li>
              </ul>
            </div>
          </section>

          {/* Data Usage */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Data Usage Statement</h2>
            <p className="text-muted-foreground">
              Hot Meal N Dealz collects and processes non-personally
              identifiable information from users, including name, username,
              email, profile avatar, and contact details. This information is
              used for internal purposes such as customer service and
              communication, and is not sold to third parties.
            </p>
          </section>

          {/* Contact */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy, please
              contact us at{" "}
              <Link
                href="mailto:info@hotmealndealz.com"
                className="text-primary hover:underline"
              >
                info@hotmealndealz.com
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
