import React from 'react';
import { cn } from '../../utils/cn';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  color: 'blue' | 'gray' | 'lightgray' | 'red' | 'green' |'answer';
  width?: string; // Accepts custom width values like '100%', '200px', etc.
};

const Button: React.FC<ButtonProps> = ({ color, children, className, width, ...props }) => {
  const baseStyles = 'px-4 py-2 rounded font-semibold focus:outline-none';

  const colorStyles = {
    answer:'bg-gray-300 text-gray-700 hover:bg-gray-400  focus:border-gray-500',
    blue: 'bg-blue-500 text-white hover:bg-blue-600',
    gray: 'bg-gray-500 text-white hover:bg-gray-600',
    red: 'bg-red-500 text-white hover:bg-red-600',
    green: 'bg-green-500 text-white hover:bg-green-600',
    lightgray :'bg-gray-300 text-white hover:bg-gray-200',
  }

  return (
    <button
      className={cn(baseStyles, colorStyles[color], className)}
      style={{ width }} // Use inline styles for custom width
      {...props} // Spread the rest of the button attributes
    >
      {children}
    </button>
  );
};

export default Button;
