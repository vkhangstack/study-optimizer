export class BotUtils {
    private static instance: BotUtils;
    static getInstance(): BotUtils {
        if (!this.instance) {
            this.instance = new BotUtils();
        }
        return this.instance;
    }

    public parseCommand(message: any): { chatId: string; userId: string; userName: string; messageText: string } {
        const chatId = message?.chat?.id;
        const userId = message?.from?.id;
        const userName = message?.from?.display_name;
        const messageText = message?.text as string;
        return { chatId, userId, userName, messageText };
    }

}