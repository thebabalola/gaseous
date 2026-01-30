"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import { parseEther } from "ethers";
import { useUserOp } from "@/hooks/useUserOp";

export function GaslessSend() {
  const { address } = useAccount();
  const { sendTransaction, loading, txHash, error } = useUserOp();

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("0.01");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const value = parseEther(amount).toBigInt();
      await sendTransaction(to as any, value, "0x");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Invalid input");
    }
  };

  return (
    <div className="p-4 bg-white/5 rounded">
      <h2 className="text-lg font-semibold mb-3">Send ETH (gasless)</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-300">From</label>
          <div className="text-sm text-white">{address ?? "Not connected"}</div>
        </div>

        <div>
          <label className="block text-sm text-gray-300">To</label>
          <input
            className="w-full mt-1 p-2 bg-white/5 rounded border border-white/10 text-sm"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="0x..."
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300">Amount (ETH)</label>
          <input
            className="w-full mt-1 p-2 bg-white/5 rounded border border-white/10 text-sm"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.01"
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
            disabled={loading || !address}
          >
            {loading ? "Sending…" : "Send gasless"}
          </button>
          {txHash && (
            <a className="text-sm text-green-400" href={`https://base.blockexplorer.com/tx/${txHash}`} target="_blank" rel="noreferrer">View tx</a>
          )}
        </div>

        {error && <div className="text-sm text-red-400">Error: {error}</div>}
      </form>
    </div>
  );
}
