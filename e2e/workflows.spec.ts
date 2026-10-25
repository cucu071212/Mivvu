import { test, expect } from "./fixtures";

// Independent Phase X acceptance list. Do not derive expected eligibility from
// production data/validators: an accidental eligibility expansion must fail.
const eligibleNames = [
  "16th & Dolores General Store", "Andalé Mexican Kitchen + Bar", "Brookstone",
  "Burger Joint", "Cat Cora", "Kiehl's", "Lark Creek Grill", "Napa Farms Market",
  "Peet's Coffee", "Sunglass Hut", "The Chocolate Market", "Wakaba",
];

test("Flight renders essential controls with honest defaults", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("GateWise");
  await expect(page.getByRole("heading", { name: "Flight context" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Boarding area", exact: true })).toHaveValue("Zone D — D Gates");
  await expect(page.getByLabel("Your gate area (landmark)")).toHaveValue("D1");
  await expect(page.getByLabel("Baseline: minutes until boarding starts")).toHaveValue("50");
  await expect(page.getByLabel("Safety buffer (minutes)")).toHaveValue("10");
  await expect(page.getByRole("checkbox", { name: /Demo estimates for wait/ })).not.toBeChecked();
  await expect(page.getByRole("button", { name: "Start countdown", exact: true })).toBeEnabled();
  await expect(page.getByText(/Uses your device clock only/)).toBeVisible();
  await expect(page.getByText(/Zone travel minutes are unverified demo estimates/)).toBeVisible();
});

test("Explore filters terminals, searches, and explains browse-only facilities", async ({ page }) => {
  await page.goto("/explore");
  const directory = page.getByRole("region", { name: "Facility directory", exact: true });
  await expect(directory.getByRole("article")).toHaveCount(26);
  await expect(page.getByText(/no cross-terminal walking times are modeled/)).toBeVisible();
  await page.getByRole("combobox", { name: "Terminal", exact: true }).selectOption({ label: "Harvey Milk Terminal 1" });
  await expect(directory.getByRole("article")).toHaveCount(3);
  await page.getByRole("searchbox", { name: /Search by facility name/ }).fill("Bun Mee");
  await expect(directory.getByRole("article")).toHaveCount(1);
  const bunMee = directory.getByRole("article", { name: "Bun Mee", exact: true });
  await expect(bunMee.getByText("Browse only — not in recommend scope", { exact: true })).toBeVisible();
  await expect(bunMee.getByText("Harvey Milk Terminal 1 · B Gates", { exact: true })).toBeVisible();
  await expect(bunMee.getByText("Total required (model)", { exact: true })).toHaveCount(0);
  await page.getByRole("searchbox").fill("no-such-facility");
  await expect(directory.getByText(/No facilities match your filters/)).toBeVisible();
  await page.getByRole("searchbox").fill("");
  await page.getByRole("combobox", { name: "Terminal", exact: true }).selectOption({ label: "All terminals" });
  await expect(directory.getByRole("article")).toHaveCount(26);
  await page.getByRole("combobox", { name: "Boarding area", exact: true }).selectOption({ label: "D Gates" });
  await expect(directory.getByRole("article")).toHaveCount(18);
});

test("Only the 12 eligible facilities participate in timing; other cards explain ineligibility", async ({ page }) => {
  await page.goto("/recommendations");
  const ranked = page.getByRole("region", { name: "Ranked recommendations", exact: true });
  await expect(ranked.getByRole("article")).toHaveCount(26);
  const timedCards = ranked.getByRole("article").filter({ has: page.getByLabel(/^Unknown timing data/) });
  await expect(timedCards).toHaveCount(12);
  const excludedCards = ranked.getByRole("article").filter({ has: page.getByLabel(/^Not eligible for time modeling/) });
  await expect(excludedCards).toHaveCount(14);
  await expect(excludedCards.getByRole("definition")).toHaveCount(0);
  const names = await timedCards.getByRole("heading", { level: 3 }).allTextContents();
  expect(names.sort()).toEqual([...eligibleNames].sort());
  for (const name of eligibleNames) {
    const card = ranked.getByRole("article", { name, exact: true });
    await expect(card.getByLabel(/^Unknown timing data/)).toBeVisible();
    await expect(card.getByText("Queue: Unknown", { exact: true })).toBeVisible();
    await expect(card.getByText("Activity: Unknown", { exact: true })).toBeVisible();
    await expect(card.getByText("Not modeled", { exact: true })).toHaveCount(4);
  }
  await expect(ranked.getByText("Model only — not a boarding guarantee", { exact: true })).toHaveCount(26);
});

test("Desktop navigation retains context and never models browse-only filter results", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Primary", exact: true });
  await page.getByLabel("Baseline: minutes until boarding starts").fill("42");
  await nav.getByRole("link", { name: "Explore", exact: true }).click();
  await expect(page).toHaveURL(/\/explore$/);
  await page.getByRole("combobox", { name: "Terminal", exact: true }).selectOption({ label: "Harvey Milk Terminal 1" });
  await nav.getByRole("link", { name: "Results", exact: true }).click();
  await expect(page).toHaveURL(/\/recommendations$/);
  await expect(page.getByText(/Baseline: 42 min/)).toBeVisible();
  const ranked = page.getByRole("region", { name: "Ranked recommendations", exact: true });
  await expect(ranked.getByRole("article")).toHaveCount(3);
  await expect(ranked.getByLabel(/^Not eligible for time modeling/)).toHaveCount(3);
  await expect(ranked.getByRole("definition")).toHaveCount(0);
  await nav.getByRole("link", { name: "Flight", exact: true }).click();
  await expect(page.getByLabel("Baseline: minutes until boarding starts")).toHaveValue("42");
  await expect(nav.getByRole("link", { name: "Flight", exact: true })).toHaveAttribute("aria-current", "page");
});

test("Demo estimates and What-if update visible margins without changing baseline", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("checkbox", { name: /Demo estimates for wait/ }).check();
  await expect(page.getByText(/These are simulated scenarios, not measured SFO times/)).toBeVisible();
  await page.getByRole("link", { name: "View results", exact: true }).click();
  const ranked = page.getByRole("region", { name: "Ranked recommendations", exact: true });
  const card = ranked.getByRole("article", { name: "Burger Joint", exact: true });
  // Approved main retains 14 explanatory ineligible cards on this page.
  await expect(ranked.getByLabel(/^Feasible in model\./)).toHaveCount(12);
  await expect(ranked.getByLabel(/^Not eligible for time modeling/)).toHaveCount(14);
  await expect(card.getByText("Queue: Demo estimate", { exact: true })).toBeVisible();
  await expect(card.getByText("Activity: Demo estimate", { exact: true })).toBeVisible();
  // Independent demo arithmetic: 3 outbound + 3 return + 8 queue + 10 activity
  // + 10 buffer = 34 required; 50 - 34 = +16. Not actual SFO walk times.
  await expect(
    card.getByRole("group", { name: "Time budget breakdown" }),
  ).toBeVisible();
  await expect(card.getByText(/Total required \(model\):.*34 min/)).toBeVisible();
  await expect(card.getByText(/Margin:.*\+16 min/)).toBeVisible();
  const simulator = page.getByRole("region", { name: "What-if simulator", exact: true });
  const comparison = simulator.getByRole("listitem").filter({
    has: page.getByRole("heading", { name: "Burger Joint", exact: true }),
  });
  await simulator.getByLabel("Scenario: minutes until boarding starts").fill("35");
  await expect(comparison.getByText("Model margin: +1 min", { exact: true })).toBeVisible();
  await expect(comparison.getByLabel(/^Tight in model\./)).toBeVisible();
  await simulator.getByLabel(/Scenario: simulated queue adjustment/).fill("7");
  await expect(comparison.getByText("Model deficit: −6 min", { exact: true })).toBeVisible();
  await expect(comparison.getByLabel(/^Over budget in model\./)).toBeVisible();
  await expect(comparison.getByText("Model margin: +16 min", { exact: true })).toBeVisible();
  await expect(card.getByText(/Margin:.*\+16 min/)).toBeVisible();
  await simulator.getByLabel("Scenario: minutes until boarding starts").fill("invalid");
  await expect(simulator.getByText("Fix scenario inputs to compare results.", { exact: true })).toBeVisible();
  await expect(simulator.getByRole("listitem")).toHaveCount(0);
  await expect(ranked.getByRole("article")).toHaveCount(26);
});
