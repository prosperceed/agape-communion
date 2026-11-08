import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { getDb, users } from "@/lib/db";
import {
  AuthorizationError,
  assertAdminPermission,
  canManageAdmins,
  canManageContent,
  canManageLivestreams,
  canManageMedia,
  canManageSettings,
  canViewActivityLogs,
  checkLoginRateLimit,
  clearAllLoginRateLimits,
  recordFailedLoginAttempt,
  setTestAdminSession,
  verifyAdminCredentials,
} from "@/lib/auth";
import {
  CACHE_TAGS,
  clearInvalidatedTagHistory,
  getInvalidatedTagHistory,
} from "@/lib/cache";
import {
  MAX_UPLOAD_SIZE_BYTES,
  validateFileSignature,
  validateUploadMetadata,
} from "@/lib/storage";
import {
  acceptAdminInvitation,
  provisionOrInviteEditorAdmin,
  resetEditorAdminPassword,
  updateEditorAdminStatus,
} from "@/features/users/service";
import {
  listAdminActivityLogs,
  listAdministrators,
} from "@/features/users/queries";
import { updateChurchSettings } from "@/features/pages/service";
import { getPublicChurchSettings } from "@/features/pages/queries";
import { createEventEntry, updateEventStatus } from "@/features/events/service";
import { eventInputSchema } from "@/features/events/schemas";
import {
  getPublishedEventBySlug,
  getUpcomingPublishedEvents,
} from "@/features/events/queries";
import { createBlogPost, updateBlogPostStatus } from "@/features/blog/service";
import {
  getPaginatedPublishedPosts,
  getPublishedPostBySlug,
} from "@/features/blog/queries";
import { createServiceEntry } from "@/features/services/service";
import { getPublishedServices } from "@/features/services/queries";
import {
  createAdminTestimony,
  submitPublicTestimony,
  updateTestimonyStatus,
} from "@/features/testimonies/service";
import { publicTestimonySubmissionSchema } from "@/features/testimonies/schemas";
import { getAllPublishedTestimonies } from "@/features/testimonies/queries";
import {
  changeLivestreamState,
  createLivestreamAnnouncement,
} from "@/features/livestream/service";
import { getPublicLivestreamOverview } from "@/features/livestream/queries";
import {
  deleteMediaAsset,
  uploadAndRegisterMediaFile,
} from "@/features/media/service";
import type { AuthenticatedAdmin } from "@/types";

let superAdminSession: AuthenticatedAdmin;
let editorAdminSession: AuthenticatedAdmin;

