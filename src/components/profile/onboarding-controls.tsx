"use client";

import { useMemo, useRef, useState } from "react";
import { Camera, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { currencies, fluencyOptions, languageOptions } from "@/lib/profile/options";

export type LanguageValue = { language: string; fluency: string };

export function Chip({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-muted/70 px-2.5 py-1 text-xs font-medium">
      {label}
      {onRemove && (
        <button type="button" onClick={onRemove} className="text-muted-foreground hover:text-foreground">
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

export function SuggestionChip({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="inline-flex items-center gap-1 rounded-lg border border-border/30 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
    >
      <Plus className="h-3 w-3" />
      {label}
    </button>
  );
}

export function MultiSelectCombobox({
  label,
  options,
  value,
  onChange,
  placeholder = "Search and select",
  suggestions = [],
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () =>
      options
        .filter((option) => !value.includes(option))
        .filter((option) => option.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 8),
    [options, query, value]
  );
  const add = (item: string) => {
    if (!value.includes(item)) onChange([...value, item]);
    setQuery("");
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium block">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {value.map((item) => (
          <Chip key={item} label={item} onRemove={() => onChange(value.filter((selected) => selected !== item))} />
        ))}
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input value={query} onChange={(event) => setQuery(event.target.value)} className="h-10 pl-9 text-sm" placeholder={placeholder} />
        {query && filtered.length > 0 && (
          <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-border/30 bg-background p-1.5 shadow-lg">
            {filtered.map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => add(option)}
                className="block w-full rounded-md px-2.5 py-1.5 text-left text-sm hover:bg-muted/50"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.filter((item) => !value.includes(item)).slice(0, 10).map((item) => (
            <SuggestionChip key={item} label={item} onAdd={() => add(item)} />
          ))}
        </div>
      )}
    </div>
  );
}

export function SingleSelectCombobox({
  label,
  options,
  value,
  onChange,
  placeholder = "Search and select",
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () =>
      options
        .filter((option) => option.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 10),
    [options, query]
  );

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium block">{label}</label>
      {value && <Chip label={value} onRemove={() => onChange("")} />}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-10 pl-9 text-sm"
          placeholder={placeholder}
        />
        {query && filtered.length > 0 && (
          <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-border/30 bg-background p-1.5 shadow-lg">
            {filtered.map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => {
                  onChange(option);
                  setQuery("");
                }}
                className="block w-full rounded-md px-2.5 py-1.5 text-left text-sm hover:bg-muted/50"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CurrencySelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
      {currencies.map((currency) => (
        <option key={currency.code} value={currency.code}>{currency.label}</option>
      ))}
    </select>
  );
}

export function LanguageSelector({ value, onChange }: { value: LanguageValue[]; onChange: (value: LanguageValue[]) => void }) {
  const [language, setLanguage] = useState("English");
  const [fluency, setFluency] = useState("Professional working");
  return (
    <div className="space-y-3">
      <label className="text-xs font-medium block">Languages</label>
      <div className="flex flex-wrap gap-1.5">
        {value.map((item) => (
          <Chip
            key={`${item.language}-${item.fluency}`}
            label={`${item.language} - ${item.fluency}`}
            onRemove={() => onChange(value.filter((selected) => selected !== item))}
          />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <select value={language} onChange={(event) => setLanguage(event.target.value)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
          {languageOptions.map((option) => <option key={option}>{option}</option>)}
        </select>
        <select value={fluency} onChange={(event) => setFluency(event.target.value)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
          {fluencyOptions.map((option) => <option key={option}>{option}</option>)}
        </select>
        <Button type="button" variant="outline" size="sm" className="h-10 rounded-xl" onClick={() => {
          if (!value.some((item) => item.language === language)) onChange([...value, { language, fluency }]);
        }}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add
        </Button>
      </div>
    </div>
  );
}

export function ProfileImageUploader({
  previewUrl,
  initials,
  onChange,
  onFileChange,
  onError,
}: {
  previewUrl: string;
  initials: string;
  onChange: (value: string) => void;
  onFileChange?: (file: File | null) => void;
  onError: (message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      onError("Profile image must be a JPG, PNG, or WebP file.");
      return;
    }
    if (file.size > 500 * 1024) {
      onError("Profile image must be 500KB or smaller.");
      return;
    }
    onFileChange?.(file);
    onChange(URL.createObjectURL(file));
  };

  return (
    <div className="space-y-3">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
      <div className="relative h-24 w-24 overflow-hidden rounded-2xl bg-primary/5 text-primary">
        {previewUrl ? (
          <img src={previewUrl} alt="Profile preview" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-lg font-semibold">{initials}</div>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-background shadow"
          aria-label="Change picture"
        >
          <Camera className="h-4 w-4" />
        </button>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => inputRef.current?.click()}>
          Change picture
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => {
          onFileChange?.(null);
          onChange("");
        }}>
          Remove picture
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">JPG, PNG, or WebP up to 500KB.</p>
    </div>
  );
}
