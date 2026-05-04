import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`px-3 py-2 text-sm border border-neutral-200 rounded-md resize-none
          focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
          placeholder:text-neutral-400
          ${className}`}
        {...props}
      />
    );
  },
);

Textarea.displayName = 'Textarea';

export default Textarea;
