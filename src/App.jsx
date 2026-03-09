import React, { useState, useCallback } from 'react';
import Sidebar   from './components/Sidebar.jsx';
import Header    from './components/Header.jsx';
import Dashboard from './components/Dashboard.jsx';
import Team      from './components/Team.jsx';
import Chat      from './components/Chat.jsx';
import Tasks     from './components/Tasks.jsx';
import Reports   from './components/Reports.jsx';
import { INITIAL_TASKS } from './data/tasks.js';

export default function App() {
  const [page, setPage]   = useState('dashboard');
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  const handleTaskCreated = useCallback((newTask) => {
    setTasks((prev) => [newTask, ...prev]);
  }, []);

  const pendingCount = tasks.filter(
    (t) => t.status === 'pending' || t.status === 'in-review' || t.status === 'in-progress'
  ).length;

  function renderPage() {
    switch (page) {
      case 'dashboard':
        return <Dashboard onNav={setPage} />;
      case 'team':
        return <Team onChatWithLeader={() => setPage('chat')} />;
      case 'chat':
        return <Chat onTaskCreated={handleTaskCreated} />;
      case 'tasks':
        return <Tasks tasks={tasks} />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard onNav={setPage} />;
    }
  }

  return (
    <div className="layout">
      <Sidebar active={page} onNav={setPage} taskBadge={pendingCount} />
      <div className="main-area">
        <Header page={page} />
        <main className="page-content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
