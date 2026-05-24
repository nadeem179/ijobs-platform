import { Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const contactMethods = [
  { icon: Mail, title: "Email", text: "hello@diplotix.com" },
  { icon: MessageSquare, title: "General inquiries", text: "We review messages during business hours." },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Contact</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Talk to the Diplotix team.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
          Send a message about recruiting, partnerships, product questions, or press inquiries. This form is a public UI and is not wired to Supabase.
        </p>
        <div className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-4">
            {contactMethods.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-border/50 p-5 shadow-sm">
                <Icon className="h-4 w-4" />
                <h2 className="mt-4 text-sm font-semibold">{title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
          <form className="rounded-2xl border border-border/50 p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input placeholder="Name" />
              <Input type="email" placeholder="Email" />
            </div>
            <Input className="mt-4" placeholder="Subject" />
            <textarea className="mt-4 min-h-32 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Message" />
            <Button className="mt-4 rounded-full" type="button">Send Message</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
