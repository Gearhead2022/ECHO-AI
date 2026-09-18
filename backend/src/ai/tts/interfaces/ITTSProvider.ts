export interface ITTSProvider {
    speak(text: string): Promise<string>;
}