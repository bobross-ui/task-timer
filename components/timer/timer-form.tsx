'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  taskName: z.string().min(1, 'Task name is required'),
});

type TimerFormData = z.infer<typeof formSchema>;

type Task = {
  id: number;
  name: string;
  start_time: string;
  end_time: string | null;
};

// Parse ISO string as UTC by ensuring it ends with Z
const parseUTCDate = (isoString: string) => {
  // If the string doesn't end with Z, append it to ensure UTC parsing
  const utcString = isoString.endsWith('Z') ? isoString : `${isoString}Z`;
  return new Date(utcString);
};

export function TimerForm() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startTime, setStartTime] = useState<number | null>(null);

  const form = useForm<TimerFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      taskName: '',
    },
  });

  // Fetch ongoing task on component mount
  useEffect(() => {
    const fetchOngoingTask = async () => {
      try {
        const response = await fetch('/api/tasks?ongoing=true');
        if (!response.ok) {
          throw new Error('Failed to fetch ongoing task');
        }

        const tasks: Task[] = await response.json();
        const ongoingTask = tasks[0]; // Get the first ongoing task

        if (ongoingTask) {
          console.log('Found ongoing task:', ongoingTask);
          console.log('Start time from DB:', ongoingTask.start_time);
          
          // Parse the start time ensuring UTC interpretation
          const taskStartTime = parseUTCDate(ongoingTask.start_time).getTime();
          setStartTime(taskStartTime);
          
          console.log('Start timestamp:', taskStartTime);
          const currentTime = Date.now();
          console.log('Current timestamp:', currentTime);
          
          // Calculate elapsed time
          const elapsedSeconds = Math.floor(
            (currentTime - taskStartTime) / 1000
          );
          
          console.log('Calculated elapsed seconds:', elapsedSeconds);

          // Set the form state
          form.setValue('taskName', ongoingTask.name);
          setCurrentTaskId(ongoingTask.id);
          setIsRunning(true);
          setTime(elapsedSeconds);
        }
      } catch (error) {
        console.error('Error fetching ongoing task:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOngoingTask();
  }, [form]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && startTime) {
      interval = setInterval(() => {
        const elapsedSeconds = Math.floor(
          (Date.now() - startTime) / 1000
        );
        setTime(elapsedSeconds);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, startTime]);

  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const onSubmit = async (data: TimerFormData) => {
    if (!isRunning) {
      try {
        const now = new Date();
        const timestamp = now.getTime();
        setStartTime(timestamp);

        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: data.taskName,
            start_time: now.toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to start task');
        }

        const task = await response.json();
        console.log('Created new task:', task);
        setCurrentTaskId(task.id);
        setIsRunning(true);
        setTime(0);
      } catch (error) {
        console.error('Error starting task:', error);
      }
    } else {
      try {
        if (currentTaskId) {
          const now = new Date();
          const response = await fetch(`/api/tasks/${currentTaskId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              end_time: now.toISOString(),
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to stop task');
          }

          const task = await response.json();
          console.log('Stopped task:', task);
          console.log('Final duration:', time, 'seconds');

          setIsRunning(false);
          setCurrentTaskId(null);
          setStartTime(null);
          form.reset();
          setTime(0);
        }
      } catch (error) {
        console.error('Error stopping task:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto p-6">
        <div className="text-center">Loading...</div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="taskName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Task Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter task name..."
                    {...field}
                    disabled={isRunning}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="text-center">
            <div className="text-4xl font-mono mb-4">{formatTime(time)}</div>
            <Button type="submit" className="w-full">
              {isRunning ? 'Stop Timer' : 'Start Timer'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
} 