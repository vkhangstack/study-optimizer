import {
  MessageType,
  MessageDirection,
  ZaloEventType,
  BotStatus,
  ConversationStatus,
  UserStatus,
} from "./enums";

/**
 * Base message interface
 */
export interface BaseMessage {
  id: string;
  content: string;
  type: MessageType;
  direction: MessageDirection;
  timestamp: Date;
  userId: string;
}

/**
 * Zalo webhook event interface
 */
export interface ZaloWebhookEvent {
  event: ZaloEventType;
  sender: {
    id: string;
    display_name?: string;
    avatar?: string;
  };
  message: {
    text?: string;
    url?: string;
    id?: string;
    latitude?: number;
    longitude?: number;
  };
  timestamp: number;
}

/**
 * Bot configuration interface
 */
export interface BotConfig {
  id: string;
  key: string;
  value: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User profile interface
 */
export interface UserProfile {
  id: string;
  zaloId: string;
  name?: string;
  avatar?: string;
  phone?: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Conversation interface
 */
export interface Conversation {
  id: string;
  zaloId: string;
  status: ConversationStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Message statistics interface
 */
export interface MessageStats {
  total: number;
  incoming: number;
  outgoing: number;
  byType: Record<MessageType, number>;
  byDirection: Record<MessageDirection, number>;
}

/**
 * Bot status interface
 */
export interface BotStatusInfo {
  status: BotStatus;
  uptime: number;
  totalMessages: number;
  totalUsers: number;
  lastActivity: Date;
}

/**
 * API response interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

/**
 * Pagination interface
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Message filter interface
 */
export interface MessageFilter {
  userId?: string;
  type?: MessageType;
  direction?: MessageDirection;
  startDate?: Date;
  endDate?: Date;
  content?: string;
}

/**
 * User filter interface
 */
export interface UserFilter {
  status?: UserStatus;
  name?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}
