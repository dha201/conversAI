'use client';
import React from 'react';
import { TopNav } from '@/components/topNav';
import VerticalNavbar from '@/components/verticalNavBar';
import { Chat } from '@/components/chat';
import { withAuth } from '@/utils/withAuth';

function Page() {
  return (
    <div className="flex flex-col h-screen">
      <TopNav />
      <div className="flex flex-1 overflow-hidden pt-16">
        <VerticalNavbar />
        {/* Main Content */}
        <div className="flex-1 p-4 overflow-auto ml-[16.67%]">
          <Chat />
        </div>
      </div>
    </div>
  );
}

export default withAuth(Page);
