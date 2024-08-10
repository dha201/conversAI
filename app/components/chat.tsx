import { useRef } from "react";
import { ChatBubble } from "./chat-bubble";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Message } from "ai/react";

export function Chat() {
    const messages: Message[] = [
        { role: 'assistant', content: 'ASSISTANT', id:'1'},
        { role: 'user', content: 'USER', id:'2'},
    ];
    const sources = ['Source 1', 'Source 2'];

    return (
        <div className="rounded-2xl border h-[75vh] flex flex-col justify-between">

            <div className="p-6 overflow-auto">
            {messages.map(({ id, role, content }: Message, index) => (
                <ChatBubble
                    key={id}
                    role={role}
                    content={content}
                    // Start from the third message of the assistant
                    sources={role !== 'assistant' ? [] : sources}
                />
                ))}
            </div>

            <form className="p-4 flex clear-both">
                <Input
                placeholder={"Type to chat with AI..."}
                className="mr-2" />

                <Button type="submit" className="w-24">
                    Ask
                </Button>
            </form>

        </div>
    )
}