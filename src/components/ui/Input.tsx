import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: LucideIcon;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon: Icon,
  required = false,
  disabled = false,
  className = '',
  error
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`
            w-full rounded-xl border border-gray-300 bg-white/80 backdrop-blur-sm
            ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3
            text-gray-900 placeholder-gray-500
            focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none
            transition-all duration-300
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
          `}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
};