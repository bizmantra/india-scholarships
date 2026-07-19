import { NextResponse } from 'next/server';
import { getClient } from '@/lib/db';

function checkAuth() {
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_ADMIN_DASHBOARD !== 'true') {
    return false;
  }
  return true;
}

export async function GET(request: Request) {
  if (!checkAuth()) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') === 'content' ? 'content' : 'dev';

  try {
    const client = getClient();
    const res = await client.execute({
      sql: 'SELECT * FROM backlog_tasks WHERE category = ? ORDER BY id',
      args: [type]
    });

    // Libsql rows are objects. Ensure fields match local interface expectations
    const tasks = res.rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      impact: row.impact || 'Medium',
      status: row.status || 'Backlog',
      type: row.type || ''
    }));

    return NextResponse.json({ tasks });
  } catch (error: any) {
    console.error(`Error loading ${type} backlog:`, error);
    return NextResponse.json({ error: 'Failed to read tasks.', details: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!checkAuth()) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { type, title, description, impact, status, taskType } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
    }

    const backlogType = type === 'content' ? 'content' : 'dev';
    const client = getClient();

    // Fetch existing tasks for ID generation
    const res = await client.execute({
      sql: 'SELECT id FROM backlog_tasks WHERE category = ?',
      args: [backlogType]
    });

    // Generate new ID
    let maxNum = 0;
    const prefix = backlogType === 'dev' ? 'IS-' : 'CNT-';
    res.rows.forEach((t: any) => {
      const idStr = String(t.id);
      if (idStr.startsWith(prefix)) {
        const num = parseInt(idStr.replace(prefix, ''));
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });
    const newId = `${prefix}${maxNum + 1}`;

    const newTask = {
      id: newId,
      title,
      description: description || '',
      impact: impact || 'Medium',
      status: status || 'Backlog',
      type: taskType || ''
    };

    await client.execute({
      sql: 'INSERT INTO backlog_tasks (id, title, description, impact, status, type, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [
        newTask.id,
        newTask.title,
        newTask.description,
        newTask.impact,
        newTask.status,
        newTask.type,
        backlogType
      ]
    });

    return NextResponse.json({ task: newTask });
  } catch (e: any) {
    console.error('Error adding backlog task:', e);
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!checkAuth()) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { type, id, title, description, impact, status, taskType } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required.' }, { status: 400 });
    }

    const backlogType = type === 'content' ? 'content' : 'dev';
    const client = getClient();

    // Check existing task
    const checkRes = await client.execute({
      sql: 'SELECT * FROM backlog_tasks WHERE id = ? AND category = ?',
      args: [id, backlogType]
    });

    if (checkRes.rows.length === 0) {
      return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
    }

    const existing = checkRes.rows[0];

    const updatedTask = {
      id,
      title: title !== undefined ? title : String(existing.title),
      description: description !== undefined ? description : String(existing.description || ''),
      impact: impact !== undefined ? impact : String(existing.impact || 'Medium'),
      status: status !== undefined ? status : String(existing.status || 'Backlog'),
      type: taskType !== undefined ? taskType : String(existing.type || '')
    };

    await client.execute({
      sql: 'UPDATE backlog_tasks SET title = ?, description = ?, impact = ?, status = ?, type = ? WHERE id = ? AND category = ?',
      args: [
        updatedTask.title,
        updatedTask.description,
        updatedTask.impact,
        updatedTask.status,
        updatedTask.type,
        id,
        backlogType
      ]
    });

    return NextResponse.json({ task: updatedTask });
  } catch (e: any) {
    console.error('Error updating backlog task:', e);
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!checkAuth()) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type') === 'content' ? 'content' : 'dev';

    if (!id) {
      return NextResponse.json({ error: 'ID is required.' }, { status: 400 });
    }

    const client = getClient();
    const result = await client.execute({
      sql: 'DELETE FROM backlog_tasks WHERE id = ? AND category = ?',
      args: [id, type]
    });

    if (result.rowsAffected === 0) {
      return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('Error deleting backlog task:', e);
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
