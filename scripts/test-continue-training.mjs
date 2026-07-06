import assert from "node:assert/strict";

const STEP_ORDER = ["read", "drill", "scenario", "certify"];

function findNextStep(steps) {
  return (
    steps.find((step) => step.status === "in-progress") ??
    steps.find((step) => step.status === "available") ??
    steps.find((step) => step.status !== "complete" && step.status !== "locked") ??
    null
  );
}

function findFurthestIncompleteUnit(units) {
  let targetUnit = null;
  for (const unit of units) {
    if (unit.status === "locked") break;
    if (unit.status === "complete") continue;
    targetUnit = unit;
  }
  return targetUnit;
}

function resolveTarget(units) {
  const targetUnit = findFurthestIncompleteUnit(units) ?? units[0];
  const step = findNextStep(targetUnit.steps) ?? targetUnit.steps[0];
  return { unitId: targetUnit.id, stepId: step.id, href: step.href };
}

const fresh = resolveTarget([
  {
    id: "declaration",
    status: "in-progress",
    steps: [
      { id: "read", status: "available", href: "/declaration" },
      { id: "drill", status: "available", href: "/path/drill" },
    ],
  },
  { id: "constitution", status: "locked", steps: [] },
]);

assert.equal(fresh.unitId, "declaration");
assert.equal(fresh.stepId, "read");
assert.equal(fresh.href, "/declaration");

const midDeclaration = resolveTarget([
  {
    id: "declaration",
    status: "in-progress",
    steps: [
      { id: "read", status: "complete", href: "/declaration" },
      { id: "drill", status: "in-progress", href: "/path/drill" },
      { id: "scenario", status: "available", href: "/path/scenario" },
    ],
  },
]);

assert.equal(midDeclaration.stepId, "drill");

const constitutionUnlocked = resolveTarget([
  {
    id: "declaration",
    status: "complete",
    steps: STEP_ORDER.map((id) => ({ id, status: "complete", href: "/" })),
  },
  {
    id: "constitution",
    status: "in-progress",
    steps: [
      { id: "read", status: "in-progress", href: "/constitution" },
      { id: "drill", status: "available", href: "/path/drill" },
    ],
  },
  { id: "bill-of-rights", status: "locked", steps: [] },
]);

assert.equal(constitutionUnlocked.unitId, "constitution");
assert.equal(constitutionUnlocked.stepId, "read");
assert.equal(constitutionUnlocked.href, "/constitution");

const billOfRights = resolveTarget([
  {
    id: "declaration",
    status: "complete",
    steps: STEP_ORDER.map((id) => ({ id, status: "complete", href: "/" })),
  },
  {
    id: "constitution",
    status: "complete",
    steps: STEP_ORDER.map((id) => ({ id, status: "complete", href: "/" })),
  },
  {
    id: "bill-of-rights",
    status: "in-progress",
    steps: [
      { id: "read", status: "complete", href: "/bill-of-rights" },
      { id: "drill", status: "complete", href: "/path/drill" },
      { id: "scenario", status: "in-progress", href: "/path/scenario" },
      { id: "certify", status: "available", href: "/certifications" },
    ],
  },
]);

assert.equal(billOfRights.unitId, "bill-of-rights");
assert.equal(billOfRights.stepId, "scenario");

console.log("Continue training target checks passed.");