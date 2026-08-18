import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Candidate } from '../types';
import { api } from '../services/api';

interface ActiveCandidateContextType {
  candidates: Candidate[];
  activeCandidateId: string | null;
  activeCandidate: Candidate | null;
  setActiveCandidateId: (id: string) => void;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const ActiveCandidateContext = createContext<ActiveCandidateContextType | undefined>(undefined);

export const ActiveCandidateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [activeCandidateId, setActiveCandidateIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCandidates();
      setCandidates(data);
      if (data.length > 0) {
        // Retrieve last active candidate from localStorage, or default to first
        const savedId = localStorage.getItem('skillgraph_active_candidate');
        const exists = data.some(c => c.id === savedId);
        const defaultId = exists && savedId ? savedId : data[0].id;
        setActiveCandidateIdState(defaultId);
      }
    } catch (err: any) {
      console.error('Error fetching candidates:', err);
      setError(err.code === 'DATABASE_UNAVAILABLE' 
        ? 'The graph database is currently offline.' 
        : 'Failed to retrieve candidate profiles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const setActiveCandidateId = (id: string) => {
    localStorage.setItem('skillgraph_active_candidate', id);
    setActiveCandidateIdState(id);
  };

  const activeCandidate = candidates.find(c => c.id === activeCandidateId) || null;

  return (
    <ActiveCandidateContext.Provider
      value={{
        candidates,
        activeCandidateId,
        activeCandidate,
        setActiveCandidateId,
        loading,
        error,
        refetch: fetchCandidates,
      }}
    >
      {children}
    </ActiveCandidateContext.Provider>
  );
};

export const useActiveCandidate = (): ActiveCandidateContextType => {
  const context = useContext(ActiveCandidateContext);
  if (context === undefined) {
    throw new Error('useActiveCandidate must be used within an ActiveCandidateProvider');
  }
  return context;
};
