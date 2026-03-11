import React, { useState } from 'react';
import { SAMPLE_REPORTS } from '../../src/data/reports.js';
import { AGENTS } from '../../src/data/agents.js';

const TYPE_META = {
  weekly:       { label: 'Weekly Report', cls: 'badge-blue' },
  'work-summary': { label: 'Work Summary', cls: 'badge-green' },
};

const STATUS_META = {
  approved: { label: 'Approved', cls: 'badge-green' },
  draft:    { label: 'Draft',    cls: 'badge-amber' },
};

const agentNames = Object.fromEntries(AGENTS.map((a) => [a.id, a.name]));

function renderMarkdown(text) {
  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={i} style={mdS.hr} />);
      i++; continue;
    }

    const h1 = line.match(/^# (.+)/);
    const h2 = line.match(/^## (.+)/);
    const h3 = line.match(/^### (.+)/);
    if (h1) { elements.push(<h1 key={i} style={mdS.h1}>{parseInline(h1[1])}</h1>); i++; continue; }
    if (h2) { elements.push(<h2 key={i} style={mdS.h2}>{parseInline(h2[1])}</h2>); i++; continue; }
    if (h3) { elements.push(<h3 key={i} style={mdS.h3}>{parseInline(h3[1])}</h3>); i++; continue; }

    if (/^[-*] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(<li key={i} style={mdS.li}>{parseInline(lines[i].replace(/^[-*] /, ''))}</li>);
        i++;
      }
      elements.push(<ul key={`ul${i}`} style={mdS.ul}>{items}</ul>);
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(<li key={i} style={mdS.li}>{parseInline(lines[i].replace(/^\d+\. /, ''))}</li>);
        i++;
      }
      elements.push(<ol key={`ol${i}`} style={mdS.ol}>{items}</ol>);
      continue;
    }

    if (line.includes('|') && lines[i + 1] && /^\|[-| ]+\|$/.test(lines[i + 1].trim())) {
      const rows = [];
      const headerCells = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      rows.push(
        <tr key={`trh${i}`} style={mdS.headerRow}>
          {headerCells.map((c, ci) => <th key={ci} style={mdS.th}>{parseInline(c.trim())}</th>)}
        </tr>
      );
      i += 2;
      while (i < lines.length && lines[i].includes('|')) {
        const cells = lines[i].split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        rows.push(
          <tr key={`tr${i}`} style={mdS.dataRow}>
            {cells.map((c, ci) => <td key={ci} style={mdS.td}>{parseInline(c.trim())}</td>)}
          </tr>
        );
        i++;
      }
      elements.push(
        <div key={`tbl${i}`} style={mdS.tableWrap}>
          <table style={mdS.table}><tbody>{rows}</tbody></table>
        </div>
      );
      continue;
    }

    if (line.trim() === '') { elements.push(<div key={i} style={{ height: 6 }} />); i++; continue; }

    elements.push(<p key={i} style={mdS.p}>{parseInline(line)}</p>);
    i++;
  }

  return elements;
}

function parseInline(text) {
  const parts = [];
  let remaining = text;
  let key = 0;
  while (remaining.length) {
    const bold = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)/s);
    if (bold) { if (bold[1]) parts.push(bold[1]); parts.push(<strong key={key++}>{parseInline(bold[2])}</strong>); remaining = bold[3]; continue; }
    const italic = remaining.match(/^(.*?)\*(.+?)\*(.*)/s);
    if (italic) { if (italic[1]) parts.push(italic[1]); parts.push(<em key={key++}>{italic[2]}</em>); remaining = italic[3]; continue; }
    const code = remaining.match(/^(.*?)`(.+?)`(.*)/s);
    if (code) { if (code[1]) parts.push(code[1]); parts.push(<code key={key++} style={mdS.code}>{code[2]}</code>); remaining = code[3]; continue; }
    parts.push(remaining); break;
  }
  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts;
}

