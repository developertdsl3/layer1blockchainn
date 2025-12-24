import React, { createContext, useState, useContext } from 'react';

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  // Mock API connection - always connected for UI preview
  const [isConnected] = useState(true);
  const [error] = useState(null);

  return (
    <ApiContext.Provider
      value={{
        isConnected,
        error,
        api: null, // No real API
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within ApiProvider');
  }
  return context;
};
