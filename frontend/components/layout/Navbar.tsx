'use client';

import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="border-b border-white/10 py-4 px-6 mb-8 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-xl font-bold tracking-tight">
          GASEOUS
        </Link>
        <div className="hidden md:flex gap-6 text-sm font-medium text-white/60">
          <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          <Link href="/sponsor" className="hover:text-white transition-colors">Sponsor</Link>
        </div>
      </div>
      <ConnectButton />
    </nav>
  );
}
