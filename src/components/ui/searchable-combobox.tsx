"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type SearchableComboboxProps = {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  customLabelPrefix?: string;
  onBlur?: () => void;
};

export function SearchableCombobox({
  value,
  options,
  onChange,
  placeholder,
  disabled,
  customLabelPrefix,
  onBlur,
}: SearchableComboboxProps) {
  const [open, setOpen] = useState(false);
  const normalizedValue = value.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      options
        .filter((option) => option.toLowerCase().includes(normalizedValue))
        .slice(0, 8),
    [normalizedValue, options]
  );
  const hasExactMatch = useMemo(
    () => options.some((option) => option.toLowerCase() === normalizedValue),
    [normalizedValue, options]
  );
  const showCustomOption = Boolean(customLabelPrefix && value.trim() && !hasExactMatch);

  const handleBlur = () => {
    window.setTimeout(() => setOpen(false), 150);
    onBlur?.();
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        value={value}
        disabled={disabled}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && showCustomOption) {
            event.preventDefault();
            onChange(value.trim());
            setOpen(false);
          }
        }}
        className="h-10 pl-9 text-sm"
        placeholder={placeholder}
      />
      {open && !disabled && (filtered.length > 0 || showCustomOption) ? (
        <div className="absolute z-30 mt-1 w-full rounded-lg border border-border/30 bg-background p-1.5 shadow-lg">
          {filtered.map((option) => (
            <button
              key={option}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className="block w-full rounded-md px-2.5 py-1.5 text-left text-sm hover:bg-muted/50"
            >
              {option}
            </button>
          ))}
          {showCustomOption ? (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(value.trim());
                setOpen(false);
              }}
              className="block w-full rounded-md px-2.5 py-1.5 text-left text-sm font-medium text-primary hover:bg-muted/50"
            >
              {customLabelPrefix}
              {value.trim()}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
