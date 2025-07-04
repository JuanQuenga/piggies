"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ConsentPreferenceCenterProps {
  onClose?: () => void;
}

export default function ConsentPreferenceCenter({
  onClose,
}: ConsentPreferenceCenterProps) {
  const [analytics, setAnalytics] = useState(true);
  const [behavioralAdvertising, setBehavioralAdvertising] = useState(true);
  const [essentialServices, setEssentialServices] = useState(true);

  const handleConfirm = () => {
    // Save preferences to localStorage
    const preferences = {
      analytics,
      behavioralAdvertising,
      essentialServices,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem("cookiePreferences", JSON.stringify(preferences));

    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 text-white p-6 rounded-lg max-w-lg w-full mx-4 border border-zinc-800">
        <h2 className="text-2xl font-bold mb-4">Consent Preference Center</h2>
        <p className="text-sm mb-6 text-zinc-300">
          Some cookies are necessary for the application to function. Other
          cookies, such as advertising-related cookies, collect information for
          our advertising partners to provide you with personalized ads on our
          App and on other websites and Apps.
        </p>

        <div className="space-y-6">
          <div className="border-b border-zinc-800 pb-4">
            <h3 className="text-lg font-semibold flex items-center justify-between">
              Analytics
              <span className="text-sm font-normal text-zinc-400">
                {analytics ? "Opted In" : "Opted Out"}
              </span>
            </h3>
            <p className="text-sm text-zinc-400 mt-1 mb-2">
              Help us improve our app by allowing us to collect usage data.
            </p>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={analytics}
                onChange={() => setAnalytics(!analytics)}
                className="sr-only peer"
              />
              <div
                className={cn(
                  "w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer",
                  "peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full",
                  "peer-checked:after:border-white after:content-['']",
                  "after:absolute after:top-[2px] after:start-[2px]",
                  "after:bg-white after:border-zinc-300 after:border",
                  "after:rounded-full after:h-5 after:w-5 after:transition-all",
                  "peer-checked:bg-purple-500"
                )}
              ></div>
            </label>
          </div>

          <div className="border-b border-zinc-800 pb-4">
            <h3 className="text-lg font-semibold flex items-center justify-between">
              Behavioral Advertising
              <span className="text-sm font-normal text-zinc-400">
                {behavioralAdvertising ? "Opted In" : "Opted Out"}
              </span>
            </h3>
            <p className="text-sm text-zinc-400 mt-1 mb-2">
              Allow personalized advertising based on your browsing behavior.
            </p>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={behavioralAdvertising}
                onChange={() =>
                  setBehavioralAdvertising(!behavioralAdvertising)
                }
                className="sr-only peer"
              />
              <div
                className={cn(
                  "w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer",
                  "peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full",
                  "peer-checked:after:border-white after:content-['']",
                  "after:absolute after:top-[2px] after:start-[2px]",
                  "after:bg-white after:border-zinc-300 after:border",
                  "after:rounded-full after:h-5 after:w-5 after:transition-all",
                  "peer-checked:bg-purple-500"
                )}
              ></div>
            </label>
          </div>

          <div className="border-b border-zinc-800 pb-4">
            <h3 className="text-lg font-semibold flex items-center justify-between">
              Essential Services
              <span className="text-sm font-normal text-zinc-400">
                Required
              </span>
            </h3>
            <p className="text-sm text-zinc-400 mt-1 mb-2">
              Necessary for the application to function properly. Cannot be
              disabled.
            </p>
            <label className="relative inline-flex items-center cursor-not-allowed">
              <input
                type="checkbox"
                checked={true}
                disabled
                className="sr-only peer"
              />
              <div
                className={cn(
                  "w-11 h-6 bg-zinc-700 rounded-full peer",
                  "peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full",
                  "peer-checked:after:border-white after:content-['']",
                  "after:absolute after:top-[2px] after:start-[2px]",
                  "after:bg-white after:border-zinc-300 after:border",
                  "after:rounded-full after:h-5 after:w-5 after:transition-all",
                  "peer-checked:bg-purple-500 opacity-50"
                )}
              ></div>
            </label>
          </div>
        </div>

        <div className="flex justify-between mt-6 gap-4">
          <button
            className={cn(
              "flex-1 bg-zinc-800 text-white px-4 py-2 rounded",
              "hover:bg-zinc-700 transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            )}
            onClick={() => {
              setAnalytics(false);
              setBehavioralAdvertising(false);
            }}
          >
            Reject All
          </button>
          <button
            className={cn(
              "flex-1 bg-zinc-800 text-white px-4 py-2 rounded",
              "hover:bg-zinc-700 transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            )}
            onClick={() => {
              setAnalytics(true);
              setBehavioralAdvertising(true);
            }}
          >
            Accept All
          </button>
          <button
            className={cn(
              "flex-1 bg-purple-600 text-white px-4 py-2 rounded",
              "hover:bg-purple-700 transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            )}
            onClick={handleConfirm}
          >
            Confirm Choices
          </button>
        </div>
      </div>
    </div>
  );
}
