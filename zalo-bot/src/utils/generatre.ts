export class GenerateUtils {
    private static instance: GenerateUtils;

    public static getInstance(): GenerateUtils {
        if (!GenerateUtils.instance) {
            GenerateUtils.instance = new GenerateUtils();
        }
        return GenerateUtils.instance;
    }

    public generateId(): string {
        return Bun.randomUUIDv7('hex');
    }

    public createHashAssignment(input: string): string {
        return Bun.hash.crc32(input).toString(8);
    }

}