import { firstLastForMie, type GsaLocation } from "@/lib/gsa";

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Monthly lodging + M&IE table for a GSA location. Groups consecutive months
 *  that share the same lodging rate so seasonal swings read clearly. */
export default function RateTable({ loc }: { loc: GsaLocation }) {
  const groups: { months: string[]; rate: number }[] = [];
  loc.lodging.forEach((rate, i) => {
    const last = groups[groups.length - 1];
    if (last && last.rate === rate) last.months.push(MONTHS[i]);
    else groups.push({ months: [MONTHS[i]], rate });
  });

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200">
      <table className="w-full text-sm">
        <thead className="bg-stone-50 text-left text-stone-500">
          <tr><th className="px-4 py-2 font-medium">Months</th><th className="px-4 py-2 font-medium">Lodging (per night)</th></tr>
        </thead>
        <tbody>
          {groups.map((g, i) => (
            <tr key={i} className="border-t border-stone-100">
              <td className="px-4 py-2">{g.months.length === 12 ? "All year" : `${g.months[0]}–${g.months[g.months.length - 1]}`}</td>
              <td className="px-4 py-2 font-medium text-stone-900">{usd(g.rate)}</td>
            </tr>
          ))}
          <tr className="border-t border-stone-200 bg-stone-50">
            <td className="px-4 py-2 text-stone-600">M&amp;IE (per day)</td>
            <td className="px-4 py-2 font-medium text-stone-900">{usd(loc.mie)} <span className="font-normal text-stone-500">· {usd(firstLastForMie(loc.mie))} first/last day</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
