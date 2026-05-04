import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="checkbox"
        className={`accent-primary cursor-pointer ${className}`}
        {...props}
      />
    );
  },
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
