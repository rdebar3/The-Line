import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const UNIT_CERTS = [
  "declaration-defender",
  "constitution-guardian",
  "bill-of-rights-sentinel",
];

function hasCertification(state, certificationId) {
  return (state.certifications ?? []).some((cert) => cert.id === certificationId);
}

function isTrainingPathComplete(state) {
  return UNIT_CERTS.every((id) => hasCertification(state, id));
}

function getRepublicSimulatorAccess(state, isPremium, demoUsed) {
  const capstoneComplete = isTrainingPathComplete(state);
  const premiumOrDemoAvailable = isPremium || !demoUsed;

  if (!capstoneComplete) {
    return { canPlay: false, reason: "capstone_incomplete" };
  }
  if (!premiumOrDemoAvailable) {
    return { canPlay: false, reason: "demo_exhausted" };
  }
  return { canPlay: true, reason: "granted" };
}

function makeState(certIds = []) {
  return {
    certifications: certIds.map((id) => ({ id, earnedAt: "2026-07-01T00:00:00.000Z" })),
  };
}

const none = makeState();
assert.equal(isTrainingPathComplete(none), false);
assert.equal(getRepublicSimulatorAccess(none, true, false).reason, "capstone_incomplete");

const partial = makeState(["declaration-defender", "constitution-guardian"]);
assert.equal(isTrainingPathComplete(partial), false);
assert.equal(getRepublicSimulatorAccess(partial, true, false).canPlay, false);

const complete = makeState(UNIT_CERTS);
assert.equal(isTrainingPathComplete(complete), true);
assert.equal(getRepublicSimulatorAccess(complete, true, false).canPlay, true);
assert.equal(getRepublicSimulatorAccess(complete, false, false).canPlay, true);
assert.equal(getRepublicSimulatorAccess(complete, false, true).reason, "demo_exhausted");

const learningPath = readFileSync("lib/learning-path.ts", "utf8");
assert.match(learningPath, /isTrainingPathComplete/);
assert.match(learningPath, /getTrainingPathCapstoneStatus/);

const accessModule = readFileSync("lib/republic-simulator-access.ts", "utf8");
assert.match(accessModule, /capstone_incomplete/);

const experience = readFileSync(
  "components/republic-simulator/republic-simulator-experience.tsx",
  "utf8"
);
assert.match(experience, /RepublicSimulatorCapstoneGate/);
assert.match(experience, /capstone_incomplete/);

const apiRoute = readFileSync("app/api/grok/republic-simulator/route.ts", "utf8");
assert.match(apiRoute, /ensureCapstoneComplete/);
assert.match(apiRoute, /CAPSTONE_INCOMPLETE/);

const hubCard = readFileSync("components/hub/republic-simulator-hub-card.tsx", "utf8");
assert.match(hubCard, /Certify all 3 units to unlock/);

console.log("Republic Simulator capstone checks passed.");