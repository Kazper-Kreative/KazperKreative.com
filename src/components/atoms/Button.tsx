"use client";

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

  const variantStyles = {
    primary: 'bg-purple-600 text-white hover:bg-purple-700 focus-visible:ring-purple-500 shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40',
    secondary: 'bg-zinc-800 text-gray-100 hover:bg-zinc-700 focus-visible:ring-zinc-500 shadow-lg shadow-zinc-800/20 hover:shadow-zinc-800/40',
    ghost: 'border border-transparent hover:bg-zinc-800 hover:border-zinc-700 hover:text-white focus-visible:ring-zinc-500',
  };

  const sizeStyles = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 py-2 text-base',
    lg: 'h-11 px-6 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
