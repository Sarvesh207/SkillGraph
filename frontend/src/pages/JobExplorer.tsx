import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useActiveCandidate } from '../hooks/useActiveCandidate';
import { api } from '../services/api';
import type { Job, Company, Skill, Technology } from '../types';
import { 
  Search, Briefcase, Sparkles, Filter, 
  AlertCircle, BriefcaseIcon, ChevronRight 
} from 'lucide-react';

interface JobListItem {
  job: Job;
  company: Company | null;
  skills: Skill[];
  technologies: Technology[];
}

export const JobExplorer: React.FC = () => {
  const { activeCandidateId } = useActiveCandidate();
  
  const [candidateSkills, setCandidateSkills] = useState<Skill[]>([]);
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [search, setSearch] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedTechnology, setSelectedTechnology] = useState<string>('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');

  // Lists (derived dynamically)
  const [locations, setLocations] = useState<string[]>([]);
  const [technologies, setTechnologies] = useState<string[]>([]);

  // Load candidate skills to map matching percentages
  useEffect(() => {
    const loadSkills = async () => {
      if (!activeCandidateId) return;
      try {
        const skillsData = await api.getCandidateSkills(activeCandidateId);
        setCandidateSkills(skillsData);
      } catch (err) {
        console.error('Error fetching candidate skills:', err);
      }
    };
    loadSkills();
  }, [activeCandidateId]);

  // Load all jobs
  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getJobs({
        search,
        location: selectedLocation,
        technology: selectedTechnology,
        industry: selectedIndustry
      });
      setJobs(data);

      if (locations.length === 0) {
        setLocations(Array.from(new Set(data.map(item => item.job.location).filter(Boolean))));
      }
      if (technologies.length === 0) {
        setTechnologies(Array.from(new Set(data.flatMap(item => item.technologies.map(t => t.name)).filter(Boolean))));
      }
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      setError(err.code === 'DATABASE_UNAVAILABLE'
        ? 'The database is currently offline.'
        : 'Failed to retrieve jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [search, selectedLocation, selectedTechnology, selectedIndustry, activeCandidateId]);

  const resetFilters = () => {
    setSearch('');
    setSelectedLocation('');
    setSelectedTechnology('');
    setSelectedIndustry('');
  };

  const calculateMatch = (jobSkills: Skill[]) => {
    if (jobSkills.length === 0) return { score: 0, matched: 0, total: 0 };
    const candSkillNames = new Set(candidateSkills.map(s => s.name.toLowerCase()));
    const matched = jobSkills.filter(s => candSkillNames.has(s.name.toLowerCase())).length;
    const score = Math.round((matched / jobSkills.length) * 100);
    return { score, matched, total: jobSkills.length };
  };

  if (loading && jobs.length === 0) {
    return <JobExplorerSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-8 py-8 space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Jobs</h1>
        <p className="text-zinc-500 text-xs mt-1">
          Discover opportunities connected to your skills.
        </p>
      </div>

      {/* Advanced Filters */}
      <div className="glass-card p-4 rounded-xl border border-zinc-900 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            <Filter className="h-3 w-3" /> Filters
          </div>
          {(search || selectedLocation || selectedTechnology || selectedIndustry) && (
            <button
              onClick={resetFilters}
              className="text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          {/* Text Search */}
          <div className="relative sm:col-span-1">
            <input
              type="text"
              placeholder="Search jobs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-900 text-white text-xs rounded-lg pl-8 pr-2 py-2 outline-none focus:border-zinc-800 focus:ring-0 placeholder:text-zinc-600"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-600" />
          </div>

          {/* Location dropdown */}
          <select
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value)}
            className="bg-zinc-950 border border-zinc-900 text-zinc-300 text-xs rounded-lg px-2.5 py-2 outline-none focus:border-zinc-800 focus:ring-0 cursor-pointer"
          >
            <option value="">All Locations</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          {/* Tech dropdown */}
          <select
            value={selectedTechnology}
            onChange={e => setSelectedTechnology(e.target.value)}
            className="bg-zinc-950 border border-zinc-900 text-zinc-300 text-xs rounded-lg px-2.5 py-2 outline-none focus:border-zinc-800 focus:ring-0 cursor-pointer"
          >
            <option value="">All Technologies</option>
            {technologies.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Industry dropdown */}
          <select
            value={selectedIndustry}
            onChange={e => setSelectedIndustry(e.target.value)}
            className="bg-zinc-950 border border-zinc-900 text-zinc-300 text-xs rounded-lg px-2.5 py-2 outline-none focus:border-zinc-800 focus:ring-0 cursor-pointer"
          >
            <option value="">All Industries</option>
            <option value="FinTech">FinTech</option>
            <option value="Healthcare">Healthcare</option>
            <option value="E-commerce">E-commerce</option>
            <option value="SaaS">SaaS</option>
            <option value="EdTech">EdTech</option>
            <option value="Logistics">Logistics</option>
            <option value="Cloud Services">Cloud Services</option>
            <option value="Developer Tools">Developer Tools</option>
          </select>
        </div>
      </div>

      {/* Opportunities Header count */}
      <div className="text-zinc-500 text-xs font-semibold">
        {jobs.length} opportunities found
      </div>

      {/* Vertical Feed list */}
      {error ? (
        <div className="bg-error/15 border border-error/30 p-8 rounded-xl max-w-sm mx-auto text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-error mx-auto" />
          <h2 className="text-sm font-bold text-white">Error Loading Jobs</h2>
          <p className="text-zinc-400 text-xs">{error}</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-card p-10 rounded-xl border border-zinc-900 text-center max-w-md mx-auto space-y-3">
          <Briefcase className="h-10 w-10 text-zinc-700 mx-auto" />
          <h3 className="text-sm font-bold text-white">No matching jobs found</h3>
          <p className="text-zinc-500 text-xs leading-relaxed">
            Try adjusting your search criteria, switching active profiles, or adding skills.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(({ job, company, skills: jobSkills }) => {
            const { score, matched, total } = calculateMatch(jobSkills);
            
            // Score descriptor
            let matchLevel = 'Low match';
            let scoreColor = 'text-zinc-500';
            if (score >= 85) { matchLevel = 'Strong match'; scoreColor = 'text-emerald-400'; }
            else if (score >= 60) { matchLevel = 'Potential match'; scoreColor = 'text-blue-400'; }
            else if (score > 0) { matchLevel = 'Low match'; scoreColor = 'text-amber-400'; }

            return (
              <div
                key={job.id}
                className="glass-card p-5 rounded-2xl border border-zinc-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-violet-500/20 hover:bg-[#0c0d15] transition-all duration-300 group"
              >
                {/* Left side: Icon, Details, Chips */}
                <div className="flex gap-4 min-w-0">
                  {/* Violet circular badge */}
                  <div className="h-10 w-10 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0 mt-0.5">
                    <BriefcaseIcon className="h-4 w-4" />
                  </div>
                  
                  <div className="space-y-3 min-w-0">
                    <div className="space-y-1">
                      <h3 className="font-bold text-white text-sm leading-snug group-hover:text-violet-400 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-xs text-zinc-500 font-semibold truncate leading-tight">
                        {company?.name} • {job.location} • {job.experienceLevel}
                      </p>
                    </div>

                    {/* Skill chips */}
                    <div className="flex flex-wrap gap-1">
                      {jobSkills.map(sk => {
                        const isPossessed = candidateSkills.some(cs => cs.name.toLowerCase() === sk.name.toLowerCase());
                        return (
                          <span
                            key={sk.id}
                            className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              isPossessed
                                ? 'bg-violet-500/10 border border-violet-500/20 text-violet-300'
                                : 'bg-zinc-950 border border-zinc-900 text-zinc-500'
                            }`}
                          >
                            {sk.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right side: Percent indicators & Link */}
                <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      {score > 0 && <Sparkles className="h-3 w-3 text-violet-400" />}
                      <span className="text-lg font-extrabold text-white leading-none font-mono">{score}%</span>
                    </div>
                    <div className={`text-[9px] font-bold ${scoreColor} uppercase mt-1`}>
                      {matchLevel}
                    </div>
                    <div className="text-[9px] text-zinc-600 mt-0.5">
                      {matched}/{total} skills matched
                    </div>
                  </div>

                  <Link
                    to={`/jobs/${job.id}`}
                    className="h-8 w-8 rounded-full bg-zinc-950 border border-zinc-900 group-hover:border-violet-500/40 group-hover:bg-violet-500/10 flex items-center justify-center text-zinc-400 group-hover:text-violet-300 transition-all"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const JobExplorerSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-32 bg-zinc-900 rounded" />
        <div className="h-4 w-64 bg-zinc-900 rounded" />
      </div>
      <div className="h-16 bg-zinc-900 rounded-xl border border-zinc-900" />
      <div className="space-y-3">
        <div className="h-28 bg-zinc-900 rounded-2xl border border-zinc-900" />
        <div className="h-28 bg-zinc-900 rounded-2xl border border-zinc-900" />
        <div className="h-28 bg-zinc-900 rounded-2xl border border-zinc-900" />
      </div>
    </div>
  );
};
export default JobExplorer;
