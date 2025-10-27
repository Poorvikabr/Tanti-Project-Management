import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FolderKanban, CheckCircle2, AlertTriangle, Clock, TrendingUp, FileText, Upload, Settings, ArrowRight, FolderOpen, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-600'
    },
    {
      title: 'Active Projects',
      value: stats?.kpi?.active_projects || 0,
      icon: Clock,
      gradient: 'from-green-500 to-green-600',
      bg: 'bg-green-600'
    },
    {
      title: 'Completed Projects',
      value: stats?.kpi?.completed_projects || 0,
      icon: CheckCircle2,
      gradient: 'from-cyan-500 to-cyan-600',
      bg: 'bg-cyan-600'
    },
    {
      title: 'At-Risk Projects',
      value: stats?.kpi?.at_risk_projects || 0,
      icon: AlertTriangle,
      gradient: 'from-red-500 to-red-600',
      bg: 'bg-red-600'
    }
  ];

  // Prepare status breakdown data with percentages
  const totalProjects = stats?.kpi?.total_projects || 1;
  const statusBreakdown = [
    { 
      name: 'Active', 
      count: stats?.kpi?.active_projects || 0, 
      percentage: Math.round(((stats?.kpi?.active_projects || 0) / totalProjects) * 100),
      color: 'bg-green-500'
    },
    { 
      name: 'Completed', 
      count: stats?.kpi?.completed_projects || 0, 
      percentage: Math.round(((stats?.kpi?.completed_projects || 0) / totalProjects) * 100),
      color: 'bg-blue-500'
    },
    { 
      name: 'At-Risk', 
      count: stats?.kpi?.at_risk_projects || 0, 
      percentage: Math.round(((stats?.kpi?.at_risk_projects || 0) / totalProjects) * 100),
      color: 'bg-red-500'
    },
    { 
      name: 'On Hold', 
      count: projects.filter(p => p.status === 'On-Hold').length, 
      percentage: Math.round((projects.filter(p => p.status === 'On-Hold').length / totalProjects) * 100),
      color: 'bg-yellow-500'
    }
  ];

  // Calculate region percentages
  const regionData = Object.entries(stats?.projects_by_region || {}).map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / totalProjects) * 100)
  }));

  const quickActions = [
    { label: 'Create Project', icon: FolderKanban, path: '/projects/new' },
    { label: 'View All Projects', icon: FolderOpen, path: '/projects' },
    { label: 'Generate Report', icon: BarChart3, path: '/reports' }
  ];

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200"
              onClick={() => navigate('/projects')}
              data-testid={`kpi-card-${kpi.title.toLowerCase().replace(/ /g, '-')}`}
            >
              <div className={`h-2 bg-gradient-to-r ${kpi.gradient}`}></div>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{kpi.title}</p>
                    <p className="text-4xl font-bold mt-2 text-slate-900">{kpi.value}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${kpi.bg}`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row - Status Breakdown & Region */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Breakdown - Horizontal Bars */}
        <Card className="border border-slate-200" data-testid="status-breakdown-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Project Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {statusBreakdown.map((status, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium text-slate-700">{status.name}</span>
                    <span className="text-base font-semibold text-slate-900">{status.count} ({status.percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full ${status.color} rounded-full transition-all duration-500`}
                      style={{ width: `${status.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Projects by Region - Percentage Cards */}
        <Card className="border border-slate-200" data-testid="region-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Projects by Region</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {regionData.map((region, index) => (
                <div key={index} className="flex items-center justify-between p-5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div>
                    <p className="text-xl font-bold text-slate-900 mb-1">{region.name}</p>
                    <p className="text-sm text-slate-600">{region.count} projects</p>
                  </div>
                  <div className="text-5xl font-bold text-blue-600">{region.percentage}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Financial Summary, Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
