"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FilterState } from "@/types/job";
import { useState } from "react";
import { cn } from "@/lib/utils";

const experienceLevels = ["Entry", "Mid", "Senior", "Lead", "Staff"];
const locationTypes = ["Remote", "Hybrid", "On-site"];

interface JobFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  className?: string;
}

export function JobFilters({
  filters,
  onFilterChange,
  className,
}: JobFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: "experienceLevel" | "locationType", value: string) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  const clearAll = () => {
    onFilterChange({
      query: "",
      location: "",
      experienceLevel: [],
      salaryMin: 0,
      salaryMax: 500000,
      remoteOnly: false,
      verifiedOnly: false,
      locationType: [],
    });
  };

  const hasActiveFilters =
    filters.query ||
    filters.location ||
    filters.experienceLevel.length > 0 ||
    filters.remoteOnly ||
    filters.verifiedOnly ||
    filters.locationType.length > 0;

  const filterContent = (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            className="pl-9 h-9 text-sm"
            value={filters.query}
            onChange={(e) => updateFilter("query", e.target.value)}
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Location
        </h4>
        <Input
          placeholder="City, state, or remote..."
          className="h-9 text-sm"
          value={filters.location}
          onChange={(e) => updateFilter("location", e.target.value)}
        />
      </div>

      {/* Location Type */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Work Type
        </h4>
        <div className="space-y-2">
          {locationTypes.map((type) => (
            <Checkbox
              key={type}
              id={`type-${type}`}
              label={type}
              checked={filters.locationType.includes(type)}
              onChange={() => toggleArrayFilter("locationType", type)}
            />
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Experience Level
        </h4>
        <div className="space-y-2">
          {experienceLevels.map((level) => (
            <Checkbox
              key={level}
              id={`level-${level}`}
              label={level}
              checked={filters.experienceLevel.includes(level)}
              onChange={() => toggleArrayFilter("experienceLevel", level)}
            />
          ))}
        </div>
      </div>

      {/* Salary Range */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Salary Range
        </h4>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            className="h-9 text-sm"
            value={filters.salaryMin || ""}
            onChange={(e) =>
              updateFilter("salaryMin", Number(e.target.value) || 0)
            }
          />
          <span className="text-muted-foreground text-xs">to</span>
          <Input
            type="number"
            placeholder="Max"
            className="h-9 text-sm"
            value={filters.salaryMax === 500000 ? "" : filters.salaryMax || ""}
            onChange={(e) =>
              updateFilter("salaryMax", Number(e.target.value) || 500000)
            }
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3 pt-2">
        <Checkbox
          id="remote-only"
          label="Remote only"
          checked={filters.remoteOnly}
          onChange={(e) =>
            updateFilter("remoteOnly", (e.target as HTMLInputElement).checked)
          }
        />
        <Checkbox
          id="verified-only"
          label="Verified recruiters only"
          checked={filters.verifiedOnly}
          onChange={(e) =>
            updateFilter("verifiedOnly", (e.target as HTMLInputElement).checked)
          }
        />
      </div>

      {/* Clear */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="w-full text-xs"
        >
          Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:block w-64 shrink-0",
          className
        )}
      >
        <div className="sticky top-24">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold">Filters</h3>
            {hasActiveFilters && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 cursor-pointer"
                onClick={clearAll}
              >
                Clear
              </Badge>
            )}
          </div>
          {filterContent}
        </div>
      </aside>

      {/* Mobile filter toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileOpen(true)}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
          </span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-[10px] px-1.5">
              Active
            </Badge>
          )}
        </Button>
      </div>

      {/* Mobile filter sheet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-background shadow-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}
    </>
  );
}