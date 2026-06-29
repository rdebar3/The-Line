import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { PageBackground } from "@/components/rights/page-background";
import { PurchaseSuccessContent } from "@/components/monetization/purchase-success-content";

function PurchaseSuccessFallback() {
  return (
    <PageBackground>
      <div className="page-shell flex min-h-[70vh] max-w-lg flex-col items-center justify-center text-center">
        <Loader2 className="size-10 animate-spin text-gold" />
        <p className="mt-4 text-sm text-muted-foreground">
          Confirming your purchase...
        </p>
      </div>
    </PageBackground>
  );
}

export default function PurchaseSuccessPage() {
  return (
    <Suspense fallback={<PurchaseSuccessFallback />}>
      <PurchaseSuccessContent />
    </Suspense>
  );
}