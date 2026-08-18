import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useActiveCandidate } from '../../hooks/useActiveCandidate';
import { api } from '../../services/api';
import { 
  Network, LayoutGrid, Briefcase, Award, 
  Settings, Search, Bell, ChevronDown, User 
} from 'lucide-react';

interface SearchResultJob {
  id: string;
  title: string;
  companyName: string;
}

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { candidates, activeCandidateId, activeCandidate, setActiveCandidateId } = useActiveCandidate();
  
  const [showCandidateDropdown, setShowCandidateDropdown] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Search metrics states
  const [allJobs, setAllJobs] = useState<SearchResultJob[]>([]);
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const [allCompanies, setAllCompanies] = useState<string[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Fetch search options on mount
  useEffect(() => {
    const fetchSearchOptions = async () => {
      try {
        const jobsData = await api.getJobs();
        const mappedJobs = jobsData.map(item => ({
          id: item.job.id,
          title: item.job.title,
          companyName: item.company?.name || 'Unknown Company'
        }));
        setAllJobs(mappedJobs);

        const uniqueSkills = Array.from(new Set(jobsData.flatMap(item => item.skills.map(s => s.name))));
        setAllSkills(uniqueSkills);

        const uniqueCompanies = Array.from(new Set(jobsData.map(item => item.company?.name).filter(Boolean))) as string[];
        setAllCompanies(uniqueCompanies);
      } catch (err) {
        console.error('Error fetching search data:', err);
      }
    };
    fetchSearchOptions();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const candidateName = activeCandidate?.name || 'Sarvesh';
  const candidateEmail = `${candidateName.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
  const initials = candidateName.split(' ').map(n => n[0]).join('');

  // Filter lists based on query
  const filteredJobs = searchQuery 
    ? allJobs.filter(j => j.title.toLowerCase().includes(searchQuery.toLowerCase()) || j.companyName.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];

  const filteredSkills = searchQuery 
    ? allSkills.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];

  const filteredCompanies = searchQuery 
    ? allCompanies.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];

  const hasResults = filteredJobs.length > 0 || filteredSkills.length > 0 || filteredCompanies.length > 0;

  return (
    <div className="h-screen overflow-hidden flex bg-[#06070a] text-foreground selection:bg-primary/30 selection:text-white">
      {/* Left Sidebar Layout */}
      <aside className="w-64 border-r border-zinc-900 bg-[#0a0b10] flex flex-col justify-between shrink-0 hidden md:flex font-sans">
        <div className="space-y-6 py-6">
          {/* Logo Branding */}
          <Link to="/" className="px-6 flex items-center space-x-2 text-violet-400 hover:text-violet-300 transition-colors">
            <Network className="h-6 w-6 stroke-[2.5]" />
            <span className="font-bold text-lg tracking-tight text-white font-mono">SkillGraph</span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1 px-3">
            <Link
              to="/"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                isActive('/')
                  ? 'bg-zinc-900 text-violet-400 border-l-2 border-violet-500 font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Overview
            </Link>
            <Link
              to="/jobs"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                isActive('/jobs')
                  ? 'bg-zinc-900 text-violet-400 border-l-2 border-violet-500 font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              <Briefcase className="h-4 w-4" />
              Jobs
            </Link>
            <Link
              to="/graph"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                isActive('/graph')
                  ? 'bg-zinc-900 text-violet-400 border-l-2 border-violet-500 font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              <Network className="h-4 w-4" />
              Graph Explorer
            </Link>
            <Link
              to="/skills"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                isActive('/skills')
                  ? 'bg-zinc-900 text-violet-400 border-l-2 border-violet-500 font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              <Award className="h-4 w-4" />
              Skills
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer settings & Profile Selector */}
        <div className="p-4 border-t border-zinc-900 space-y-4">
          <Link
            to="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>

          {/* Active Candidate Popover Selector */}
          <div className="relative">
            <button
              onClick={() => setShowCandidateDropdown(!showCandidateDropdown)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-zinc-800 transition-all text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-400 shrink-0 font-mono">
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate leading-tight">{candidateName}</div>
                  <div className="text-[10px] text-zinc-500 truncate mt-0.5">{candidateEmail}</div>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0" />
            </button>

            {showCandidateDropdown && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-zinc-950 border border-zinc-900 rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="px-3 py-2 border-b border-zinc-900 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  Switch profile
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {candidates.map(cand => (
                    <button
                      key={cand.id}
                      onClick={() => {
                        setActiveCandidateId(cand.id);
                        setShowCandidateDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-zinc-900 transition-colors ${
                        cand.id === activeCandidateId ? 'text-violet-400 font-bold bg-zinc-900/50' : 'text-zinc-300'
                      }`}
                    >
                      <User className="h-3 w-3 shrink-0" />
                      <span className="truncate">{cand.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Work Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-900 bg-[#0a0b10]/80 backdrop-filter backdrop-blur px-6 md:px-8 flex items-center justify-between gap-4 sticky top-0 z-40">
          {/* Mobile brand trigger */}
          <div className="flex items-center gap-2 md:hidden">
            <Network className="h-5 w-5 text-violet-400" />
            <span className="font-bold text-white font-mono text-sm">SkillGraph</span>
          </div>

          {/* Header Search Command bar */}
          <div className="relative max-w-md w-full hidden sm:block" ref={dropdownRef}>
            <input
              type="text"
              placeholder="Search jobs, skills, companies..."
              value={searchQuery}
              onFocus={() => setShowSearchDropdown(true)}
              onChange={e => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              className="w-full bg-zinc-950 border border-zinc-900 text-white text-xs rounded-lg pl-9 pr-8 py-2.5 outline-none focus:border-zinc-800 focus:ring-0 placeholder:text-zinc-600 font-sans"
            />
            <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-zinc-600" />
            <kbd className="absolute right-3 top-2.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500">
              ⌘K
            </kbd>

            {/* Command Search Results Dropdown Overlay */}
            {showSearchDropdown && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#090a16] border border-zinc-900 rounded-xl shadow-2xl overflow-hidden z-50 p-2 space-y-3 font-sans text-xs">
                {hasResults ? (
                  <>
                    {/* Jobs Category */}
                    {filteredJobs.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider px-2 py-1">
                          Jobs
                        </div>
                        {filteredJobs.map(job => (
                          <button
                            key={job.id}
                            onClick={() => {
                              navigate(`/jobs/${job.id}`);
                              setShowSearchDropdown(false);
                              setSearchQuery('');
                            }}
                            className="w-full text-left text-zinc-300 hover:text-white px-2 py-1.5 rounded-lg hover:bg-zinc-900 flex justify-between items-center"
                          >
                            <span>{job.title}</span>
                            <span className="text-[9px] text-zinc-500 font-mono">{job.companyName}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Skills Category */}
                    {filteredSkills.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider px-2 py-1">
                          Skills
                        </div>
                        {filteredSkills.map(sk => (
                          <button
                            key={sk}
                            onClick={() => {
                              navigate('/jobs');
                              setShowSearchDropdown(false);
                              setSearchQuery('');
                            }}
                            className="w-full text-left text-zinc-300 hover:text-white px-2 py-1.5 rounded-lg hover:bg-zinc-900"
                          >
                            {sk}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Companies Category */}
                    {filteredCompanies.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider px-2 py-1">
                          Companies
                        </div>
                        {filteredCompanies.map(comp => (
                          <button
                            key={comp}
                            onClick={() => {
                              navigate('/jobs');
                              setShowSearchDropdown(false);
                              setSearchQuery('');
                            }}
                            className="w-full text-left text-zinc-300 hover:text-white px-2 py-1.5 rounded-lg hover:bg-zinc-900"
                          >
                            {comp}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-4 text-center text-zinc-500 text-xs italic">
                    No matching categories found.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-4">
            <button className="p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors relative">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-violet-500 rounded-full" />
            </button>

            {/* Profile Avatar indicator */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-400 font-mono">
                {initials}
              </div>
              {/* Mobile Candidate toggler */}
              <div className="md:hidden">
                <select
                  value={activeCandidateId || ''}
                  onChange={e => setActiveCandidateId(e.target.value)}
                  className="bg-transparent text-white text-xs border-none outline-none font-bold"
                >
                  {candidates.map(c => (
                    <option key={c.id} value={c.id} className="bg-zinc-950 text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable workspace content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
export default DashboardLayout;
