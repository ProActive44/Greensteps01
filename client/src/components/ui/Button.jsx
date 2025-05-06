import React from 'react';

const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  className = 'cursor-pointer',
  ...props 
}) => {
  // Define base styles
  const baseStyles = "relative inline-flex items-center justify-center rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 z-50";
  
  // Define variant styles
  const variantStyles = {
    primary: "bg-gray-600 text-white hover:bg-primary-700 focus:ring-primary-500 border-2 border-primary-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400 border border-gray-300",
    outline: "bg-white text-primary-600 border-2 border-primary-600 hover:bg-primary-50 focus:ring-primary-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border-2 border-red-700",
  };
  
  // Define size styles
  const sizeStyles = {
    sm: "py-1.5 px-3 text-xs",
    md: "py-2 px-4 text-sm",
    lg: "py-2.5 px-5 text-base",
  };
  
  // Define disabled and loading styles
  const disabledStyles = "opacity-50 cursor-not-allowed";
  
  // Construct the final class string
  const classes = [
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    fullWidth ? "w-full" : "",
    (disabled || loading) ? disabledStyles : "",
    className
  ].join(" ");
  
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg
        className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        role="status"
        aria-hidden="true"
      >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      <span className={loading ? "relative z-50" : "z-50"}>{children}</span>
    </button>
  );
};

export default Button; 