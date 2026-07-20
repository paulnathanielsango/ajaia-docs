export function canAccessDocument(
  userId: string,
  ownerId: string,
  sharedUserIds: string[],
): boolean {
  if (userId === ownerId) {
    return true;
  }

  return sharedUserIds.includes(userId);
}

export function canDeleteDocument(userId: string, ownerId: string): boolean {
  return userId === ownerId;
}

export function canShareDocument(userId: string, ownerId: string): boolean {
  return userId === ownerId;
}
