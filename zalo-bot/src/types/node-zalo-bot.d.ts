declare module 'node-zalo-bot' {
  interface ZaloBotOptions {
    webHook?: {
      port?: number;
    };
    polling?: boolean
  }

  interface ZaloBotMessage {
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

  class ZaloBot {
    constructor(token: string, options?: ZaloBotOptions);
    
    setWebHook(url: string): void;
    processUpdate(update: any): void;
    sendMessage(chatId: string, message: string): Promise<any>;
    
    on(event: 'message', callback: (msg: any) => void): void;
    on(event: 'photo', callback: (msg: any) => void): void;
    on(event: 'sticker', callback: (msg: any) => void): void;
    on(event: 'location', callback: (msg: any) => void): void;
    on(event: string, callback: (msg: any) => void): void;
    onText(regex: RegExp, callback: (msg: any, match: any) => void): void;
  }

  export = ZaloBot;
}

  // Allow imports of internal subpaths (e.g. 'node-zalo-bot/errors') and
  // local packaged copy under `pkg/node-zalo-bot/*` used by the project.
  declare module 'node-zalo-bot/*' {
    const value: any;
    export default value;
  }

  declare module 'pkg/node-zalo-bot/*' {
    const value: any;
    export default value;
  }