import { describe, expect, it } from "vitest";

import {
  canAccessDocument,
  canDeleteDocument,
  canShareDocument,
} from "@/lib/permissions";

describe("canAccessDocument", () => {
  const ownerId = "owner-id";
  const sharedUserId = "shared-user-id";
  const otherUserId = "other-user-id";
  const sharedUserIds = [sharedUserId, "another-shared-id"];

  it("allows the owner", () => {
    expect(canAccessDocument(ownerId, ownerId, sharedUserIds)).toBe(true);
  });

  it("allows users with an explicit share", () => {
    expect(canAccessDocument(sharedUserId, ownerId, sharedUserIds)).toBe(true);
  });

  it("denies users without access", () => {
    expect(canAccessDocument(otherUserId, ownerId, sharedUserIds)).toBe(false);
  });
});

describe("canDeleteDocument", () => {
  it("allows only the owner", () => {
    expect(canDeleteDocument("owner-id", "owner-id")).toBe(true);
    expect(canDeleteDocument("other-id", "owner-id")).toBe(false);
  });
});

describe("canShareDocument", () => {
  it("allows only the owner", () => {
    expect(canShareDocument("owner-id", "owner-id")).toBe(true);
    expect(canShareDocument("other-id", "owner-id")).toBe(false);
  });
});
