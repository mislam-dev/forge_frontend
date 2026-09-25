'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';

interface EncryptedValueMaskerProps {
  value: string;
  maskedPlaceholder?: string;
}

export const EncryptedValueMasker: React.FC<EncryptedValueMaskerProps> = ({
  value,
  maskedPlaceholder = '••••••••••••••••',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(value);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2 font-mono text-xs bg-muted/50 p-2 rounded border border-border">
      <span className="flex-1 select-all truncate">
        {isVisible ? value : maskedPlaceholder}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => setIsVisible(!isVisible)}
        aria-label={isVisible ? 'Hide secret' : 'Show secret'}
      >
        {isVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={handleCopy}
        aria-label="Copy secret to clipboard"
      >
        {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
};
