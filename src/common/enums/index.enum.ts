export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
}

export enum PlanType {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export enum TenantStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum Role {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum FeedbackStatus {
  PENDING = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
}

export enum FeedbackPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum FeedbackType {
  BUG = 'BUG',
  FEATURE_REQUEST = 'FEATURE_REQUEST',
  IMPROVEMENT = 'IMPROVEMENT',
}

export enum ChangelogType {
  FEATURE = 'feature',
  IMPROVEMENT = 'improvement',
  BUGFIX = 'bugfix',
  BREAKING = 'breaking',
  SECURITY = 'security',
}

export enum ChangelogStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}
