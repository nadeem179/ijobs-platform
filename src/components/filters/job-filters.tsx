"use client";

import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FilterState } from "@/types/job";

const experienceLevels = ["Intern", "Fresher", "Junior", "Mid", "Senior", "Lead", "Manager", "Director"];
const locationTypes = ["Remote", "Hybrid", "On-site"];
const jobTypes = ["Full-time", "Part-time", "Contract", "Internship", "Freelance"];
const freshnessOptions = [
  { label: "Any time", value: "any" },
  { label: "Past 24h", value: "24h" },
  { label: "Past 3 days", value: "3d" },
  { label: "Past week", value: "7d" },
  { label: "Past month", value: "30d" },
] as const;

interface JobFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableSkills?: string[];
  availableLocations?: string[];
  availableDesignations?: string[];
  onClear: () => void;
  activeFilterCount: number;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

export function JobSearchBar({
  query,
  onQueryChange,
  onQuerySubmit,
  onOpenFilters,
  activeFilterCount,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  onQuerySubmit?: (value: string) => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
}) {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search jobs, companies, skills..."
          className="h-11 rounded-xl pl-9 text-sm"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            onQuerySubmit?.(query);
          }}
        />
      </div>
      <Button
        type="button"
        variant="outline"
        className="h-11 rounded-xl lg:hidden"
        onClick={onOpenFilters}
      >
        <SlidersHorizontal className="mr-2 h-4 w-4" />
        Filters
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="ml-2 px-1.5 text-[10px]">
            {activeFilterCount}
          </Badge>
        )}
      </Button>
    </div>
  );
}

export function JobFilters({
  filters,
  onFilterChange,
  availableSkills = [],
  availableLocations = [],
  availableDesignations = [],
  onClear,
  activeFilterCount,
  mobileOpen,
  onMobileOpenChange,
}: JobFiltersProps) {
  const content = (
    <FilterContent
      filters={filters}
      onFilterChange={onFilterChange}
      availableSkills={availableSkills}
      availableLocations={availableLocations}
      availableDesignations={availableDesignations}
      onClear={onClear}
      activeFilterCount={activeFilterCount}
      mobileOpen={mobileOpen}
      onMobileOpenChange={onMobileOpenChange}
    />
  );

  return (
    <>
      <aside className="hidden w-[280px] shrink-0 lg:block xl:w-[300px]">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
          {content}
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/20" onClick={() => onMobileOpenChange(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-md overflow-y-auto bg-background p-5 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Filters</h2>
                <p className="text-xs text-muted-foreground">Narrow your job search.</p>
              </div>
              <button onClick={() => onMobileOpenChange(false)} className="rounded-md p-1 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}

function FilterContent({
  filters,
  onFilterChange,
  availableSkills = [],
  availableLocations = [],
  availableDesignations = [],
  onClear,
  activeFilterCount,
}: JobFiltersProps) {
  const [skillInput, setSkillInput] = useState("");

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (
    key: "experienceLevel" | "locationType" | "jobType" | "skills",
    value: string
  ) => {
    const current = filters[key];
    updateFilter(
      key,
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  };

  const addSkill = (value: string) => {
    const skill = value.trim();
    if (!skill || filters.skills.includes(skill)) return;
    updateFilter("skills", [...filters.skills, skill]);
    setSkillInput("");
  };

  const skillSuggestions = useMemo(
    () =>
      availableSkills
        .filter((skill) => !filters.skills.includes(skill))
        .filter((skill) => skill.toLowerCase().includes(skillInput.toLowerCase()))
        .slice(0, 8),
    [availableSkills, filters.skills, skillInput]
  );

  return (
    <div className="rounded-xl border border-border/30 bg-background p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Filters</h2>
          <p className="text-xs text-muted-foreground">{activeFilterCount} active</p>
        </div>
        {activeFilterCount > 0 && (
          <button type="button" onClick={onClear} className="text-xs font-medium text-primary">
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-1">
        <FilterSection title="Work Mode" defaultOpen>
          <CheckGroup values={locationTypes} selected={filters.locationType} onToggle={(value) => toggleArrayFilter("locationType", value)} />
        </FilterSection>

        <FilterSection title="Experience Level" defaultOpen>
          <CheckGroup values={experienceLevels} selected={filters.experienceLevel} onToggle={(value) => toggleArrayFilter("experienceLevel", value)} />
        </FilterSection>

        <FilterSection title="Job Type">
          <CheckGroup values={jobTypes} selected={filters.jobType} onToggle={(value) => toggleArrayFilter("jobType", value)} />
        </FilterSection>

        <FilterSection title="Salary Range">
          <div className="flex items-center gap-2">
            <Input type="number" placeholder="Min" className="h-9 text-sm" value={filters.salaryMin || ""} onChange={(event) => updateFilter("salaryMin", Number(event.target.value) || 0)} />
            <Input type="number" placeholder="Max" className="h-9 text-sm" value={filters.salaryMax === 5000000 ? "" : filters.salaryMax || ""} onChange={(event) => updateFilter("salaryMax", Number(event.target.value) || 5000000)} />
          </div>
        </FilterSection>

        <FilterSection title="Date Posted">
          <select
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={filters.freshness}
            onChange={(event) => updateFilter("freshness", event.target.value as FilterState["freshness"])}
          >
            {freshnessOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterSection>

        <FilterSection title="Easy Apply">
          <Checkbox id="easy-apply" label="Easy Apply jobs" checked={filters.easyApply} onChange={(event) => updateFilter("easyApply", (event.target as HTMLInputElement).checked)} />
        </FilterSection>

        <FilterSection title="Skills">
          <div className="flex gap-2">
            <Input
              value={skillInput}
              onChange={(event) => setSkillInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === ",") {
                  event.preventDefault();
                  addSkill(skillInput.replace(",", ""));
                }
              }}
              placeholder="React, SQL, Figma..."
              className="h-9 text-sm"
            />
            <Button type="button" variant="outline" size="sm" className="h-9 px-3 text-xs" onClick={() => addSkill(skillInput)}>
              Add
            </Button>
          </div>
          {filters.skills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {filters.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="cursor-pointer text-[11px]" onClick={() => toggleArrayFilter("skills", skill)}>
                  {skill}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
          )}
          {skillSuggestions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {skillSuggestions.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => addSkill(skill)}
                  className="rounded-full border border-border/40 px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                >
                  + {skill}
                </button>
              ))}
            </div>
          )}
        </FilterSection>

        <FilterSection title="Location">
          <Input
            list="job-locations"
            value={filters.location}
            onChange={(event) => updateFilter("location", event.target.value)}
            placeholder="City, state, or remote"
            className="h-9 text-sm"
          />
          <datalist id="job-locations">
            {availableLocations.map((location) => (
              <option key={location} value={location} />
            ))}
          </datalist>
        </FilterSection>

        <FilterSection title="Designation">
          <Input
            list="job-designations"
            value={filters.designation}
            onChange={(event) => updateFilter("designation", event.target.value)}
            placeholder="Product Designer..."
            className="h-9 text-sm"
          />
          <datalist id="job-designations">
            {availableDesignations.map((designation) => (
              <option key={designation} value={designation} />
            ))}
          </datalist>
        </FilterSection>
      </div>
    </div>
  );
}

function FilterSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-b border-border/20 py-3 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </section>
  );
}

function CheckGroup({
  values,
  selected,
  onToggle,
}: {
  values: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      {values.map((value) => (
        <Checkbox
          key={value}
          id={`${value}-filter`}
          label={value}
          checked={selected.includes(value)}
          onChange={() => onToggle(value)}
        />
      ))}
    </div>
  );
}
