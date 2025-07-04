"use client";

import { Separator } from "@/components/ui/separator";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-zinc-400 mb-8">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <div className="space-y-8 text-zinc-200">
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            1. Information We Collect
          </h2>
          <div className="space-y-4">
            <h3 className="text-xl font-medium">
              1.1 Information you provide:
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account information (email, username, password)</li>
              <li>
                Profile information (age, photos, physical characteristics,
                preferences)
              </li>
              <li>Location data</li>
              <li>Messages and communications</li>
              <li>Usage information and preferences</li>
            </ul>

            <h3 className="text-xl font-medium">
              1.2 Automatically collected information:
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Device information (IP address, browser type, device ID)</li>
              <li>Usage data (interactions, time spent, features used)</li>
              <li>Location data (GPS, WiFi access points, cell towers)</li>
              <li>Cookies and similar technologies</li>
            </ul>
          </div>
        </section>

        <Separator className="my-8" />

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            2. How We Use Your Information
          </h2>
          <p className="mb-4">We use the collected information to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide and maintain our services</li>
            <li>
              Match you with other users based on location and preferences
            </li>
            <li>Send you notifications and updates</li>
            <li>Improve our services and develop new features</li>
            <li>Ensure safety and security of our platform</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <Separator className="my-8" />

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            3. Location Information
          </h2>
          <p className="mb-4">
            Our service relies on location data to function properly. We collect
            and process location information in the following ways:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Precise location when you enable GPS</li>
            <li>Approximate location based on IP address</li>
            <li>Location history when you use the app</li>
            <li>Nearby WiFi access points and cell towers</li>
          </ul>
          <p className="mt-4">
            You can control location sharing through your device settings, but
            this may limit functionality.
          </p>
        </section>

        <Separator className="my-8" />

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            4. Information Sharing
          </h2>
          <p className="mb-4">We may share your information with:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Other users (as part of your profile)</li>
            <li>Service providers and partners</li>
            <li>Law enforcement (when required by law)</li>
            <li>Third-party analytics services</li>
          </ul>
        </section>

        <Separator className="my-8" />

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
          <p className="mb-4">
            We implement appropriate security measures to protect your
            information, including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security assessments</li>
            <li>Access controls and authentication</li>
            <li>Monitoring for suspicious activity</li>
          </ul>
        </section>

        <Separator className="my-8" />

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            6. Your Rights and Choices
          </h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Delete your account and data</li>
            <li>Object to data processing</li>
            <li>Export your data</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </section>

        <Separator className="my-8" />

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
          <p className="mb-4">
            We retain your information for as long as your account is active or
            as needed to provide services. You can request deletion of your
            account at any time.
          </p>
        </section>

        <Separator className="my-8" />

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            8. International Data Transfers
          </h2>
          <p className="mb-4">
            Your information may be transferred to and processed in countries
            other than your own. We ensure appropriate safeguards are in place
            for such transfers.
          </p>
        </section>

        <Separator className="my-8" />

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
          <p className="mb-4">
            Our service is not intended for users under 18 years of age. We do
            not knowingly collect information from children.
          </p>
        </section>

        <Separator className="my-8" />

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            10. Changes to Privacy Policy
          </h2>
          <p className="mb-4">
            We may update this privacy policy from time to time. We will notify
            you of any material changes through the service or via email.
          </p>
        </section>

        <Separator className="my-8" />

        <section>
          <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
          <p className="mb-4">
            If you have questions about this Privacy Policy or our practices,
            please contact us at:
          </p>
          <p className="text-purple-400">[Your Contact Information]</p>
        </section>

        <div className="mt-12 p-4 bg-zinc-900 rounded-lg">
          <p className="text-sm text-zinc-400">
            Note: This Privacy Policy is for informational purposes only and
            should be reviewed by legal professionals before implementation. It
            should be customized to accurately reflect your specific data
            collection and processing practices.
          </p>
        </div>
      </div>
    </div>
  );
}
