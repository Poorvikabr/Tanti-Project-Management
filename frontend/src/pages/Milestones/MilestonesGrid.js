import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { Search, Plus, Download, RefreshCw, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const MilestonesGrid = () => {
  // Register AG Grid community modules (required for v29+)
  ModuleRegistry.registerModules([AllCommunityModule]);
  const location = useLocation();
  const navigate = useNavigate();
  const [rowData, setRowData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState({});

  // Local fallback cache so ticks persist even if navigation happens before network save completes
  const CACHE_KEY = 'milestones_grid_overrides_v1';
  const readOverrides = () => {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch { return {}; }
  };
  const writeOverrides = (obj) => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(obj || {}));
  };
  const setOverride = (rowId, patch) => {
    const map = readOverrides();
    map[rowId] = { ...(map[rowId] || {}), ...patch };
    writeOverrides(map);
  };
  const clearOverride = (rowId) => {
    const map = readOverrides();
    if (map[rowId]) { delete map[rowId]; writeOverrides(map); }
  };

  // Column definitions matching the grid structure from the images
  const rawColumnDefs = useMemo(() => [
    // Left half: Project overview (un-pinned so both halves scroll together)
    {
      headerName: 'Project Overview', marryChildren: true, headerClass: 'header-pink', children: [
        { field: 'project_id', headerName: 'Project ID', width: 90 },
        { field: 'project_name', headerName: 'Project Name', width: 120 },
        { field: 'branch', headerName: 'Branch to Involve', width: 100 },
        { field: 'priority', headerName: 'Priority', width: 60, editable: true, cellEditor: 'agSelectCellEditor', cellEditorParams: { values: ['High', 'Medium', 'Low'] } },
        { field: 'sales_team', headerName: 'Sales Team', width: 90, editable: true },
        { field: 'immediate_action', headerName: 'Immediate Action to be taken', width: 110, editable: true },
        { field: 'site_engineer', headerName: 'Site Eng', width: 80, editable: true },
        { field: 'ongoing_milestone', headerName: 'Ongoing Milestone', width: 100, editable: true },
        { field: 'upcoming_milestone', headerName: 'Upcoming Milestone', width: 100, editable: true },
        { field: 'owner', headerName: 'Owner', width: 80, editable: true },
      ]
    },
    // Visual spacer between halves
    { field: '__gap', headerName: '', width: 12, resizable: false, sortable: false, filter: false, editable: false, suppressMenu: true, lockPosition: true, cellStyle: { background: 'transparent', borderRight: 'none' }, headerClass: 'no-divider' },

    // Grouped milestone columns
    {
      headerName: 'Entry point', headerClass: 'header-orange', children: [
        { field: 'm_entry_electrical_labour', headerName: 'Electrical Labour contract', width: 180, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor' },
        { field: 'm_entry_electrical_design', headerName: 'Electrical Design Contract', width: 190, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor' },
        { field: 'm_entry_essential', headerName: 'Essential contract', width: 150, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor' },
        { field: 'm_entry_automation', headerName: 'Building Automation Contract', width: 210, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor' },
      ]
    },
    {
      headerName: 'Milestone 1 - Slab Conduits', headerClass: 'header-orange', children: [
        { field: 'm1_slab1', headerName: 'Conduits, accessories, JBs, and Drop Boxes — SLAB 1', width: 420, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue no-wrap-header' },
        { field: 'm1_slab2', headerName: 'Conduits, accessories, JBs, and Drop Boxes — SLAB 2', width: 360, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue wrap-header' },
        { field: 'm1_slab3', headerName: 'Conduits, accessories, JBs, and Drop Boxes — SLAB 3', width: 360, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue no-wrap-header' },
        { field: 'm1_slab4', headerName: 'Conduits, accessories, JBs, and Drop Boxes — SLAB 4', width: 360, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue no-wrap-header' },
      ]
    },
    {
      headerName: 'Milestone 2 - Wall chipping', headerClass: 'header-orange', children: [
        { field: 'm2_conduits', headerName: 'Conduits & accessories', width: 200, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue' },
        { field: 'm2_db_wall_boxes', headerName: 'DB & Wall boxes', width: 220, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue' },
      ]
    },
    {
      headerName: 'Milestone 3 - Wiring', headerClass: 'header-orange', children: [
        { field: 'm3_wires', headerName: 'Electrical wires', width: 150, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue' },
        { field: 'm3_comm_cables', headerName: 'Communication cables', width: 240, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue' },
      ]
    },
    {
      headerName: 'Milestone 4 - DB Dressing, Backend & Passive', headerClass: 'header-orange', children: [
        { field: 'm4_mcbs', headerName: 'MCBs & Protection', width: 200, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue' },
        { field: 'm4_automation_backend', headerName: 'Automation Backend', width: 180, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue' },
        { field: 'm4_networking_passive', headerName: 'Networking passive', width: 220, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue' },
      ]
    },
    {
      headerName: 'Milestone 5 - Infrastructure', headerClass: 'header-orange', children: [
        { field: 'm5_power_panels', headerName: 'Power panels', width: 170, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue' },
        { field: 'm5_earthing', headerName: 'Earthing', width: 120, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue' },
        { field: 'm5_gate_motor', headerName: 'Gate Motor', width: 120, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue' },
        { field: 'm5_stabilizer', headerName: 'Stabilizer', width: 120, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue' },
        { field: 'm5_ups', headerName: 'UPS', width: 100, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue' },
        { field: 'm5_solar', headerName: 'Solar Panels', width: 140, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue' },
      ]
    },
    {
      headerName: 'Milestone 6 - Switches & Front End', headerClass: 'header-orange', children: [
        { field: 'm6_switches_int', headerName: 'Switches (Int.)', width: 170, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue' },
        { field: 'm6_switches_ind', headerName: 'Switches (Ind.)', width: 170, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue' },
        { field: 'm6_frontend', headerName: 'Frontend Components', width: 180, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue' },
      ]
    },
    {
      headerName: 'Milestone 7 - Essentials', headerClass: 'header-orange', children: [
        { field: 'm7_cctv', headerName: 'CCTV', width: 100, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue' },
        { field: 'm7_vdp', headerName: 'VDP', width: 100, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue' },
        { field: 'm7_networking_active', headerName: 'Networking Active', width: 180, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue' },
        { field: 'm7_wifi', headerName: 'Wi-Fi', width: 100, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue' },
        { field: 'm7_digital_locks', headerName: 'Digital Locks', width: 150, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue' },
        { field: 'm7_security_basic', headerName: 'Security Basic', width: 160, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue' },
        { field: 'm7_security_advanced', headerName: 'Security Advanced', width: 170, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue' },
        { field: 'm7_intercomm', headerName: 'EPBAX/Intercom', width: 160, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue' },
        { field: 'm7_motion_sensors', headerName: 'Motion sensors', width: 150, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue' },
        { field: 'm7_water_mgmt', headerName: 'Water management', width: 170, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue' },
      ]
    },
    {
      headerName: 'Milestone 8 and 9 - Light Fixtures', headerClass: 'header-orange', children: [
        { field: 'm8_light_fixtures', headerName: 'Light Fixtures', width: 170, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue wrap-header' },
        { field: 'm8_curtain_motor', headerName: 'Curtain Motor/Blinds for Windows', width: 320, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue wrap-header' },
        { field: 'm8_zonal_audio', headerName: 'Zonal Audio', width: 170, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue wrap-header' },
        { field: 'm8_home_theater', headerName: 'Home theater', width: 170, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue wrap-header' },
      ]
    },
    // Milestone 9 - Visualization removed per user request
    {
      headerName: 'Milestone 10 - Visualization & Handover', headerClass: 'header-orange', children: [
        { field: 'm9_mobile_control', headerName: 'Visualization / Mobile Control', width: 220, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue wrap-header' },
        { field: 'm9_hvac', headerName: 'HVAC Control', width: 160, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue wrap-header' },
        { field: 'm9_socket_timer', headerName: 'Any Socket on Schedule or Timer control', width: 280, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue wrap-header' },
        { field: 'm9_heat_pump', headerName: 'Heat Pump On-Off control based on time', width: 300, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue wrap-header' },
        { field: 'm9_voice_control', headerName: 'Voice control with Alexa or Siri', width: 280, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue wrap-header' },
        { field: 'm10_handover', headerName: 'Commissioning, programming, handover and 1 year service', width: 420, editable: true, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', headerClass: 'header-blue wrap-header' },
      ]
    },

    // Progress column
    { field: 'progress_pct', headerName: 'Progress %', width: 120, cellRenderer: (params) => `${params.value}%` },
    // Delete action (render text; handle click in onCellClicked)
    { field: '__actions', headerName: 'Actions', width: 100, sortable: false, filter: false, editable: false, cellRenderer: () => 'Delete', cellClass: 'text-red-600 font-semibold cursor-pointer' }
  ], []);

  // Normalize columns: remove fixed widths, add flex and sensible minWidth
  const normalizeColumns = useCallback((cols) => {
    const pinnedSizeMap = {
      project_id: { minWidth: 70, maxWidth: 90 },
      project_name: { minWidth: 100, maxWidth: 120 },
      branch: { minWidth: 80, maxWidth: 100 },
      priority: { minWidth: 40, maxWidth: 60 },
      sales_team: { minWidth: 60, maxWidth: 80 },
      immediate_action: { minWidth: 90, maxWidth: 110 },
      site_engineer: { minWidth: 60, maxWidth: 80 },
      ongoing_milestone: { minWidth: 80, maxWidth: 100 },
      upcoming_milestone: { minWidth: 80, maxWidth: 100 },
      owner: { minWidth: 60, maxWidth: 80 },
    };
    return cols.map((c) => {
      if (c.children && Array.isArray(c.children)) {
        return { ...c, children: normalizeColumns(c.children) };
      }
      const { width, flex, minWidth, ...rest } = c;
      const size = pinnedSizeMap[rest.field] || {};
      if (c.pinned) {
        return {
          ...rest,
          flex: 0,
          minWidth: size.minWidth || minWidth || 120,
          ...(size.maxWidth ? { maxWidth: size.maxWidth, width: size.maxWidth } : {}),
          ...(size.maxWidth ? { maxWidth: size.maxWidth } : {}),
        };
      }
      // Respect explicit width when provided (used for overview half)
      if (width) {
        return { ...rest, width, flex: 0, minWidth: width };
      }
      return { ...rest, minWidth: minWidth || 150, flex: flex || 1 };
    });
  }, []);

  const columnDefs = useMemo(() => normalizeColumns(rawColumnDefs), [normalizeColumns, rawColumnDefs]);

  // Build a definitive list of all milestone checkbox fields from column defs
  const milestoneFieldKeys = useMemo(() => {
    const prefixes = ['m_entry_', 'm1_', 'm2_', 'm3_', 'm4_', 'm5_', 'm6_', 'm7_', 'm8_', 'm9_', 'm10_'];
    const keys = [];
    const walk = (cols) => {
      cols.forEach((c) => {
        if (c.children) return walk(c.children);
        if (c.field && prefixes.some((p) => c.field.startsWith(p))) keys.push(c.field);
      });
    };
    walk(rawColumnDefs);
    return keys;
  }, [rawColumnDefs]);

  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    filter: true,
    editable: true,
  }), []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const statusFilter = params.get('status');
    const regionFilter = params.get('region');

    let filtered = rowData;
    if (searchQuery) {
      filtered = filtered.filter(row => 
        row.project_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.project_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (statusFilter) {
      filtered = filtered.filter(row => (row.status || '').toLowerCase() === statusFilter.toLowerCase());
    }
    if (regionFilter) {
      filtered = filtered.filter(row => (row.branch || row.region || '').toLowerCase() === regionFilter.toLowerCase());
    }
    setFilteredData(filtered);
  }, [searchQuery, rowData, location.search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.getMilestonesGrid();
      const overrides = readOverrides();
      const rows = (response.data || []).map((r) => {
        // Normalize all milestone checkbox fields to strict booleans
        const patched = { ...r, ...(overrides[r.id] || {}) };
        milestoneFieldKeys.forEach((k) => {
          const v = patched[k];
          patched[k] = typeof v === 'boolean' ? v : (v === 1 || (typeof v === 'string' && ['true','1','yes','on'].includes(v.toLowerCase())));
        });
        return patched;
      });
      // Recompute progress client-side to fix legacy incorrect values
      const corrected = await Promise.all(rows.map(async (r) => {
        const p = calculateEqualProgress(r);
        if (typeof r.progress_pct !== 'number' || r.progress_pct !== p) {
          try { await api.updateMilestoneCell(r.id, 'progress_pct', p); } catch {}
          return { ...r, progress_pct: p };
        }
        return r;
      }));
      setRowData(corrected);
      setFilteredData(corrected);
    } catch (error) {
      console.error('Failed to fetch milestones grid:', error);
      toast.error('Failed to load milestones grid');
    } finally {
      setLoading(false);
    }
  };

  // Calculate progress: Every checkbox across Entry point + M1..M10 is equal weight.
  // 100% only when ALL such checkboxes are checked.
  const isChecked = (v) => {
    if (typeof v === 'boolean') return v === true;
    if (typeof v === 'number') return v === 1;
    if (typeof v === 'string') return ['true', '1', 'yes', 'on'].includes(v.trim().toLowerCase());
    return false;
  };

  const calculateEqualProgress = (row) => {
    const keys = milestoneFieldKeys;
    if (!keys || keys.length === 0) return 0;
    const completed = keys.reduce((acc, k) => acc + (isChecked(row[k]) ? 1 : 0), 0);
    return Math.round((completed / keys.length) * 100);
  };

  const addNewRow = async () => {
    try {
      const newRow = {
        project_id: `TAPL${String((rowData?.length || 0) + 1).padStart(3, '0')}`,
        project_name: 'New Project',
        branch: 'Bengaluru',
        priority: 'Low',
        sales_team: '',
        immediate_action: '',
        site_engineer: '',
        ongoing_milestone: '',
        upcoming_milestone: '',
        owner: ''
      };
      const resp = await api.createMilestonesGrid(newRow);
      toast.success('New milestone added');
      await fetchData();
    } catch (e) {
      console.error('Failed to add row', e);
      toast.error('Failed to add row');
    }
  };

  const getRowStyle = (params) => {
    const progress = params.data.progress_pct || 0;
    if (progress === 100) {
      return { backgroundColor: '#d4edda' }; // Green
    } else if (progress >= 1 && progress < 100) {
      return { backgroundColor: '#fff3cd' }; // Yellow
    } else if (params.data.status === 'On Hold') {
      return { backgroundColor: '#ffeaa7' }; // Orange
    } else if (params.data.status === 'At Risk') {
      return { backgroundColor: '#f8d7da' }; // Red
    }
    return { backgroundColor: '#ffffff' };
  };

  const onCellValueChanged = async (params) => {
    if (params.colDef.field.startsWith('m_') || params.colDef.field.startsWith('m1_') || 
        params.colDef.field.startsWith('m2_') || params.colDef.field.startsWith('m3_') ||
        params.colDef.field.startsWith('m4_') || params.colDef.field.startsWith('m5_') ||
        params.colDef.field.startsWith('m6_') || params.colDef.field.startsWith('m7_') ||
        params.colDef.field.startsWith('m8_') || params.colDef.field.startsWith('m9_') ||
        params.colDef.field.startsWith('m10_')) {
      // Recalculate equal-weight progress across Entry point + M1..M10
      const progress = calculateEqualProgress(params.data);
      
      params.data.progress_pct = progress;
      params.api.refreshCells({ rowNodes: [params.node] });

      // Save to backend (debounced by quick timeout)
      try {
        setSaving({ ...saving, [params.data.id]: true });
        // Normalize checkbox value to strict boolean
        const normalized = isChecked(params.newValue);
        await api.updateMilestoneCell(params.data.id, params.colDef.field, normalized);
        // Persist progress immediately to avoid losing it on navigation/refresh
        await api.updateMilestoneCell(params.data.id, 'progress_pct', progress);
        setOverride(params.data.id, { [params.colDef.field]: normalized, progress_pct: progress });
        toast.success('✓ Saved', { duration: 1000 });
        setTimeout(() => {
          setSaving({ ...saving, [params.data.id]: false });
        }, 500);
      } catch (error) {
        console.error('Failed to save milestone:', error);
        toast.error('Failed to save');
        // Revert the change
        params.oldValue && (params.data[params.colDef.field] = params.oldValue);
        setOverride(params.data.id, { [params.colDef.field]: isChecked(params.newValue), progress_pct: progress });
      }
    } else {
      // Save other field changes
      try {
        await api.updateMilestoneCell(params.data.id, params.colDef.field, params.newValue);
        toast.success('✓ Saved', { duration: 1000 });
      } catch (error) {
        console.error('Failed to save:', error);
        toast.error('Failed to save');
      }
    }
  };

  const exportToExcel = () => {
    // Implement Excel export
    const csv = [];
    const headers = columnDefs.map(col => col.headerName).join(',');
    csv.push(headers);
    
    filteredData.forEach(row => {
      const values = columnDefs.map(col => {
        const value = row[col.field];
        return value !== undefined && value !== null ? value : '';
      }).join(',');
      csv.push(values);
    });
    
    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'milestones-export.csv';
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Milestones Tracker</h1>
          <p className="text-slate-600 mt-1">Excel-like milestone tracking with real-time updates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="default" onClick={addNewRow}>
            <Plus className="w-4 h-4 mr-2" />
            Add Row
          </Button>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="mb-4 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by Project ID or Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredData && filteredData.length > 0 ? (
        <div className="flex flex-col w-full h-[calc(100vh-260px)] overflow-hidden">
          <div className="flex-1 overflow-x-auto overflow-y-hidden">
            <div className="min-w-max">
              <div
                className="ag-theme-alpine"
                style={{
                  height: 'calc(100vh - 260px)',
                  width: '100%',
                  margin: 0,
                  padding: 0,
                  border: 'none',
                  borderRadius: 0,
                }}
              >
                <AgGridReact
                  rowData={filteredData}
                  columnDefs={columnDefs}
                  defaultColDef={defaultColDef}
                  onCellValueChanged={onCellValueChanged}
                  onCellClicked={async (e) => {
                    const f = e.colDef.field || '';
                    const isMilestoneField = f.startsWith('m_') || f.startsWith('m1_') || f.startsWith('m2_') || f.startsWith('m3_') || f.startsWith('m4_') || f.startsWith('m5_') || f.startsWith('m6_') || f.startsWith('m7_') || f.startsWith('m8_') || f.startsWith('m9_') || f.startsWith('m10_');
                    if (f === '__actions') {
                      const yes = window.confirm('Delete this row?');
                      if (!yes) return;
                      try {
                        const rowId = e.node.data.id;
                        if (!rowId) {
                          toast.error('Row ID not found');
                          return;
                        }
                        await api.deleteMilestonesGrid(rowId);
                        toast.success('Row deleted');
                        e.api.applyTransaction({ remove: [e.node.data] });
                      } catch (err) {
                        console.error('Delete failed', err);
                        const errorMsg = err.response?.data?.detail || err.message || 'Failed to delete';
                        toast.error(errorMsg);
                      }
                      return;
                    }
                    if (isMilestoneField) {
                      // Toggle value to ensure change fires even if editor doesn't
                      const current = isChecked(e.value);
                      const next = !current;
                      // Update grid data immediately
                      e.node.setDataValue(f, next);
                      // Also ensure backing data object reflects change before progress calc
                      e.node.data[f] = next;
                      // Recalculate and persist synchronously to avoid losing on navigation
                      const p = calculateEqualProgress(e.node.data);
                      e.node.setDataValue('progress_pct', p);
                      try {
                        await api.updateMilestoneCell(e.node.data.id, f, next);
                        await api.updateMilestoneCell(e.node.data.id, 'progress_pct', p);
                        setOverride(e.node.data.id, { [f]: next, progress_pct: p });
                      } catch (err) {
                        console.error('Save failed on click:', err);
                        toast.error('Failed to save');
                        setOverride(e.node.data.id, { [f]: next, progress_pct: p });
                      }
                    }
                  }}
                  getRowStyle={getRowStyle}
                  rowSelection="singleRow"
                  animateRows={true}
                  wrapHeaderText={true}
                  autoHeaderHeight={true}
                  rowHeight={32}
                  domLayout="normal"
                  theme="legacy"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-slate-300 rounded-md bg-white p-8 text-center text-slate-500">
          No milestones to display yet.
        </div>
      )}
      <div className="text-xs text-slate-500 mt-2">{filteredData?.length || 0} rows</div>
    </div>
  );
};

export default MilestonesGrid;

