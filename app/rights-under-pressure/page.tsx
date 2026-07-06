import { redirect } from "next/navigation";

import { LEGACY_TRAINING_REDIRECTS } from "@/lib/path-routes";

export default function RightsUnderPressureRedirectPage() {
  redirect(LEGACY_TRAINING_REDIRECTS["/rights-under-pressure"]);
}