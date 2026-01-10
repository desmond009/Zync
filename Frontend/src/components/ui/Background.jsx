import React from 'react';

const Background = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800"></div>

      {/* Abstract shapes */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
      <div className="absolute top-1/4 right-20 w-24 h-24 bg-purple-300/10 rounded-full blur-lg"></div>
      <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-blue-300/8 rounded-full blur-2xl"></div>
      <div className="absolute bottom-1/3 right-10 w-28 h-28 bg-indigo-300/6 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 left-1/3 w-20 h-20 bg-purple-400/5 rounded-full blur-lg"></div>
      <div className="absolute top-3/4 right-1/3 w-36 h-36 bg-blue-400/7 rounded-full blur-2xl"></div>
    </div>
  );
};

export default Background;