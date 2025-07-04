"use client";

import { useState, useEffect } from "react";
import ConsentPreferenceCenter from "./ConsentPreferenceCenter";
import { cn } from "@/lib/utils";

export default function PrivacyConsentDialog() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const hasConsent = localStorage.getItem("cookieConsent");
    if (!hasConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    // Set all preferences to true
    const preferences = {
      analytics: true,
      behavioralAdvertising: true,
      essentialServices: true,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
    localStorage.setItem("cookieConsent", "accepted");
    setIsVisible(false);
  };

  const handlePreferences = () => {
    setShowPreferences(true);
  };

  const handleClosePreferences = () => {
    setShowPreferences(false);
    setIsVisible(false);
  };

  // If neither dialog should be visible, return null
  if (!isVisible && !showPreferences) return null;

  // If preferences should be shown, render the preferences center
  if (showPreferences) {
    return <ConsentPreferenceCenter onClose={handleClosePreferences} />;
  }

  // Otherwise, render the main consent dialog
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 text-white border-t border-zinc-800 p-4 z-50">
      <div className="max-w-xl mx-auto">
        <h2 className="text-lg font-bold">Your Privacy. Your Choice.</h2>
        <p className="mt-2 text-sm text-zinc-300">
          We may use cookies to personalize content, serve personalized ads,
          provide social media features, and help analyze app performance. By
          clicking "accept sharing" you are directing us to disclose information
          about your use of our app via cookies. You may read in our privacy
          policy about how advertising partners receive your data, and what they
          can do with your data. You can limit what our advertising partners can
          do with your data by clicking on the Consent Preference Center link
          below. Our Consent Preference Center is always accessible through the
          "Settings" menu within the app. Read our Privacy Policy here.
        </p>
        <div className="mt-4 flex justify-between gap-4">
          <button
            onClick={handleAccept}
            className={cn(
              "bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500",
              "transition-colors"
            )}
          >
            Accept Sharing
          </button>
          <button
            onClick={handlePreferences}
            className={cn(
              "text-purple-400 hover:text-purple-300 transition-colors underline",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            )}
          >
            Consent Preference Center
          </button>
        </div>
      </div>
    </div>
  );
}
