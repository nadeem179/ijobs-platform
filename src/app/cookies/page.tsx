import { LegalPage } from "@/components/marketing/marketing-page";

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      description="A concise placeholder explaining how cookies may support authentication, preferences, and product analytics."
      sections={[
        { title: "Essential cookies", text: "Essential cookies may be used for authentication, session continuity, security, and core platform functionality." },
        { title: "Preference cookies", text: "Preference cookies may remember user choices such as settings, filters, and interface preferences." },
        { title: "Analytics cookies", text: "Analytics may help Diplotix understand product usage and improve marketplace quality without adding advertising clutter." },
        { title: "Managing cookies", text: "Users can manage browser cookie settings, though disabling essential cookies may affect sign-in and product behavior." },
      ]}
    />
  );
}
