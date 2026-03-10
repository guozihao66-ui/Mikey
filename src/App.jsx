import React, { useState, useCallback } from 'react';
import Sidebar    from './components/Sidebar.jsx';
import Header     from './components/Header.jsx';
import Dashboard  from './components/Dashboard.jsx';
import Goals      from './components/Goals.jsx';
import Team       from './components/Team.jsx';
import Chat       from './components/Chat.jsx';
import Tasks      from './components/Tasks.jsx';
import Reports    from './components/Reports.jsx';
import Approvals  from './components/Approvals.jsx';
import Playbooks  from './components/Playbooks.jsx';
import { INITIAL_TASKS } from './data/tasks.js';
import { APPROVAL_ITEMS } from './data/tasks.js';
import { INITIAL_GOALS } from './data/goals.js';

export default function App() {
  const [page, setPage]         = useState('dashboard');
  const [tasks, setTasks]       = useState(INITIAL_TASKS);
  const [approvals, setApprovals] = useState(APPROVAL_ITEMS);
  const [goals] = useState(INITIAL_GOALS);

  const handleTaskCreated = useCallback((payload) => {
    const task = payload?.task || (payload?.id ? payload : null);
    const approval = payload?.approval || payload?.newApproval || payload?.generatedApproval || task?.generatedApproval || null;
    const extraTasks = payload?.extraTasks || [];

    if (task || extraTasks.length) {
      setTasks((prev) => [
        ...(task ? [task] : []),
        ...extraTasks,
        ...prev,
      ]);
    }
    if (approval) {
      setApprovals((prev) => [approval, ...prev]);
    }
  }, []);

  const handleApprovalAction = useCallback((id, action, feedback = '') => {
    let matchedApproval = null;

    setApprovals((prev) => {
      matchedApproval = prev.find((item) => item.id === id) || null;
      return prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          resolved: action === 'changes-requested' ? null : action,
          lastAction: action,
          feedback: feedback || item.feedback || '',
          updatedAt: new Date().toISOString(),
          revisionCount: action === 'changes-requested' ? (item.revisionCount || 0) + 1 : (item.revisionCount || 0),
        };
      });
    });

    setTasks((prev) =>
      prev.map((t) => {
        const ap = matchedApproval || APPROVAL_ITEMS.find((a) => a.id === id);
        if (!(ap && t.id === ap.taskId)) return t;

        if (action === 'approved') {
          return { ...t, status: 'in-progress', updatedAt: new Date().toISOString() };
        }

        if (action === 'changes-requested') {
          const existingOutput = t.output || 'Draft output pending.';
          const note = feedback?.trim() || 'Reviewer requested changes.';
          return {
            ...t,
            status: 'in-review',
            updatedAt: new Date().toISOString(),
            reviewerFeedback: note,
            outputLabel: t.outputLabel || 'Revised Draft',
            output: `${existingOutput}\n\n---\nRevision Note\n${note}\n\nRevised Direction\n- Adjust tone and structure based on reviewer feedback\n- Prepare a cleaner second-pass draft for approval`,
          };
        }

        return t;
      })
    );
  }, []);

  const pendingCount   = tasks.filter(
    (t) => t.status === 'pending' || t.status === 'in-review' || t.status === 'in-progress'
  ).length;

  const approvalCount  = approvals.filter((a) => !a.resolved).length;

  function renderPage() {
    switch (page) {
      case 'dashboard':
        return <Dashboard onNav={setPage} approvalCount={approvalCount} tasks={tasks} approvals={approvals} />;
      case 'goals':
        return <Goals goals={goals} tasks={tasks} onNav={setPage} />;
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
