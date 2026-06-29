"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { arsenalItems } from "@/lib/arsenal";
import { ARSENAL_DISCLAIMER } from "@/lib/legal-disclaimers";

const WALLET_ITEMS = arsenalItems.filter((item) =>
  ["fourth-search", "fifth-silence", "first-assembly", "stop-document", "limited-government"].includes(
    item.id
  )
);

export function WalletCardsPrint() {
  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-4">
      <Button
        type="button"
        onClick={handlePrint}
        className="btn-gold print:hidden"
      >
        <Printer className="size-4" />
        Print wallet set
      </Button>
      <div className="wallet-print-area hidden print:block">
        <h1 className="mb-4 text-center font-heading text-xl font-bold">
          The Line — Pocket Defender Cards
        </h1>
        <div className="grid gap-4">
          {WALLET_ITEMS.map((item) => (
            <article
              key={item.id}
              className="break-inside-avoid rounded border border-black/20 p-4"
            >
              <p className="text-xs font-bold uppercase">{item.title}</p>
              <p className="mt-2 whitespace-pre-line text-sm">{item.content}</p>
            </article>
          ))}
        </div>
        <p className="mt-4 text-center text-xs">{ARSENAL_DISCLAIMER}</p>
      </div>
      <div className="grid gap-3 print:hidden sm:grid-cols-2">
        {WALLET_ITEMS.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-gold/20 bg-navy-elevated/50 p-4"
          >
            <p className="font-heading text-sm font-semibold text-gold">{item.title}</p>
            <p className="mt-2 line-clamp-4 text-xs text-muted-foreground">
              {item.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}