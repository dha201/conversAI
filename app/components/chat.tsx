'use client'

import React, { FormEvent, ChangeEvent, useRef, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useChat } from "ai/react";
import { ChatBubble } from "./chat-bubble"; // Adjust the import path if needed
import { Message } from "ai/react";

interface ChatProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleMessageSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  messages: Message[];
}

const Chat: React.FC<ChatProps> = ({
  input,
  handleInputChange,
  handleMessageSubmit,
  messages,
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="rounded-2xl border h-[75vh] flex flex-col justify-between">
      <div
        className="p-6 overflow-y-auto flex-grow flex flex-col gap-4"
        ref={chatContainerRef}
      >
        <ul className="flex flex-col gap-4">
          {messages.map(({ id, role, content }: Message) => (
            <li key={id}>
              <ChatBubble role={role} content={content} />
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleMessageSubmit} className="p-4 flex">
        <Input
          placeholder={"Type to chat with AI..."}
          className="mr-2"
          value={input}
          onChange={handleInputChange}
        />
        <Button type="submit" className="w-24">
          Ask
        </Button>
      </form>
    </div>
  );
};

export default function ChatContainer() {
  // The useChat hook from ai sdk will automatically handle this streaming response.
  // Ref: https://sdk.vercel.ai/docs/reference/ai-sdk-ui/use-chat#api-signature
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    streamProtocol: 'text',
    api: '/api/chat',
    onResponse: (response) => {
      console.log('Received response from chat:', response);
    },
    onFinish: (message) => {
      console.log('Finished message:', message);
    },
    onError: (error) => {
      console.error('Error during chat submission:', error);
    },
  });

  // triggers the API request
  const handleMessageSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <Chat
      input={input}
      handleInputChange={handleInputChange}
      handleMessageSubmit={handleMessageSubmit}
      messages={messages}
    />
  );
}