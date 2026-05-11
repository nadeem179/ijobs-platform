import { cn } from "@/lib/utils";

interface ProgressStepperProps {
  steps: string[];
  currentIndex: number;
}

export function ProgressStepper({
  steps,
  currentIndex,
}: ProgressStepperProps) {
  return (
    <div className="flex items-center gap-1">
      {steps.map((label, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <div key={label} className="flex items-center gap-1 flex-1">
            <div
              className={cn(
                "h-1 rounded-full flex-1 transition-all duration-300",
                isCompleted
                  ? "bg-primary"
                  : isCurrent
                  ? "bg-primary/40"
                  : "bg-muted"
              )}
            />
          </div>
        );
      })}
      <span className="text-[11px] text-muted-foreground ml-1 shrink-0">
        {currentIndex + 1}/{steps.length}
      </span>
    </div>
  );
}