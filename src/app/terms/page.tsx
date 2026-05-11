import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="inline-flex items-center rounded-full border border-border/30 bg-muted/30 px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
          Legal
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.1] mb-6">Terms of Service</h1>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">Acceptance of Terms</h2>
            <p>By accessing or using iJobs, you agree to be bound by these terms. If you do not agree, please do not use our platform.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information when creating your profile. You may not create multiple accounts or impersonate others.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">Job Listings</h2>
            <p>Employers must provide accurate job information, including valid salary ranges and truthful company descriptions. Misleading listings will result in account suspension.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">Applications</h2>
            <p>Candidates agree that their profile information will be shared with recruiters when they apply for a position. Recruiters agree to use candidate data solely for hiring purposes.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">Prohibited Activities</h2>
            <p>You may not use iJobs for spam, fraud, illegal activities, or any purpose that violates applicable laws. We reserve the right to remove content and suspend accounts that violate these terms.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">Limitation of Liability</h2>
            <p>iJobs is provided as a platform connecting candidates and employers. We are not responsible for the accuracy of job listings posted by third parties or for the outcome of any hiring process.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">Changes</h2>
            <p>We may update these terms at any time. Users will be notified of material changes via email or platform notification.</p>
          </section>

          <p className="text-xs text-muted-foreground pt-4 border-t border-border/30">Last updated: May 2026. This is a demo terms of service for demonstration purposes.</p>
        </div>
      </div>
    </div>
  );
}