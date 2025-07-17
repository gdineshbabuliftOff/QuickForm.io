import Link from 'next/link';
import React from 'react';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-gray-200 p-4 text-center">
      <h1 className="text-6xl font-bold text-indigo-500 mb-4">404</h1>
      <h2 className="text-3xl font-semibold text-white mb-3">Page Not Found</h2>
      <p className="text-lg text-gray-400 mb-8 max-w-md">
        Oops! The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/dashboard" className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-500 transition-colors duration-200">
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
