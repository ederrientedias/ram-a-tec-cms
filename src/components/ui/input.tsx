import { cn } from '@/lib/utils';
import * as React from 'react';


const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-rz-beige bg-rz-white px-3 py-2 text-base font-sans font-light ring-rz-beige file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-rz-black placeholder:text-rz-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rz-gold/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
