import React from 'react';
import { FiLoader } from 'react-icons/fi';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ size = 'md', text, fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        <div className={`${sizeClasses[size]} animate-spin`}>
          <FiLoader className="w-full h-full text-primary" />
        </div>
        <div className={`absolute inset-0 ${sizeClasses[size]} animate-ping opacity-30`}>
          <div className="w-full h-full rounded-full bg-primary" />
        </div>
      </div>
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;
