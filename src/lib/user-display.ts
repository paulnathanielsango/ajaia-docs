type AuthUserLike = {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

function emailLocalPart(email: string) {
  const local = email.split("@")[0]?.trim();
  if (!local) return null;

  return local
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Prefer OAuth/full name; fall back to a friendly name from the email. */
export function displayNameFromUser(user: AuthUserLike) {
  const meta = user.user_metadata ?? {};
  const fullName = meta.full_name;
  const name = meta.name;

  if (typeof fullName === "string" && fullName.trim()) return fullName.trim();
  if (typeof name === "string" && name.trim()) return name.trim();
  if (user.email) {
    return emailLocalPart(user.email) ?? user.email;
  }

  return "User";
}
