"use client";

import { useEffect, useMemo, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  findRecruiterPhoneCountry,
  getRecruiterPhoneCountries,
  normalizePhoneCountryCode,
  sanitizeRecruiterPhoneNumber,
  type RecruiterPhoneValue,
} from "@/lib/recruiter/phone";

type RecruiterPhoneInputProps = {
  value: RecruiterPhoneValue;
  onChange: (value: RecruiterPhoneValue) => void;
  onBlur?: () => void;
  disabled?: boolean;
  error?: string;
};

export function RecruiterPhoneInput({
  value,
  onChange,
  onBlur,
  disabled = false,
  error,
}: RecruiterPhoneInputProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const selectedCountry =
    findRecruiterPhoneCountry(value.phoneCountryCode) ||
    findRecruiterPhoneCountry(value.phoneCountry) ||
    null;

  const countries = useMemo(() => getRecruiterPhoneCountries(query), [query]);
  const activeIndex = countries.length === 0 ? 0 : Math.min(highlightedIndex, countries.length - 1);

  useEffect(() => {
    if (!open) return;
    window.setTimeout(() => searchInputRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const commitCountry = (country: NonNullable<typeof selectedCountry>) => {
    onChange({
      phoneCountry: country.phoneCountry,
      phoneCountryCode: country.phoneCountryCode,
      phoneNumber: value.phoneNumber,
    });
    setQuery("");
    setOpen(false);
  };

  const handlePhoneChange = (rawValue: string) => {
    onChange({
      ...value,
      phoneNumber: sanitizeRecruiterPhoneNumber(rawValue),
    });
  };

  const handleGroupBlur = (event: FocusEvent<HTMLDivElement>) => {
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && wrapperRef.current?.contains(nextTarget)) return;
    window.setTimeout(() => {
      setOpen(false);
      onBlur?.();
    }, 0);
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (countries.length === 0) return;
      setHighlightedIndex((current) => Math.min(current + 1, countries.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (countries.length === 0) return;
      setHighlightedIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const country = countries[activeIndex];
      if (country) commitCountry(country);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  };

  const selectedFlag = selectedCountry?.flag || "🌐";
  const selectedLabel = selectedCountry?.phoneCountry || "Country";
  const dialingCode = normalizePhoneCountryCode(value.phoneCountryCode) || "+__";

  return (
    <div ref={wrapperRef} className="relative w-full" onBlurCapture={handleGroupBlur}>
      <div
        className={[
          "flex h-10 overflow-hidden rounded-lg border bg-background transition-colors focus-within:border-foreground/60 focus-within:ring-1 focus-within:ring-foreground/10",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-text",
          error
            ? "border-red-500"
            : open
              ? "border-foreground/60"
              : "border-border/30 hover:border-foreground/30",
        ].join(" ")}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (disabled) return;
            setOpen((current) => !current);
          }}
          className="flex min-w-0 items-center gap-2 px-3 text-left transition-colors hover:bg-muted/30 focus-visible:bg-muted/30 focus-visible:outline-none disabled:cursor-not-allowed"
          aria-label="Select country"
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <span className="text-sm leading-none">{selectedFlag}</span>
          <span className="max-w-24 truncate text-sm font-medium text-foreground sm:max-w-32">
            {selectedLabel}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>

        <div className="my-1 w-px bg-border/40" />

        <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
          <span className="shrink-0 text-sm font-medium text-muted-foreground">
            {dialingCode}
          </span>
          <Input
            value={value.phoneNumber}
            onChange={(event) => handlePhoneChange(event.target.value)}
            onFocus={() => {
              if (!disabled) setOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" && !open) {
                setOpen(true);
              }
            }}
            disabled={disabled}
            inputMode="numeric"
            autoComplete="tel"
            className="h-10 flex-1 border-0 bg-transparent px-0 text-sm shadow-none outline-none focus-visible:ring-0"
            placeholder="Phone number"
            aria-invalid={Boolean(error)}
          />
        </div>
      </div>

      {open && !disabled ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-border/30 bg-background shadow-lg">
          <div className="border-b border-border/30 p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleSearchKeyDown}
                className="h-10 pl-9 text-sm"
                placeholder="Search for country"
                autoComplete="off"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-1.5" role="listbox">
            {countries.length > 0 ? (
              countries.map((country, index) => {
                const active = index === activeIndex;
                return (
                  <button
                    key={`${country.isoCode}-${country.phoneCountryCode}`}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => commitCountry(country)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={[
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      active ? "bg-muted/70" : "hover:bg-muted/40",
                    ].join(" ")}
                    role="option"
                    aria-selected={active}
                  >
                    <span className="text-base leading-none">{country.flag}</span>
                    <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                      {country.phoneCountry}
                    </span>
                    <span className="shrink-0 text-sm text-muted-foreground">
                      {country.phoneCountryCode}
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="px-3 py-2 text-sm text-muted-foreground">No countries found.</p>
            )}
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
