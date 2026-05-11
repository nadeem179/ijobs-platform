export default function CookiesPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="inline-flex items-center rounded-full border border-border/30 bg-muted/30 px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
          Legal
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.1] mb-6">Cookie Policy</h1>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">What Are Cookies</h2>
            <p>Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and improve your browsing experience.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">How We Use Cookies</h2>
            <p>We use cookies to keep you signed in, remember your preferences, analyze platform usage, and improve our services. We do not use cookies for targeted advertising or tracking across third-party sites.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">Types of Cookies We Use</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Essential cookies</strong> — Required for the platform to function (authentication, security).</li>
              <li><strong>Preference cookies</strong> — Remember your settings and preferences.</li>
              <li><strong>Analytics cookies</strong> — Help us understand how the platform is used to make improvements.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">Managing Cookies</h2>
            <p>You can control cookies through your browser settings. Disabling cookies may affect some platform functionality, including authentication persistence.</p>
          </section>

          <p className="text-xs text-muted-foreground pt-4 border-t border-border/30">Last updated: May 2026. This is a demo cookie policy for demonstration purposes.</p>
        </div>
      </div>
    </div>
  );
}