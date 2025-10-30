import axios, { AxiosInstance, HttpStatusCode } from "axios";
import BOT_RESPONSES from "../types/message";


export class ZaloBotService {
  private api: AxiosInstance;
  private static instance: ZaloBotService;

  constructor() {
    this.api = axios.create({
      baseURL: Bun.env.ZALO_API_BASE_URL || "https://bot-api.zapps.me",
      timeout: 10000,
    });
  }

  public static getInstance(): ZaloBotService {
    if (!ZaloBotService.instance) {
      ZaloBotService.instance = new ZaloBotService();
    }
    return ZaloBotService.instance;
  }

  public getBotToken(): string | null {
    return Bun.env.ZALO_BOT_TOKEN ?? null;
  }

  public getSecretToken(): string | null {
    return Bun.env.WEBHOOK_SECRET ?? null;
  }

  public getIsPolling(): boolean {
    return Bun.env.WEBHOOK_URL === undefined && Bun.env.WEBHOOK_URL === null || Bun.env.WEBHOOK_URL === "";
  }

  public getWebHookUrl(): string | null {
    return Bun.env.WEBHOOK_URL ?? null;
  }

  async getWebhookInfo(): Promise<string> {
    const { data, status } = await this.api.post(
      `/bot${this.getBotToken()}/getWebhookInfo`,
      {}
    );

    if (status !== HttpStatusCode.Ok) {
      throw new Error("Error getting webhook info");
    }

    return data?.result?.url;
  }

  async setWebHook(url?: string): Promise<boolean> {
    //first check if webhook is set
    const webhookUrl = await this.getWebhookInfo();
    if (webhookUrl) {
      return true;
    }

    const response = await this.api.post(
      `/bot${this.getBotToken()}/setWebhook`,
      {
        url: url ?? this.getWebHookUrl(),
        secret_token: this.getSecretToken(),
      }
    );

    if (response.status === 200 && response.data?.ok === true) {
      return true;
    }
    return false;
  }

  async deleteWebHook(): Promise<boolean> {
    const response = await this.api.post(
      `/bot${this.getBotToken()}/deleteWebhook`,
      {
        secret_token: this.getSecretToken(),
      }
    );

    if (response.status === 200 && response.data?.ok === true) {
      return true;
    }
    return false;
  }

  async sendMessage(zaloId: string, message: string): Promise<boolean> {
    const response = await this.api.post(
      `/bot${this.getBotToken()}/sendMessage`,
      {
        chat_id: zaloId,
        text: message,
      }
    );

    if (response.status === 200 && response.data?.ok === true) {
      return true;
    }
    return false;
  }

  async sendPhoto(zaloId: string, photoUrl: string, caption: string): Promise<boolean> {
    const response = await this.api.post(
      `/bot${this.getBotToken()}/sendPhoto`,
      {
        chat_id: zaloId,
        caption: caption,
        photo: photoUrl
      }
    );

    if (response.status === 200 && response.data?.ok === true) {
      return true;
    }
    return false;
  }

  async sendSticker(zaloId: string, stickerId: string): Promise<boolean> {
    const response = await this.api.post(
      `/bot${this.getBotToken()}/sendSticker`,
      {
        chat_id: zaloId,
        sticker: stickerId
      }
    );

    if (response.status === 200 && response.data?.ok === true) {
      return true;
    }
    return false;
  }

  async sendTypingAction(zaloId: string): Promise<boolean> {
    const response = await this.api.post(
      `/bot${this.getBotToken()}/sendChatAction`,
      {
        chat_id: zaloId,
        action: "typing"
      }
    );

    if (response.status === 200 && response.data?.ok === true) {
      return true;
    }
    return false;
  }

  public getHelpMessage(): string {
    return BOT_RESPONSES.help.text
  }

  public getBotInformation(): string {
    return BOT_RESPONSES.info.text
  }

}
