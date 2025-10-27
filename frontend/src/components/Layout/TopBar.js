import React, { useState, useEffect } from 'react';
import { Search, Plus, Bell, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export const TopBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [region, setRegion] = useState('Bengaluru');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.getNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  return (
    <div className="h-16 bg-white border-b border-slate-200 fixed top-0 left-64 right-0 z-10 shadow-sm" data-testid="top-bar">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left Section: Search */}
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search projects, scope items, POs, issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200"
              data-testid="global-search-input"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* +New Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="bg-cyan-600 hover:bg-cyan-700" data-testid="new-dropdown-trigger">
                <Plus className="w-4 h-4 mr-1" />
                New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" data-testid="new-dropdown-menu">
              <DropdownMenuItem onClick={() => navigate('/projects/new')} data-testid="new-project-option">Create Project</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/milestones/new')} data-testid="new-task-option">Create Task</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/materials/new')} data-testid="new-material-request-option">Material Request</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/issues/new')} data-testid="new-issue-option">Report Issue</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" data-testid="notifications-trigger">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500" data-testid="notifications-badge">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80" data-testid="notifications-dropdown">
              <div className="p-2 font-semibold border-b flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleMarkAllRead} data-testid="mark-all-read-btn">
                    Mark all read
                  </Button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-500" data-testid="no-notifications-msg">No notifications</div>
                ) : (
                  notifications.slice(0, 10).map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={`p-3 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                      onClick={() => notification.link && navigate(notification.link)}
                      data-testid={`notification-item-${notification.id}`}
                    >
                      <div>
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Region Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" data-testid="region-switcher-trigger">
                {region}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" data-testid="region-switcher-menu">
              <DropdownMenuItem onClick={() => setRegion('Bengaluru')} data-testid="region-bengaluru">Bengaluru</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRegion('Mysuru')} data-testid="region-mysuru">Mysuru</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRegion('North Karnataka')} data-testid="region-north-karnataka">North Karnataka</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
            data-testid="theme-toggle-btn"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2" data-testid="user-menu-trigger">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-cyan-600 text-white text-sm">
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.role}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" data-testid="user-menu">
              <DropdownMenuItem onClick={() => navigate('/profile')} data-testid="user-profile-option">Profile</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} data-testid="user-logout-option">Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
