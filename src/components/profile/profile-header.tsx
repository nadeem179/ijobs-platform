"use client";

import { Profile } from "@/types/profile";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, MapPin } from "lucide-react";

interface ProfileHeaderProps {
  profile: Profile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start gap-5">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-xl font-bold">
        {profile.avatarInitials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
          <h1 className="text-xl font-semibold tracking-tight">
            {profile.name}
          </h1>
          {profile.verifiedEmail && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-3.5 w-3.5" />
              Verified
            </span>
          )}
        </div>
        <p className="text-base text-muted-foreground mb-1">
          {profile.headline}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {profile.location}
          </span>
          <span className="text-muted-foreground/50">&middot;</span>
          <span>{profile.experienceLevel}</span>
        </div>
      </div>
    </div>
  );
}