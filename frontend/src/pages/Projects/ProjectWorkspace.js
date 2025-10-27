import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, DollarSign, MapPin, User, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export const ProjectWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [scopeItems, setScopeItems] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProjectData();
    }
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const [projectRes, milestonesRes, scopeRes, logsRes] = await Promise.all([
        api.getProject(id),
        api.getMilestones(id),
        api.getScopeItems(id),
        api.getActivityLogs(id)
      ]);
      
      setProject(projectRes.data);
      setMilestones(milestonesRes.data);
      setScopeItems(scopeRes.data);
      setActivityLogs(logsRes.data);
    } catch (error) {
      console.error('Failed to fetch project data:', error);
      toast.error('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96" data-testid="workspace-loading">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12" data-testid="project-not-found">
        <h2 className="text-2xl font-bold text-slate-900">Project not found</h2>
        <Button onClick={() => navigate('/projects')} className="mt-4">Back to Projects</Button>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      'Planning': 'bg-gray-100 text-gray-700',
      'Active': 'bg-green-100 text-green-700',
      'On-Hold': 'bg-yellow-100 text-yellow-700',
      'Completed': 'bg-blue-100 text-blue-700',
      'At-Risk': 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6" data-testid="project-workspace">
      {/* Project Header */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {project.name}
              </h1>
              <Badge className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
            </div>
            <p className="text-slate-600">{project.client}</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/projects')}>
            Back to Projects
          </Button>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Project Value</p>
              <p className="text-lg font-bold">₹{project.value?.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Progress</p>
              <p className="text-lg font-bold">{project.progress}%</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Region</p>
              <p className="text-lg font-bold">{project.region}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-100 rounded-lg">
              <Calendar className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Type</p>
              <p className="text-lg font-bold">{project.type}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full" data-testid="project-tabs">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-9">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="milestones" onClick={() => navigate(`/projects/${id}/milestones`)}>Milestones</TabsTrigger>
          <TabsTrigger value="scope" onClick={() => navigate(`/projects/${id}/scope`)}>Scope</TabsTrigger>
          <TabsTrigger value="design" onClick={() => navigate(`/projects/${id}/design`)}>Design</TabsTrigger>
          <TabsTrigger value="materials" onClick={() => navigate(`/projects/${id}/materials`)}>Materials</TabsTrigger>
          <TabsTrigger value="issues" onClick={() => navigate(`/projects/${id}/issues`)}>Issues</TabsTrigger>
          <TabsTrigger value="timesheets" onClick={() => navigate(`/projects/${id}/timesheets`)}>Timesheets</TabsTrigger>
          <TabsTrigger value="documents" onClick={() => navigate(`/projects/${id}/documents`)}>Documents</TabsTrigger>
          <TabsTrigger value="reports" onClick={() => navigate(`/projects/${id}/reports`)}>Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Project Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Overall Completion</span>
                    <span className="text-sm font-bold">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-3" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-slate-600">Start Date</p>
                    <p className="text-sm font-medium">{new Date(project.start_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">End Date</p>
                    <p className="text-sm font-medium">{new Date(project.end_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Milestones Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Milestones</CardTitle>
                  <Button size="sm" onClick={() => navigate(`/projects/${id}/milestones`)}>View All</Button>
                </div>
              </CardHeader>
              <CardContent>
                {milestones.length > 0 ? (
                  <div className="space-y-3">
                    {milestones.slice(0, 5).map((milestone) => (
                      <div key={milestone.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium">{milestone.name}</p>
                          <p className="text-xs text-slate-500">{milestone.status}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{milestone.progress}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-8">No milestones yet</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {activityLogs.length > 0 ? (
                  <div className="space-y-3">
                    {activityLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{log.action}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(log.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-8">No recent activity</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
