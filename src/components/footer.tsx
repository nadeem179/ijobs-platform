import Link from "next/link";
import {
  BookOpen,
  Building2,
  Facebook,
  Github,
  Instagram,
  Linkedin,
  MessageCircle,
  Twitter,
} from "lucide-react";
import { LogoWordmark } from "@/branding";
import { BRAND } from "@/lib/branding";
import { AuthCTAButton } from "@/components/marketing/auth-cta-button";

const postJobHref = "/recruiter/post-job";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Find Jobs", href: "/discover-jobs" },
      { label: "Companies", href: "/companies" },
      { label: "Pricing", href: "/pricing" },
      { label: "AI Matching", href: "/ai-matching" },
      { label: "Saved Jobs", href: "/saved-jobs" },
    ],
  },
  {
    title: "Candidates",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Applications", href: "/applications" },
      { label: "Profile", href: "/profile" },
      { label: "Settings", href: "/settings" },
      { label: "Career Resources", href: "/career-resources" },
    ],
  },
  {
    title: "Recruiters",
    links: [
      { label: "Post a Job", href: postJobHref },
      { label: "Recruiter Dashboard", href: "/recruiter/dashboard" },
      { label: "Candidate Quality", href: "/candidate-quality" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Trust & Safety", href: "/trust-safety" },
    ],
  },
];

const socialLinks = [
  { label: "Reddit", href: "https://www.reddit.com/user/diplotix/", icon: MessageCircle },
  { label: "Crunchbase", href: "https://www.crunchbase.com/organization/diplotix", icon: Building2 },
  { label: "Instagram", href: "https://www.instagram.com/diplotix_", icon: Instagram },
  { label: "X", href: "https://x.com/diplotix", icon: Twitter },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/diplotix/", icon: Linkedin },
  { label: "GitHub", href: "https://github.com/Diplotix", icon: Github },
  { label: "Medium", href: "https://medium.com/@diplotixx", icon: BookOpen },
  { label: "Facebook", href: "https://www.facebook.com/diplotix", icon: Facebook },
];

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_3fr]">
          <div>
            <Link href="/" className="inline-flex items-center">
              <LogoWordmark className="w-20 sm:w-20" />
            </Link>
            <p className="mt-4 max-w-56 text-sm leading-6 text-muted-foreground">
              Trusted hiring marketplace with AI-assisted matching for modern professionals.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
                  {group.title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                    {link.href === postJobHref || link.href === "/recruiter/dashboard" ? (
                      <AuthCTAButton
                        mode={link.href === postJobHref ? "signup" : "signin"}
                        roleIntent="recruiter"
                        continueTo={link.href}
                        authenticatedHref={link.href}
                        variant="ghost"
                        className="h-auto justify-start rounded-none p-0 text-sm font-normal text-muted-foreground shadow-none hover:bg-transparent hover:text-foreground"
                      >
                        {link.label}
                      </AuthCTAButton>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-border/40 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 {BRAND.appName} &middot; Built for trusted hiring.
          </p>
          <div className="flex items-center gap-3">
            {socialLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                aria-label={item.label}
                className="rounded-full border border-border/50 p-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <item.icon className="h-3.5 w-3.5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
