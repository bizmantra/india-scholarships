import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(process.cwd(), 'data');
const DEV_JSON = path.join(DATA_DIR, 'backlog-dev.json');
const CONTENT_JSON = path.join(DATA_DIR, 'backlog-content.json');
const DEV_MD = path.join(DATA_DIR, 'backlog-dev.md');
const CONTENT_MD = path.join(DATA_DIR, 'backlog-content.md');

function checkAuth() {
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_ADMIN_DASHBOARD !== 'true') {
    return false;
  }
  return true;
}

function readBacklog(type: 'dev' | 'content') {
  const filePath = type === 'dev' ? DEV_JSON : CONTENT_JSON;
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`Error reading ${type} backlog:`, e);
    return [];
  }
}

function writeBacklog(type: 'dev' | 'content', tasks: any[]) {
  const jsonPath = type === 'dev' ? DEV_JSON : CONTENT_JSON;
  const mdPath = type === 'dev' ? DEV_MD : CONTENT_MD;
  const title = type === 'dev' ? 'IndiaScholarships Dev Backlog' : 'IndiaScholarships Content Backlog';

  // Save JSON
  fs.writeFileSync(jsonPath, JSON.stringify(tasks, null, 2));

  // Generate and Save Markdown
  let md = `# ${title}\n\n`;
  const columns = {
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    'Backlog': tasks.filter(t => t.status === 'Backlog'),
    'Done': tasks.filter(t => t.status === 'Done'),
    'Parked': tasks.filter(t => t.status === 'Parked')
  };

  for (const [colName, colTasks] of Object.entries(columns)) {
    md += `## ${colName} (${colTasks.length})\n\n`;
    if (colTasks.length === 0) {
      md += `*No tasks in this section.*\n\n`;
      continue;
    }
    for (const t of colTasks) {
      const check = colName === 'Done' ? '[x]' : '[ ]';
      md += `- ${check} **${t.id}**: ${t.title}\n`;
      if (t.impact) md += `  - **Impact**: ${t.impact}\n`;
      if (t.type) md += `  - **Type**: ${t.type}\n`;
      if (t.description) {
        const descLines = t.description.split('\n').map((line: string) => '    ' + line).join('\n');
        md += `  - **Description**:\n${descLines}\n`;
      }
      md += `\n`;
    }
  }

  fs.writeFileSync(mdPath, md);
}

export async function GET(request: Request) {
  if (!checkAuth()) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') === 'content' ? 'content' : 'dev';

  const tasks = readBacklog(type);
  return NextResponse.json({ tasks });
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
    const tasks = readBacklog(backlogType);

    // Generate new ID
    let maxNum = 0;
    const prefix = backlogType === 'dev' ? 'IS-' : 'CNT-';
    tasks.forEach((t: any) => {
      if (t.id && t.id.startsWith(prefix)) {
        const num = parseInt(t.id.replace(prefix, ''));
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

    tasks.push(newTask);
    writeBacklog(backlogType, tasks);

    return NextResponse.json({ task: newTask });
  } catch (e: any) {
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
    const tasks = readBacklog(backlogType);
    const taskIndex = tasks.findIndex((t: any) => t.id === id);

    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
    }

    const updatedTask = {
      ...tasks[taskIndex],
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(impact !== undefined && { impact }),
      ...(status !== undefined && { status }),
      ...(taskType !== undefined && { type: taskType })
    };

    tasks[taskIndex] = updatedTask;
    writeBacklog(backlogType, tasks);

    return NextResponse.json({ task: updatedTask });
  } catch (e: any) {
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

    const tasks = readBacklog(type);
    const filteredTasks = tasks.filter((t: any) => t.id !== id);

    if (tasks.length === filteredTasks.length) {
      return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
    }

    writeBacklog(type, filteredTasks);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
