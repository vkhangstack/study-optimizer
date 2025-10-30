export interface ZaloBotMessage {
  message_id: string;
  from: {
    id: string;
    display_name: string;
    avatar?: string;
  };
  chat: {
    id: string;
    type: string;
  };
  date: number;
  text?: string;
  photo?: Array<{
    file_id: string;
    file_unique_id: string;
    width: number;
    height: number;
    file_size?: number;
  }>;
  sticker?: {
    file_id: string;
    file_unique_id: string;
    width: number;
    height: number;
    is_animated: boolean;
    file_size?: number;
  };
  location?: {
    longitude: number;
    latitude: number;
  };
}

export interface BotCommand {
  command: string;
  description: string;
  handler: (msg: ZaloBotMessage) => Promise<string | null>;
}

export interface BotStats {
  totalUsers: number;
  activeUsers: number;
  totalMessages: number;
  messagesLastHour: number;
  messagesLastDay: number;
}

export interface BroadcastOptions {
  userIds?: string[];
  delay?: number;
  template?: boolean;
}