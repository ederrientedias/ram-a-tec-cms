import { cn } from '@/lib/utils';
import * as React from 'react';


export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-rz-beige bg-rz-white px-3 py-2 text-sm font-sans font-light ring-offset-background placeholder:text-rz-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rz-gold/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
