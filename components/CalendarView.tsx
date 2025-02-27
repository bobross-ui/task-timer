import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventSourceInput } from '@fullcalendar/core';
import { supabase } from '@/lib/supabase';

interface Task {
  id: number;
  name: string;
  start_time: string;
  end_time: string | null;
}

const calendarStyles = {
  '.fc': {
    height: '100%',
    '--fc-border-color': '#ddd',
    '--fc-button-text-color': '#fff',
    '--fc-button-bg-color': '#2563eb',
    '--fc-button-border-color': '#2563eb',
    '--fc-button-hover-bg-color': '#1d4ed8',
    '--fc-button-hover-border-color': '#1d4ed8',
    '--fc-button-active-bg-color': '#1e40af',
    '--fc-button-active-border-color': '#1e40af',
  },
  '.fc .fc-button': {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    borderRadius: '0.375rem',
  },
  '.fc .fc-toolbar-title': {
    fontSize: '1.25rem',
    fontWeight: '600',
  },
  '.fc-event': {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
  },
};

export default function CalendarView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async (start: string, end: string) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .gte('start_time', start)
        .lte('start_time', end);

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (arg: { start: Date; end: Date }) => {
    fetchTasks(arg.start.toISOString(), arg.end.toISOString());
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const handleEventDrop = async (info: any) => {
    const { event } = info;
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          start_time: event.start.toISOString(),
          end_time: event.end?.toISOString() || null,
        })
        .eq('id', event.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating task:', error);
      info.revert();
    }
  };

  const handleDateSelect = async (selectInfo: any) => {
    const taskName = prompt('Enter task name:');
    if (!taskName) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          name: taskName,
          start_time: selectInfo.start.toISOString(),
          end_time: selectInfo.end.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      setTasks([...tasks, data]);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const events: EventSourceInput = tasks.map(task => ({
    id: task.id.toString(),
    title: task.name,
    start: task.start_time,
    end: task.end_time || undefined,
    extendedProps: {
      timeDisplay: `${formatTime(new Date(task.start_time))} - ${
        task.end_time ? formatTime(new Date(task.end_time)) : 'Ongoing'
      }`,
    },
  }));

  return (
    <div className="h-[800px] bg-white rounded-lg shadow-lg p-4" style={calendarStyles}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={events}
        datesSet={handleDateRangeChange}
        eventDrop={handleEventDrop}
        select={handleDateSelect}
        eventContent={(arg) => (
          <div className="p-1">
            <div className="font-semibold">{arg.event.title}</div>
            <div className="text-xs">{arg.event.extendedProps.timeDisplay}</div>
          </div>
        )}
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        dayCellClassNames="hover:bg-gray-50"
        eventClassNames="rounded-md shadow-sm"
      />
    </div>
  );
} 