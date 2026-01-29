import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm text-gray-400 mb-1">{label}</label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 
            bg-gray-700 border rounded-lg 
            text-white placeholder-gray-500 
            focus:outline-none focus:border-purple-500
            transition-colors
            ${error ? 'border-red-500' : 'border-gray-600'}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
