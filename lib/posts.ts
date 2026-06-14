export type Block =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

export interface Post {
  slug: string;
  title: string;
  description: string;
  keyword: string;
  date: string;
  readMins: number;
  body: Block[];
}

export const POSTS: Post[] = [
  {
    slug: "what-is-per-diem",
    title: "What Is Per Diem? A Plain-English Guide",
    description:
      "Per diem is a flat daily allowance for lodging, meals and incidentals on a business trip. Here's how it works, who sets the rates, and how to use it.",
    keyword: "what is per diem",
    date: "2026-06-14",
    readMins: 5,
    body: [
      { type: "p", text: "Per diem is Latin for \"per day.\" Instead of saving every receipt, a traveller is paid a fixed daily amount to cover lodging plus meals and incidental expenses (M&IE) while away on business. For US federal travel — and for most companies and government contractors that mirror the federal system — those daily amounts are set by the General Services Administration (GSA)." },
      { type: "h2", text: "The two parts of a per diem" },
      { type: "ul", items: [
        "Lodging — a maximum nightly rate for your hotel, which varies by city and by month (it's higher in peak season).",
        "M&IE — a flat daily allowance for meals and small incidentals such as tips. The full M&IE rate applies on full travel days.",
      ] },
      { type: "h2", text: "The standard rate covers most of the country" },
      { type: "p", text: "GSA publishes specific rates for a few hundred higher-cost cities and counties. Everywhere else falls under the standard CONUS (continental US) rate, which for FY2026 is $110 for lodging and $68 for M&IE — $178 a day combined." },
      { type: "h2", text: "Why per diem beats keeping receipts" },
      { type: "p", text: "Per diem removes the paperwork: travellers don't itemise every coffee, and finance teams don't audit them. As long as the trip is documented (dates, destination, business purpose) and the amount stays within the federal rate, the reimbursement is not treated as taxable income to the employee." },
    ],
  },
  {
    slug: "is-per-diem-taxable",
    title: "Is Per Diem Taxable? When It Counts as Income",
    description:
      "Per diem within the federal rate, backed by an expense report, is tax-free. Here's when per diem becomes taxable wages and how to keep it clean.",
    keyword: "is per diem taxable",
    date: "2026-06-14",
    readMins: 5,
    body: [
      { type: "p", text: "Per diem is usually not taxable — but only if it follows the IRS \"accountable plan\" rules. Cross those lines and some or all of it becomes taxable wages reported on your W-2." },
      { type: "h2", text: "Per diem is tax-free when…" },
      { type: "ul", items: [
        "The payment does not exceed the federal per diem rate for that location and date.",
        "You file an expense report showing the time, place and business purpose of the trip.",
        "You return any amount paid in advance that exceeds your actual days of travel.",
      ] },
      { type: "h2", text: "When per diem becomes taxable" },
      { type: "p", text: "If your employer pays more than the federal rate, the excess is taxable. If you never file an expense report (a \"non-accountable plan\"), the entire per diem is taxable and subject to payroll tax. Flat travel stipends with no substantiation are the most common way per diem accidentally turns into income." },
      { type: "h2", text: "The first-and-last-day catch" },
      { type: "p", text: "Because M&IE is only paid at 75% on your first and last travel day, paying a full day's M&IE on those days technically overshoots the federal rate. A compliant calculator applies the 75% rule automatically so the total stays inside the tax-free limit." },
    ],
  },
  {
    slug: "gsa-per-diem-first-and-last-day-75-percent-rule",
    title: "The 75% First-and-Last-Day Per Diem Rule",
    description:
      "On your first and last day of travel, M&IE per diem is paid at 75%, not 100%. Here's why, and how it changes a trip total.",
    keyword: "per diem first and last day",
    date: "2026-06-14",
    readMins: 4,
    body: [
      { type: "p", text: "One rule trips up almost everyone calculating per diem by hand: meals & incidentals (M&IE) are paid at only 75% on the day you leave and the day you return — regardless of what time you actually travel." },
      { type: "h2", text: "Why three-quarters?" },
      { type: "p", text: "The federal travel rules assume you don't need a full day of meals when you're only partly away — you ate breakfast at home before you left, or you'll have dinner at home the night you get back. So the GSA M&IE table lists a reduced \"first & last day\" amount for every tier." },
      { type: "h2", text: "What it looks like in dollars" },
      { type: "ul", items: [
        "Standard $68 M&IE → $51 on the first and last day.",
        "$74 tier → $55.50 · $80 tier → $60 · $86 tier → $64.50 · $92 tier → $69.",
      ] },
      { type: "h2", text: "A worked example" },
      { type: "p", text: "A three-day trip to a $68 M&IE city pays $51 (day 1) + $68 (day 2) + $51 (day 3) = $170 in M&IE, not $204. Lodging is added for the two nights you actually stay. PerDiemWise applies this automatically so you never overstate a claim." },
    ],
  },
  {
    slug: "how-to-calculate-per-diem-for-a-business-trip",
    title: "How to Calculate Per Diem for a Business Trip",
    description:
      "Step by step: find the GSA rate for your destination, apply the 75% first-and-last-day rule to M&IE, add lodging per night, and total the trip.",
    keyword: "how to calculate per diem",
    date: "2026-06-14",
    readMins: 6,
    body: [
      { type: "p", text: "Calculating per diem is four steps once you know the rules. Here's the whole process for a typical multi-day trip." },
      { type: "h2", text: "1. Look up the destination rate" },
      { type: "p", text: "Find the GSA lodging and M&IE rates for the city you're visiting. If the city isn't separately listed, use the standard CONUS rate ($110 lodging / $68 M&IE for FY2026). Lodging can change by month in seasonal destinations, so use the rate for the month you'll travel." },
      { type: "h2", text: "2. Count nights and days" },
      { type: "p", text: "Lodging is paid per night — a trip that arrives Monday and leaves Wednesday is two nights. M&IE is paid per day, including both travel days." },
      { type: "h2", text: "3. Apply the 75% rule to M&IE" },
      { type: "p", text: "Pay 75% of the M&IE rate on the first and last day and 100% on every full day in between." },
      { type: "h2", text: "4. Add it up" },
      { type: "ul", items: [
        "Lodging = nightly rate × number of nights (using each night's month).",
        "M&IE = (first day 75%) + (full days × 100%) + (last day 75%).",
        "Total per diem = lodging + M&IE.",
      ] },
      { type: "p", text: "That's exactly what PerDiemWise does — pick a city and dates and it returns the itemised, day-by-day total using the real GSA FY2026 figures." },
    ],
  },
  {
    slug: "what-does-per-diem-cover",
    title: "What Does Per Diem Cover? Lodging, Meals & Incidentals",
    description:
      "Per diem covers your hotel (lodging) and your meals and incidentals (M&IE). Here's exactly what's in — and what's not — including incidentals.",
    keyword: "what does per diem cover",
    date: "2026-06-14",
    readMins: 4,
    body: [
      { type: "p", text: "Per diem is split into two buckets, and knowing what's in each keeps you from double-claiming." },
      { type: "h2", text: "Lodging" },
      { type: "p", text: "The nightly room rate, up to the GSA cap for that city and month. Lodging taxes on CONUS travel are usually reimbursed separately and are not counted against the cap." },
      { type: "h2", text: "Meals & incidentals (M&IE)" },
      { type: "ul", items: [
        "Breakfast, lunch and dinner, at the split published in the GSA M&IE table.",
        "Incidentals — a flat $5/day for fees and tips (to porters, hotel staff, and similar).",
      ] },
      { type: "h2", text: "What per diem does not cover" },
      { type: "p", text: "Transportation (airfare, rental car, mileage), baggage fees, conference registration and other actual costs are reimbursed on top of per diem, not from it. Mileage in a personal vehicle is reimbursed at the IRS standard rate — see our mileage calculator." },
    ],
  },
  {
    slug: "meals-and-incidentals-mie-breakdown-explained",
    title: "The GSA M&IE Breakdown, Explained",
    description:
      "Every GSA M&IE tier splits into breakfast, lunch, dinner and incidentals. Here's the FY2026 breakdown and how deductions for provided meals work.",
    keyword: "m&ie breakdown",
    date: "2026-06-14",
    readMins: 4,
    body: [
      { type: "p", text: "M&IE isn't a single number — GSA publishes a breakdown so travellers can deduct any meal that was provided (for example, a conference lunch or a hotel breakfast)." },
      { type: "h2", text: "The FY2026 tiers" },
      { type: "ul", items: [
        "$68 → breakfast $16, lunch $19, dinner $28, incidentals $5",
        "$74 → $18 / $20 / $31 / $5",
        "$80 → $20 / $22 / $33 / $5",
        "$86 → $22 / $23 / $36 / $5",
        "$92 → $23 / $26 / $38 / $5",
      ] },
      { type: "h2", text: "Deduct provided meals" },
      { type: "p", text: "If a meal is provided at no cost to you, subtract that meal's amount from the day's M&IE. The $5 incidental portion always stays, even when all three meals are provided." },
      { type: "h2", text: "And the 75% first/last day" },
      { type: "p", text: "On travel days the whole M&IE figure (including the breakdown) is paid at 75%. Our M&IE calculator shows both the full and reduced amounts for any destination." },
    ],
  },
  {
    slug: "2026-irs-standard-mileage-rate",
    title: "The 2026 IRS Standard Mileage Rates",
    description:
      "The 2026 IRS standard mileage rates: 72.5¢ per mile for business, 20.5¢ for medical/moving and 14¢ for charity. What changed and how to use them.",
    keyword: "2026 irs mileage rate",
    date: "2026-06-14",
    readMins: 4,
    body: [
      { type: "p", text: "On December 29, 2025 the IRS released the optional standard mileage rates for 2026, used to value the deductible cost of operating a vehicle for business, medical, moving or charitable purposes." },
      { type: "h2", text: "The 2026 rates" },
      { type: "ul", items: [
        "Business: 72.5¢ per mile (up 2.5¢ from 2025).",
        "Medical or moving (qualifying active-duty military): 20.5¢ per mile.",
        "Charitable service: 14¢ per mile (fixed by statute).",
      ] },
      { type: "h2", text: "How reimbursement works" },
      { type: "p", text: "Multiply business miles by 72.5¢. A 240-mile round trip for work is 240 × $0.725 = $174.00. Employers who reimburse at or below the IRS rate under an accountable plan pay it tax-free; anything above the rate is taxable to the employee." },
      { type: "h2", text: "Keep a mileage log" },
      { type: "p", text: "The IRS expects a contemporaneous log: date, purpose, start and end point, and miles. Our mileage calculator totals multiple legs so you can build a per-trip figure quickly." },
    ],
  },
  {
    slug: "per-diem-vs-actual-expense-reimbursement",
    title: "Per Diem vs. Actual Expense Reimbursement",
    description:
      "Should you use per diem or reimburse actual receipts? A comparison of paperwork, tax treatment, fairness and when each method wins.",
    keyword: "per diem vs reimbursement",
    date: "2026-06-14",
    readMins: 5,
    body: [
      { type: "p", text: "Companies reimburse travel one of two ways: a flat per diem, or actual expenses backed by receipts. Each has trade-offs." },
      { type: "h2", text: "Per diem" },
      { type: "ul", items: [
        "Minimal paperwork — no receipts for meals.",
        "Predictable budgeting and fast approvals.",
        "Travellers keep any savings if they spend less than the allowance.",
      ] },
      { type: "h2", text: "Actual expense" },
      { type: "ul", items: [
        "Pays exactly what was spent — better for unusually high-cost trips.",
        "Requires receipts and line-by-line review.",
        "No windfall and no shortfall for the traveller.",
      ] },
      { type: "h2", text: "Which to choose" },
      { type: "p", text: "Per diem usually wins for routine domestic travel because it's cheaper to administer and keeps reimbursements inside the tax-free federal limit. Many organisations use per diem for M&IE and actuals for lodging, which is a common GSA-aligned hybrid." },
    ],
  },
  {
    slug: "standard-conus-per-diem-rate-explained",
    title: "The Standard CONUS Per Diem Rate, Explained",
    description:
      "Most US destinations use the standard CONUS rate — $110 lodging and $68 M&IE for FY2026. Here's when it applies and how it differs from city rates.",
    keyword: "standard conus rate",
    date: "2026-06-14",
    readMins: 4,
    body: [
      { type: "p", text: "GSA names specific per diem rates for a few hundred higher-cost cities and counties. Every other location in the continental US (CONUS) uses a single fallback: the standard rate." },
      { type: "h2", text: "FY2026 standard rate" },
      { type: "ul", items: [
        "Lodging: $110 per night.",
        "M&IE: $68 per day ($51 on the first and last travel day).",
        "Combined: $178 per full day on the road.",
      ] },
      { type: "h2", text: "When it applies" },
      { type: "p", text: "If your destination city or county isn't separately listed by GSA, you use the standard rate. PerDiemWise tells you clearly when it has fallen back to the standard rate so there's no ambiguity in your claim." },
      { type: "h2", text: "CONUS vs. OCONUS" },
      { type: "p", text: "Alaska, Hawaii, US territories and foreign locations are \"OCONUS\" and use rates set by the Department of Defense and the State Department, not the GSA CONUS table." },
    ],
  },
  {
    slug: "travel-nurse-per-diem-explained",
    title: "Travel Nurse Per Diem (Stipends), Explained",
    description:
      "How travel-nurse housing and M&IE stipends relate to GSA per diem, and the tax-home rule that keeps them tax-free.",
    keyword: "travel nurse per diem",
    date: "2026-06-14",
    readMins: 5,
    body: [
      { type: "p", text: "Travel-nurse pay packages usually split into a taxable hourly wage plus tax-free stipends for housing and meals. Those stipends are a form of per diem, and agencies typically cap them at the GSA rate for the assignment's location." },
      { type: "h2", text: "The tax-home rule" },
      { type: "p", text: "Stipends are only tax-free if you maintain a permanent \"tax home\" and are duplicating expenses while on assignment. Nurses who give up a permanent residence (\"itinerants\") lose the tax-free treatment and the stipends become taxable income." },
      { type: "h2", text: "How GSA rates set the ceiling" },
      { type: "p", text: "An agency can pay up to the GSA lodging and M&IE rate for the assignment city without it being taxable. Looking up that city's rate tells you the most a stipend can be before tax applies." },
      { type: "h2", text: "Check your assignment city" },
      { type: "p", text: "Search your destination on PerDiemWise to see its FY2026 lodging and M&IE rate, then compare it to your package's stipend." },
    ],
  },
  {
    slug: "per-diem-for-government-contractors",
    title: "Per Diem for Government Contractors",
    description:
      "Federal contractors must bill travel at GSA per diem rates. Here's how the FTR/JTR limits flow into a contract and why documentation matters.",
    keyword: "per diem for government contractors",
    date: "2026-06-14",
    readMins: 5,
    body: [
      { type: "p", text: "If you bill travel on a federal contract, your reimbursements are almost always capped at the GSA per diem rate. Contracting officers reject travel claims that exceed the federal limit or lack documentation." },
      { type: "h2", text: "Why the GSA rate is the ceiling" },
      { type: "p", text: "The Federal Travel Regulation (FTR) and Joint Travel Regulations (JTR) set per diem for federal employees, and the Federal Acquisition Regulation (FAR) ties contractor travel reimbursement to those same limits. Bill above them and the excess is unallowable." },
      { type: "h2", text: "Document every trip" },
      { type: "ul", items: [
        "Destination city and exact dates.",
        "Business purpose tied to the contract.",
        "Lodging at or below the cap, with the 75% rule applied to travel days.",
      ] },
      { type: "h2", text: "Build a defensible figure" },
      { type: "p", text: "PerDiemWise produces an itemised, GSA-rate per-diem total you can attach to a travel voucher — the kind of clean, rate-defensible breakdown a contracting officer expects." },
    ],
  },
  {
    slug: "lodging-rates-change-by-season",
    title: "Why GSA Lodging Rates Change by Month",
    description:
      "Many GSA cities have seasonal lodging caps that rise in peak months. Here's why, and how to use the right month's rate for your trip.",
    keyword: "seasonal per diem rates",
    date: "2026-06-14",
    readMins: 3,
    body: [
      { type: "p", text: "In resort and convention cities, GSA lodging caps move with the season — higher when hotels are expensive, lower in the off-season. Use the rate for the month you actually travel." },
      { type: "h2", text: "Examples of seasonal swings" },
      { type: "ul", items: [
        "San Francisco's FY2026 lodging cap runs $259 most of the year, rising to $272 in the autumn.",
        "Ski and beach towns can swing by hundreds of dollars between peak and off-peak months.",
      ] },
      { type: "h2", text: "M&IE doesn't change by month" },
      { type: "p", text: "Only lodging is seasonal; the M&IE rate for a city is fixed all year. PerDiemWise reads each night's month and applies the correct lodging cap automatically, so a trip that straddles a season change is totalled correctly." },
    ],
  },
];

export function getPost(slug: string): Post | null {
  return POSTS.find((p) => p.slug === slug) ?? null;
}
