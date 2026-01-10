import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';

const AuthSocialButton = ({ provider, disabled = false, onClick }) => {
  const [isLoading, setIsLoading] = useState(false);

  const getProviderIcon = () => {
    switch (provider) {
      case 'Google':
        return <FcGoogle size={20} />;
      case 'GitHub':
        return <FaGithub size={20} className="text-black dark:text-white" />;
      default:
        return null;
    }
  };

  const getProviderColors = () => {
    switch (provider) {
      case 'Google':
        return {
          bg: 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
          border: 'border-zinc-200 dark:border-zinc-700',
        };
      case 'GitHub':
        return {
          bg: 'hover:bg-zinc-900 dark:hover:bg-white/5',
          border: 'border-zinc-200 dark:border-zinc-700',
        };
      default:
        return {
          bg: 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
          border: 'border-zinc-200 dark:border-zinc-700',
        };
    }
  };

  const colors = getProviderColors();

  const handleClick = async () => {
    if (disabled || isLoading) return;
    setIsLoading(true);
    
    try {
      // Simulate OAuth flow delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (onClick) onClick();
      console.log(`${provider} auth triggered`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={disabled || isLoading}
      whileHover={!disabled && !isLoading ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      className={`flex items-center justify-center w-full h-11 border rounded-lg transition-all duration-200
        ${colors.border} ${colors.bg}
        disabled:opacity-50 disabled:cursor-not-allowed
        font-medium text-sm text-zinc-700 dark:text-zinc-200`}
    >
      {isLoading ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-4 h-4 border-2 border-zinc-400 dark:border-zinc-500 border-t-zinc-700 dark:border-t-zinc-200 rounded-full"
          />
        </>
      ) : (
        <>
          <span className="mr-2 flex items-center">{getProviderIcon()}</span>
          <span>Continue with {provider}</span>
        </>
      )}
    </motion.button>
  );
};

export default AuthSocialButton;