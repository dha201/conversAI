import { TopNav } from '@/components/topNav';
import VerticalNavbar from '@/components/verticalNavBar';
import React from 'react';

export default function Page() {
  return (
    <div className="flex flex-col h-screen">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <VerticalNavbar />
        {/* Main Content */}
        <div className="flex-1 p-4 overflow-auto">
          {/* <Chat /> */}
        </div>
      </div>
    </div>
  );
}
