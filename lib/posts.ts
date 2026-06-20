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

const WEEK2_POSTS: Post[] = [
  {
    slug: "va-mileage-reimbursement",
    title: "VA Mileage Reimbursement for Veterans",
    description:
      "Veterans enrolled in VA healthcare can be reimbursed for mileage to VA facilities. Here's the rate, eligibility rules, and how to file a travel claim.",
    keyword: "va mileage reimbursement",
    date: "2026-06-20",
    readMins: 5,
    body: [
      { type: "p", text: "The VA Beneficiary Travel program reimburses eligible veterans for the cost of traveling to and from VA medical appointments. If you meet the income or disability criteria, you can recover a portion of every mile you drive to a VA facility." },
      { type: "h2", text: "Who qualifies for VA travel pay" },
      { type: "ul", items: [
        "Veterans with a service-connected disability rated 30% or higher.",
        "Veterans whose household income falls at or below the VA pension threshold.",
        "Veterans traveling for a VA-approved compensation and pension exam.",
        "Some veterans receiving care for a non-service-connected condition may also qualify — check with your local VA travel office.",
      ] },
      { type: "h2", text: "The VA beneficiary travel mileage rate" },
      { type: "p", text: "The VA sets its own mileage reimbursement rate for beneficiary travel — separate from the IRS business mileage rate. Check the current rate at benefits.va.gov or ask your local VA facility, as the rate is updated periodically." },
      { type: "h2", text: "The deductible" },
      { type: "p", text: "Most veterans pay a round-trip deductible per appointment. Veterans with a service-connected rating of 30% or higher or those who meet the income threshold have the deductible waived. If you make multiple VA trips in one month, there is an annual maximum deductible cap." },
      { type: "h2", text: "How to file a VA mileage claim" },
      { type: "ul", items: [
        "Online: submit through the VA's AccessVA travel reimbursement portal at ebenefits.va.gov.",
        "At the facility: use a beneficiary travel self-service kiosk on the day of your appointment.",
        "By mail: complete VA Form 10-3542 and send it to your VA medical center's travel office.",
        "Claims must be filed within 30 days of the appointment.",
      ] },
      { type: "h2", text: "Estimate before you go" },
      { type: "p", text: "Before each appointment, enter your mileage in PerDiemWise to estimate the reimbursement you'll receive after the deductible is applied. It helps you decide whether driving or taking VA-arranged transport makes more sense." },
    ],
  },
  {
    slug: "calculating-mileage-reimbursement",
    title: "Calculating Mileage Reimbursement Step by Step",
    description:
      "Multiply business miles by the IRS rate, submit a mileage log, and round to two decimal places. Here's exactly how to calculate reimbursement in 2026.",
    keyword: "calculating mileage reimbursement",
    date: "2026-06-20",
    readMins: 5,
    body: [
      { type: "p", text: "Mileage reimbursement is calculated by multiplying the number of business miles driven by an agreed-upon rate — usually the IRS standard rate, which for 2026 is 72.5 cents per mile." },
      { type: "h2", text: "Step 1: Count only business miles" },
      { type: "p", text: "Business miles include travel between job sites, to client meetings, and to temporary work locations. They do NOT include commuting miles — the drive from your home to your regular office is personal travel and is not reimbursable." },
      { type: "h2", text: "Step 2: Apply the rate" },
      { type: "ul", items: [
        "IRS standard rate 2026: 72.5 cents per mile for business.",
        "Example: 80 miles × $0.725 = $58.00.",
        "If your employer uses a different rate, multiply by that rate instead.",
      ] },
      { type: "h2", text: "Step 3: Round and submit with a log" },
      { type: "p", text: "Round the total to two decimal places and attach a mileage log showing: the date, starting point, ending point, business purpose, and total miles for each trip. A log is required for the reimbursement to be tax-free under IRS accountable plan rules." },
      { type: "h2", text: "Step 4: Total multi-leg trips correctly" },
      { type: "p", text: "If you drive from the office to Client A, then to Client B, then back, count each leg separately and add them. PerDiemWise's mileage calculator handles multi-leg totals automatically, saving you the arithmetic." },
      { type: "h2", text: "What if I'm not reimbursed?" },
      { type: "p", text: "If your employer does not reimburse business mileage, self-employed workers can deduct it on Schedule C. Employees who are not reimbursed generally cannot deduct it on federal returns (the deduction for unreimbursed employee expenses is suspended for most filers)." },
    ],
  },
  {
    slug: "claiming-mileage-deduction-taxes",
    title: "Claiming Mileage on Your Taxes: 2026 Guide",
    description:
      "Self-employed workers can deduct business miles at 72.5 cents per mile on Schedule C. Here's what qualifies and how to claim the 2026 mileage deduction.",
    keyword: "claiming mileage on taxes",
    date: "2026-06-20",
    readMins: 6,
    body: [
      { type: "p", text: "Claiming a mileage deduction can meaningfully reduce your tax bill — but the rules differ depending on whether you are self-employed, an employee, or driving for medical or charitable purposes." },
      { type: "h2", text: "Self-employed: Schedule C" },
      { type: "p", text: "If you are self-employed, a sole proprietor, or an independent contractor, you can deduct business miles on Schedule C. The 2026 IRS standard mileage rate is 72.5 cents per mile for business." },
      { type: "h2", text: "Employees: limited deduction" },
      { type: "p", text: "The Tax Cuts and Jobs Act of 2017 suspended the federal deduction for unreimbursed employee business expenses through at least 2025 (tax year). For most employees, unreimbursed mileage is not deductible on your federal return. Some states — including California, New York and New Jersey — still allow the deduction on state returns." },
      { type: "h2", text: "Medical mileage" },
      { type: "p", text: "You can deduct miles driven to receive medical care on Schedule A (itemised deductions), subject to the 7.5% AGI threshold. The 2026 medical mileage rate is 20.5 cents per mile." },
      { type: "h2", text: "Charitable mileage" },
      { type: "p", text: "Miles driven for a qualified charity are deductible on Schedule A at 14 cents per mile, a rate fixed by statute." },
      { type: "h2", text: "Standard mileage vs. actual expenses" },
      { type: "ul", items: [
        "Standard mileage: multiply miles × the IRS rate. Simple, no receipts needed for vehicle costs.",
        "Actual expenses: track gas, insurance, depreciation, repairs and multiply by the business-use percentage. Better when your vehicle costs are high.",
        "You must choose your method in the first year you use the vehicle for business and generally stick with it.",
      ] },
      { type: "h2", text: "Keep a contemporaneous log" },
      { type: "p", text: "The IRS requires a mileage log with the date, destination, business purpose and miles for every trip. Reconstruct logs are rarely accepted in an audit. Use PerDiemWise to total your miles per trip so the log is always ready." },
    ],
  },
  {
    slug: "what-is-a-travel-stipend",
    title: "What Is a Travel Stipend? A Complete Guide",
    description:
      "A travel stipend is a fixed allowance for business travel costs. Here's how it differs from per diem, how stipends are taxed, and who typically receives one.",
    keyword: "travel stipend",
    date: "2026-06-20",
    readMins: 5,
    body: [
      { type: "p", text: "A travel stipend is a fixed allowance paid to cover travel-related costs — commuting, business trips, or remote-work home-office expenses. Unlike per diem, which follows GSA daily rates, a travel stipend is set by the employer at whatever amount the company decides." },
      { type: "h2", text: "How a travel stipend differs from per diem" },
      { type: "ul", items: [
        "Per diem: tied to GSA lodging and M&IE rates for a specific destination. Tax-free if within the federal limit.",
        "Travel stipend: employer-set flat amount. May or may not follow GSA rates.",
        "A stipend paid above the GSA limit without an expense report is treated as taxable wages.",
      ] },
      { type: "h2", text: "Common types of travel stipends" },
      { type: "ul", items: [
        "Commuter stipend: covers transit passes, parking, or fuel for regular commuters.",
        "Remote-work stipend: covers internet, home-office equipment, or co-working space — not strictly travel, but structured the same way.",
        "Business-travel stipend: covers flights, hotels and meals for work trips, sometimes as a monthly flat amount.",
      ] },
      { type: "h2", text: "Tax treatment of a travel stipend" },
      { type: "p", text: "A travel stipend is tax-free only when it follows IRS accountable plan rules: it must be for a genuine business purpose, substantiated with documentation, and any excess must be returned. A no-strings stipend paid on a payroll cycle is taxable compensation — you'll see it on your W-2." },
      { type: "h2", text: "Should your company offer a stipend or per diem?" },
      { type: "p", text: "Per diem is better for frequent travellers who visit different cities — the rate adjusts to the cost of the destination. A flat stipend is simpler to administer for employees with predictable, routine travel costs. Many companies use both: per diem for business travel and a flat stipend for commuting." },
    ],
  },
  {
    slug: "mileage-reimbursement-policy-template",
    title: "Mileage Reimbursement Policy: What to Include",
    description:
      "A written mileage policy sets the rate, log format, and submission deadline. Here's what every HR team should include and a sample framework to adapt.",
    keyword: "mileage reimbursement policy",
    date: "2026-06-20",
    readMins: 6,
    body: [
      { type: "p", text: "A clear mileage reimbursement policy reduces disputes, keeps reimbursements tax-free, and ensures employees know exactly what to do when they drive for work. Here's what to include." },
      { type: "h2", text: "1. Who is eligible" },
      { type: "p", text: "State which employees or contractors are covered: all employees who use a personal vehicle for work, field staff only, or managers at a certain grade level. Also define what trips qualify — client visits, inter-office travel, job-site inspections — and explicitly exclude home-to-office commuting." },
      { type: "h2", text: "2. The reimbursement rate" },
      { type: "p", text: "Most companies reimburse at the IRS standard mileage rate (72.5 cents per mile for 2026) to keep reimbursements tax-free. If you pay above the rate, the excess is taxable. Some employers use a tiered rate that falls as annual miles increase." },
      { type: "h2", text: "3. Mileage log requirements" },
      { type: "ul", items: [
        "Date of each trip.",
        "Starting address and ending address (or odometer readings).",
        "Business purpose of the trip.",
        "Total miles per trip.",
      ] },
      { type: "h2", text: "4. Submission deadline" },
      { type: "p", text: "Require employees to submit mileage for the prior month within a set window — 15 days after month-end is common. Late submissions may be denied or delayed until the next payroll cycle." },
      { type: "h2", text: "5. Approval workflow" },
      { type: "p", text: "Specify who reviews and approves mileage reports — usually the direct manager. Large claims may require a second-level approval." },
      { type: "h2", text: "6. What happens if you pay above the IRS rate" },
      { type: "p", text: "Any amount above the IRS standard rate is treated as taxable wages unless you require a detailed log comparing actual vehicle costs to the IRS rate. Most companies find it simpler to match the IRS rate exactly and avoid the paperwork." },
    ],
  },
  {
    slug: "irs-accountable-plan-travel-expenses",
    title: "IRS Accountable Plan Rules for Travel Expenses",
    description:
      "Reimbursements under an IRS accountable plan are tax-free for employees. Here's the three-part test your travel expense policy must meet to qualify.",
    keyword: "irs travel reimbursement guidelines",
    date: "2026-06-20",
    readMins: 5,
    body: [
      { type: "p", text: "An IRS accountable plan is a set of expense-reimbursement rules that keeps travel payments tax-free for both the employer and the employee. Without it, reimbursements are treated as taxable wages." },
      { type: "h2", text: "The three-part accountable plan test" },
      { type: "ul", items: [
        "Business connection: the expense must be for a genuine business purpose — not personal travel.",
        "Substantiation: the employee must submit documentation (receipts, mileage log, expense report) showing the amount, date, place and purpose within a reasonable time (45 days is the IRS safe harbour).",
        "Return of excess: any amount paid in advance that exceeds actual expenses must be returned within 120 days.",
      ] },
      { type: "h2", text: "What happens without an accountable plan" },
      { type: "p", text: "A \"non-accountable plan\" — where employees receive a flat travel allowance with no requirement to document or return excess — makes the entire allowance taxable compensation subject to income tax and payroll taxes. The employer also loses the ability to deduct those reimbursements as a travel expense." },
      { type: "h2", text: "Per diem under an accountable plan" },
      { type: "p", text: "When you use the GSA per diem rates and employees file expense reports showing the destination, dates and business purpose, the reimbursement is automatically within the accountable plan framework. You do not need lodging receipts — only evidence of the trip itself." },
      { type: "h2", text: "How to build a compliant policy" },
      { type: "p", text: "Write an expense reimbursement policy that requires employees to submit a report with the four substantiation points (date, destination, business purpose, amount) within 45 days. Use the GSA per diem rates as your daily ceiling, and require any pre-paid advances to be reconciled and excess returned. PerDiemWise produces itemised, rate-backed trip totals that fit neatly into this documentation workflow." },
    ],
  },
  {
    slug: "how-to-set-per-diem-policy",
    title: "How to Set a Per Diem Policy for Your Company",
    description:
      "Setting a per diem policy means choosing a rate, defining who qualifies, and establishing the documentation rules. Here's a practical starting point.",
    keyword: "per diem policy",
    date: "2026-06-20",
    readMins: 6,
    body: [
      { type: "p", text: "A per diem policy tells employees how much they will be reimbursed each day for lodging and meals while travelling on company business — no receipts required for M&IE. Here's how to build one that works." },
      { type: "h2", text: "Choose a rate structure" },
      { type: "ul", items: [
        "GSA rates: reimburse at the federal rate for each destination. Amounts vary by city and month. Best for companies that send employees across many locations.",
        "Fixed rate: a single flat per diem regardless of city (e.g. $200/day). Simpler to budget, but employees in expensive cities may find it insufficient.",
        "Tiered structure: one rate for high-cost cities (e.g. NYC, San Francisco) and a lower rate for standard destinations.",
      ] },
      { type: "h2", text: "Decide what the per diem covers" },
      { type: "p", text: "Most policies cover lodging and M&IE separately. Some companies pay per diem only for M&IE and reimburse actual lodging on receipt. Others pay a fully combined daily rate. Be explicit so employees know what the allowance is meant to cover." },
      { type: "h2", text: "Apply the first-and-last-day rule" },
      { type: "p", text: "GSA policy pays M&IE at 75% on the first and last day of a trip. Matching this rule in your policy keeps reimbursements within the tax-free limit and aligns with what federal auditors expect." },
      { type: "h2", text: "Set eligibility and approval rules" },
      { type: "ul", items: [
        "Who is covered: all travelling employees, directors and above, or specific roles.",
        "What trips qualify: customer visits, conferences, training, internal meetings with overnight travel.",
        "Pre-approval: trips over a certain length or cost may need manager sign-off in advance.",
      ] },
      { type: "h2", text: "Documentation requirements" },
      { type: "p", text: "Per diem for M&IE does not require meal receipts, but you still need documentation of the trip itself: dates, destination and business purpose. Require employees to submit an expense report within 30 days of returning. For lodging, require the hotel receipt even when reimbursing at per diem." },
    ],
  },
  {
    slug: "per-diem-employee-rights",
    title: "Per Diem Employee Rights: Are You Entitled?",
    description:
      "Most private-sector employees aren't legally entitled to per diem, but some jobs and contracts require it. Here's when and how much you can expect.",
    keyword: "per diem employee rights",
    date: "2026-06-20",
    readMins: 5,
    body: [
      { type: "p", text: "Per diem is not a universal right in the private sector. Whether you receive it — and how much — depends on your employment contract, union agreement, or company policy. Here's how it breaks down." },
      { type: "h2", text: "Private-sector employees" },
      { type: "p", text: "Federal law (the Fair Labor Standards Act) does not require private employers to pay per diem or travel expense reimbursements, as long as any expenses that would bring pay below minimum wage are reimbursed. However, if your employment contract, offer letter or company policy promises per diem, you are entitled to it under that agreement." },
      { type: "h2", text: "Government employees and contractors" },
      { type: "p", text: "Federal employees who travel on official business are entitled to per diem at GSA rates under the Federal Travel Regulation. State and local government employees are typically covered by equivalent state travel regulations. Federal contractors are governed by the Federal Acquisition Regulation, which limits allowable travel to the GSA rate." },
      { type: "h2", text: "Union-covered workers" },
      { type: "p", text: "Many collective bargaining agreements specify per diem amounts, usually at or above the GSA rate. If you are covered by a union contract, check the travel and reimbursement provisions — per diem is often guaranteed and the rate may be higher than your employer's standard policy." },
      { type: "h2", text: "When it can be withheld" },
      { type: "ul", items: [
        "You didn't submit an expense report or documentation of the trip.",
        "The trip wasn't pre-approved as required by company policy.",
        "You stayed with family instead of a hotel and the policy requires an actual lodging expense.",
        "You cancelled or shortened a trip and per diem was already paid as an advance.",
      ] },
      { type: "h2", text: "What to do if your per diem is denied" },
      { type: "p", text: "Start with your company's expense policy and HR department. If the denial contradicts a written policy or contract, raise it in writing. For government employees and contractors, disputes may be addressed through the contracting officer or your agency's travel office." },
    ],
  },
  {
    slug: "travel-expense-reimbursement-guide",
    title: "Travel Expense Reimbursement: A Complete Guide",
    description:
      "Travel expense reimbursement covers lodging, meals, mileage and more. This guide explains what qualifies, how to submit, and what stays tax-free.",
    keyword: "travel expense reimbursement",
    date: "2026-06-20",
    readMins: 6,
    body: [
      { type: "p", text: "Travel expense reimbursement is how employers pay back employees for out-of-pocket costs incurred on business trips. To stay tax-free, reimbursements must follow IRS accountable plan rules." },
      { type: "h2", text: "What expenses can be reimbursed" },
      { type: "ul", items: [
        "Lodging: hotel stays or short-term rentals for business travel. Often reimbursed at the actual cost up to the GSA lodging cap.",
        "Meals & incidentals: covered via per diem or actual receipts. The GSA M&IE rate is the standard benchmark.",
        "Transportation: airfare, train, rental car, taxi, rideshare, and mileage if you drive your own vehicle.",
        "Parking and tolls: typically reimbursed at actual cost on top of per diem.",
        "Conference fees, business calls and essential supplies: can be included if the employer policy allows.",
      ] },
      { type: "h2", text: "What is NOT reimbursable" },
      { type: "ul", items: [
        "Personal meals when you are not away from home overnight.",
        "Commuting from home to your regular workplace.",
        "Alcohol, unless your policy explicitly covers client entertainment.",
        "Personal side trips added to a business journey.",
      ] },
      { type: "h2", text: "How to submit a travel expense claim" },
      { type: "ul", items: [
        "Complete an expense report with dates, destination and business purpose.",
        "Attach receipts for lodging and any out-of-pocket meals above the per diem limit.",
        "Attach a mileage log if you drove your own vehicle.",
        "Submit within the deadline set by your employer (typically 30-45 days after returning).",
      ] },
      { type: "h2", text: "Tax-free vs. taxable reimbursement" },
      { type: "p", text: "Reimbursements within the GSA per diem rates, supported by a trip report, are generally tax-free. Amounts above the federal per diem, or any amount paid without documentation, become taxable wages. PerDiemWise calculates a GSA-rate total you can attach directly to your expense report." },
    ],
  },
  {
    slug: "types-of-per-diem-allowances",
    title: "Types of Per Diem Allowances Explained",
    description:
      "Per diem comes in two forms: a lodging cap and an M&IE daily amount. Some employers also pay a flat combined stipend. Here's how each type works and is taxed.",
    keyword: "per diem allowance",
    date: "2026-06-20",
    readMins: 5,
    body: [
      { type: "p", text: "\"Per diem allowance\" can mean several different things depending on who is paying and under what rules. Here's how to tell them apart." },
      { type: "h2", text: "1. GSA per diem (federal standard)" },
      { type: "p", text: "The General Services Administration publishes separate rates for lodging (per night) and M&IE (per day) for hundreds of US cities. These are the benchmark for federal employee travel and for most government contractor reimbursements. They vary by city and, for lodging, by month." },
      { type: "h2", text: "2. Private-employer per diem" },
      { type: "p", text: "Many companies mirror the GSA rates to keep reimbursements tax-free. Others set a single flat daily allowance (e.g. $250 all-in) that employees can use as they see fit. A flat rate above the GSA level for a given city turns the excess into taxable income." },
      { type: "h2", text: "3. M&IE-only per diem" },
      { type: "p", text: "Some employers pay per diem only for meals and incidentals and reimburse actual lodging on receipt. This is the most common hybrid — it removes the need for meal receipts without giving employees a blank cheque for hotels." },
      { type: "h2", text: "4. International per diem (OCONUS)" },
      { type: "p", text: "Travel outside the continental US uses rates set by the Department of Defense (for military and civilian DoD employees) or the State Department (for foreign affairs employees). These OCONUS rates can be significantly higher than domestic GSA rates in expensive cities." },
      { type: "h2", text: "Tax treatment across allowance types" },
      { type: "ul", items: [
        "At or below the GSA rate, with a trip report: fully tax-free under the IRS accountable plan.",
        "Above the GSA rate: excess is taxable wages, subject to income tax and payroll tax.",
        "No report required: the entire per diem becomes taxable, regardless of amount.",
      ] },
    ],
  },
  {
    slug: "mileage-tax-deduction-self-employed",
    title: "Mileage Tax Deduction for the Self-Employed",
    description:
      "Self-employed workers can deduct business miles on Schedule C at 72.5 cents per mile. Here's what counts as business use and what records you need.",
    keyword: "mileage tax deduction",
    date: "2026-06-20",
    readMins: 5,
    body: [
      { type: "p", text: "If you are self-employed — whether as a sole proprietor, freelancer or independent contractor — you can deduct the business use of your vehicle directly on Schedule C. The 2026 IRS standard mileage rate is 72.5 cents per mile." },
      { type: "h2", text: "What counts as a business mile" },
      { type: "ul", items: [
        "Driving to a client or customer location.",
        "Driving between two business locations.",
        "Travel to a bank, post office, or supply store for business purposes.",
        "Travel to a temporary work site away from your usual place of business.",
      ] },
      { type: "h2", text: "What does NOT count" },
      { type: "ul", items: [
        "Driving from home to your primary place of business (commuting is not deductible).",
        "Personal errands, even if they occur during a work trip.",
        "Miles driven for an employee job when you have both employee and self-employed income.",
      ] },
      { type: "h2", text: "Standard mileage vs. actual expenses" },
      { type: "p", text: "You can choose between the standard mileage rate (72.5 cents for 2026, simpler) or tracking actual vehicle expenses (gas, insurance, oil changes, depreciation) and multiplying by business-use percentage. You must choose in the first year you use the vehicle and may need to stick with that method for that vehicle." },
      { type: "h2", text: "How to report on Schedule C" },
      { type: "p", text: "Enter vehicle expenses on Part II, Line 9 (Car and truck expenses). In Part IV of Schedule C, report total miles, business miles, commuting miles and personal miles for the year, and whether you have evidence to support the business-use claim." },
      { type: "h2", text: "Records to keep" },
      { type: "p", text: "Keep a contemporaneous mileage log: date, starting and ending location, business purpose and miles. The IRS scrutinises vehicle deductions heavily — reconstructed logs based on memory are not reliable in an audit." },
    ],
  },
  {
    slug: "irs-mileage-reimbursement-rules",
    title: "IRS Mileage Reimbursement Rules for Employers",
    description:
      "Employers can reimburse business mileage tax-free at the IRS rate under an accountable plan. Here's what to document and when reimbursement becomes taxable.",
    keyword: "irs mileage reimbursement",
    date: "2026-06-20",
    readMins: 5,
    body: [
      { type: "p", text: "Employers can reimburse employees for business mileage tax-free — but only when the reimbursement follows IRS accountable plan rules and stays within the standard mileage rate. Here's what you need to know." },
      { type: "h2", text: "The 2026 IRS standard mileage rate" },
      { type: "p", text: "The IRS sets the optional standard mileage rate each December for the following year. For 2026, the business mileage rate is 72.5 cents per mile. Reimbursing at or below this rate keeps the payment outside the employee's gross income." },
      { type: "h2", text: "What makes a mileage reimbursement tax-free" },
      { type: "ul", items: [
        "The reimbursement is for actual business driving — not commuting or personal trips.",
        "The employee submits a mileage log with dates, destinations, business purpose and miles within 60 days.",
        "The reimbursement amount does not exceed the IRS rate.",
      ] },
      { type: "h2", text: "When reimbursement becomes taxable" },
      { type: "ul", items: [
        "You pay above 72.5 cents per mile — the excess is wages.",
        "Employees don't submit logs — the entire reimbursement is a taxable non-accountable plan payment.",
        "You pay a flat car allowance with no log requirement — the full allowance is taxable.",
      ] },
      { type: "h2", text: "FAVR: an alternative to the IRS rate" },
      { type: "p", text: "Fixed and Variable Rate (FAVR) reimbursement programmes calculate a per-mile rate based on actual regional fuel and insurance costs. They can legally exceed the IRS standard mileage rate without triggering income tax, but they require IRS-approved actuarial data and more administration." },
      { type: "h2", text: "Car allowances vs. mileage reimbursement" },
      { type: "p", text: "A monthly car allowance (e.g. $500/month) paid without mileage logs is taxable income to the employee. Mileage reimbursement — pay per mile driven for business — is tax-free when properly documented. Most employers find the mileage approach creates less payroll-tax exposure." },
    ],
  },
  {
    slug: "per-diem-policy-example",
    title: "Per Diem Policy Example: A Sample Template",
    description:
      "A sample per diem policy covering daily lodging and M&IE limits, the 75% travel-day rule, and the claim submission process your employees should follow.",
    keyword: "per diem policy example",
    date: "2026-06-20",
    readMins: 5,
    body: [
      { type: "p", text: "Here is a sample per diem policy framework that companies of any size can adapt. It mirrors the GSA structure to keep reimbursements inside the tax-free limit." },
      { type: "h2", text: "Policy scope and purpose" },
      { type: "p", text: "This policy covers all employees and contractors who travel on company business overnight or for a full day away from their primary work location. It replaces the need to submit meal receipts for trips that fall within the daily limits." },
      { type: "h2", text: "Daily allowances" },
      { type: "ul", items: [
        "Lodging: reimbursed at the actual cost up to the current GSA lodging rate for the destination city and travel month.",
        "Meals & incidentals (M&IE): reimbursed at the GSA M&IE rate for the destination city.",
        "First and last day of travel: M&IE is paid at 75% of the full daily rate.",
        "Standard CONUS rate applies to any destination not separately listed by GSA.",
      ] },
      { type: "h2", text: "What per diem does not cover" },
      { type: "ul", items: [
        "Alcohol and entertainment — reimbursed separately with manager approval.",
        "Meals at your primary work location on a non-travel day.",
        "Commuting from home to the office.",
      ] },
      { type: "h2", text: "Claim submission requirements" },
      { type: "ul", items: [
        "Submit an expense report within 30 days of the trip end date.",
        "Include: destination, dates of travel, and business purpose.",
        "Attach the hotel receipt for lodging.",
        "Meal receipts are not required when claiming the GSA M&IE rate.",
      ] },
      { type: "h2", text: "Approval workflow" },
      { type: "p", text: "Expense reports must be approved by the traveller's direct manager. Trips with lodging that exceeds the GSA rate require VP-level approval in advance. Unapproved expenses above the policy limit will not be reimbursed." },
      { type: "h2", text: "Rates and tools" },
      { type: "p", text: "Employees can look up the GSA per diem rate for their destination and automatically calculate the trip total — including the 75% first-and-last-day M&IE rule — using PerDiemWise. Print the result and attach it to the expense report." },
    ],
  },
];

POSTS.push(...WEEK2_POSTS);
