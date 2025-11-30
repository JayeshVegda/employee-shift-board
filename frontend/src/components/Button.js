import React from 'react';

const Button = ({ children, onClick, type = 'button', variant = 'primary', disabled = false, className = '' }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors duration-200';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;

