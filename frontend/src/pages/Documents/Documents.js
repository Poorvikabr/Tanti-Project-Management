import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Upload, Download, FileBox } from 'lucide-react';
import { toast } from 'sonner';

export const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    project_id: '',
    type: 'Drawings'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [documentsRes, projectsRes] = await Promise.all([
        api.getDocuments(),
        api.getProjects()
      ]);
      setDocuments(documentsRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', selectedFile);
      formDataToSend.append('project_id', formData.project_id);
      formDataToSend.append('doc_type', formData.type);

      await api.uploadDocument(formDataToSend);
      toast.success('Document uploaded successfully!');
      setDialogOpen(false);
      fetchData();
      setFormData({
        project_id: '',
        type: 'Drawings'
      });
      setSelectedFile(null);
    } catch (error) {
      console.error('Failed to upload document:', error);
      toast.error('Failed to upload document');
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      'Drawings': 'bg-blue-100 text-blue-700',
      'Invoices': 'bg-green-100 text-green-700',
      'As-built': 'bg-purple-100 text-purple-700',
      'Handover': 'bg-orange-100 text-orange-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Drawings': return <FileText className="w-12 h-12 text-blue-500" />;
      case 'Invoices': return <FileText className="w-12 h-12 text-green-500" />;
      case 'As-built': return <FileText className="w-12 h-12 text-purple-500" />;
      case 'Handover': return <FileText className="w-12 h-12 text-orange-500" />;
      default: return <FileBox className="w-12 h-12 text-gray-500" />;
    }
  };

  const groupedDocuments = documents.reduce((acc, doc) => {
    if (!acc[doc.type]) acc[doc.type] = [];
    acc[doc.type].push(doc);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="documents-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Documents</h1>
          <p className="text-slate-600 mt-1">Manage project documents and files</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600" data-testid="upload-document-btn">
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
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
                <Label>Document Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Drawings">Drawings</SelectItem>
                    <SelectItem value="Invoices">Invoices</SelectItem>
                    <SelectItem value="As-built">As-built</SelectItem>
                    <SelectItem value="Handover">Handover</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>File *</Label>
                <Input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  required
                />
                {selectedFile && (
                  <p className="text-sm text-slate-600">Selected: {selectedFile.name}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Upload</Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileBox className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No documents yet</h3>
            <p className="text-slate-500 mb-6">Upload your first project document</p>
            <Button onClick={() => setDialogOpen(true)} className="bg-gradient-to-r from-blue-600 to-cyan-600">
              <Upload className="w-4 h-4 mr-2" />
              Upload First Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedDocuments).map(([type, docs]) => (
            <div key={type}>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-bold text-slate-900">{type}</h2>
                <Badge className={getTypeColor(type)}>{docs.length} files</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {docs.map((doc) => {
                  const project = projects.find(p => p.id === doc.project_id);
                  return (
                    <Card key={doc.id} className="hover:shadow-lg transition-shadow cursor-pointer" data-testid={`document-card-${doc.id}`}>
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                          <div className="mb-4">
                            {getTypeIcon(doc.type)}
                          </div>
                          <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">{doc.name}</h3>
                          <p className="text-xs text-slate-500 mb-2">{project?.name || 'Unknown'}</p>
                          <Badge className={getTypeColor(doc.type)} className="mb-3">{doc.type}</Badge>
                          <div className="text-xs text-slate-500 mb-4">
                            Version {doc.version} • {new Date(doc.created_at).toLocaleDateString()}
                          </div>
                          <Button size="sm" variant="outline" className="w-full">
                            <Download className="w-3 h-3 mr-2" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
