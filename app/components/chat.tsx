'use client'

import React, { FormEvent, ChangeEvent, useRef, useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useChat } from "ai/react";
import { ChatBubble } from "./chat-bubble";
import { Message } from "ai/react";
import PDFUploader from "./PDFUploader";

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
  const [summary, setSummary] = useState<string>('');
  const apiCallMade = useRef(false);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const fetchSummary = async () => {
      if (apiCallMade.current) return;
      apiCallMade.current = true;

      try {
        const response = await fetch('/api/summarize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setSummary(data.introduction || data.summary);
      } catch (error) {
        console.error('Error fetching summary:', error);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div className="rounded-2xl border h-[75vh] flex flex-col justify-between">
      <div
        className="p-6 overflow-y-auto flex-grow flex flex-col gap-4"
        ref={chatContainerRef}
      >
        {summary && (
          <ChatBubble
            role="assistant"
            content={`Hello! Here's a summary of what I know so far:\n\n${summary}\n\nHow can I assist you today?`}
          />
        )}
        <ul className="flex flex-col gap-4">
          {messages.map(({ id, role, content }: Message) => (
            <li key={id}>
              <ChatBubble role={role} content={content} />
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 flex">
        <PDFUploader />
        <form onSubmit={handleMessageSubmit} className="flex flex-grow">
          <Input
            placeholder={"Type to chat with AI..."}
            className="mr-2 flex-grow"
            value={input}
            onChange={handleInputChange}
          />
          <Button type="submit" className="w-24">
            Ask
          </Button>
        </form>
      </div>
    </div>
  );
};

export default function ChatContainer() {
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
