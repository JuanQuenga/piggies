"use client";

import { Separator } from "@/components/ui/separator";

export default function TermsOfService() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-sm text-zinc-400 mb-8">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <div className="space-y-8 text-zinc-200">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
          <p className="mb-4">
            By accessing or using our service, you agree to be bound by these
            Terms of Service. If you disagree with any part of the terms, you do
            not have permission to access the service.
          </p>
        </section>

        <Separator className="my-8" />

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Age Restrictions</h2>
          <p className="mb-4">
            You must be at least 18 years old to use this service. By using this
            service, you represent and warrant that you are at least 18 years
            old and have the legal capacity to enter into these terms.
          </p>
        </section>

        <Separator className="my-8" />

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
          <p className="mb-4">
            When you create an account with us, you guarantee that:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>You are 18 years of age or older</li>
            <li>
              The information you provide is accurate, complete, and current
            </li>
            <li>You will maintain the accuracy of such information</li>
            <li>
              Your use of the service will not violate any applicable law or
              regulation
            </li>
          </ul>
        </section>

        <Separator className="my-8" />

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
          <p className="mb-4">You agree not to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              Post content that is illegal, harmful, threatening, abusive,
              harassing, defamatory, or sexually explicit
            </li>
            <li>Impersonate others or provide inaccurate information</li>
            <li>Engage in unauthorized commercial activities</li>
            <li>Attempt to bypass any security measures</li>
            <li>Share or distribute explicit content without consent</li>
            <li>Harass, stalk, or harm other users</li>
          </ul>
        </section>

        <Separator className="my-8" />

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            5. Privacy and Data Protection
          </h2>
          <p className="mb-4">
            Your privacy is important to us. Please review our Privacy Policy to
            understand how we collect, use, and share your information.
          </p>
        </section>

        <Separator className="my-8" />

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            6. Safety and Security
          </h2>
          <p className="mb-4">
            While we strive to provide a safe environment, you are responsible
            for:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Your personal safety when meeting others</li>
            <li>Protecting your account credentials</li>
            <li>Reporting suspicious or harmful behavior</li>
            <li>Using discretion when sharing personal information</li>
          </ul>
        </section>

        <Separator className="my-8" />

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Termination</h2>
          <p className="mb-4">
            We reserve the right to terminate or suspend your account
            immediately, without prior notice or liability, for any reason
            whatsoever, including without limitation if you breach the Terms.
          </p>
        </section>

        <Separator className="my-8" />

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Disclaimer</h2>
          <p className="mb-4">
            The service is provided "as is" without any warranties, express or
            implied. We do not guarantee the accuracy, completeness, or
            usefulness of any information on the service.
          </p>
        </section>

        <Separator className="my-8" />

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            9. Limitation of Liability
          </h2>
          <p className="mb-4">
            To the maximum extent permitted by law, we shall not be liable for
            any indirect, incidental, special, consequential, or punitive
            damages resulting from your use of the service.
          </p>
        </section>

        <Separator className="my-8" />

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
          <p className="mb-4">
            We reserve the right to modify or replace these terms at any time.
            If a revision is material, we will try to provide at least 30 days
            notice prior to any new terms taking effect.
          </p>
        </section>

        <div className="mt-12 p-4 bg-zinc-900 rounded-lg">
          <p className="text-sm text-zinc-400">
            Note: This Terms of Service document is for informational purposes
            only and should be reviewed by legal professionals before
            implementation.
          </p>
        </div>
      </div>
    </div>
  );
}
