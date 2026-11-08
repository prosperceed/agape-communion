export type AdminRole = "SUPER_ADMIN" | "EDITOR_ADMIN";

export type AccountStatus = "ACTIVE" | "INVITED" | "DEACTIVATED" | "REVOKED";

export type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type TestimonyStatus = "PENDING" | "APPROVED" | "PUBLISHED" | "ARCHIVED";

export type LivestreamStatus = "SCHEDULED" | "LIVE" | "ENDED";

export type LivestreamPlatform = "YOUTUBE" | "FACEBOOK";

export type ServiceFrequency = "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "ONE_TIME";

export type DayOfWeek =
  | "SUNDAY"
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY";

export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export type ActionResult<T = void> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export interface CoreBeliefItem {
  title: string;
  description: string;
  scripture: string;
}

export interface LeadershipMember {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
}

export interface AuthenticatedAdmin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AccountStatus;
}
