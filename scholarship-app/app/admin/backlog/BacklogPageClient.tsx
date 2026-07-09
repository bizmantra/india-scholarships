'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  RotateCw,
  FolderGit,
  FileText,
  AlertCircle,
  TrendingUp,
  Tag,
  Clock,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Edit3,
  X
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  impact: string;
  status: 'Backlog' | 'In Progress' | 'Done' | 'Parked';
  type: string;
}

export default function BacklogPageClient() {
  const [type, setType] = useState<'dev' | 'content'>('dev');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals / Forms
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [impact, setImpact] = useState('Medium');
  const [status, setStatus] = useState<'Backlog' | 'In Progress' | 'Done' | 'Parked'>('Backlog');
  const [taskType, setTaskType] = useState('');

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/backlog?type=${type}`);
      if (!res.ok) throw new Error('Failed to load backlog tasks');
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (e: any) {
      setError(e.message || 'An error occurred while loading tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [type]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch('/api/admin/backlog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title,
          description,
          impact,
          status,
          taskType
        })
      });
      if (!res.ok) throw new Error('Failed to add task');
      
      // Reset form
      setTitle('');
      setDescription('');
      setImpact('Medium');
      setStatus('Backlog');
      setTaskType('');
      setIsAddOpen(false);
      
      fetchTasks();
    } catch (e: any) {
      alert(e.message || 'Error creating task');
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !title.trim()) return;

    try {
      const res = await fetch('/api/admin/backlog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          id: selectedTask.id,
          title,
          description,
          impact,
          status,
          taskType
        })
      });
      if (!res.ok) throw new Error('Failed to update task');

      setIsEditOpen(false);
      setSelectedTask(null);
      fetchTasks();
    } catch (e: any) {
      alert(e.message || 'Error updating task');
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'Backlog' | 'In Progress' | 'Done' | 'Parked') => {
    try {
      const res = await fetch('/api/admin/backlog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          id,
          status: newStatus
        })
      });
      if (!res.ok) throw new Error('Failed to update task status');
      fetchTasks();
    } catch (e: any) {
      alert(e.message || 'Error updating task status');
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`/api/admin/backlog?type=${type}&id=${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete task');
      fetchTasks();
    } catch (e: any) {
      alert(e.message || 'Error deleting task');
    }
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setImpact(task.impact || 'Medium');
    setStatus(task.status);
    setTaskType(task.type || '');
    setIsEditOpen(true);
  };

  const openAddModal = () => {
    setTitle('');
    setDescription('');
    setImpact('Medium');
    setStatus('Backlog');
    setTaskType('');
    setIsAddOpen(true);
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = {
    'Backlog': filteredTasks.filter(t => t.status === 'Backlog'),
    'In Progress': filteredTasks.filter(t => t.status === 'In Progress'),
    'Done': filteredTasks.filter(t => t.status === 'Done'),
    'Parked': filteredTasks.filter(t => t.status === 'Parked')
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-blue-500" />
            Local Backlog Board
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your project tickets completely offline and in markdown.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Type */}
          <div className="bg-gray-900/60 p-1 rounded-xl border border-gray-800/80 flex">
            <button
              onClick={() => setType('dev')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                type === 'dev'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FolderGit className="h-3.5 w-3.5" />
              Dev Backlog
            </button>
            <button
              onClick={() => setType('content')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                type === 'content'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              Content Backlog
            </button>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/10"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', val: filteredTasks.length, color: 'text-blue-400', bg: 'bg-blue-500/5 border-blue-500/10' },
          { label: 'Active (In Progress)', val: columns['In Progress'].length, color: 'text-amber-400', bg: 'bg-amber-500/5 border-amber-500/10' },
          { label: 'Completed', val: columns['Done'].length, color: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-500/10' },
          { label: 'Backlog Size', val: columns['Backlog'].length, color: 'text-gray-400', bg: 'bg-gray-500/5 border-gray-500/10' },
        ].map((stat, i) => (
          <div key={i} className={`p-4 rounded-2xl border ${stat.bg} flex flex-col justify-between`}>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</span>
            <span className={`text-2xl font-black mt-2 ${stat.color}`}>{stat.val}</span>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 h-4.5 w-4.5" />
          <input
            type="text"
            placeholder="Search tickets by ID, Title, or Description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900/60 border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-white placeholder-gray-500"
          />
        </div>
        <button
          onClick={fetchTasks}
          className="p-2.5 bg-gray-950 border border-gray-850 hover:bg-gray-900 text-gray-400 hover:text-white rounded-xl transition-all"
        >
          <RotateCw className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Board Columns */}
      {loading ? (
        <div className="flex items-center justify-center py-20 bg-gray-900/20 border border-gray-850 rounded-2xl">
          <div className="flex flex-col items-center gap-3">
            <RotateCw className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="text-xs text-gray-400 font-medium">Loading backlog tasks...</span>
          </div>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-rose-400">Error</h4>
            <p className="text-xs text-rose-300/80 mt-1">{error}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {(Object.keys(columns) as Array<keyof typeof columns>).map((colName) => {
            const colTasks = columns[colName];
            let titleColor = 'text-gray-400';
            let bgHeader = 'bg-gray-550/10';
            if (colName === 'In Progress') { titleColor = 'text-amber-400'; bgHeader = 'bg-amber-500/10'; }
            if (colName === 'Done') { titleColor = 'text-emerald-400'; bgHeader = 'bg-emerald-500/10'; }
            if (colName === 'Parked') { titleColor = 'text-purple-400'; bgHeader = 'bg-purple-500/10'; }

            return (
              <div key={colName} className="flex flex-col h-[70vh] bg-[#0d1324]/40 border border-gray-850/80 rounded-2xl overflow-hidden">
                <div className={`p-4 flex items-center justify-between border-b border-gray-850/80 ${bgHeader}`}>
                  <span className={`text-xs font-black uppercase tracking-widest ${titleColor}`}>
                    {colName}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-900 border border-gray-800 text-[10px] text-gray-400 font-bold rounded-full">
                    {colTasks.length}
                  </span>
                </div>
                <div className="flex-1 p-3 overflow-y-auto space-y-3">
                  {colTasks.length === 0 ? (
                    <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-850/40 rounded-xl p-4 text-center">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        Drop / Move tasks here
                      </span>
                    </div>
                  ) : (
                    colTasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-4 bg-[#0d1324] border border-gray-800 hover:border-gray-700/80 rounded-xl transition-all group flex flex-col justify-between space-y-3 shadow-md hover:shadow-lg hover:shadow-blue-500/[0.02]"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                              {t.id}
                            </span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditModal(t)}
                                className="p-1 hover:bg-gray-800 text-gray-400 hover:text-white rounded"
                              >
                                <Edit3 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteTask(t.id)}
                                className="p-1 hover:bg-rose-950 text-gray-400 hover:text-rose-400 rounded"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <h3 className="text-xs font-bold text-gray-200 group-hover:text-white transition-colors line-clamp-2">
                            {t.title}
                          </h3>
                        </div>

                        {t.description && (
                          <p className="text-[10px] text-gray-500 line-clamp-2 font-medium">
                            {t.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-gray-800/40">
                          {t.impact && (
                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full flex items-center gap-0.5 uppercase tracking-wider ${
                              t.impact === 'Critical' || t.impact === 'High'
                                ? 'bg-rose-500/10 border border-rose-500/25 text-rose-400'
                                : t.impact === 'Medium'
                                ? 'bg-amber-500/10 border border-amber-500/25 text-amber-400'
                                : 'bg-gray-500/10 border border-gray-500/25 text-gray-400'
                            }`}>
                              <TrendingUp className="h-2 w-2" />
                              {t.impact}
                            </span>
                          )}
                          {t.type && (
                            <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold rounded-full flex items-center gap-0.5 uppercase tracking-wider">
                              <Tag className="h-2 w-2" />
                              {t.type}
                            </span>
                          )}
                        </div>

                        {/* Fast Status Move Controls */}
                        <div className="flex items-center justify-between pt-1 border-t border-gray-800/30">
                          <button
                            disabled={colName === 'Backlog'}
                            onClick={() => {
                              const steps: Array<typeof colName> = ['Backlog', 'In Progress', 'Done', 'Parked'];
                              const idx = steps.indexOf(colName);
                              if (idx > 0) handleUpdateStatus(t.id, steps[idx - 1]);
                            }}
                            className="p-1 text-gray-500 hover:text-white disabled:opacity-0 transition-opacity"
                          >
                            <ArrowLeft className="h-3 w-3" />
                          </button>
                          <button
                            disabled={colName === 'Parked'}
                            onClick={() => {
                              const steps: Array<typeof colName> = ['Backlog', 'In Progress', 'Done', 'Parked'];
                              const idx = steps.indexOf(colName);
                              if (idx < steps.length - 1) handleUpdateStatus(t.id, steps[idx + 1]);
                            }}
                            className="p-1 text-gray-500 hover:text-white disabled:opacity-0 transition-opacity"
                          >
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Dialogs */}
      {(isAddOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#0d1324] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between">
              <h3 className="font-bold text-white">
                {isAddOpen ? 'Add New Backlog Task' : 'Edit Backlog Task'}
              </h3>
              <button
                onClick={() => { setIsAddOpen(false); setIsEditOpen(false); setSelectedTask(null); }}
                className="p-1 bg-gray-900 border border-gray-800 text-gray-400 hover:text-white rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={isAddOpen ? handleAddTask : handleUpdateTask} className="p-5 space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title..."
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl focus:outline-none focus:border-blue-500 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of task..."
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl focus:outline-none focus:border-blue-500 text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Impact</label>
                  <select
                    value={impact}
                    onChange={(e) => setImpact(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl focus:outline-none focus:border-blue-500 text-white text-sm"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl focus:outline-none focus:border-blue-500 text-white text-sm"
                  >
                    <option value="Backlog">Backlog</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                    <option value="Parked">Parked</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Type (e.g., Feature, Bug, SEO)</label>
                <input
                  type="text"
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value)}
                  placeholder="Task category tag..."
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl focus:outline-none focus:border-blue-500 text-white text-sm"
                />
              </div>

              <div className="pt-4 border-t border-gray-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => { setIsAddOpen(false); setIsEditOpen(false); setSelectedTask(null); }}
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-850 text-gray-300 text-xs font-bold rounded-xl transition-all border border-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/10"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
