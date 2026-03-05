"use client";

import { shortenAddress } from "@/lib/graphql";
import { ExternalLink } from "lucide-react";

interface AddressLinkProps {
  address: string;
  type?: "address" | "tx";
  short?: boolean;
}

export function AddressLink({
  address,
  type = "address",
  short = true,
}: AddressLinkProps) {
  const base = "https://polygonscan.com";
  const href =
    type === "tx" ? `${base}/tx/${address}` : `${base}/address/${address}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-accent-blue hover:text-accent-blue/80 transition-colors font-mono"
    >
      {short ? shortenAddress(address) : address}
      <ExternalLink size={10} className="opacity-50" />
    </a>
  );
}
