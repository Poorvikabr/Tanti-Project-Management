import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/utils/api';
import { Plus, CheckSquare, ClipboardCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export const Tasks = () => {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('mine');
  const [assignedByMe, setAssignedByMe] = useState([]);
  const listRef = React.useRef(null);
  const [statFilter, setStatFilter] = useState(null); // 'all' | 'mine' | 'pending' | 'completed'
  const handleStatClick = (filter) => {
    setActiveTab('mine');
    setStatFilter(filter);
    requestAnimationFrame(() => {
      const el = listRef.current;
      if (el) {
        const top = el.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  };
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskAssigneeEmail, setTaskAssigneeEmail] = useState('');
  const [taskProject, setTaskProject] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskDueDate, setTaskDueDate] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.data || []);
      const assigned = await api.getAssignedTasks();
      setAssignedByMe(assigned.data || []);
    } catch (e) {
      console.error('Failed to load tasks', e);
    }
  };

  const stats = useMemo(() => {
    const total = notifications.length;
    const mine = notifications.length; // notifications are for current user
    const completed = 0; // completion flow not implemented yet
    const pending = Math.max(total - completed, 0);
    if (total === 0) {
      return { total: 4, mine: 2, pending: 2, completed: 0 }; // examples when empty
    }
    return { total, mine, pending, completed };
  }, [notifications]);

  const submitTask = async () => {
    try {
      if (!taskAssigneeEmail || !taskTitle) {
        toast.error('Provide assignee email and task title');
        return;
      }
      const meta = [];
      if (taskPriority) meta.push(`priority: ${taskPriority}`);
      if (taskDueDate) meta.push(`due: ${taskDueDate}`);
      const message = `${taskTitle}${taskDescription ? ' — ' + taskDescription : ''}${meta.length ? ' (' + meta.join(', ') + ')' : ''}`;
      const link = taskProject || undefined;
      await api.createTask({ assignee_email: taskAssigneeEmail, message, link });
      toast.success('Task sent');
      setTaskOpen(false);
      setTaskTitle('');
      setTaskDescription('');
      setTaskAssigneeEmail('');
      setTaskProject('');
      setTaskPriority('Medium');
      setTaskDueDate('');
      await load();
    } catch (e) {
      const msg = e?.response?.data?.detail || 'Failed to send task';
      console.error('Failed to create task', e);
      toast.error(msg);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Tasks</h1>
          <p className="text-slate-600 mt-1">Manage and track all your tasks</p>
        </div>
        <Button onClick={() => setTaskOpen(true)} className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="w-4 h-4 mr-2" /> New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <Card className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => handleStatClick('all')}>
          <CheckSquare className="w-8 h-8 text-cyan-600" />
          <div>
            <div className="text-slate-500">Total Tasks</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => handleStatClick('mine')}>
          <ClipboardCheck className="w-8 h-8 text-fuchsia-600" />
          <div>
            <div className="text-slate-500">My Tasks</div>
            <div className="text-2xl font-bold">{stats.mine}</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => handleStatClick('pending')}>
          <AlertTriangle className="w-8 h-8 text-orange-500" />
          <div>
            <div className="text-slate-500">Pending</div>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => handleStatClick('completed')}>
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          <div>
            <div className="text-slate-500">Completed</div>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </div>
        </Card>
      </div>

      <div className="flex items-center mb-3">
        <button
          className={`px-4 py-2 rounded-l border ${
            activeTab === 'mine' ? 'bg-white font-semibold' : 'bg-slate-100 text-slate-600'
          }`}
          onClick={() => setActiveTab('mine')}
        >
          My Tasks ({stats.mine})
        </button>
        <button
          className={`px-4 py-2 rounded-r border-t border-b border-r ${
            activeTab === 'assigned' ? 'bg-white font-semibold' : 'bg-slate-100 text-slate-600'
          }`}
          onClick={() => setActiveTab('assigned')}
        >
          Assigned by Me ({assignedByMe.length})
        </button>
      </div>

      <div ref={listRef} style={{ scrollMarginTop: 80 }}></div>
      {activeTab === 'mine' ? (
        notifications.length === 0 ? (
          <Card className="p-6">
            <ul className="space-y-3">
              {[ 
                { id: 'exm1', message: 'Submit DB dressing checklist for Tower A — priority: High', created_at: new Date().toISOString() },
                { id: 'exm2', message: 'Update wiring progress for Level 3 (M3) — due: today', created_at: new Date(Date.now()-3600*1000*2).toISOString() }
              ].map((t) => (
                <li key={t.id} className="border rounded p-3 bg-white">
                  <div className="text-sm">{t.message}</div>
                  <div className="text-xs text-slate-500">{new Date(t.created_at).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-slate-700">
                {statFilter === 'pending' && `Pending (${stats.pending})`}
                {statFilter === 'completed' && `Completed (${stats.completed})`}
                {(!statFilter || statFilter === 'all') && `Total Tasks (${stats.total})`}
                {statFilter === 'mine' && `My Tasks (${stats.mine})`}
              </div>
              <button className="text-xs text-blue-600" onClick={() => setStatFilter(null)}>Clear filter</button>
            </div>
            <ul className="space-y-3">
              {(function(){
                const items = notifications.map(n => ({ id: n.id, message: n.message, created_at: n.created_at }));
                if (statFilter === 'completed') return [];
                return items;
              })().map((t) => (
                <li key={t.id} className="border rounded p-3 bg-white">
                  <div className="text-sm">{t.message}</div>
                  <div className="text-xs text-slate-500">{new Date(t.created_at).toLocaleString()}</div>
                </li>
              ))}
              {statFilter === 'completed' && (
                <li className="text-center text-slate-500 text-sm py-6">No completed tasks yet</li>
              )}
            </ul>
          </Card>
        )
      ) : (
        <Card className="p-6">
          {assignedByMe.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-500">
              <CheckSquare className="w-16 h-16 mb-4 opacity-60" />
              <div className="text-lg">No tasks assigned by you</div>
            </div>
          ) : (
            <ul className="space-y-3">
              {assignedByMe.map((t) => (
                <li key={t.id} className="border rounded p-3 bg-white">
                  <div className="text-sm">{t.message}</div>
                  <div className="text-xs text-slate-500">{new Date(t.created_at).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-slate-600 mb-1">Task Title</div>
              <Input placeholder="Enter task title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-1">Description</div>
              <Input placeholder="Description" value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} />
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-1">Assign To</div>
              <Input placeholder="Assignee email" value={taskAssigneeEmail} onChange={(e) => setTaskAssigneeEmail(e.target.value)} />
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-1">Project (Optional)</div>
              <Input placeholder="/projects/123 or full link" value={taskProject} onChange={(e) => setTaskProject(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-slate-600 mb-1">Priority</div>
                <Select value={taskPriority} onValueChange={setTaskPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1">Due Date</div>
                <Input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setTaskOpen(false)}>Cancel</Button>
              <Button onClick={submitTask}>Create Task</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tasks;


