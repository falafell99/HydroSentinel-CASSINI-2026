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

let toastIdCounter = 0;

/**
 * App — Root component
 * Manages: active tab, selected field, toasts, activity log, command palette
 * Simulates: meter drift (60s), satellite age (60s), new anomaly toast (90s)
 */
export default function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [selectedField, setSelectedField] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [activityLog, setActivityLog] = useState(false);
  const [activityEntries, setActivityEntries] = useState([]);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [anomalyCount, setAnomalyCount] = useState(SUMMARY.anomaly);
  const [fields, setFields] = useState(FIELDS);

  // ── Meter drift simulation (60s) ──
  useEffect(() => {
    const iv = setInterval(() => {
      setFields(prev => prev.map(f => ({
        ...f,
        actualUse: Math.max(0, f.actualUse + Math.floor(Math.random() * 40 - 18)),
      })));
    }, 60000);
    return () => clearInterval(iv);
  }, []);

  // ── New anomaly demo (90s) ──
  useEffect(() => {
    const timeout = setTimeout(() => {
      addToast({ type: 'warning', icon: '⚠️', title: 'New anomaly detected', body: 'Field G-15 · +44% over CWR · Nagykáta district' });
      setAnomalyCount(n => n + 1);
    }, 90000);
    return () => clearTimeout(timeout);
  }, []);

  // ── Cmd+K keyboard shortcut ──
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(o => !o);
      }
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
      addToast({ type: 'success', icon: '✓', title: `Cease irrigation order issued`, body: `Field ${field.id} · ${field.owner} · ${new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}` });
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

  // Content left margin accounts for sidebar (64px)
  const contentLeft = 64;

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <TopBar anomalyCount={anomalyCount} />
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} onActivityLogOpen={() => setActivityLog(true)} />

      {/* Main content */}
      <div style={{
        position: 'fixed',
        top: 52,
        left: contentLeft,
        right: selectedField ? 400 : 0,
        bottom: 0,
        overflow: 'hidden',
        transition: 'right 0.3s cubic-bezier(0.4,0,0.2,1)',
        zIndex: 1,
      }}>
        {activeTab === 'map' && (
          <MapView onFieldSelect={handleFieldSelect} selectedField={selectedField} />
        )}
        {activeTab === 'fields' && (
          <FieldsTable onFieldSelect={handleFieldSelect} />
        )}
        {activeTab === 'reports' && (
          <ReportsTab onAction={handleAction} />
        )}
        {activeTab === 'settings' && (
          <SettingsTab />
        )}
      </div>

      {/* Field detail panel */}
      {selectedField && (
        <FieldDetailPanel
          field={selectedField}
          onClose={() => setSelectedField(null)}
          onAction={handleAction}
        />
      )}

      {/* Toasts */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Activity log */}
      <ActivityLog open={activityLog} onClose={() => setActivityLog(false)} entries={activityEntries} />

      {/* Command palette */}
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onFieldSelect={handleFieldSelect} />
    </div>
  );
}
