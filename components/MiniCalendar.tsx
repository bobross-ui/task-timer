import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

interface MiniCalendarProps {
  onDateSelect: (date: Date) => void;
}

const miniCalendarStyles = {
  '.fc': {
    '--fc-border-color': '#ddd',
    '--fc-button-text-color': '#fff',
    '--fc-button-bg-color': '#2563eb',
    '--fc-button-border-color': '#2563eb',
    '--fc-button-hover-bg-color': '#1d4ed8',
    '--fc-button-hover-border-color': '#1d4ed8',
  },
  '.fc .fc-button': {
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
  },
  '.fc .fc-toolbar-title': {
    fontSize: '1rem',
    fontWeight: '600',
  },
};

export default function MiniCalendar({ onDateSelect }: MiniCalendarProps) {
  return (
    <div className="w-64 bg-white rounded-lg shadow-lg p-2" style={miniCalendarStyles}>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev',
          center: 'title',
          right: 'next',
        }}
        height="auto"
        dayMaxEvents={0}
        selectable={true}
        select={(info) => onDateSelect(info.start)}
        dayCellClassNames="hover:bg-gray-50"
      />
    </div>
  );
} 