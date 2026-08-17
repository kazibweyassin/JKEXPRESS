import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border border-navy-200 bg-white text-navy-900 hover:bg-navy-50 shadow-sm",
        accent:
          "bg-[linear-gradient(135deg,_#e80000_0%,_#ff4d4d_100%)] text-white font-semibold shadow-[0_12px_35px_-12px_rgba(232,0,0,0.55)] hover:shadow-[0_16px_42px_-12px_rgba(232,0,0,0.7)] ring-1 ring-red-200/70",
        gold: "bg-[linear-gradient(135deg,_#e80000_0%,_#ff4d4d_100%)] text-white font-semibold shadow-[0_12px_35px_-12px_rgba(232,0,0,0.55)] hover:shadow-[0_16px_42px_-12px_rgba(232,0,0,0.7)] ring-1 ring-red-200/70",
        destructive: "bg-rose-700 text-white hover:bg-rose-800",
        outline:
          "border border-slate-300 bg-white hover:bg-navy-50 text-navy-900",
        secondary: "bg-navy-50 text-navy-900 hover:bg-navy-100",
        ghost: "hover:bg-navy-50 text-slate-700",
        link: "text-navy-800 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
