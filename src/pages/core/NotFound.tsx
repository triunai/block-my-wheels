import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { logger } from "../../lib/utils";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    logger.warn("404 Error: User attempted to access non-existent route", {
      pathname: location.pathname,
      timestamp: new Date().toISOString()
    });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-black dark:via-gray-900 dark:to-orange-950">
      <div className="text-center">
        <div className="text-6xl mb-4">🚗💨</div>
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">Oops! This page drove away!</p>
        <a 
          href="/" 
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300 shadow-lg hover:shadow-xl"
        >
          🏠 Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
