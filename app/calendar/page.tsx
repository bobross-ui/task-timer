'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Link from 'next/link';

const CalendarView = dynamic(() => import('@/components/CalendarView'), {
  ssr: false,
});

const MiniCalendar = dynamic(() => import('@/components/MiniCalendar'), {
  ssr: false,
});

export default function CalendarPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Calendar</h1>
        <Link 
          href="/"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Back to Timer
        </Link>
      </div>
      
      <div className="flex gap-4">
        <div className="hidden md:block">
          <Suspense fallback={<div>Loading mini calendar...</div>}>
            <MiniCalendar 
              onDateSelect={(date) => {
                const calendarApi = document.querySelector('.fc')._fullCalendar;
                if (calendarApi) {
                  calendarApi.gotoDate(date);
                }
              }}
            />
          </Suspense>
        </div>
        
        <div className="flex-1">
          <Suspense fallback={<div>Loading calendar...</div>}>
            <CalendarView />
          </Suspense>
        </div>
      </div>
    </div>
  );
} 