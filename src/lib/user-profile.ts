import { API_BASE } from "@/lib/api";

export interface CurrentUserProfile {
  username?: string | null;
  email?: string | null;
  displayName?: string | null;
}

export async function getCurrentUserProfile(accessToken: string) {
  try {
    const response = await fetch(`${API_BASE}/v1/users/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as CurrentUserProfile;
  } catch {
    return null;
  }
}

export async function getCurrentUserDisplayName(accessToken: string) {
  const profile = await getCurrentUserProfile(accessToken);
  return profile?.displayName?.trim() || null;
}
