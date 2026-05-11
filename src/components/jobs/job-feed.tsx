"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { FilterState } from "@/types/job";
import { jobs as allJobs } from "@/data/jobs";
import { JobCard } from "@/components/jobs/job-card";
import { JobFilters } from "@/components/filters/job-filters";
import { SkeletonCard } from "@/components/jobs/skeleton-card";
import { NoResultsEmptyState, NoSavedJobsEmptyState } from "@/components/jobs/empty-states";

const INITIAL_FILTERS: FilterState = {
  query: "",
  location: "",
  experienceLevel: [],
  salaryMin: 0,
  salaryMax: 500000,
  remoteOnly: false,
  verifiedOnly: false,
  locationType: [],
};

export function JobFeed() {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showSaved, setShowSaved] = useState(false);
  const filterTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Simulate filter debounce
  useEffect(() => {
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }
    setLoading(true);
    filterTimeoutRef.current = setTimeout(() => {
      setLoading(false);
    }, 200);
    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
    };
  }, [filters]);

  const filteredJobs = useMemo(() => {
    return allJobs
      .filter((job) => {
        if (filters.query) {
          const q = filters.query.toLowerCase();
          const matchesTitle = job.title.toLowerCase().includes(q);
          const matchesCompany = job.company.toLowerCase().includes(q);
          const matchesSkill = job.skills.some((s) =>
            s.toLowerCase().includes(q)
          );
          if (!matchesTitle && !matchesCompany && !matchesSkill) return false;
        }

        if (filters.location) {
          const loc = filters.location.toLowerCase();
          if (!job.location.toLowerCase().includes(loc)) return false;
        }

        if (filters.locationType.length > 0) {
          if (!filters.locationType.includes(job.locationType)) return false;
        }

        if (filters.remoteOnly && job.locationType !== "Remote") return false;

        if (filters.verifiedOnly && !job.verifiedRecruiter) return false;

        if (filters.experienceLevel.length > 0) {
          if (!filters.experienceLevel.includes(job.experienceLevel))
            return false;
        }

        if (job.salaryMax < filters.salaryMin) return false;
        if (job.salaryMin > filters.salaryMax) return false;

        return true;
      })
      .map((job) => ({
        ...job,
        saved: savedIds.has(job.id),
      }));
  }, [filters, savedIds]);

  const savedJobs = useMemo(
    () => allJobs.filter((j) => savedIds.has(j.id)),
    [savedIds]
  );

  const handleSave = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  const activeFilterCount = [
    filters.query,
    filters.location,
    ...filters.experienceLevel,
    ...filters.locationType,
    filters.remoteOnly ? "remote" : null,
    filters.verifiedOnly ? "verified" : null,
  ].filter(Boolean).length;

  const displayJobs = showSaved ? savedJobs : filteredJobs;

  return (
    <div className="flex gap-8">
      <JobFilters filters={filters} onFilterChange={setFilters} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {showSaved ? "Saved Jobs" : "Jobs"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {showSaved
                ? `${savedJobs.length} saved job${savedJobs.length !== 1 ? "s" : ""}`
                : `${filteredJobs.length} ${filteredJobs.length === 1 ? "result" : "results"}`}
              {!showSaved && activeFilterCount > 0 && (
                <span>
                  {" "}with {activeFilterCount} filter
                  {activeFilterCount !== 1 ? "s" : ""} applied
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowSaved(!showSaved)}
              className={`text-sm font-medium transition-colors ${
                showSaved
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Saved ({savedJobs.length})
            </button>
            <select className="text-sm border border-input rounded-lg bg-background px-3 py-1.5 text-muted-foreground">
              <option>Most relevant</option>
              <option>Most recent</option>
              <option>Salary: High to low</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!loading && showSaved && savedJobs.length === 0 && (
          <NoSavedJobsEmptyState />
        )}

        {!loading && !showSaved && filteredJobs.length === 0 && (
          <NoResultsEmptyState query={filters.query} onClear={clearFilters} />
        )}

        {!loading && displayJobs.length > 0 && (
          <div className="space-y-3">
            {displayJobs.map((job) => (
              <JobCard key={job.id} job={job} onSave={handleSave} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}