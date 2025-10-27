import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FolderKanban, CheckCircle2, AlertTriangle, Clock, TrendingUp, FileText, Upload, Settings } from 'lucide-react';
import { toast } from 'sonner';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, projectsRes, logsRes] = await Promise.all([
        api.getDashboardStats(),
        api.getProjects(),
        api.getActivityLogs()
      ]);
      
      setStats(statsRes.data);
      setProjects(projectsRes.data);
      setActivityLogs(logsRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96" data-testid="dashboard-loading">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Total Projects',
      value: stats?.kpi?.total_projects || 0,
      icon: FolderKanban,
      color: 'from-blue-500 to-blue-600',
      filter: 'all'
    },
    {
      title: 'Active Projects',
      value: stats?.kpi?.active_projects || 0,
      icon: Clock,
      color: 'from-green-500 to-green-600',
      filter: 'active'
    },
    {
      title: 'Completed Projects',
      value: stats?.kpi?.completed_projects || 0,
      icon: CheckCircle2,
      color: 'from-cyan-500 to-cyan-600',
      filter: 'completed'
    },
    {
      title: 'At-Risk Projects',
      value: stats?.kpi?.at_risk_projects || 0,
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
      filter: 'at-risk'
    }
  ];

  // Prepare chart data
  const statusData = Object.entries(stats?.projects_by_status || {}).map(([name, value]) => ({
    name,
    value
  }));

  const regionData = Object.entries(stats?.projects_by_region || {}).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#84cc16', '#eab308'];

  const quickLinks = [
    { label: 'Create Project', icon: FolderKanban, path: '/projects/new' },
    { label: 'Reports', icon: FileText, path: '/reports' },
    { label: 'Upload Invoice', icon: Upload, path: '/documents' },
    { label: 'Manage Templates', icon: Settings, path: '/admin' }
  ];

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden group"
              onClick={() => navigate('/projects')}
              data-testid={`kpi-card-${kpi.title.toLowerCase().replace(/ /g, '-')}`}
            >
              <div className={`h-2 bg-gradient-to-r ${kpi.color}`}></div>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{kpi.title}</p>
                    <p className="text-3xl font-bold mt-2">{kpi.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Donut Chart */}
        <Card data-testid="status-chart-card">
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-72 flex items-center justify-center text-slate-500">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Region Bar Chart */}
        <Card data-testid="region-chart-card">
          <CardHeader>
            <CardTitle>Projects by Region</CardTitle>
          </CardHeader>
          <CardContent>
            {regionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={regionData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-72 flex items-center justify-center text-slate-500">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Summary */}
        <Card data-testid="financial-summary-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                <span className="text-slate-600">Total Project Value</span>
                <span className="text-xl font-bold">\u20b9{projects.reduce((sum, p) => sum + (p.value || 0), 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                <span className="text-slate-600">Active Value</span>
                <span className="text-xl font-bold text-green-600">
                  \u20b9{projects.filter(p => p.status === 'Active').reduce((sum, p) => sum + (p.value || 0), 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                <span className="text-slate-600">Completed Value</span>
                <span className="text-xl font-bold text-blue-600">
                  \u20b9{projects.filter(p => p.status === 'Completed').reduce((sum, p) => sum + (p.value || 0), 0).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card data-testid="quick-links-card">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {quickLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-cyan-50 hover:border-cyan-500 hover:text-cyan-700 transition-all"
                    onClick={() => navigate(link.path)}
                    data-testid={`quick-link-${link.label.toLowerCase().replace(/ /g, '-')}`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm font-medium">{link.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card data-testid="activity-feed-card">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activityLogs.length > 0 ? (
            <div className="space-y-3">
              {activityLogs.slice(0, 10).map((log, index) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                  onClick={() => log.project_id && navigate(`/projects/${log.project_id}`)}
                  data-testid={`activity-log-${index}`}
                >
                  <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{log.action}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500" data-testid="no-activity-msg">No recent activity</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
