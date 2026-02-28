import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-b from-primary to-primary/90 text-primary-foreground shadow-[0_10px_26px_-14px_hsl(var(--primary)/0.75)] hover:shadow-[0_16px_32px_-16px_hsl(var(--primary)/0.85)] hover:-translate-y-0.5',
        destructive: 'bg-destructive text-white hover:bg-destructive/90 shadow-[0_10px_24px_-16px_hsl(var(--destructive)/0.7)]',
        outline: 'border border-input/90 bg-background/80 backdrop-blur-sm hover:bg-accent/75 hover:text-accent-foreground hover:border-primary/30',
        secondary: 'bg-secondary/85 text-secondary-foreground hover:bg-secondary',
        ghost: 'hover:bg-accent/75 hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-lg px-3',
        lg: 'h-11 rounded-lg px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
));
Button.displayName = 'Button';
export { Button, buttonVariants };
