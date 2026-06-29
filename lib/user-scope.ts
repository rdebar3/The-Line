let activeUserId: string | null = null;
let activeAuthLoaded = false;

export function setActiveUserScope(
  userId: string | null | undefined,
  authLoaded: boolean
) {
  activeAuthLoaded = authLoaded;
  activeUserId = userId ?? null;
}

export function isActiveUserScopeReady() {
  return activeAuthLoaded;
}

export function getActiveUserId() {
  return activeUserId;
}

export function buildUserStorageKey(baseKey: string) {
  if (!activeAuthLoaded) {
    return `${baseKey}:pending`;
  }

  if (activeUserId) {
    return `${baseKey}:${activeUserId}`;
  }

  return `${baseKey}:guest`;
}

