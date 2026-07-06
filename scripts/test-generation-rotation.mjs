import assert from "node:assert/strict";

const BILL_OF_RIGHTS_AMENDMENTS = [
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
];

function amendmentRecencyScore(amendment, recentAmendmentTags) {
  const index = recentAmendmentTags.lastIndexOf(amendment);
  return index === -1 ? -1 : index;
}

function prioritizeBillOfRightsTopics(topics, recentAmendmentTags) {
  if (topics.length <= 1) return topics;

  return [...topics].sort((left, right) => {
    const leftScore = amendmentRecencyScore(left.amendment, recentAmendmentTags);
    const rightScore = amendmentRecencyScore(
      right.amendment,
      recentAmendmentTags
    );

    if (leftScore !== rightScore) return leftScore - rightScore;

    const leftOrder = BILL_OF_RIGHTS_AMENDMENTS.indexOf(left.amendment);
    const rightOrder = BILL_OF_RIGHTS_AMENDMENTS.indexOf(right.amendment);

    if (leftOrder !== -1 && rightOrder !== -1) {
      return leftOrder - rightOrder;
    }

    return 0;
  });
}

const billTopics = BILL_OF_RIGHTS_AMENDMENTS.map((amendment) => ({
  id: `${amendment}-topic`,
  amendment,
}));

const recentHistory = ["4th", "4th", "1st", "4th"];
const prioritized = prioritizeBillOfRightsTopics(billTopics, recentHistory);

assert.notEqual(
  prioritized[0].amendment,
  "4th",
  "Bill of Rights rotation should avoid the most recently served amendment"
);

assert.notEqual(
  prioritized[0].amendment,
  "1st",
  "Bill of Rights rotation should avoid recently served amendments"
);

const served = new Set();
let rollingHistory = [];

for (let round = 0; round < 8; round += 1) {
  const pick = prioritizeBillOfRightsTopics(billTopics, rollingHistory)[0];
  served.add(pick.amendment);
  rollingHistory = [...rollingHistory, pick.amendment].slice(-15);
}

assert.ok(
  served.size >= 5,
  `Expected broad amendment coverage across rounds, got ${served.size}: ${[...served].join(", ")}`
);

console.log("Generation rotation checks passed.");
console.log(`Amendments served across 8 simulated rounds: ${[...served].join(", ")}`);