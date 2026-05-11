import { cn } from "@/lib/utils";

interface SkillBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function SkillBadge({ children, className }: SkillBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-border/50 bg-muted/50 px-2 py-0.5 text-[11px] font-normal text-muted-foreground leading-tight",
        className
      )}
    >
      {children}
    </span>
  );
}