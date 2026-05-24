"use client";

import { Fragment, useMemo } from "react";

export function getHighlightTerms(query: string) {
  const seen = new Set<string>();

  return query
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean)
    .filter((term) => term.length >= 2)
    .filter((term) => {
      const normalized = term.toLowerCase();
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    })
    .sort((left, right) => right.length - left.length);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function splitHighlightedParts(text: string, terms: string[]) {
  if (!text || terms.length === 0) {
    return [{ value: text, match: false }];
  }

  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  return text.split(pattern).filter(Boolean).map((value) => ({
    value,
    match: terms.some((term) => term.toLowerCase() === value.toLowerCase()),
  }));
}

export function HighlightedText({
  text,
  query,
  className,
}: {
  text: string;
  query: string;
  className?: string;
}) {
  const terms = useMemo(() => getHighlightTerms(query), [query]);
  const parts = useMemo(() => splitHighlightedParts(text, terms), [terms, text]);

  if (terms.length === 0) {
    return <>{text}</>;
  }

  return (
    <>
      {parts.map((part, index) =>
        part.match ? (
          <mark
            key={`${part.value}-${index}`}
            className={
              className ??
              "rounded-[0.35rem] bg-yellow-100 px-0.5 py-0.5 text-black dark:bg-yellow-200 dark:text-black"
            }
          >
            {part.value}
          </mark>
        ) : (
          <Fragment key={`${part.value}-${index}`}>{part.value}</Fragment>
        )
      )}
    </>
  );
}
