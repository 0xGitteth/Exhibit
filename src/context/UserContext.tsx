import React, { createContext, useContext } from 'react';

type CurrentUser = {
  email?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  roles?: string[];
  instagram?: string;
  show_sensitive_content?: boolean;
};

type CurrentUserContextValue = {
  user: CurrentUser | null;
  setUser: React.Dispatch<React.SetStateAction<CurrentUser | null>>;
};

const noop = () => undefined;

const CurrentUserContext = createContext<CurrentUserContextValue | undefined>(undefined);

type ProviderProps = CurrentUserContextValue & { children: React.ReactNode };

export function CurrentUserProvider({ children, user, setUser }: ProviderProps) {
  return (
    <CurrentUserContext.Provider value={{ user, setUser }}>{children}</CurrentUserContext.Provider>
  );
}

export function useCurrentUser(): CurrentUserContextValue {
  const context = useContext(CurrentUserContext);
  if (!context) {
    return { user: null, setUser: noop };
  }
  return context;
}

export default CurrentUserContext;
