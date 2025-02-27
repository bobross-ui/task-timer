import { TimerForm } from '@/components/timer/timer-form';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Task Timer</h1>
          <Link 
            href="/calendar" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            View Calendar
          </Link>
        </div>
        <TimerForm />
      </div>
    </main>
  );
}
