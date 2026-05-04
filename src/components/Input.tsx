import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

type InputSize = 'sm' | 'md';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  inputSize?: InputSize;
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'px-2 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ inputSize = 'md', className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`border border-neutral-200 rounded-md bg-white text-neutral-700
          placeholder-neutral-400
          focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
          transition-colors
          ${sizeClasses[inputSize]} ${className}`}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';

export default Input;
