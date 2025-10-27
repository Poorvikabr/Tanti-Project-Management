import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export const Milestones = () => {
  const navigate = useNavigate();
  const [milestones, setMilestones] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    project_id: '',
    name: '',
    start_date: '',
    end_date: '',
    status: 'On-time',
    assignee: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [milestonesRes, projectsRes] = await Promise.all([
        api.getMilestones(),
        api.getProjects()
      ]);
      setMilestones(milestonesRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load milestones');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const milestoneData = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString()
      };
      await api.createMilestone(milestoneData);
      toast.success('Milestone created successfully!');
      setDialogOpen(false);
      fetchData();
      setFormData({
        project_id: '',
        name: '',
        start_date: '',
        end_date: '',
        status: 'On-time',
        assignee: ''
      });
    } catch (error) {
      console.error('Failed to create milestone:', error);
      toast.error('Failed to create milestone');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'On-time': 'bg-green-100 text-green-700',
      'At-risk': 'bg-yellow-100 text-yellow-700',
      'Delayed': 'bg-red-100 text-red-700',
      'Completed': 'bg-blue-100 text-blue-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="milestones-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Milestones</h1>
          <p className="text-slate-600 mt-1">Track and manage project milestones</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600" data-testid="create-milestone-btn">
              <Plus className="w-4 h-4 mr-2" />
              New Milestone
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Milestone</DialogTitle>
              <DialogDescription>Add a new milestone to track project progress</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Project *</Label>
                <Select value={formData.project_id} onValueChange={(value) => setFormData({ ...formData, project_id: value })} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Milestone Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter milestone name"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="On-time">On-time</SelectItem>
                    <SelectItem value="At-risk">At-risk</SelectItem>
                    <SelectItem value="Delayed">Delayed</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assignee</Label>
                <Input
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  placeholder="Enter assignee name"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Create Milestone</Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {milestones.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No milestones yet</h3>
            <p className="text-slate-500 mb-6">Create your first milestone to track project progress</p>
            <Button onClick={() => setDialogOpen(true)} className="bg-gradient-to-r from-blue-600 to-cyan-600">
              <Plus className="w-4 h-4 mr-2" />
              Create First Milestone
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {milestones.map((milestone) => {
            const project = projects.find(p => p.id === milestone.project_id);
            return (
              <Card key={milestone.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">{milestone.name}</h3>
                        <Badge className={getStatusColor(milestone.status)}>{milestone.status}</Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-4">
                        Project: {project?.name || 'Unknown'}
                      </p>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-slate-500">Start Date</p>
                          <p className="text-sm font-medium">{new Date(milestone.start_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">End Date</p>
                          <p className="text-sm font-medium">{new Date(milestone.end_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Assignee</p>
                          <p className="text-sm font-medium">{milestone.assignee || 'Unassigned'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">Progress</p>
                      <p className="text-3xl font-bold text-cyan-600">{milestone.progress}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
