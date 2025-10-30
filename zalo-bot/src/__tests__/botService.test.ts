import { describe, it, expect } from 'bun:test';
import { BotService } from '../services/botService';

function makePrismaMock(overrides: any = {}) {
    return {
        user: {
            findUnique: overrides.findUnique || (async () => null),
            findMany: overrides.findMany || (async () => []),
        },
        message: {
            create: overrides.create || (async () => ({})),
        },
    } as any;
}

function makeConfigServiceMock(overrides: any = {}) {
    return {
        getBotEnabled: overrides.getBotEnabled || (async () => true),
        getWelcomeMessage: overrides.getWelcomeMessage || (async () => 'Xin chào {name}'),
        getDefaultResponse: overrides.getDefaultResponse || (async () => 'Mặc định'),
    } as any;
}

describe('BotService.processMessage', () => {
    it('returns null when bot is disabled', async () => {
        const prisma = makePrismaMock();
        const svc = new BotService({}, prisma as any);
        (svc as any).configService = makeConfigServiceMock({ getBotEnabled: async () => false });

        const res = await svc.processMessage('hello', { display_name: 'Khang' });
        expect(res).toBeNull();
    });

    it('returns welcome message with name', async () => {
        const prisma = makePrismaMock();
        const svc = new BotService({}, prisma as any);
        (svc as any).configService = makeConfigServiceMock({
            getBotEnabled: async () => true,
            getWelcomeMessage: async () => 'Chào {name}, welcome!',
        });

        const res = await svc.processMessage('hello', { display_name: 'An' });
        expect(res).toBe('Chào An, welcome!');
    });

    it('echo command returns echoed text', async () => {
        const prisma = makePrismaMock();
        const svc = new BotService({}, prisma as any);
        (svc as any).configService = makeConfigServiceMock({ getBotEnabled: async () => true });

        const res = await svc.processMessage('echo Hello Bun', { display_name: 'User' });
        expect(res).toBe('Bạn nói: "Hello Bun"');
    });

    it('stats returns formatted stats when user exists', async () => {
        const createdAt = new Date('2024-01-02T00:00:00Z');
        const prisma = makePrismaMock({
            findUnique: async () => ({
                id: '1',
                zaloId: 'zalo-1',
                name: 'Tester',
                createdAt,
                _count: { messages: 42 },
            }),
        });

        const svc = new BotService({}, prisma as any);
        (svc as any).configService = makeConfigServiceMock({ getBotEnabled: async () => true });

        const res = await svc.processMessage('stats', { id: 'zalo-1' });
        expect(typeof res).toBe('string');
        expect(res).toContain('Tổng tin nhắn: 42');
        expect(res).toContain('Tên: Tester');
    });
});
