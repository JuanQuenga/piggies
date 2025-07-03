"use client";

import { PricingTable } from "@clerk/nextjs";

export default function SubscriptionsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 p-6">
      <div className="w-full max-w-lg bg-zinc-900 rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Support Piggies
        </h1>
        <p className="text-zinc-300 mb-8 text-center">
          Become a Piggies Supporter to unlock exclusive features and help us
          build a better community!
        </p>
        {/* The PricingTable will show all publicly available plans from your Clerk dashboard */}
        <PricingTable />
        {/* Ensure your plan is set as 'publicly available' in the Clerk dashboard */}
      </div>
    </div>
  );
}
