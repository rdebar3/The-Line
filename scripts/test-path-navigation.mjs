import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  LEGACY_TRAINING_REDIRECTS,
  PATH_ROUTES,
  pathOverviewHref,
} from "../lib/path-routes.ts";
import { PRIMARY_NAV } from "../lib/site-nav.ts";

const navLabels = PRIMARY_NAV.map((item) => item.label);

assert.ok(navLabels.includes("Path"), "PRIMARY_NAV should include Path");
assert.equal(
  navLabels.filter((label) => label === "Path").length,
  1,
  "Path should appear once"
);
assert.ok(!navLabels.includes("Training"), "Training nav item removed");
assert.ok(!navLabels.includes("Drills"), "Drills nav item removed");
assert.ok(!navLabels.includes("Simulator"), "Simulator nav item removed");

const pathItem = PRIMARY_NAV.find((item) => item.label === "Path");
assert.equal(pathItem?.href, PATH_ROUTES.overview);

assert.equal(
  LEGACY_TRAINING_REDIRECTS["/quick-drills"],
  pathOverviewHref({ step: "drill" })
);
assert.equal(
  LEGACY_TRAINING_REDIRECTS["/rights-under-pressure"],
  pathOverviewHref({ step: "scenario" })
);
assert.equal(
  LEGACY_TRAINING_REDIRECTS["/republic-simulator"],
  PATH_ROUTES.simulator
);

const learningPath = readFileSync("lib/learning-path.ts", "utf8");
assert.match(learningPath, /drill: PATH_ROUTES\.drill/);
assert.match(learningPath, /scenario: PATH_ROUTES\.scenario/);

const pathExperience = readFileSync("components/path/path-experience.tsx", "utf8");
assert.match(pathExperience, /defenderScore/);
assert.match(pathExperience, /getLearningPath\(state\)/);
assert.match(pathExperience, /<RankBadge rank=\{rank\}/);

console.log("Path navigation consolidation checks passed.");