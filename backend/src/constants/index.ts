/** Allowed listing statuses an owner can set on their property */
export const OWNER_ALLOWED_LISTING_STATUSES = ['ACTIVE', 'PAUSED', 'RENTED', 'ARCHIVED'] as const;

/** Valid user roles for the platform */
export const USER_ROLES = ['USER', 'ROOM_OWNER', 'ADMIN'] as const;

/** Valid account statuses */
export const ACCOUNT_STATUSES = ['ACTIVE', 'SUSPENDED'] as const;

/** Valid visit statuses */
export const VISIT_STATUSES = ['REQUESTED', 'ACCEPTED', 'REJECTED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED'] as const;

/** Valid inquiry statuses */
export const INQUIRY_STATUSES = ['SENT', 'VIEWED', 'RESPONDED', 'VISIT_REQUESTED', 'VISIT_SCHEDULED', 'CLOSED'] as const;

/** Valid report statuses */
export const REPORT_STATUSES = ['PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED'] as const;

/** Valid listing statuses */
export const LISTING_STATUSES = ['DRAFT', 'PENDING_REVIEW', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'REJECTED', 'PAUSED', 'RENTED', 'ARCHIVED'] as const;

/** Dev OTP codes that are always accepted */
export const DEV_OTP_CODES = ['123456', '000000'] as const;

/** Maximum audit log entries retained in-memory */
export const MAX_AUDIT_LOGS = 500;

/** Default search radius in km */
export const DEFAULT_SEARCH_RADIUS_KM = 15;

/** Default page size for search results */
export const DEFAULT_PAGE_SIZE = 20;
