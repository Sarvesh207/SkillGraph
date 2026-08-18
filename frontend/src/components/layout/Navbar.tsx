import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useActiveCandidate } from '../../hooks/useActiveCandidate';
import { Briefcase, Network, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { candidates, activeCandidateId, setActiveCandidateId, loading } = useActiveCandidate();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="glass border-b border-border sticky top-0 z-50 px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-2 text-violet-400 hover:text-violet-300 transition-colors">
          <Network className="h-6 w-6 stroke-[2.5]" />
          <span className="font-bold text-lg tracking-tight text-white font-mono">SkillGraph</span>
        </Link>

        {/* Links */}
        <div className="flex items-center space-x-1 md:space-x-4">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
              isActive('/')
                ? 'bg-primary/20 text-violet-300 border border-primary/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/jobs"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
              isActive('/jobs')
                ? 'bg-primary/20 text-violet-300 border border-primary/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Briefcase className="h-4 w-4" />
              Jobs
            </span>
          </Link>
          <Link
            to="/graph"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
              isActive('/graph')
                ? 'bg-primary/20 text-violet-300 border border-primary/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Network className="h-4 w-4" />
              Graph Explorer
            </span>
          </Link>
        </div>

        {/* Profile/Candidate Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-zinc-500 hidden sm:inline">Active Candidate:</span>
          {loading ? (
            <div className="h-9 w-40 bg-zinc-800 rounded animate-pulse" />
          ) : (
            <div className="relative">
              <select
                value={activeCandidateId || ''}
                onChange={e => setActiveCandidateId(e.target.value)}
                className="bg-zinc-900 border border-border text-white text-sm rounded-md px-3 py-1.5 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 cursor-pointer pr-8 appearance-none font-medium"
              >
                {candidates.map(cand => (
                  <option key={cand.id} value={cand.id} className="bg-zinc-900 text-white">
                    {cand.name} ({cand.experience})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-zinc-400">
                <User className="h-4 w-4" />
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
