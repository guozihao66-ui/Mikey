import React, { useState, useCallback } from 'react';
import Sidebar    from './components/Sidebar.jsx';
import Header     from './components/Header.jsx';
import Dashboard  from './components/Dashboard.jsx';
import Team       from './components/Team.jsx';
import Chat       from './components/Chat.jsx';
import Tasks      from './components/Tasks.jsx';
import Reports    from './components/Reports.jsx';
import Approvals  from './components/Approvals.jsx';
import Playbooks  from './components/Playbooks.jsx';
import { INITIAL_TASKS } from './data/tasks.js';
import { APPROVAL_ITEMS } from './data/tasks.js';

export default function App() {
  const [page, setPage]         = useState('dashboard');
  const [tasks, setTasks]       = useState(INITIAL_TASKS);
  const [approvals, setApprovals] = useState(APPROVAL_ITEMS);

  const handleTaskCreated = useCallback((payload) => {
    const task = payload?.task || (payload?.id ? payload : null);
    const approval = payload?.approval || payload?.newApproval || payload?.generatedApproval || task?.generatedApproval || null;

    if (task) {
      setTasks((prev) => [task, ...prev]);
    }
    if (approval) {
      setApprovals((prev) => [approval, ...prev]);
    }
  }, []);

  const handleApprovalAction = useCallback((id, action) => {
    let matchedApproval = null;

    setApprovals((prev) => {
      matchedApproval = prev.find((item) => item.id === id) || null;
      return prev.map((item) => item.id === id ? { ...item, resolved: action } : item);
    });

    if (action === 'approved') {
      setTasks((prev) =>
        prev.map((t) => {
          const ap = matchedApproval || APPROVAL_ITEMS.find((a) => a.id === id);
          return ap && t.id === ap.taskId
            ? { ...t, status: 'in-progress', updatedAt: new Date().toISOString() }
            : t;
        })
      );
    }
  }, []);

  const pendingCount   = tasks.filter(
    (t) => t.status === 'pending' || t.status === 'in-review' || t.status === 'in-progress'
  ).length;

  const approvalCount  = approvals.filter((a) => !a.resolved).length;

  function renderPage() {
    switch (page) {
      case 'dashboard':
        return <Dashboard onNav={setPage} approvalCount={approvalCount} />;
      case 'team':
        return <Team onChatWithLeader={() => setPage('chat')} />;
      case 'chat':
        return <Chat onTaskCreated={handleTaskCreated} />;
      case 'tasks':
        return <Tasks tasks={tasks} />;
      case 'reports':
        return <Reports />;
      case 'approvals':
        return <Approvals items={approvals} onAction={handleApprovalAction} />;
      case 'playbooks':
        return <Playbooks />;
      default:
        return <Dashboard onNav={setPage} approvalCount={approvalCount} />;
    }
  }

  return (
    <div className="layout">
      <Sidebar
        active={page}
        onNav={setPage}
        taskBadge={pendingCount}
        approvalBadge={approvalCount}
      />
      <div className="main-area">
        <Header page={page} />
        <main className="page-content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
