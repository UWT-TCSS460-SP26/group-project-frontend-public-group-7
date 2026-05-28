export function formatDisplayName(name: string | null | undefined): string {
  const trimmed = name?.trim();

  if (!trimmed) {
    return "Unknown user";
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);

  if (parts.length < 2) {
    return trimmed;
  }

  const [firstName, lastName] = parts;
  return `${firstName} ${lastName.charAt(0).toUpperCase()}.`;
}
