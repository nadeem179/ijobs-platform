import { Calendar } from "lucide-react";

const articles = [
  ["Resume signals that recruiters actually scan", "Career", "How to make profile quality visible without adding noise."],
  ["Why salary transparency improves hiring quality", "Marketplace", "Clear compensation ranges save time for candidates and recruiters."],
  ["Using AI matching without losing human judgment", "AI Matching", "How fit signals can support better conversations."],
  ["Reducing spam applications with better incentives", "Recruiting", "A cleaner marketplace starts with stronger candidate and role context."],
] as const;

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Blog</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Ideas for better hiring.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
          Notes on resumes, hiring quality, salary transparency, and AI-assisted matching.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {articles.map(([title, category, excerpt]) => (
            <article key={title} className="rounded-2xl border border-border/50 bg-background p-6 shadow-sm">
              <span className="rounded-full border border-border/50 px-2 py-1 text-xs text-muted-foreground">{category}</span>
              <h2 className="mt-5 text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{excerpt}</p>
              <p className="mt-5 inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Coming soon
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
