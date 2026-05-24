"use client";

import { useMemo, useState } from "react";
import { ChevronDown, CircleHelp, Search } from "lucide-react";
import { ProtectedLayout } from "@/components/navigation/protected-layout";
import { Input } from "@/components/ui/input";

const faqSections = [
  {
    title: "Account and login",
    items: [
      {
        question: "Why can't I change my email address here?",
        answer: "Email is managed by your authentication provider. If you signed up with email login, password reset is available from Settings. OAuth accounts continue to manage email and password with their provider.",
      },
      {
        question: "What happens when I deactivate my account?",
        answer: "Deactivation marks your account as deactivated in settings and turns off recruiter visibility preferences. It does not permanently erase your data.",
      },
    ],
  },
  {
    title: "Profile and resume",
    items: [
      {
        question: "How is profile completion calculated?",
        answer: "Diplotix calculates profile completion from real profile fields like basic info, summary, profile image, resume, preferences, skills, experience, education, and certifications or links.",
      },
      {
        question: "Can I update my resume later?",
        answer: "Yes. You can upload or replace your resume from your profile or quick actions at any time.",
      },
    ],
  },
  {
    title: "Job search",
    items: [
      {
        question: "How do job preferences affect recommendations?",
        answer: "Preferred locations, salary, work mode, job type, experience level, industry, and functional area help shape recommendations where that data is available.",
      },
      {
        question: "Why are some jobs highlighted for my search?",
        answer: "Search terms are highlighted directly in job titles, company names, descriptions, skills, and locations so you can scan matching results faster.",
      },
    ],
  },
  {
    title: "Applications",
    items: [
      {
        question: "Can I track application status in Diplotix?",
        answer: "Yes. The Applications page shows your submitted jobs and any available status events like viewed, shortlisted, rejected, or hired.",
      },
      {
        question: "Why don't I see updates for every application?",
        answer: "Updates only appear when the related event exists in the application data. Diplotix does not invent recruiter activity.",
      },
    ],
  },
  {
    title: "Saved jobs",
    items: [
      {
        question: "Where do my saved jobs appear?",
        answer: "Saved jobs appear on the Saved Jobs page and in candidate surfaces that preview live saved-job data.",
      },
    ],
  },
  {
    title: "Privacy and blocked companies",
    items: [
      {
        question: "What does blocking a company do?",
        answer: "Blocked companies are saved to your account so future recruiter visibility rules can use them. The settings page already lets you add and remove blocked companies safely.",
      },
      {
        question: "Can recruiters still message me if I turn visibility off?",
        answer: "The communication and privacy preferences save your intent now. They are designed to support future recruiter-visibility behavior without changing your profile data locally.",
      },
    ],
  },
  {
    title: "Recruiter contact",
    items: [
      {
        question: "How do recruiter messages relate to my job status?",
        answer: "Your job search status can preset recruiter-message preferences. You can still fine-tune those toggles in Settings afterward.",
      },
    ],
  },
  {
    title: "Troubleshooting",
    items: [
      {
        question: "What should I do if settings do not save?",
        answer: "Try refreshing the page and saving again. If the problem continues, check whether your session is still active and then contact support with the action that failed.",
      },
      {
        question: "Why do some fields show 'Not set'?",
        answer: "That means the related profile data has not been saved yet. Completing those fields will also increase profile completion where relevant.",
      },
    ],
  },
];

export default function FaqPage() {
  const [query, setQuery] = useState("");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const filteredSections = useMemo(() => {
    if (!query.trim()) return faqSections;
    const needle = query.trim().toLowerCase();
    return faqSections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.question.toLowerCase().includes(needle) ||
            item.answer.toLowerCase().includes(needle)
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [query]);

  return (
    <ProtectedLayout allowedRoles={["candidate"]}>
      <div className="min-h-screen">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              <CircleHelp className="h-3.5 w-3.5" />
              Candidate FAQs
            </div>
            <h1 className="mt-3 text-xl font-semibold tracking-tight">Frequently Asked Questions</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Quick answers for account, profile, search, applications, and privacy.
            </p>
          </div>

          <div className="mb-6 rounded-xl border border-border/30 bg-background p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-10 pl-9 text-sm"
                placeholder="Search FAQs"
              />
            </div>
          </div>

          <div className="space-y-5">
            {filteredSections.map((section) => (
              <section key={section.title} className="rounded-xl border border-border/30 bg-background p-4">
                <h2 className="mb-3 text-sm font-semibold">{section.title}</h2>
                <div className="space-y-2">
                  {section.items.map((item) => {
                    const key = `${section.title}:${item.question}`;
                    const open = openItems[key] ?? false;
                    return (
                      <div key={key} className="rounded-xl border border-border/20">
                        <button
                          type="button"
                          onClick={() => setOpenItems((current) => ({ ...current, [key]: !open }))}
                          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                        >
                          <span className="text-sm font-medium">{item.question}</span>
                          <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                        </button>
                        {open && (
                          <div className="border-t border-border/20 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                            {item.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}

            {filteredSections.length === 0 && (
              <div className="rounded-xl border border-dashed border-border/40 bg-background px-5 py-10 text-center">
                <p className="text-sm font-medium">No FAQ matches found.</p>
                <p className="mt-1 text-sm text-muted-foreground">Try a different keyword like profile, applications, or privacy.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
