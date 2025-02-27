import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, start_time } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Task name is required' },
        { status: 400 }
      );
    }

    console.log('Creating task with start time:', start_time);

    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          name,
          start_time,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return NextResponse.json(
        { error: 'Failed to create task' },
        { status: 500 }
      );
    }

    console.log('Created task:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const ongoing = searchParams.get('ongoing');

    console.log('GET request params:', { start, end, ongoing });

    let query = supabase.from('tasks').select('*');

    if (ongoing === 'true') {
      // Get tasks with no end_time (ongoing tasks)
      query = query.is('end_time', null);
    } else {
      // Apply date range filters if not fetching ongoing tasks
      if (start) {
        query = query.gte('start_time', start);
      }
      if (end) {
        query = query.lte('end_time', end);
      }
    }

    const { data, error } = await query.order('start_time', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      );
    }

    console.log('Fetched tasks:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 