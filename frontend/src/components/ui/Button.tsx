import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className = '', isLoading, variant = 'primary', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]",
      secondary: "bg-white/10 text-white hover:bg-white/20 backdrop-blur-md",
      outline: "border border-white/10 text-white hover:bg-white/5 backdrop-blur-md"
    };

    const sizes = "h-11 px-8 py-2 text-sm";

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes} ${className}`}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';
