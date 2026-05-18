"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth";
import { cn } from "@/lib/utils";
import {
  User,
  Briefcase,
  Bookmark,
  Settings,
  LogOut,
} from "lucide-react";

export function ProfileDropdown() {
  const { user, role, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const items =
    role === "recruiter"
      ? [
          { href: "/recruiter", label: "Dashboard", icon: Briefcase },
          { href: "/recruiter/jobs", label: "Jobs", icon: Briefcase },
          { href: "/recruiter/candidates", label: "Candidates", icon: User },
          { href: "/recruiter/post-job", label: "Post Job", icon: Settings },
          { href: "/profile", label: "Company/Profile", icon: User, divider: true },
          { href: "/profile/edit", label: "Edit Profile", icon: Settings, divider: true },
        ]
      : [
          { href: "/dashboard", label: "Dashboard", icon: User },
          { href: "/jobs", label: "Jobs", icon: Briefcase },
          { href: "/applications", label: "Applications", icon: Briefcase },
          { href: "/saved-jobs", label: "Saved Jobs", icon: Bookmark },
          { href: "/profile", label: "Profile", icon: User, divider: true },
          { href: "/profile/edit", label: "Edit Profile", icon: Settings, divider: true },
        ];

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
      >
        {user.initials}
      </button>

      {open && (
        <div
          ref={menuRef}
          className={cn(
            "absolute right-0 top-10 z-50 w-56 origin-top-right",
            "rounded-xl border border-border/40 bg-background shadow-lg",
            "p-1.5"
          )}
        >
          {/* User info */}
          <div className="px-3 py-2 border-b border-border/20 mb-1">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
          </div>

          {/* Menu items */}
          <div className="space-y-0.5">
            {items.map((item) => (
              <div key={item.label}>
                {item.divider && (
                  <div className="border-t border-border/20 my-1" />
                )}
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Logout */}
          <div className="border-t border-border/20 mt-1 pt-1">
            <button
              onClick={() => {
                setOpen(false);
                void logout();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
