export interface TargetMessageAIResponse {
    chatId: number,
    messageId: number,
    summary: string
}

export interface AnalyzeMessagesAIResponse {
    messages: TargetMessageAIResponse[]
}
