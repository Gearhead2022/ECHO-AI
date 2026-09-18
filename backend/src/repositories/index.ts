import { ConversationRepository } from "./ConversationRepository";
import { MessageRepository } from "./MessageRepository";

export const conversationRepository =
    new ConversationRepository();

export const messageRepository =
    new MessageRepository();