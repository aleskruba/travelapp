import React from 'react';

type ButtonProps = {
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  color: 'blue' | 'gray' | 'red';
  children: React.ReactNode;
  className?: string; // For additional custom styles if needed
  width?: string; // Accepts custom width values like '100%', '200px', etc.
};

const Button: React.FC<ButtonProps> = ({ type = 'button', onClick, color, children, className, width }) => {
  const baseStyles = 'px-4 py-2 rounded font-semibold focus:outline-none';
  
  const colorStyles = {
    blue: 'bg-blue-500 text-white hover:bg-blue-600',
    gray: 'bg-gray-500 text-white hover:bg-gray-600',
    red: 'bg-red-500 text-white hover:bg-red-600',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${colorStyles[color]} ${className}`}
      style={{ width }} // Use inline styles for custom width
    >
      {children}
    </button>
  );
};

export default Button;