describe("Agape Communion Church Platform - Core Unit & Integration Suite", () => {
  beforeAll(async () => {
    process.env.PGLITE_MEMORY = "true";
    const db = await getDb();

    const allUsers = await db.select().from(users);
    const superUser = allUsers.find((u) => u.role === "SUPER_ADMIN");
    const editorUser = allUsers.find((u) => u.role === "EDITOR_ADMIN");

    if (!superUser || !editorUser) {
      throw new Error("Seeded Super Admin and Editor Admin must exist.");
    }

    superAdminSession = {
      id: superUser.id,
      name: superUser.name,
      email: superUser.email,
      role: superUser.role,
      status: superUser.status,
    };

    editorAdminSession = {
      id: editorUser.id,
      name: editorUser.name,
      email: editorUser.email,
      role: editorUser.role,
      status: editorUser.status,
    };
  });

  beforeEach(() => {
    clearAllLoginRateLimits();
    clearInvalidatedTagHistory();
    setTestAdminSession(superAdminSession);
  });

  it("1. Authentication & login rate limiting", async () => {
    const validRes = await verifyAdminCredentials(
      superAdminSession.email,
      "AgapeSuperAdmin!2026"
    );
    expect(validRes.ok).toBe(true);
    if (validRes.ok) {
      expect(validRes.admin.role).toBe("SUPER_ADMIN");
    }

    const wrongRes = await verifyAdminCredentials(
      superAdminSession.email,
      "WrongPassword123!"
    );
    expect(wrongRes.ok).toBe(false);

    const testIdentifier = "ratelimit-check@agapecommunion.org.ng";
    for (let i = 0; i < 5; i++) {
      recordFailedLoginAttempt(testIdentifier);
    }

    const limitStatus = checkLoginRateLimit(testIdentifier);
    expect(limitStatus.allowed).toBe(false);
    expect(limitStatus.remainingAttempts).toBe(0);
    expect(limitStatus.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("2. Role-based authorization matrix (SUPER_ADMIN vs EDITOR_ADMIN)", () => {
    expect(canManageAdmins("SUPER_ADMIN")).toBe(true);
    expect(canManageSettings("SUPER_ADMIN")).toBe(true);
    expect(canViewActivityLogs("SUPER_ADMIN")).toBe(true);
    expect(canManageContent("SUPER_ADMIN")).toBe(true);
    expect(canManageMedia("SUPER_ADMIN")).toBe(true);
    expect(canManageLivestreams("SUPER_ADMIN")).toBe(true);

    expect(canManageAdmins("EDITOR_ADMIN")).toBe(false);
    expect(canManageSettings("EDITOR_ADMIN")).toBe(false);
    expect(canViewActivityLogs("EDITOR_ADMIN")).toBe(false);
    expect(canManageContent("EDITOR_ADMIN")).toBe(true);
    expect(canManageMedia("EDITOR_ADMIN")).toBe(true);
    expect(canManageLivestreams("EDITOR_ADMIN")).toBe(true);

    expect(() =>
      assertAdminPermission(editorAdminSession, "MANAGE_ADMINS")
    ).toThrow(AuthorizationError);
  });

  it("3. Super Admin account management (invite, activate, deactivate, revoke, reset password, self-lockout protection)", async () => {
    setTestAdminSession(superAdminSession);

    const invited = await provisionOrInviteEditorAdmin({
      name: "Brother Samuel Okon",
      email: "samuel.okon@agapecommunion.org.ng",
      password: "InitialPassword!2026",
      sendInviteOnly: true,
    });

    expect(invited.role).toBe("EDITOR_ADMIN");
    expect(invited.status).toBe("INVITED");
    expect(invited.invitationToken).toBeTruthy();

    const activated = await acceptAdminInvitation({
      token: invited.invitationToken!,
      password: "NewEditorPassword!2026",
    });
    expect(activated.status).toBe("ACTIVE");

    const loginAfterInvite = await verifyAdminCredentials(
      "samuel.okon@agapecommunion.org.ng",
      "NewEditorPassword!2026"
    );
    expect(loginAfterInvite.ok).toBe(true);

    const deactivated = await updateEditorAdminStatus({
      userId: invited.id,
      status: "DEACTIVATED",
    });
    expect(deactivated.status).toBe("DEACTIVATED");

    const loginWhileDeactivated = await verifyAdminCredentials(
      "samuel.okon@agapecommunion.org.ng",
      "NewEditorPassword!2026"
    );
    expect(loginWhileDeactivated.ok).toBe(false);

    await resetEditorAdminPassword({
      userId: invited.id,
      newPassword: "ResetPassword!2026",
    });
    await updateEditorAdminStatus({
      userId: invited.id,
      status: "ACTIVE",
    });

    const loginAfterReset = await verifyAdminCredentials(
      "samuel.okon@agapecommunion.org.ng",
      "ResetPassword!2026"
    );
    expect(loginAfterReset.ok).toBe(true);

    // Self-lockout protection: Super Admin cannot deactivate their own account
    await expect(
      updateEditorAdminStatus({
        userId: superAdminSession.id,
        status: "DEACTIVATED",
      })
    ).rejects.toThrow(/cannot deactivate or revoke your own Super Admin account/i);
  });

  it("4. Editor Admin restrictions enforced server-side", async () => {
    setTestAdminSession(editorAdminSession);

    await expect(listAdministrators()).rejects.toThrow(AuthorizationError);
    await expect(listAdminActivityLogs()).rejects.toThrow(AuthorizationError);

    const currentSettings = await getPublicChurchSettings();
    await expect(
      updateChurchSettings({
        ...currentSettings,
        churchName: "Unauthorized Change",
      })
    ).rejects.toThrow(AuthorizationError);
  });

  it("5. Prevention of privilege escalation & role-based invitation verification", async () => {
    // Editor Admin cannot provision or invite any administrator
    setTestAdminSession(editorAdminSession);
    await expect(
      provisionOrInviteEditorAdmin({
        name: "Attempted Escalation",
        email: "escalation@agapecommunion.org.ng",
        password: "EscalationPassword!2026",
        sendInviteOnly: false,
        role: "SUPER_ADMIN",
      })
    ).rejects.toThrow(AuthorizationError);

    // Super Admin can invite a user and assign their role; invited user cannot escalate role on verification
    setTestAdminSession(superAdminSession);
    const invitedEditor = await provisionOrInviteEditorAdmin({
      name: "Invited Editor Member",
      email: "invited-editor@agapecommunion.org.ng",
      role: "EDITOR_ADMIN",
      sendInviteOnly: true,
    });
    expect(invitedEditor.inviteLink).toContain("/admin/accept-invite?token=");

    await expect(
      acceptAdminInvitation({
        token: invitedEditor.invitationToken!,
        password: "VerifiedPassword!2026",
        role: "SUPER_ADMIN",
      })
    ).rejects.toThrow(/Privilege escalation blocked/i);
  });

  it("6 & 7. Content creation, publishing, and automatic slug uniqueness", async () => {
    setTestAdminSession(editorAdminSession);

    const firstPost = await createBlogPost({
      title: "Walking in Covenant Love",
      slug: "",
      excerpt: "A reflection on walking daily in the love of Christ.",
      content:
        "<p>Believers are called to walk in covenant love and unity across every season of life.</p>",
      coverImage: "/assets/blog/abiding-in-the-living-word.jpg",
      categoryId: "",
      authorName: "Pastor Emmanuel Adeyemi",
      tagNames: ["Covenant", "Love"],
      status: "PUBLISHED",
      seoTitle: "",
      seoDescription: "",
    });

    const secondPostSameTitle = await createBlogPost({
      title: "Walking in Covenant Love",
      slug: "",
      excerpt: "Part two on walking daily in the love of Christ.",
      content:
        "<p>Continuing our reflection on covenant love and practical discipleship.</p>",
      coverImage: "/assets/blog/abiding-in-the-living-word.jpg",
      categoryId: "",
      authorName: "Pastor Emmanuel Adeyemi",
      tagNames: ["Discipleship"],
      status: "PUBLISHED",
      seoTitle: "",
      seoDescription: "",
    });

    expect(firstPost.slug).toBe("walking-in-covenant-love");
    expect(secondPostSameTitle.slug).toBe("walking-in-covenant-love-2");
  });

  it("8. Zod input validation rules", () => {
    // Event endDate before startDate must fail
    const invalidEvent = eventInputSchema.safeParse({
      title: "Invalid Conference Dates",
      slug: "",
      excerpt: "Valid excerpt text here for testing.",
      description:
        "<p>Detailed conference description that is long enough to pass validation.</p>",
      coverImage: "/assets/events/night-of-worship.jpg",
      startDate: "2026-12-10T18:00:00.000Z",
      endDate: "2026-12-09T18:00:00.000Z",
      venue: "Main Sanctuary",
      registrationUrl: "",
      isFeatured: false,
      status: "DRAFT",
    });
    expect(invalidEvent.success).toBe(false);

    // Public testimony submission without story permission must fail
    const invalidTestimony = publicTestimonySubmissionSchema.safeParse({
      title: "God Answered My Prayer",
      personName: "Brother Kunle",
      displayPersonName: true,
      hasMediaPermission: true,
      hasStoryPermission: false,
      roleOrRelation: "Member",
      fullTestimony:
        "I am grateful to God for His faithfulness and provision throughout this year.",
    });
    expect(invalidTestimony.success).toBe(false);
  });

  it("9. Media upload restrictions, magic-byte file signature checks, and safe deletion", async () => {
    // Reject unsupported MIME type
    expect(
      validateUploadMetadata({
        mimeType: "application/pdf",
        sizeBytes: 1024,
        filename: "bulletin.pdf",
      }).valid
    ).toBe(false);

    // Reject oversized file (> 5MB)
    expect(
      validateUploadMetadata({
        mimeType: "image/jpeg",
        sizeBytes: MAX_UPLOAD_SIZE_BYTES + 100,
        filename: "huge.jpg",
      }).valid
    ).toBe(false);

    // Reject spoofed JPEG (wrong magic bytes)
    const fakeJpegBytes = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04]);
    expect(validateFileSignature(fakeJpegBytes, "image/jpeg").valid).toBe(
      false
    );

    // Reject SVG containing <script>
    const unsafeSvg = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'
    );
    expect(
      validateFileSignature(new Uint8Array(unsafeSvg), "image/svg+xml").valid
    ).toBe(false);

    // Accept valid PNG magic bytes and upload/register
    const validPngBytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    ]);
    expect(validateFileSignature(validPngBytes, "image/png").valid).toBe(true);

    const uploadedMedia = await uploadAndRegisterMediaFile({
      filename: "test-banner.png",
      mimeType: "image/png",
      sizeBytes: validPngBytes.length,
      folder: "events",
      altText: "Test event banner",
      bytes: validPngBytes,
    });

    // Reference this media URL in an event
    const eventUsingMedia = await createEventEntry({
      title: "Event Using Uploaded Media",
      slug: "",
      excerpt: "Testing media reference protection before deletion.",
      description:
        "<p>This event references the uploaded media asset so deletion is blocked while in use.</p>",
      coverImage: uploadedMedia.url,
      startDate: "2027-03-15T10:00:00.000Z",
      endDate: "2027-03-15T13:00:00.000Z",
      venue: "Main Auditorium",
      registrationUrl: "",
      isFeatured: false,
      status: "DRAFT",
    });
    expect(eventUsingMedia.coverImage).toBe(uploadedMedia.url);

    // Attempt to delete media while in use must fail
    await expect(deleteMediaAsset(uploadedMedia.id)).rejects.toThrow(
      /currently referenced/i
    );
  });

  it("10. Composite cursor-based pagination", async () => {
    const page1 = await getPaginatedPublishedPosts({ limit: 2 });
    expect(page1.items.length).toBe(2);
    expect(page1.hasMore).toBe(true);
    expect(page1.nextCursor).toBeTruthy();

    const page2 = await getPaginatedPublishedPosts({
      limit: 2,
      cursor: page1.nextCursor!,
    });
    expect(page2.items.length).toBeGreaterThan(0);

    const page1Ids = new Set(page1.items.map((item) => item.id));
    for (const item of page2.items) {
      expect(page1Ids.has(item.id)).toBe(false);
    }
  });

  it("11. Event scheduling and recurring service schedules", async () => {
    const createdService = await createServiceEntry({
      title: "Early Morning Intercessory Prayer",
      slug: "",
      description:
        "Gathering together at dawn to pray for families, our city, and the nation.",
      location: "Prayer Chapel",
      imageUrl: "/assets/services/friday-prayer-vigil.jpg",
      isRecurring: true,
      eventDate: "",
      status: "PUBLISHED",
      displayOrder: 10,
      schedules: [
        {
          dayOfWeek: "MONDAY",
          startTime: "06:00 AM",
          endTime: "07:00 AM",
          frequency: "WEEKLY",
          notes: "Open to all intercessors",
        },
      ],
    });

    const publicServices = await getPublishedServices();
    const matched = publicServices.find((s) => s.id === createdService.id);
    expect(matched).toBeDefined();
    expect(matched?.schedules.length).toBe(1);
    expect(matched?.schedules[0]?.dayOfWeek).toBe("MONDAY");

    const upcomingEvents = await getUpcomingPublishedEvents(10);
    expect(upcomingEvents.length).toBeGreaterThan(0);
  });

  it("12. Livestream state transitions (SCHEDULED -> LIVE -> ENDED) with single active LIVE stream guarantee", async () => {
    const streamA = await createLivestreamAnnouncement({
      title: "Sunday Morning Live Broadcast A",
      slug: "",
      description: "Join our first live worship service.",
      platform: "YOUTUBE",
      streamUrl: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
      thumbnailUrl: "/assets/hero/sunday-livestream-banner.jpg",
      status: "SCHEDULED",
      scheduledFor: "2027-04-04T09:00:00.000Z",
    });

    const streamB = await createLivestreamAnnouncement({
      title: "Sunday Second Service Broadcast B",
      slug: "",
      description: "Join our second live worship service.",
      platform: "YOUTUBE",
      streamUrl: "https://www.youtube.com/watch?v=5qap5aO4i9A",
      thumbnailUrl: "/assets/hero/sunday-livestream-banner.jpg",
      status: "SCHEDULED",
      scheduledFor: "2027-04-04T11:00:00.000Z",
    });

    // Transition stream A to LIVE
    const liveA = await changeLivestreamState(streamA.id, "LIVE");
    expect(liveA.status).toBe("LIVE");

    const overview1 = await getPublicLivestreamOverview();
    expect(overview1.activeStream?.id).toBe(streamA.id);
    expect(overview1.activeStream?.status).toBe("LIVE");

    // Transition stream B to LIVE -> stream A must automatically become ENDED
    const liveB = await changeLivestreamState(streamB.id, "LIVE");
    expect(liveB.status).toBe("LIVE");

    const overview2 = await getPublicLivestreamOverview();
    expect(overview2.activeStream?.id).toBe(streamB.id);
    expect(overview2.activeStream?.status).toBe("LIVE");

    // End stream B
    const endedB = await changeLivestreamState(streamB.id, "ENDED");
    expect(endedB.status).toBe("ENDED");
    expect(endedB.endedAt).toBeTruthy();
  });

  it("13. Explicit cache invalidation on content updates", async () => {
    clearInvalidatedTagHistory();

    const post = await createBlogPost({
      title: "Cache Invalidation Verification Post",
      slug: "",
      excerpt: "Verifying that cache tags are invalidated when content changes.",
      content:
        "<p>Testing explicit tag invalidation on publish and status transitions.</p>",
      coverImage: "/assets/blog/finding-peace-in-the-psalms.jpg",
      categoryId: "",
      authorName: "Pastor Emmanuel Adeyemi",
      tagNames: ["Faith"],
      status: "DRAFT",
      seoTitle: "",
      seoDescription: "",
    });

    expect(getInvalidatedTagHistory()).toContain(CACHE_TAGS.POSTS);

    clearInvalidatedTagHistory();
    await updateBlogPostStatus(post.id, "PUBLISHED");
    expect(getInvalidatedTagHistory()).toContain(CACHE_TAGS.POSTS);
  });

  it("14. Public content visibility (drafts/archived hidden; testimony privacy respected)", async () => {
    const draftEvent = await createEventEntry({
      title: "Internal Draft Leadership Retreat",
      slug: "",
      excerpt: "Draft event that should never appear publicly.",
      description:
        "<p>This draft event is still being planned and should not be visible to visitors.</p>",
      coverImage: "/assets/events/night-of-worship.jpg",
      startDate: "2027-06-01T09:00:00.000Z",
      endDate: "2027-06-01T15:00:00.000Z",
      venue: "Conference Room",
      registrationUrl: "",
      isFeatured: false,
      status: "DRAFT",
    });

    const publicLookupDraft = await getPublishedEventBySlug(draftEvent.slug);
    expect(publicLookupDraft).toBeNull();

    await updateEventStatus(draftEvent.id, "PUBLISHED");
    const publicLookupPublished = await getPublishedEventBySlug(
      draftEvent.slug
    );
    expect(publicLookupPublished).not.toBeNull();

    await updateEventStatus(draftEvent.id, "ARCHIVED");
    const publicLookupArchived = await getPublishedEventBySlug(draftEvent.slug);
    expect(publicLookupArchived).toBeNull();

    // Public testimony submission defaults to PENDING (not visible publicly)
    const submittedTestimony = await submitPublicTestimony({
      title: "Peace Restored in My Home",
      personName: "Sister Ngozi",
      displayPersonName: false,
      hasMediaPermission: true,
      hasStoryPermission: true,
      roleOrRelation: "Church Member",
      fullTestimony:
        "We prayed together during the Friday vigil and the Lord brought lasting peace to our family.",
    });
    expect(submittedTestimony.status).toBe("PENDING");

    const beforePublishList = await getAllPublishedTestimonies();
    expect(
      beforePublishList.some((t) => t.id === submittedTestimony.id)
    ).toBe(false);

    // Publish testimony and verify displayPersonName=false masks the person's name
    await updateTestimonyStatus(submittedTestimony.id, "PUBLISHED");
    const afterPublishList = await getAllPublishedTestimonies();
    const publishedTestimony = afterPublishList.find(
      (t) => t.id === submittedTestimony.id
    );
    expect(publishedTestimony).toBeDefined();
    expect(publishedTestimony?.publicName).toBe("Church Member");

    // Testimony without media/story consent cannot be published
    const unconsentedTestimony = await createAdminTestimony({
      title: "Unconsented Draft Testimony",
      slug: "",
      personName: "Brother Emeka",
      displayPersonName: true,
      hasMediaPermission: false,
      hasStoryPermission: true,
      roleOrRelation: "Member",
      excerpt: "Short summary of testimony.",
      fullTestimony:
        "Full testimony text stored internally while awaiting photo permission.",
      imageUrl: "/assets/testimonies/deacon-chinedu-obi.jpg",
      isFeatured: false,
      status: "PENDING",
    });

    await expect(
      updateTestimonyStatus(unconsentedTestimony.id, "PUBLISHED")
    ).rejects.toThrow(/without confirmed story and photograph permissions/i);
  });

  it("15. Administrative activity logging", async () => {
    setTestAdminSession(superAdminSession);
    const logs = await listAdminActivityLogs(25);
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0]).toHaveProperty("actorName");
    expect(logs[0]).toHaveProperty("action");
    expect(logs[0]).toHaveProperty("entityType");
    expect(logs[0]).toHaveProperty("summary");
  });
});
