import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      'flex h-10 w-full rounded-lg border border-input/90 bg-background/70 px-3 py-2 text-sm shadow-sm shadow-black/5 ring-offset-background backdrop-blur-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary/40 dark:shadow-black/20 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  />
));
Input.displayName = 'Input';
export { Input };
