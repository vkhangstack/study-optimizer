export interface ZaloWebhookEvent {
  app_id: string;
  user_id_by_app: string;
  event_name: string;
  timestamp: number;
  sender: {
    id: string;
  };
  recipient: {
    id: string;
  };
  message?: {
    text?: string;
    msg_id: string;
    attachments?: Array<{
      type: string;
      payload: {
        url?: string;
        coordinates?: {
          lat: number;
          long: number;
        };
      };
    }>;
  };
}

export interface ZaloUserProfile {
  user_id: string;
  display_name: string;
  user_alias: string;
  user_is_follower: boolean;
  avatar: string;
  shared_info?: {
    address?: string;
    phone?: string;
    name?: string;
    city_id?: string;
    district_id?: string;
    ward_id?: string;
  };
}

export interface ZaloMessageResponse {
  error: number;
  message: string;
  data?: {
    message_id: string;
  };
}

export interface ZaloTemplate {
  template_type: 'media' | 'list' | 'request_user_info';
  elements: Array<{
    media_type?: 'image' | 'video';
    attachment_id?: string;
    title?: string;
    subtitle?: string;
    image_url?: string;
    default_action?: {
      type: 'oa.open.url';
      url: string;
    };
    buttons?: Array<{
      title: string;
      type: 'oa.open.url' | 'oa.query.hide' | 'oa.query.show';
      payload?: string;
      url?: string;
    }>;
  }>;
}

export interface ZaloApiError {
  error: number;
  message: string;
  data?: any;
}
export interface ZaloBotWebhookMessageDefinition {
  date: number;
  chat: { chat_type: "PRIVATE", id: string };
  message_id: string;
  from: { id: string, is_bot: boolean, display_name: string };
  message_type?: string;
}

export interface ZaloBotWebhookMessageText extends ZaloBotWebhookMessageDefinition {
  text: string;
}
export interface ZaloBotWebhookMessagePhoto extends ZaloBotWebhookMessageDefinition {
  caption: string;
  photo_url: string;
}

export interface ZaloBotWebhookMessageSticker extends ZaloBotWebhookMessageDefinition {
  sticker: string;
  url: string;
}

export enum ZaloMessageType {
  TEXT = 'message.text.received',
  IMAGE = 'message.image.received',
  STICKER = 'message.sticker.received',
  UNSUPPORTED = 'message.unsupported.received',
}

export type ZaloBotWebhookMessage = ZaloBotWebhookMessageText | ZaloBotWebhookMessagePhoto | ZaloBotWebhookMessageSticker;