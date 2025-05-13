import React, { createContext, useContext, useState, ReactNode } from 'react';

type TokenContextType = {
  token: string;
  setToken: (token: string) => void;
  entitlements: string;
  setEntitlements: (entitlements: string) => void;
};

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const TokenProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string>('');
  const [entitlements, setEntitlements] = useState<string>('');

  return (
    <TokenContext.Provider value={{ token, setToken, entitlements, setEntitlements }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useToken = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error('useToken debe usarse dentro de TokenProvider');
  }
  return context;
};
