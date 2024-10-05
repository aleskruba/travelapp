import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
  };
  
  export default function Button({ className, children, ...props }: ButtonProps) {
    return (
      <button
 
        {...props}
      >
        {children}
      </button>
    );
  }