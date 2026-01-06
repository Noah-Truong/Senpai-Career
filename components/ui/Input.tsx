"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode, forwardRef } from "react";

// Input Component
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  fullWidth = true,
  className = "",
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseInputStyles = "px-4 py-2 text-gray-900 bg-white border rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-0 focus:border-accent";
  const errorStyles = error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300";
  const widthStyles = fullWidth ? "w-full" : "";
  const iconPaddingLeft = leftIcon ? "pl-10" : "";
  const iconPaddingRight = rightIcon ? "pr-10" : "";
  
  const combinedStyles = `${baseInputStyles} ${errorStyles} ${widthStyles} ${iconPaddingLeft} ${iconPaddingRight} ${className}`;
  
  return (
    <div className={fullWidth ? "w-full" : ""}>
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium mb-1"
          style={{ color: '#374151' }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={combinedStyles}
          style={{
            borderColor: error ? '#DC2626' : '#D1D5DB',
            color: '#111827',
          }}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1 text-sm text-gray-500">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = "Input";

// Textarea Component
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  hint,
  fullWidth = true,
  className = "",
  id,
  rows = 4,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseStyles = "px-4 py-2 text-gray-900 bg-white border rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-0 focus:border-accent resize-y";
  const errorStyles = error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300";
  const widthStyles = fullWidth ? "w-full" : "";
  
  const combinedStyles = `${baseStyles} ${errorStyles} ${widthStyles} ${className}`;
  
  return (
    <div className={fullWidth ? "w-full" : ""}>
      {label && (
        <label 
          htmlFor={textareaId} 
          className="block text-sm font-medium mb-1"
          style={{ color: '#374151' }}
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={combinedStyles}
        style={{
          borderColor: error ? '#DC2626' : '#D1D5DB',
          color: '#111827',
        }}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1 text-sm text-gray-500">{hint}</p>
      )}
    </div>
  );
});

Textarea.displayName = "Textarea";

// Select Component
interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<InputHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  fullWidth?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  hint,
  options,
  fullWidth = true,
  className = "",
  id,
  placeholder,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseStyles = "px-4 py-2 text-gray-900 bg-white border rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-0 focus:border-accent appearance-none cursor-pointer";
  const errorStyles = error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300";
  const widthStyles = fullWidth ? "w-full" : "";
  
  const combinedStyles = `${baseStyles} ${errorStyles} ${widthStyles} ${className}`;
  
  return (
    <div className={fullWidth ? "w-full" : ""}>
      {label && (
        <label 
          htmlFor={selectId} 
          className="block text-sm font-medium mb-1"
          style={{ color: '#374151' }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={combinedStyles}
          style={{
            borderColor: error ? '#DC2626' : '#D1D5DB',
            color: '#111827',
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1 text-sm text-gray-500">{hint}</p>
      )}
    </div>
  );
});

Select.displayName = "Select";

// Checkbox Component
interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  description,
  className = "",
  id,
  ...props
}, ref) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="flex items-start">
      <input
        ref={ref}
        type="checkbox"
        id={checkboxId}
        className={`mt-1 h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent cursor-pointer ${className}`}
        style={{ accentColor: '#2563EB' }}
        {...props}
      />
      <div className="ml-3">
        <label 
          htmlFor={checkboxId} 
          className="text-sm font-medium cursor-pointer"
          style={{ color: '#374151' }}
        >
          {label}
        </label>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
    </div>
  );
});

Checkbox.displayName = "Checkbox";

export default Input;

