"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type SearchableOption = { id: string; label: string };

export function SearchableSelect({
  id,
  name,
  options,
  required,
  placeholder = "Type to search…",
  emptyLabel = "No matches",
  className,
}: {
  id: string;
  name: string;
  options: SearchableOption[];
  required?: boolean;
  placeholder?: string;
  emptyLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [query, setQuery] = useState("");
  const selected = options.find((option) => option.id === value);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return options;
    return options.filter((option) => option.label.toLowerCase().includes(term));
  }, [options, query]);

  const display = open ? query : selected?.label ?? "";

  return (
    <div className={cn("relative", className)}>
      <input type="hidden" name={name} value={value} />
      <Input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        autoComplete="off"
        required={required && !value}
        placeholder={placeholder}
        value={display}
        onChange={(event) => {
          const next = event.target.value;
          setQuery(next);
          setOpen(true);
          if (!next.trim()) setValue("");
        }}
        onFocus={() => {
          setQuery(selected?.label ?? "");
          setOpen(true);
        }}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 120);
        }}
      />
      {open ? (
        <ul
          id={`${id}-list`}
          role="listbox"
          className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg"
        >
          {filtered.map((option) => (
            <li key={option.id} role="option" aria-selected={option.id === value}>
              <button
                type="button"
                className={cn(
                  "block w-full px-3 py-2 text-left text-sm hover:bg-navy-50",
                  option.id === value ? "bg-navy-50 font-medium text-navy-900" : "text-slate-800",
                )}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setValue(option.id);
                  setQuery(option.label);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-500">{emptyLabel}</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
