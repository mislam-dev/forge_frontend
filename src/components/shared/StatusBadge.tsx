import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  Hammer,
  Loader2,
  PlayCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { DeploymentStatus } from '@/lib/api/types';

interface StatusBadgeProps {
  status: DeploymentStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  switch (status) {
    case 'Queued':
      return (
        <Badge
          variant="outline"
          className={`bg-slate-500/10 text-slate-400 border-slate-500/20 gap-1.5 ${className || ''}`}
        >
          <Clock className="w-3.5 h-3.5" />
          Queued
        </Badge>
      );
    case 'Building':
      return (
        <Badge
          variant="outline"
          className={`bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1.5 ${className || ''}`}
        >
          <Hammer className="w-3.5 h-3.5 animate-bounce" />
          Building
        </Badge>
      );
    case 'Deploying':
      return (
        <Badge
          variant="outline"
          className={`bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1.5 ${className || ''}`}
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Deploying
        </Badge>
      );
    case 'Running':
      return (
        <Badge
          variant="outline"
          className={`bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5 ${className || ''}`}
        >
          <PlayCircle className="w-3.5 h-3.5 text-emerald-500" />
          Running
        </Badge>
      );
    case 'Success':
      return (
        <Badge
          variant="outline"
          className={`bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5 ${className || ''}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Success
        </Badge>
      );
    case 'Failed':
      return (
        <Badge
          variant="outline"
          className={`bg-rose-500/10 text-rose-500 border-rose-500/20 gap-1.5 ${className || ''}`}
        >
          <XCircle className="w-3.5 h-3.5" />
          Failed
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className={className}>
          {status}
        </Badge>
      );
  }
};
