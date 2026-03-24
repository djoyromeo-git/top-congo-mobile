import React from 'react';

const HomeLoadingContext = React.createContext(false);

type HomeLoadingProviderProps = {
  value: boolean;
  children: React.ReactNode;
};

export function HomeLoadingProvider({ value, children }: HomeLoadingProviderProps) {
  return <HomeLoadingContext.Provider value={value}>{children}</HomeLoadingContext.Provider>;
}

export function useHomeLoading() {
  return React.useContext(HomeLoadingContext);
}
