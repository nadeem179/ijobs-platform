import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex items-center rounded-full border border-border/30 bg-muted/30 px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
            Contact
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.1] mb-3">Get in touch</h1>
          <p className="text-base text-muted-foreground leading-relaxed mb-8">
            Have a question or feedback? We'd love to hear from you.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 mb-8">
            <div className="rounded-xl border border-border/30 bg-background p-5">
              <Mail className="h-5 w-5 text-primary mb-3" />
              <h3 className="text-sm font-semibold mb-1">Email us</h3>
              <p className="text-sm text-muted-foreground">hello@ijobs.com</p>
            </div>
            <div className="rounded-xl border border-border/30 bg-background p-5">
              <MessageSquare className="h-5 w-5 text-primary mb-3" />
              <h3 className="text-sm font-semibold mb-1">General inquiries</h3>
              <p className="text-sm text-muted-foreground">We respond within 24 hours.</p>
            </div>
          </div>

          <div className="rounded-xl border border-border/30 bg-background p-6">
            <h2 className="text-sm font-semibold mb-4">Send us a message</h2>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Name</label>
                  <Input className="h-10 text-sm" placeholder="Your name" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Email</label>
                  <Input type="email" className="h-10 text-sm" placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">Subject</label>
                <Input className="h-10 text-sm" placeholder="How can we help?" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">Message</label>
                <textarea className="w-full min-h-[120px] rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y" placeholder="Your message..." />
              </div>
              <Button size="lg" className="rounded-xl w-full sm:w-auto">Send Message</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}