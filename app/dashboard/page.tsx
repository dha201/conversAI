'use client'
import React, { useState, useEffect } from 'react';
import { TopNav } from '@/app/components/topNav';
import Chat from '../components/chat';
import { withAuth } from '@/app/utils/withAuth';
import { useAuth } from '@clerk/nextjs';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Toaster } from "@/app/components/ui/toaster"


function Page() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const { userId } = useAuth();

  useEffect(() => {
    const fetchConversation = async () => {
      if (userId) {
        try {
          const response = await fetch(`/api/getLastConvoId?userId=${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (response.ok) {
            const data = await response.json();
            console.log('Last Conversation ID received:', data.conversationId);
            setConversationId(data.conversationId);
          } else {
            console.error('Failed to fetch conversation:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching conversation:', error);
        }
      }
    };

    fetchConversation();
  }, [userId]);

  const fetchAllConversations = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/getAllConvo?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('All Conversations received:', data);
        setConversations(data);
      } else {
        console.error('Failed to fetch conversations:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const handleConversationClick = (id: string) => {
    setConversationId(id);
  };

  const handleNewChat = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!userId) return;
    try {
      const response = await fetch('/api/newChat', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'userID': userId,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setConversationId(data.newConversationId);
        console.log('New chat created:', data.newConversationId);
      } else {
        console.error('Failed to create new chat');
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <TopNav />
      <Toaster />
      <div className="flex flex-1 overflow-hidden pt-16">
        <nav className="w-1/6 h-[calc(100vh-4rem)] bg-white text-slate-900 fixed left-0 top-16 pt-4">
          <ul className="flex flex-col space-y-4 p-4 ml-5">
            <li className="hover:bg-gray-200 p-2 rounded flex items-center">
              <a href="#" onClick={handleNewChat} className="flex items-center w-full">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 mr-2"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    <path
                      d="M4 12H20M12 4V20"
                      stroke="#000000"
                      strokeWidth="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>
                  </g>
                </svg>
                New Chat
              </a>
            </li>
            <li className="hover:bg-gray-200 p-2 rounded flex items-center">
              <Menu as="div" className="relative inline-block text-left">
                <MenuButton
                  onClick={fetchAllConversations}
                  className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Conversations
                  <ChevronDownIcon aria-hidden="true" className="-mr-1 h-5 w-5 text-gray-400" />
                </MenuButton>
                <MenuItems
                  className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  style={{ left: '-3px', transform: 'translateX(2px)' }}
                >
                  {conversations.length > 0 ? (
                    conversations.map((convo) => (
                      <MenuItem key={convo.conversationId}>
                        {({ active }: { active: boolean }) => (
                          <a
                            href="#"
                            onClick={() => handleConversationClick(convo.conversationId)}
                            className={`block px-4 py-2 text-sm ${
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                            }`}
                          >
                            Conversation {convo.conversationId}
                          </a>
                        )}
                      </MenuItem>
                    ))
                  ) : (
                    <div className="py-1 px-4 text-sm text-gray-700">
                      No Conversations Available
                    </div>
                  )}
                </MenuItems>
              </Menu>
            </li>
          </ul>
        </nav>
        <div className="flex-1 p-4 overflow-auto ml-[16.67%]">
          {conversationId && <Chat conversationId={conversationId} />}
        </div>
      </div>
    </div>
  );
}

export default withAuth(Page);
