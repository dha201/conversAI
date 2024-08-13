'use client'

import React, { FormEvent, ChangeEvent, useRef, useEffect, useState } from "react";
import { useAuth } from '@clerk/nextjs';

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useChat } from "ai/react";
import { ChatBubble } from "./chat-bubble";
import { Message } from "ai/react";
import PDFUploader from "./PDFUploader";

interface ChatProps {
  conversationId: string | null;
  chatInput: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleMessageSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  messages: Message[];
}

type Role = "user" | "assistant";

interface oldMessage {
  role: Role;
  content: string;
}


const Chat: React.FC<ChatProps> = ({
  conversationId,
  chatInput,
  handleInputChange,
  handleMessageSubmit,
  messages,
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [summary, setSummary] = useState<string>('');
  const apiCallMade = useRef(false);
  const [conversationData, setConversationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useAuth();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const fetchSummary = async () => {
      if (apiCallMade.current || (conversationData && conversationData.messages.length > 0)) return;
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
  }, [conversationData]);

  useEffect(() => {
    const fetchConversation = async () => {
      if (conversationId && userId) {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/getConversation?conversationId=${conversationId}&userId=${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (response.ok) {
            const data = await response.json();
            console.log('data recieved:', data);
            setConversationData(data);
          } else {
            console.error('Failed to fetch conversation:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching conversation:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
  
    fetchConversation();
  }, [conversationId, userId]);

  return (
    <div className="rounded-2xl border h-[75vh] flex flex-col justify-between">
      <div
        className="p-6 overflow-y-auto flex-grow flex flex-col gap-4"
        ref={chatContainerRef}
      >
        {isLoading ? (
          <p>Loading conversation...</p>
        ) : (
          <>
            {conversationData && conversationData.length > 0 ? (
              <ul className="flex flex-col gap-4">
                {conversationData.map((message: oldMessage, index: number) => (
                  <li key={index}>
                    <ChatBubble role={message.role} content={message.content} />
                  </li>
                ))}
              </ul>
            ) : (
              summary && (
                <ChatBubble
                  role="assistant"
                  content={`${summary}\n\nHow can I assist you today?`}
                />
              )
            )}
            <ul className="flex flex-col gap-4">
              {messages.map(({ id, role, content }: Message) => (
                <li key={id}>
                  <ChatBubble role={role} content={content} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="p-4 flex">
        <PDFUploader />
        <form onSubmit={handleMessageSubmit} className="flex flex-grow">
          <Input
            placeholder={"Type to chat with AI..."}
            className="mr-2 flex-grow"
            value={chatInput}
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

interface ChatContainerProps {
  conversationId: string | null;
}

export default function ChatContainer({ conversationId }: ChatContainerProps) {
  const { getToken, userId } = useAuth();

  const { messages, input: chatInput, handleInputChange, handleSubmit, isLoading } = useChat({ //https://sdk.vercel.ai/docs/reference/ai-sdk-ui/use-chat
    streamProtocol: 'text',
    api: '/api/chat',
    onResponse: (response) => {
      console.log('Received response from chat:', response);
    },
    onFinish: async (message) => {
      console.log('Finished message:', message);
  
      try {
        const response = await fetch('/api/updateMessage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            conversationId,
            newMessages: message,
          }),
        });
  
        if (!response.ok) {
          throw new Error('Failed to update conversation');
        }
  
        const data = await response.json();
        console.log('Conversation updated:', data);
      } catch (error) {
        console.error('Error updating conversation with AI response: ', error);
      }
    },
    onError: (error) => {
      console.error('Error during chat submission:', error);
    },
  });

  const handleMessageSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (chatInput.trim() === '' || !userId) return;
  
    try {
      // Store user's message in the database
      const response = await fetch('/api/updateMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          conversationId,
          newMessages: { role: 'user', content: chatInput },
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to save user message');
      }
  
      // Proceed with the AI handling and getting the response
      handleSubmit();
    } catch (error) {
      console.error('Error during message submission:', error);
    }
  };

  return (
    <Chat
      chatInput={chatInput}
      handleInputChange={handleInputChange}
      handleMessageSubmit={handleMessageSubmit}
      messages={messages}
      conversationId={conversationId}
    />
  );
}
