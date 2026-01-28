'use client';

import React from 'react';
import { useAccount } from 'wagmi';
import { useSmartAccount } from '@/hooks/useSmartAccount';
import { useUserOp } from '@/hooks/useUserOp';

export default function Dashboard() {
  const { address: eoaAddress, isConnected } = useAccount();
  const { smartAccountAddress, isDeployed, createAccount, isLoading } = useSmartAccount();
  const { sendTransaction, loading: txLoading, txHash, error: txError } = useUserOp();

  const handleTestTransaction = async () => {
    // Send 0 ETH to self as a test
    if (smartAccountAddress) {
      await sendTransaction(smartAccountAddress, 0n, "0x");
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-4xl font-bold mb-4 text-white">Connect your wallet</h1>
        <p className="text-white/60">Please connect your EOA to manage your gasless smart account.</p>
      </div>
    );
  }

  return (
    <div className="py-10">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-white/60">Manage your smart account and track your gasless transactions.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-6">Account Status</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-white/40 mb-1">Owner (EOA)</p>
              <p className="font-mono text-sm text-white break-all">{eoaAddress}</p>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-1">Smart Account</p>
              <p className="font-mono text-sm text-white break-all">
                {isLoading ? "Calculating..." : smartAccountAddress || "Not available"}
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 mt-4">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-white/60">Deployment Status</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  isDeployed ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                }`}>
                  {isDeployed ? 'Deployed' : 'Counterfactual'}
                </span>
              </div>
              {!isDeployed && (
                <button
                  onClick={() => createAccount()}
                  className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-white/90 transition-colors"
                >
                  Deploy Smart Account
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">⛽</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Gas Needed</h3>
          <p className="text-sm text-white/60 mb-6 max-w-[240px]">
            Once deployed, you can send transactions without paying any native gas fees.
          </p>
          <button
            onClick={handleTestTransaction}
            disabled={!isDeployed || txLoading}
            className={`text-sm font-bold py-2 px-6 rounded-lg transition-all ${
              !isDeployed 
                ? "text-white/40 cursor-not-allowed bg-white/5" 
                : "bg-blue-600 text-white hover:bg-blue-500"
            }`}
          >
            {txLoading ? "Sending..." : "Send Test Transaction (0 ETH)"}
          </button>
          
          {txHash && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg max-w-full overflow-hidden">
              <p className="text-xs text-green-400 font-bold mb-1">Transaction Sent!</p>
              <a 
                href={`https://basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-green-500/80 hover:text-green-400 truncate block underline"
              >
                View on BaseScan
              </a>
            </div>
          )}

          {txError && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg max-w-full">
              <p className="text-xs text-red-400 font-bold mb-1">Error</p>
              <p className="text-xs text-red-500/80 break-words">{txError}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
