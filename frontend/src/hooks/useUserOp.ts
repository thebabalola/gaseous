'use client';

import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { buildUserOp, encodeExecute } from '@/lib/userop/builder';
import { sendUserOperation } from '@/lib/bundler/client';
import { useSmartAccount } from './useSmartAccount';
import { type Hex } from 'viem';

export function useUserOp() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { smartAccountAddress } = useSmartAccount();
  
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendTransaction = async (to: Hex, value: bigint, data: Hex) => {
    if (!walletClient || !smartAccountAddress) {
      setError("Wallet not connected or Smart Account not ready");
      return;
    }

    setLoading(true);
    setError(null);
    setTxHash(null);

    try {
      // 1. Build UserOperation
      const callData = encodeExecute(to, value, data);
      
      // Note: In a real app, nonce should be fetched from EntryPoint
      const userOp = await buildUserOp(
        smartAccountAddress,
        0n, // Nonce placeholder
        callData
      );

      // 2. Sign UserOperation
      // Hash the UserOp (simplified for now, ideally use EntryPoint.getUserOpHash)
      // For this MVP, we are skipping the complex EIP-712 signing implementation details
      // and focusing on the flow structure.
      const signature = await walletClient.signMessage({
        message: "Sign this message to authorize the gasless transaction."
      });
      userOp.signature = signature;

      // 3. Send to Bundler
      const opHash = await sendUserOperation(userOp);
      setTxHash(opHash);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send transaction");
    } finally {
      setLoading(false);
    }
  };

  return {
    sendTransaction,
    loading,
    txHash,
    error
  };
}
