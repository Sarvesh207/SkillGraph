import React, { useEffect, useState } from 'react';
import { useActiveCandidate } from '../hooks/useActiveCandidate';
import { api } from '../services/api';
import type { Skill } from '../types';
import { Award, Layers, TrendingUp, AlertCircle } from 'lucide-react';

interface SkillStats extends Skill {
  jobPercentage: number;
  jobCount: number;
}

export const Skills: React.FC = () => {
  const { activeCandidateId } = useActiveCandidate();
  
  const [skillStats, setSkillStats] = useState<SkillStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSkillMetrics = async () => {
      if (!activeCandidateId) return;
      setLoading(true);
      setError(null);
      try {
        const [candidateSkills, allJobs] = await Promise.all([
          api.getCandidateSkills(activeCandidateId),
          api.getJobs()
        ]);
        


        // Calculate how many jobs require each of the candidate's skills
        const totalJobs = allJobs.length || 1;
        const stats = candidateSkills.map(skill => {
          const matchingJobs = allJobs.filter(item => 
            item.skills.some(s => s.name.toLowerCase() === skill.name.toLowerCase())
          );
          const jobCount = matchingJobs.length;
          const jobPercentage = Math.round((jobCount / totalJobs) * 100);

          return {
            ...skill,
            jobCount,
            jobPercentage
          };
        });

        // Sort stats by job percentage descending
        setSkillStats(stats.sort((a, b) => b.jobPercentage - a.jobPercentage));
      } catch (err: any) {
        console.error('Error fetching skill metrics:', err);
        setError(err.code === 'DATABASE_UNAVAILABLE'
          ? 'The graph database is offline.'
          : 'Failed to retrieve skill metrics.');
      } finally {
        setLoading(false);
      }
    };

    loadSkillMetrics();
  }, [activeCandidateId]);

  if (loading) {
    return <SkillsSkeleton />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <div className="bg-error/15 border border-error/30 p-8 rounded-2xl max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Skills</h2>
          <p className="text-zinc-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Group skills by category
  const categories: Record<string, SkillStats[]> = {};
  skillStats.forEach(stat => {
    const cat = stat.category || 'Core Skills';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(stat);
  });

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Award className="h-6 w-6 text-violet-400" />
          Skills Directory
        </h1>
        <p className="text-zinc-500 text-xs mt-1">
          Explore your skill profile and check demand popularity metrics calculated from real job connections.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category list panels */}
        <div className="lg:col-span-2 space-y-8">
          {Object.entries(categories).map(([category, items]) => (
            <div key={category} className="glass-card p-6 rounded-2xl border border-border space-y-4">
              <h3 className="text-sm font-bold text-violet-300 flex items-center gap-2">
                <Layers className="h-4 w-4" /> {category}
              </h3>
              
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-white">{item.name}</span>
                      <span className="text-zinc-400 font-medium">
                        {item.jobCount} connected {item.jobCount === 1 ? 'job' : 'jobs'} ({item.jobPercentage}%)
                      </span>
                    </div>
                    {/* Custom progress bar */}
                    <div className="h-2 w-full bg-zinc-900 border border-border rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-500" 
                        style={{ width: `${item.jobPercentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {Object.keys(categories).length === 0 && (
            <div className="glass-card p-8 rounded-2xl border border-border text-center">
              <p className="text-sm text-zinc-500 italic">No skills registered for candidate profile.</p>
            </div>
          )}
        </div>

        {/* Analytics Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-border space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-violet-400" />
              Skill Market Insights
            </h3>
            
            <p className="text-xs text-zinc-400 leading-relaxed">
              Based on the current listings in the database, skills in **Frontend** and **Backend** development show the highest demand connection counts.
            </p>

            <div className="pt-4 border-t border-border/30 space-y-3">
              <h4 className="text-xs font-bold text-zinc-300">Top In-Demand Skills</h4>
              {skillStats.slice(0, 4).map(item => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">{item.name}</span>
                  <span className="font-bold text-violet-400">{item.jobPercentage}% demand</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton Screen
const SkillsSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-zinc-900 rounded" />
        <div className="h-4 w-96 bg-zinc-900 rounded" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-48 bg-zinc-900 rounded-2xl border border-border" />
          <div className="h-48 bg-zinc-900 rounded-2xl border border-border" />
        </div>
        <div className="h-64 bg-zinc-900 rounded-2xl border border-border" />
      </div>
    </div>
  );
};
export default Skills;
