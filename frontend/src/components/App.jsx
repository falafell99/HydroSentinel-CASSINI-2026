import React, { useState, useEffect, useCallback } from 'react';
import '../styles/theme.css';
import TopBar from './TopBar.jsx';
import Sidebar from './Sidebar.jsx';
import MapView from './MapView.jsx';
import FieldsTable from './FieldsTable.jsx';
import FieldDetailPanel from './FieldDetailPanel.jsx';
import ReportsTab from './ReportsTab.jsx';
import SettingsTab from './SettingsTab.jsx';
import Toast from './Toast.jsx';
import ActivityLog from './ActivityLog.jsx';
import CommandPalette from './CommandPalette.jsx';
import { FIELDS, SUMMARY } from '../data/fields.js';
import { useMobile } from '../hooks/useMobile.js';

let toastIdCounter = 0;

export default function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [selectedField, setSelectedField] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [activityLog, setActivityLog] = useState(false);
  const [activityEntries, setActivityEntries] = useState([]);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [anomalyCount, setAnomalyCount] = useState(SUMMARY.anomaly);
  const [fields, setFields] = useState(FIELDS);
  const isMobile = useMobile();

  useEffect(() => {
    const iv = setInterval(() => {
      setFields(prev => prev.map(f => ({
        ...f,
        actualUse: Math.max(0, f.actualUse + Math.floor(Math.random() * 40 - 18)),
      })));
    }, 60000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      addToast({ type: 'warning', icon: '⚠️', title: 'New anomaly detected', body: 'Field G-15 · +44% over CWR · Nagykáta district' });
      setAnomalyCount(n => n + 1);
    }, 90000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(o => !o); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const addToast = useCallback((toast) => {
    const id = ++toastIdCounter;
    setToasts(prev => [...prev, { id, ...toast }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addActivityEntry = useCallback((entry) => {
    setActivityEntries(prev => [entry, ...prev]);
  }, []);

  const handleAction = useCallback((type, field) => {
    if (type === 'cease') {
      addToast({ type: 'success', icon: '✓', title: 'Cease irrigation order issued', body: `Field ${field.id} · ${field.owner} · ${new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}` });
      addActivityEntry({ time: new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' }), icon: 'Shield', color: 'var(--green)', label: `Cease order issued · Field ${field.id} · ${field.owner}` });
    } else if (type === 'flag') {
      addToast({ type: 'warning', icon: '🚩', title: 'Field flagged for inspection', body: `Field ${field.id} · ${field.owner}` });
    } else if (type === 'warn') {
      addToast({ type: 'warning', icon: '📧', title: 'Warning notice sent', body: `Field ${field.id} · ${field.owner}` });
    } else if (type === 'monitor') {
      addToast({ type: 'info', icon: '👁', title: 'Field added to monitoring queue', body: `Field ${field.id} · next cycle` });
    }
  }, [addToast, addActivityEntry]);

  const handleFieldSelect = useCallback((field) => {
    setSelectedField(field);
    if (activeTab !== 'map' && activeTab !== 'fields') setActiveTab('map');
  }, [activeTab]);

  const handleTabChange = useCallback((tab) => {
    setSelectedField(null);
    setActiveTab(tab);
  }, []);

  // ── Responsive layout dimensions ──────────────────────────────────────────
  const contentLeft   = isMobile ? 0 : 64;
  const contentBottom = isMobile ? 56 : 0;
  // On desktop, content shrinks right when detail panel opens; on mobile the panel goes full-screen
  const contentRight  = (!isMobile && selectedField) ? 400 : 0;

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <TopBar anomalyCount={anomalyCount} />
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} onActivityLogOpen={() => setActivityLog(true)} />

      {/* Main content area */}
      <div style={{
        position: 'fixed',
        top: 52,
        left: contentLeft,
        right: contentRight,
        bottom: contentBottom,
        overflow: 'hidden',
        transition: 'right 0.3s cubic-bezier(0.4,0,0.2,1)',
        // Hide content when full-screen panel is open on mobile
        visibility: (isMobile && selectedField) ? 'hidden' : 'visible',
        zIndex: 1,
      }}>
        {activeTab === 'map'      && <MapView onFieldSelect={handleFieldSelect} selectedField={selectedField} />}
        {activeTab === 'fields'   && <FieldsTable onFieldSelect={handleFieldSelect} />}
        {activeTab === 'reports'  && <ReportsTab onAction={handleAction} />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>

      {/* Field detail panel — full-screen on mobile, 400px drawer on desktop */}
      {selectedField && (
        <FieldDetailPanel
          field={selectedField}
          onClose={() => setSelectedField(null)}
          onAction={handleAction}
          isMobile={isMobile}
        />
      )}

      <Toast toasts={toasts} onDismiss={dismissToast} />
      <ActivityLog open={activityLog} onClose={() => setActivityLog(false)} entries={activityEntries} />
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onFieldSelect={handleFieldSelect} />
    </div>
  );
}
