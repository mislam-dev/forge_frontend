'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';

export default function NotificationsPage() {
  const { toast } = useToast();
  const { data: notifications = [], isLoading } = useNotificationsList();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const [filter, setFilter] = useState<'all' | 'unread' | 'info' | 'warning' | 'error' | 'success'>('all');

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.is_read).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === 'unread') return !n.is_read;
      if (filter !== 'all') return n.severity === filter;
      return true;
    });
  }, [notifications, filter]);

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
            Build status alerts, deployment failures, and organization activity stream.
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <Filter className="h-4 w-4 text-muted-foreground mr-1 shrink-0" />
        {(['all', 'unread', 'info', 'warning', 'error', 'success'] as const).map((tab) => (
          <Button
            key={tab}
            variant={filter === tab ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(tab)}
            className="capitalize h-8 text-xs shrink-0"
          >
            {tab}
          </Button>
        ))}
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
              {filter === 'unread'
                ? "You're all caught up! No unread notifications found."
                : 'No notifications match the selected category filter.'}
            </p>
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
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm tracking-tight truncate ${notif.is_read ? 'font-medium' : 'font-semibold text-foreground'}`}>
                      {notif.title}
                    </h3>
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
