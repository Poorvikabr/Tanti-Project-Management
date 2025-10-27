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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-600">{kpi.title}</p>
                    <p className="text-3xl font-bold mt-1 text-slate-900">{kpi.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${kpi.bg}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row - Status Breakdown & Region */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Project Status Breakdown - Horizontal Bars */}
        <Card className="border border-slate-200" data-testid="status-breakdown-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold">Project Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3" style={{ height: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
              {statusBreakdown.map((status, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{status.name}</span>
                    <span className="text-sm font-semibold text-slate-900">{status.count} ({status.percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
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
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold">Projects by Region</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3" style={{ height: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
              {regionData.map((region, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div>
                    <p className="text-base font-bold text-slate-900 mb-0.5">{region.name}</p>
                    <p className="text-xs text-slate-600">{region.count} projects</p>
                  </div>
                  <div className="text-4xl font-bold text-blue-600">{region.percentage}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Financial Summary, Quick Links & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Financial Summary */}
        <Card className="border border-slate-200" data-testid="financial-summary-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs text-slate-600">Total Project Value</p>
                <p className="text-xl font-bold text-slate-900">
                  ₹{projects.reduce((sum, p) => sum + (p.value || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-600">Active Value</p>
                <p className="text-xl font-bold text-green-600">
                  ₹{projects.filter(p => p.status === 'Active').reduce((sum, p) => sum + (p.value || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-600">Completed Value</p>
                <p className="text-xl font-bold text-blue-600">
                  ₹{projects.filter(p => p.status === 'Completed').reduce((sum, p) => sum + (p.value || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border border-slate-200" data-testid="quick-actions-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full h-auto py-3 px-4 flex items-center justify-start gap-3 hover:bg-slate-50 hover:border-slate-300 transition-all text-left"
                    onClick={() => navigate(action.path)}
                    data-testid={`quick-action-${action.label.toLowerCase().replace(/ /g, '-')}`}
                  >
                    <Icon className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-900 flex-1">{action.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border border-slate-200" data-testid="activity-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-bold">Recent Activity</CardTitle>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 h-auto py-1 px-2" onClick={() => navigate('/projects')}>
              <span className="text-xs">View All</span> <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {activityLogs.length > 0 ? (
              <div className="space-y-2">
                {activityLogs.slice(0, 4).map((log, index) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                    onClick={() => log.project_id && navigate(`/projects/${log.project_id}`)}
                    data-testid={`activity-log-${index}`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-blue-600 text-white text-xs font-semibold">
                        {getInitials(user?.name || 'Admin User')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900">
                        {user?.name || 'Admin User'} <span className="font-normal text-slate-600">{log.action.toLowerCase()}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {new Date(log.created_at).toLocaleString('en-IN', { 
                          month: 'short', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500" data-testid="no-activity-msg">
                <p className="text-xs">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links Row */}
      <Card className="border border-slate-200" data-testid="quick-links-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold">Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Create Project', icon: FolderKanban, path: '/projects/new' },
              { label: 'Reports', icon: FileText, path: '/reports' },
              { label: 'Upload Invoice', icon: Upload, path: '/documents' },
              { label: 'Manage Templates', icon: Settings, path: '/admin' }
            ].map((link, index) => {
              const Icon = link.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all"
                  onClick={() => navigate(link.path)}
                  data-testid={`quick-link-${link.label.toLowerCase().replace(/ /g, '-')}`}
                >
                  <Icon className="w-6 h-6 text-slate-600" />
                  <span className="text-xs font-medium text-slate-900">{link.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};