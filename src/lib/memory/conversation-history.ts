import { createLogger } from "@/lib/logger";
import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { longTermMemory, shortTermMemory } from "./session-manager";

const logger = createLogger({ agent: "conversation-history" });

const CONTEXT_WINDOW_SIZE = 50; // Keep last 50 messages in Redis

export class ConversationManager {

    /**
     * Add a message to the conversation context
     * Stores in both Short-Term (Redis) and Long-Term (Supabase) memory
     */
    async addMessage(
        sessionId: string,
        userId: string,
        organizationId: string,
        message: BaseMessage,
        metadata: any = {}
    ): Promise<void> {
        try {
            // 1. Format for storage
            const messageData = {
                type: message._getType(),
                content: message.content,
                timestamp: new Date().toISOString(),
                metadata
            };

            // 2. Save to Short-Term Memory (Redis List)
            await shortTermMemory.pushToList(sessionId, "messages", messageData);

            // 3. Maintain Context Window (Trim to last N)
            await shortTermMemory.trimList(sessionId, "messages", CONTEXT_WINDOW_SIZE);

            // 4. Save to Long-Term Memory (Supabase)
            // Fire-and-forget to avoid blocking the user
            longTermMemory.appendEvent(
                userId,
                organizationId,
                sessionId,
                message._getType() === "human" ? "user_message" : "agent_response",
                message.content,
                metadata
            ).catch(err => logger.error("LongTermMemory write failed", err));

        } catch (error) {
            logger.error("Failed to add message to history", error);
            throw error;
        }
    }

    /**
     * Get recent conversation context for the AI
     * Retrieves from Redis types and converts to LangChain BaseMessage[]
     */
    async getContext(sessionId: string): Promise<BaseMessage[]> {
        try {
            const rawMessages = await shortTermMemory.getListRange<any>(sessionId, "messages", 0, -1);

            return rawMessages.map(msg => {
                switch (msg.type) {
                    case "human":
                        return new HumanMessage(msg.content);
                    case "ai":
                        return new AIMessage(msg.content);
                    case "system":
                        return new SystemMessage(msg.content);
                    default:
                        return new HumanMessage(msg.content); // Fallback
                }
            });
        } catch (error) {
            logger.error("Failed to retrieve context", error);
            return [];
        }
    }

    /**
     * Clear context for a session
     */
    async clearSession(sessionId: string): Promise<void> {
        await shortTermMemory.delete(sessionId);
    }
}

export const conversationManager = new ConversationManager();
