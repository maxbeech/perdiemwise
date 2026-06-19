"use client";

import { useMemo, useRef, useState } from "react";
import { LOCATIONS, type GsaLocation } from "@/lib/gsa";

// Shared, accessible city picker used by every calculator (single source of
// truth — replaces two near-identical inline comboboxes). Supports full keyboard
// navigation and warns when a destination is OCONUS (Alaska/Hawaii/territories/
// international), which the GSA CONUS table does not cover.

const OCONUS_TERMS = [
  "hawaii", "honolulu", "maui", "kauai", "kona", "hilo", "alaska", "anchorage",
  "juneau", "fairbanks", "puerto rico", "san juan", "guam", "virgin islands",
  "saipan", "international", "abroad", "overseas", "canada", "mexico", "europe",
  "london", "tokyo", "paris", "germany", "japan", "england",
];

interface Item {
  loc: GsaLocation | null;
  label: string;
  sub: string;
}

export default function CityCombobox({
  initialSlug,
  onChange,
  placeholder = "Search a city — or leave blank for the standard rate",
  idPrefix = "city",
}: {
  initialSlug?: string;
  onChange: (loc: GsaLocation | null) => void;
  placeholder?: string;
  idPrefix?: string;
}) {
  const initial = initialSlug ? LOCATIONS.find((l) => l.slug === initialSlug) : undefined;
  const [query, setQuery] = useState(initial ? `${initial.city}, ${initial.state}` : "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = `${idPrefix}-listbox`;

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

  const inputRef = useRef<HTMLInputElement>(null);

  function choose(item: Item) {
    setQuery(item.label);
    onChange(item.loc);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, items.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { if (open && items[active]) { e.preventDefault(); choose(items[active]); } }
    else if (e.key === "Escape") { setOpen(false); }
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && items[active] ? `${idPrefix}-opt-${active}` : undefined}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(0); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-sky-500"
      />
      {open && (
        <ul id={listId} role="listbox" className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-stone-200 bg-white shadow-lg">
          {items.map((item, i) => (
            <li key={item.loc?.slug ?? "standard"} id={`${idPrefix}-opt-${i}`} role="option" aria-selected={i === active}>
              <button type="button" onMouseDown={() => choose(item)} onMouseEnter={() => setActive(i)}
                className={`flex w-full justify-between px-3 py-2 text-left text-sm ${i === active ? "bg-sky-50" : "hover:bg-stone-50"}`}>
                <span className={item.loc ? "" : "font-medium"}>{item.label}{item.loc?.county ? <span className="text-stone-400"> · {item.loc.county}</span> : null}</span>
                <span className="text-stone-500">{item.sub}</span>
              </button>
            </li>
          ))}
          {oconus && (
            <li className="px-3 py-2 text-xs text-amber-800" role="status">
              That looks like an <strong>OCONUS</strong> destination (Alaska, Hawaii, a US territory or abroad). Those rates are set by the DoD / State Department, not the GSA CONUS table — this tool covers the continental US.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
