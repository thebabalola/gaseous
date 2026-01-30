import React from "react";
import { GaslessSend } from "@/components/GaslessSend";

export default function Page() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-4">Gasless Demo</h1>
        <p className="text-sm text-gray-400 mb-6">A simple demo that builds and sends a UserOperation to execute an ETH transfer via your Smart Account and a Bundler. Ensure your wallet is connected and the bundler URL is configured in <code className="bg-white/5 px-1 rounded">NEXT_PUBLIC_BUNDLER_RPC_URL</code>.</p>
        <GaslessSend />
      </div>
    </div>
  );
}
