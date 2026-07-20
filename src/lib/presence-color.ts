/** Stable accent color for a presence user (avatars + remote carets). */
export function presenceColor(userId: string): string {
  const palette = [
    "#38bdf8", // sky
    "#a78bfa", // violet
    "#34d399", // emerald
    "#fbbf24", // amber
    "#fb7185", // rose
    "#22d3ee", // cyan
  ];
  let hash = 0;
  for (let i = 0; i < userId.length; i += 1) {
    hash = (hash + userId.charCodeAt(i) * (i + 1)) % palette.length;
  }
  return palette[hash] ?? palette[0];
}
