import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import "./App.css";
import type {Session, User} from "@supabase/supabase-js";

type AuthContextValue = {
  session: Session | undefined;
  user: User | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({children}: {children: ReactNode}){
  type SessionResponse = {session : Session};

  const url = "http://localhost:8000/auth/";
  const [session, setSession] = useState<Session>();
  useEffect(() => {
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Could not load user");
          }
  
          return response.json() as Promise<SessionResponse>;
        })
        .then((data) => {
          setSession(data.session);
        })
        .catch((err: Error) => {
          console.log(err);
        });
    }, []);
  return (
    <AuthContext.Provider
      value={{
        session: session,
        user: session?.user ?? null
      }}
      >
        {children}
      </AuthContext.Provider>
    
  );
}

export function useAuth(){
  const context = useContext(AuthContext);
  if (!context){
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}