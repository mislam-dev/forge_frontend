'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import {
  useNotificationsList,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/lib/hooks/api/useNotifications';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  ExternalLink,
  Filter,
  Search,
  RotateCcw,
} from 'lucide-react';

export default function NotificationsPage() {
  const { toast } = useToast();
  const { data: notifications = [], isLoading } = useNotificationsList();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.is_read).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (readFilter === 'unread' && n.is_read) return false;
      if (readFilter === 'read' && !n.is_read) return false;
      if (severityFilter !== 'all' && n.severity !== severityFilter) return false;
      if (categoryFilter !== 'all' && (n.category || 'deployment') !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = n.title.toLowerCase().includes(query);
        const matchesMsg = n.message.toLowerCase().includes(query);
        if (!matchesTitle && !matchesMsg) return false;
      }
      return true;
    });
  }, [notifications, severityFilter, categoryFilter, readFilter, searchQuery]);

  const handleMarkAllRead = async () => {
    try {
      await markAllRead.mutateAsync();
      toast({
        title: 'Notifications Updated',
        description: 'All notifications have been marked as read.',
      });
    } catch (err: any) {
      toast({
        title: 'Action Failed',
        description: err?.message || 'Could not mark notifications as read.',
        variant: 'destructive',
      });
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await markRead.mutateAsync(id);
    } catch {
      // quiet fail
    }
  };

  const resetFilters = () => {
    setSeverityFilter('all');
    setCategoryFilter('all');
    setReadFilter('all');
    setSearchQuery('');
  };

  const isFiltered = severityFilter !== 'all' || categoryFilter !== 'all' || readFilter !== 'all' || searchQuery !== '';

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Notification Center</h1>
            {unreadCount > 0 && (
              <Badge variant="default" className="text-xs">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Build status alerts, security notices, and organization activity stream.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markAllRead.isPending}
            className="h-9 text-xs"
          >
            <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border border-border bg-card/60">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search alerts and notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Read Status Dropdown */}
          <select
            value={readFilter}
            onChange={(e) => setReadFilter(e.target.value as any)}
            className="h-9 rounded-md border border-input bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="Filter by read status"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            <option value="deployment">Deployments</option>
            <option value="security">Security</option>
            <option value="team">Team Activity</option>
            <option value="system">System Alerts</option>
          </select>

          {/* Severity Dropdown */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary capitalize"
            aria-label="Filter by severity"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="success">Success</option>
          </select>

          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground"
              title="Reset all filters"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Notifications Feed */}
      <div className="rounded-xl border border-border bg-card shadow-sm divide-y divide-border overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Bell className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-base">No Notifications</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {isFiltered
                ? 'No notifications match the selected search and filter criteria.'
                : "You're all caught up! No notifications found."}
            </p>
            {isFiltered && (
              <Button size="sm" variant="outline" onClick={resetFilters} className="text-xs">
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                notif.is_read ? 'bg-card hover:bg-muted/30' : 'bg-primary/[0.03] hover:bg-primary/[0.06]'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="shrink-0 mt-0.5">{getSeverityIcon(notif.severity)}</div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`text-sm tracking-tight truncate ${notif.is_read ? 'font-medium' : 'font-semibold text-foreground'}`}>
                      {notif.title}
                    </h3>
                    {notif.category && (
                      <Badge variant="outline" className="text-[10px] uppercase font-mono px-1.5 py-0">
                        {notif.category}
                      </Badge>
                    )}
                    {!notif.is_read && (
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground">
                    <span>
                      {notif.created_at ? new Date(notif.created_at).toLocaleString() : 'Recent'}
                    </span>
                    {notif.link_url && (
                      <Link
                        href={notif.link_url}
                        onClick={() => handleMarkSingleRead(notif.id)}
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        View details
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {!notif.is_read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkSingleRead(notif.id)}
                  className="h-8 text-xs shrink-0 text-muted-foreground hover:text-foreground"
                >
                  Mark read
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
