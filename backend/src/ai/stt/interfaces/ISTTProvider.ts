export interface ISTTProvider {
    transcribe(
        audioPath: string
    ): Promise<{
        text: string;
    }>;
}