"use client";

import { useMemo, useRef, useState } from "react";
import { LOCATIONS, type GsaLocation } from "@/lib/gsa";

// Shared, accessible city picker used by every calculator (single source of
// truth). Full keyboard navigation + ARIA, and an OCONUS warning for
// Alaska/Hawaii/territories/international (not covered by the GSA CONUS table).

const OCONUS_TERMS = [
  "hawaii", "honolulu", "maui", "kauai", "kona", "hilo", "alaska", "anchorage",
  "juneau", "fairbanks", "puerto rico", "san juan", "guam", "virgin islands",
  "saipan", "international", "abroad", "overseas", "canada", "mexico", "europe",
  "london", "tokyo", "paris", "germany", "japan", "england",
];

interface Item { loc: GsaLocation | null; label: string; sub: string; }

export default function CityCombobox({
  initialSlug, onChange, placeholder = "Search a city — or leave blank for the standard rate", idPrefix = "city",
}: {
  initialSlug?: string; onChange: (loc: GsaLocation | null) => void; placeholder?: string; idPrefix?: string;
}) {
  const initial = initialSlug ? LOCATIONS.find((l) => l.slug === initialSlug) : undefined;
  const [query, setQuery] = useState(initial ? `${initial.city}, ${initial.state}` : "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = `${idPrefix}-listbox`;
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase();
    const std: Item = { loc: null, label: "Standard CONUS rate", sub: "$110 + $68" };
    const matched = (q
      ? LOCATIONS.filter((l) => `${l.city} ${l.state} ${l.county ?? ""}`.toLowerCase().includes(q))
      : LOCATIONS
    ).slice(0, 30);
    return [std, ...matched.map((l) => ({ loc: l, label: `${l.city}, ${l.state}`, sub: `M&IE $${l.mie}` }))];
  }, [query]);

  const oconus = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q.length > 1 && items.length === 1 && OCONUS_TERMS.some((t) => q.includes(t));
  }, [query, items]);

  function choose(item: Item) { setQuery(item.label); onChange(item.loc); setOpen(false); }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, items.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { if (open && items[active]) { e.preventDefault(); choose(items[active]); } }
    else if (e.key === "Escape") { setOpen(false); }
  }

  return (
    <div className="relative">
      <div className="relative">
        <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4"/><path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
        <input
          ref={inputRef} role="combobox" aria-expanded={open} aria-controls={listId} aria-autocomplete="list"
          aria-activedescendant={open && items[active] ? `${idPrefix}-opt-${active}` : undefined}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(0); }}
          onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)} onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="w-full rounded-xl border border-line-strong bg-surface py-2.5 pl-9 pr-3 text-ink outline-none transition placeholder:text-muted/70 focus:border-accent"
        />
      </div>
      {open && (
        <ul id={listId} role="listbox" className="absolute z-20 mt-1.5 max-h-64 w-full overflow-auto rounded-xl border border-line bg-surface p-1 shadow-xl">
          {items.map((item, i) => (
            <li key={item.loc?.slug ?? "standard"} id={`${idPrefix}-opt-${i}`} role="option" aria-selected={i === active}>
              <button type="button" onMouseDown={() => choose(item)} onMouseEnter={() => setActive(i)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${i === active ? "bg-accent-tint text-accent-dark" : "text-ink-soft hover:bg-paper-2"}`}>
                <span className={item.loc ? "" : "font-medium"}>{item.label}{item.loc?.county ? <span className="text-muted"> · {item.loc.county}</span> : null}</span>
                <span className="tnum text-xs text-muted">{item.sub}</span>
              </button>
            </li>
          ))}
          {oconus && (
            <li className="px-3 py-2 text-xs text-clay" role="status">
              That looks like an <strong>OCONUS</strong> destination (Alaska, Hawaii, a US territory or abroad). Those rates are set by the DoD / State Department, not the GSA CONUS table — this tool covers the continental US.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
