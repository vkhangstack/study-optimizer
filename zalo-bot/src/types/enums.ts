/**
 * Message type enumeration
 * Defines the different types of messages that can be sent/received
 */
export enum MessageType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  FILE = "FILE",
  STICKER = "STICKER",
  LOCATION = "LOCATION",
  TEMPLATE = "TEMPLATE",
  AUDIO = "AUDIO",
  VIDEO = "VIDEO",
  DOCUMENT = "DOCUMENT",
  CHAT_STICKER = "CHAT_STICKER",
  CHAT_PHOTO = "CHAT_PHOTO",
}

/**
 * Message direction enumeration
 * Defines whether a message is incoming (from user) or outgoing (from bot)
 */
export enum MessageDirection {
  INCOMING = "INCOMING",
  OUTGOING = "OUTGOING",
}

/**
 * Bot status enumeration
 * Defines the current status of the bot
 */
export enum BotStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  MAINTENANCE = "MAINTENANCE",
  ERROR = "ERROR",
}

/**
 * Conversation status enumeration
 * Defines the status of a conversation
 */
export enum ConversationStatus {
  ACTIVE = "active",
  CLOSED = "closed",
  ARCHIVED = "archived",
  BLOCKED = "blocked",
}

/**
 * User status enumeration
 * Defines the status of a user
 */
export enum UserStatus {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
  INACTIVE = "INACTIVE",
}

/**
 * Event type enumeration
 * Defines the different types of webhook events from Zalo
 */
export enum ZaloEventType {
  USER_SEND_TEXT = "user_send_text",
  USER_SEND_IMAGE = "user_send_image",
  USER_SEND_FILE = "user_send_file",
  USER_SEND_STICKER = "user_send_sticker",
  USER_SEND_LOCATION = "user_send_location",
  USER_SEND_AUDIO = "user_send_audio",
  USER_SEND_VIDEO = "user_send_video",
  USER_FOLLOW = "user_follow",
  USER_UNFOLLOW = "user_unfollow",
}

/**
 * API response status enumeration
 * Defines standard API response statuses
 */
export enum ApiStatus {
  SUCCESS = "success",
  ERROR = "error",
  PENDING = "pending",
  FAILED = "failed",
}

export enum Command {
  HELP = "/help",
  INFO = "/info",
  MENU = "/menu",
  REGISTER = "/register",
  UNREGISTER = "/unregister",
  CLASS = "/class",
  // SCHEDULE = "/schedule",
  TODAY = "/today",
  NOTIFY = "/notify",
  ASSIGNMENTS = "/assignments",
  ADD_ASSIGNMENT = "/add_assignment",
  ADD_ASSIGNMENT_CLASS = "/add_assignment_class",
  STATUS_ASSIGNMENT = "/status_assignment",
  REMOVE_ASSIGNMENT = "/remove_assignment",
  UPCOMING_ASSIGNMENTS = "/upcoming_assignments",
  DOCS = "/docs",
}

export enum StatusUser {
  INACTIVE = 0,
  ACTIVE = 1,
}

export enum YearSemester {
  FIRST_SEMESTER = 1,
  SECOND_SEMESTER = 2,
  SUMMER_SEMESTER = 3,
}
export enum Years {
  YEAR_2025_2026 = "2025-2026",
  YEAR_2026_2027 = "2026-2027",
}

export enum AssignmentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  OVERDUE = "overdue",
}

export const commandList = Object.values(Command)
