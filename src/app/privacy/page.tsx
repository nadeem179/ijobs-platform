import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="inline-flex items-center rounded-full border border-border/30 bg-muted/30 px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
          Legal
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.1] mb-6">Privacy Policy</h1>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">Information We Collect</h2>
            <p>We collect information you provide directly to us, including your name, email address, profile information, and resume data when you create an account or apply for jobs. We also collect usage data about how you interact with our platform.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">How We Use Your Information</h2>
            <p>Your information is used to provide and improve our hiring platform, including processing job applications, matching you with relevant opportunities, and communicating with you about your account. We never share your data with unverified third parties.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">Data Sharing</h2>
            <p>When you apply for a job, your profile and application materials are shared with the recruiter who posted the listing. We do not sell your personal data to third parties. We may share anonymized aggregate data for platform analytics.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">Data Security</h2>
            <p>We implement industry-standard security measures to protect your data, including encryption in transit and at rest. We regularly audit our security practices to maintain the integrity of your information.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data at any time through your account settings. You can also request a copy of your data by contacting us. We will respond to all requests within 30 days.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">Contact</h2>
            <p>If you have questions about this privacy policy, please <Link href="/contact" className="text-primary underline">contact us</Link>.</p>
          </section>

          <p className="text-xs text-muted-foreground pt-4 border-t border-border/30">Last updated: May 2026. This is a demo privacy policy for demonstration purposes.</p>
        </div>
      </div>
    </div>
  );
}