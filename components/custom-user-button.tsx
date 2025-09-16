'use client';

import { UserButton, useClerk } from "@clerk/nextjs";
import { Settings, LogOut } from "lucide-react";

export function CustomUserButton() {
  const { signOut } = useClerk();

  return (
    <UserButton
      appearance={{
        elements: {
          userButtonAvatarBox: "w-8 h-8",
        },
      }}
    >
      <UserButton.MenuItems>
        {/* Manage Account */}
        <UserButton.Link
          label="Manage account"
          labelIcon={<Settings className="h-4 w-4" />}
          href="/user-profile"
        />

        {/* Sign Out */}
        <UserButton.Action
          label="Sign out"
          labelIcon={<LogOut className="h-4 w-4" />}
          onClick={() => signOut({ redirectUrl: "/sign-in" })}
        />
      </UserButton.MenuItems>
    </UserButton>
  );
}