export default function Reports() {
  const [selectedId, setSelectedId] = useState(SAMPLE_REPORTS[0]?.id || null);
  const selected = SAMPLE_REPORTS.find((r) => r.id === selectedId);

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div style={styles.layout}>
      {/* List */}
      <div style={styles.listCol}>
        <div style={styles.listHeader}>
          <h2 style={styles.listTitle}>Reports</h2>
          <span style={styles.listCount}>{SAMPLE_REPORTS.length}</span>
        </div>
        {SAMPLE_REPORTS.map((r) => {
          const tm = TYPE_META[r.type] || {};
          const sm = STATUS_META[r.status] || {};
          const isActive = selected?.id === r.id;
          return (
            <div
              key={r.id}
              className="card"
              onClick={() => setSelectedId(r.id)}
              style={{ ...styles.reportCard, ...(isActive ? styles.reportCardActive : {}) }}
            >
              <div style={styles.reportCardTop}>
                <span className={`badge ${tm.cls}`}>{tm.label}</span>
                <span className={`badge ${sm.cls}`}>{sm.label}</span>
              </div>
              <div style={styles.reportTitle}>{r.title}</div>
              <div style={styles.reportMeta}>
                By {agentNames[r.generatedBy] || r.generatedBy} · {formatDate(r.generatedAt)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Report viewer */}
      <div style={styles.viewerCol}>
        {selected ? (
          <div className="card" style={styles.viewer}>
            <div style={styles.viewerHeader}>
              <div>
                <div style={styles.viewerTitle}>{selected.title}</div>
                <div style={styles.viewerMeta}>
                  Generated {formatDate(selected.generatedAt)} by {agentNames[selected.generatedBy] || selected.generatedBy}
                </div>
              </div>
              <div style={styles.viewerBadges}>
                <span className={`badge ${(TYPE_META[selected.type] || {}).cls}`}>
                  {(TYPE_META[selected.type] || {}).label}
                </span>
                <span className={`badge ${(STATUS_META[selected.status] || {}).cls}`}>
                  {(STATUS_META[selected.status] || {}).label}
                </span>
              </div>
            </div>
            <div style={styles.reportContent}>
              {renderMarkdown(selected.content)}
            </div>
            <div style={styles.disclaimer}>
              This report was generated by the Okeanos Marketing AI Team. All data is simulated for prototype purposes.
              Recommended actions require human approval before execution.
            </div>
          </div>
        ) : (
          <div className="card" style={{ ...styles.viewer, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Select a report to view.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  layout: { display: 'flex', gap: 16, alignItems: 'flex-start', height: '100%' },
  listCol: { width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 },
  listHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 },
  listTitle: { fontSize: 13, fontWeight: 600, color: 'var(--color-text)' },
  listCount: {
    background: 'var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 99,
    padding: '1px 7px',
  },
  reportCard: {
    padding: '12px 14px',
    cursor: 'pointer',
    transition: 'all 0.12s',
  },
  reportCardActive: {
    background: 'var(--color-primary-muted)',
    borderColor: 'var(--color-primary)',
  },
  reportCardTop: { display: 'flex', gap: 6, marginBottom: 6 },
  reportTitle: { fontSize: 13, fontWeight: 500, color: 'var(--color-text)', lineHeight: 1.4, marginBottom: 4 },
  reportMeta: { fontSize: 11, color: 'var(--color-text-muted)' },
  viewerCol: { flex: 1, minHeight: 400 },
  viewer: { padding: '22px 26px' },
  viewerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottom: '1px solid var(--color-border)',
    gap: 12,
  },
  viewerTitle: { fontSize: 15, fontWeight: 600, color: 'var(--color-text)', marginBottom: 3 },
  viewerMeta: { fontSize: 12, color: 'var(--color-text-muted)' },
  viewerBadges: { display: 'flex', gap: 6, flexShrink: 0 },
  reportContent: {
    fontSize: 13,
    color: 'var(--color-text)',
    lineHeight: 1.7,
    maxHeight: 'calc(100vh - var(--header-height) - 200px)',
    overflowY: 'auto',
    paddingRight: 4,
  },
  disclaimer: {
    marginTop: 20,
    padding: '10px 14px',
    background: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    fontSize: 11,
    color: 'var(--color-text-muted)',
    fontStyle: 'italic',
  },
};

const mdS = {
  h1: { fontSize: 18, fontWeight: 700, marginBottom: 8, marginTop: 12, color: 'var(--color-primary)' },
  h2: { fontSize: 15, fontWeight: 700, marginBottom: 6, marginTop: 14, color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)', paddingBottom: 4 },
  h3: { fontSize: 13, fontWeight: 600, marginBottom: 4, marginTop: 10, color: 'var(--color-text)' },
  p: { fontSize: 13, marginBottom: 6, lineHeight: 1.65 },
  ul: { paddingLeft: 20, marginBottom: 8 },
  ol: { paddingLeft: 22, marginBottom: 8 },
  li: { fontSize: 13, marginBottom: 4, lineHeight: 1.6 },
  hr: { border: 'none', borderTop: '1px solid var(--color-border)', margin: '12px 0' },
  code: { background: '#f1f5f9', border: '1px solid var(--color-border)', borderRadius: 3, padding: '1px 5px', fontSize: 12, fontFamily: 'var(--font-mono)' },
  tableWrap: { overflowX: 'auto', marginBottom: 10, borderRadius: 6, border: '1px solid var(--color-border)' },
  table: { borderCollapse: 'collapse', fontSize: 12, width: '100%' },
  headerRow: { background: 'var(--color-surface-2)' },
  dataRow: {},
  th: { borderBottom: '2px solid var(--color-border)', padding: '7px 12px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' },
  td: { borderBottom: '1px solid var(--color-border)', padding: '6px 12px', whiteSpace: 'nowrap' },
};
