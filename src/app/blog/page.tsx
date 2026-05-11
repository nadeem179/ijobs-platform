import Link from "next/link";
import { Calendar } from "lucide-react";

const articles = [
  {
    title: "How verified hiring reduces recruitment spam",
    excerpt: "Learn how our verification process cuts through the noise to connect real candidates with serious employers.",
    date: "May 5, 2026",
    category: "Hiring",
  },
  {
    title: "The rise of salary transparency in tech hiring",
    excerpt: "Why more companies are disclosing salary ranges and how it leads to better outcomes for everyone.",
    date: "April 28, 2026",
    category: "Trends",
  },
  {
    title: "5 tips for building a standout candidate profile",
    excerpt: "Simple ways to make your profile more attractive to recruiters without exaggeration or clutter.",
    date: "April 20, 2026",
    category: "Career Advice",
  },
  {
    title: "How recruiters can attract quality applicants",
    excerpt: "Practical strategies for writing job descriptions that attract the right candidates — not just more of them.",
    date: "April 12, 2026",
    category: "Recruiting",
  },
  {
    title: "Understanding response rates in modern hiring",
    excerpt: "Why response rate transparency matters and how it improves the candidate experience.",
    date: "April 5, 2026",
    category: "Product",
  },
  {
    title: "The future of proof-based hiring",
    excerpt: "How skills verification and portfolio-based assessments are reshaping the hiring landscape.",
    date: "March 28, 2026",
    category: "Trends",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <div className="inline-flex items-center rounded-full border border-border/30 bg-muted/30 px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
            Blog
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.1] mb-3">
            Insights on trusted hiring
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Articles, guides, and updates from the iJobs team.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.title}
              href="#"
              className="rounded-xl border border-border/30 bg-background p-5 transition-all hover:border-border/60 hover:shadow-sm"
            >
              <span className="inline-flex items-center rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground mb-3">
                {article.category}
              </span>
              <h3 className="text-sm font-semibold mb-2 leading-snug">{article.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{article.excerpt}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {article.date}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}