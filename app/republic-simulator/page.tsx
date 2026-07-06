import { redirect } from "next/navigation";

import { LEGACY_TRAINING_REDIRECTS } from "@/lib/path-routes";

export default function RepublicSimulatorRedirectPage() {
  redirect(LEGACY_TRAINING_REDIRECTS["/republic-simulator"]);
}