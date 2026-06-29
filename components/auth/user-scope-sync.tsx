"use client";

import { useAuth } from "@clerk/nextjs";

import { setActiveUserScope } from "@/lib/user-scope";

export function UserScopeSync() {
  const { isLoaded, isSignedIn, userId } = useAuth();

  setActiveUserScope(isSignedIn ? userId : null, isLoaded);

  return null;
}