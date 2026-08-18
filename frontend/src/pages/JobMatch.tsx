import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useActiveCandidate } from '../hooks/useActiveCandidate';
import { api } from '../services/api';
import type { Skill, Job, Company } from '../types';
import { 
  ArrowLeft, Check, X, Info, HelpCircle
} from 'lucide-react';

interface JobDetails {
  job: Job;
  company: Company | null;
  requiredSkills: Skill[];
  technologies: any[];
}

export const JobMatch: React.FC = () => {
  const { id: jobId } = useParams<{ id: string }>();
  const { activeCandidateId, activeCandidate } = useActiveCandidate();

  const [details, setDetails] = useState<JobDetails | null>(null);
  const [candidateSkills, setCandidateSkills] = useState<Skill[]>([]);
  const [graphNodes, setGraphNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  const loadMatchData = async () => {
    if (!jobId || !activeCandidateId) return;
    setLoading(true);
    setError(null);
    setSelectedNode(null);
    try {
      const [detailsData, skillsData, graphPath] = await Promise.all([
        api.getJobById(jobId),
        api.getCandidateSkills(activeCandidateId),
        api.getJobMatchGraph(jobId, activeCandidateId)
      ]);

      setDetails(detailsData);
      setCandidateSkills(skillsData);
      setGraphNodes(graphPath.nodes);

      // Default the detail panel to the Candidate node
      const candidateNode = graphPath.nodes.find(n => n.label === 'Candidate');
      if (candidateNode && activeCandidate) {
        setSelectedNode({
          ...candidateNode,
          properties: activeCandidate
        });
      }
    } catch (err: any) {
      console.error('Error loading match details:', err);
      setError(err.code === 'DATABASE_UNAVAILABLE'
        ? 'The graph database is currently unavailable.'
        : 'Failed to retrieve match details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatchData();
  }, [jobId, activeCandidateId]);

  if (loading) {
    return <JobMatchSkeleton />;
  }

  if (error || !details) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-error mx-auto" />
        <h2 className="text-xl font-bold text-white">Error</h2>
        <p className="text-zinc-400 text-sm">{error || 'Job details not found.'}</p>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 bg-zinc-950 border border-zinc-900 text-zinc-300 hover:text-white px-4 py-2 rounded-lg text-xs font-semibold"
        >
          <ArrowLeft className="h-4 w-4" /> Back to jobs
        </Link>
      </div>
    );
  }

  const { job, company, requiredSkills } = details;

  // Calculate matching metrics
  const candSkillNames = new Set(candidateSkills.map(s => s.name.toLowerCase()));
  const matchedSkillsCount = requiredSkills.filter(s => candSkillNames.has(s.name.toLowerCase())).length;
  const totalSkillsCount = requiredSkills.length;
  const score = totalSkillsCount > 0 ? Math.round((matchedSkillsCount / totalSkillsCount) * 100) : 0;

  // Score description strings
  let matchLevel = 'Low match';
  let matchAdvice = 'Some skill overlap, consider upskilling.';
  let textColor = 'text-amber-400';
  if (score >= 85) {
    matchLevel = 'Strong match';
    matchAdvice = 'You are a great fit for this role!';
    textColor = 'text-emerald-400';
  } else if (score >= 60) {
    matchLevel = 'Potential match';
    matchAdvice = 'Good fit, matching primary requirements.';
    textColor = 'text-blue-400';
  }

  // Circular progress math
  const circleRadius = 26;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Render connection path nodes order
  const candidateNode = graphNodes.find(n => n.label === 'Candidate');
  const skillNode = graphNodes.find(n => n.label === 'Skill');
  const jobNode = graphNodes.find(n => n.label === 'Job');
  const companyNode = graphNodes.find(n => n.label === 'Company');
  const industryNode = graphNodes.find(n => n.label === 'Industry');

  const connectionPathList = [
    { node: candidateNode, type: 'Candidate', color: 'border-violet-500 text-violet-400 bg-violet-600/10', properties: activeCandidate },
    { node: skillNode, type: 'Skill', color: 'border-emerald-500 text-emerald-400 bg-emerald-600/10', properties: skillNode?.properties },
    { node: jobNode, type: 'Job', color: 'border-blue-500 text-blue-400 bg-blue-600/10', properties: job },
    { node: companyNode, type: 'Company', color: 'border-amber-500 text-amber-400 bg-amber-600/10', properties: company },
    { node: industryNode, type: 'Industry', color: 'border-pink-500 text-pink-400 bg-pink-600/10', properties: industryNode?.properties },
  ].filter(item => item.node !== undefined);

  const handlePathNodeClick = (item: any) => {
    setSelectedNode({
      id: item.node.id,
      label: item.type,
      name: item.node.name,
      properties: item.properties || {}
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-8 py-8 space-y-8">
      {/* Back Button */}
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to jobs
      </Link>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-zinc-900">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-extrabold text-white leading-tight">{job.title}</h1>
          <p className="text-zinc-500 text-xs font-medium">
            {company?.name} • {job.location} • {job.experienceLevel} experience
          </p>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-all">
            Apply externally
          </button>
          <button className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold rounded-lg transition-all">
            Save job
          </button>
        </div>
      </div>

      {/* Big Circular Match Score Widget */}
      <div className="glass-card p-6 rounded-2xl border border-zinc-900 flex items-center gap-6">
        <div className="relative h-16 w-16 flex items-center justify-center shrink-0">
          <svg className="h-full w-full transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r={circleRadius}
              fill="transparent"
              stroke="#18181b"
              strokeWidth="4.5"
            />
            <circle
              cx="32"
              cy="32"
              r={circleRadius}
              fill="transparent"
              stroke={score >= 85 ? '#10b981' : (score >= 60 ? '#3b82f6' : '#f59e0b')}
              strokeWidth="4.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-sm font-extrabold text-white">{score}%</span>
        </div>
        <div className="space-y-1">
          <h4 className={`text-base font-extrabold ${textColor}`}>{matchLevel}</h4>
          <p className="text-zinc-400 text-xs font-medium leading-normal">{matchAdvice}</p>
        </div>
      </div>

      {/* Why This Job Matches Section */}
      <div className="glass-card p-6 rounded-2xl border border-zinc-900 space-y-4">
        <h3 className="text-sm font-bold text-white">Why this job matches</h3>
        
        <div className="grid grid-cols-2 gap-8">
          {/* Your Skills Column */}
          <div className="space-y-3">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Your skills</div>
            <div className="space-y-2">
              {requiredSkills.map(sk => {
                const hasSkill = candSkillNames.has(sk.name.toLowerCase());
                return (
                  <div key={`ys-${sk.id}`} className="flex items-center gap-2 text-xs">
                    {hasSkill ? (
                      <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : (
                      <X className="h-4 w-4 text-zinc-600 shrink-0" />
                    )}
                    <span className={hasSkill ? 'text-zinc-300 font-medium' : 'text-zinc-600'}>
                      {sk.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Job Requirements Column */}
          <div className="space-y-3">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Job requirements</div>
            <div className="space-y-2">
              {requiredSkills.map(sk => (
                <div key={`jr-${sk.id}`} className="flex items-center gap-2 text-xs">
                  <Check className="h-4 w-4 text-violet-400 shrink-0" />
                  <span className="text-zinc-300 font-medium">{sk.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-900/60 text-xs text-emerald-400 font-bold">
          {matchedSkillsCount} of {totalSkillsCount} required skills match
        </div>
      </div>

      {/* Visual Connection Path (Vertical Flow) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 glass-card p-6 rounded-2xl border border-zinc-900 space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Connection path</h3>
            <p className="text-[10px] text-zinc-500">
              Interactive relationship chain. Click on elements to inspect.
            </p>
          </div>

          <div className="pl-4 space-y-0.5 relative">
            {connectionPathList.map((item, index) => (
              <div key={item.node.id} className="relative">
                {/* Connecting Line */}
                {index < connectionPathList.length - 1 && (
                  <div className="absolute left-4 top-8 bottom-0 w-0.5 border-l-2 border-dashed border-zinc-800 -translate-x-0.5 h-8 z-0" />
                )}

                <button
                  onClick={() => handlePathNodeClick(item)}
                  className={`relative z-10 flex items-center gap-3.5 py-2 text-left group w-full rounded-lg hover:bg-zinc-900/30 px-2 -mx-2 transition-all duration-150`}
                >
                  {/* Clickable Circle Badge */}
                  <div className={`h-8 w-8 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${item.color} group-hover:scale-105 transition-transform`}>
                    {item.type[0]}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-tight group-hover:text-violet-400 transition-colors">
                      {item.node.name}
                    </div>
                    <div className="text-[10px] text-zinc-500 leading-tight mt-0.5">
                      {item.type}
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Path Inspection Details panel */}
        <div className="glass-card p-5 rounded-2xl border border-zinc-900 flex flex-col justify-between h-auto">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-zinc-950 border border-zinc-900 text-zinc-400 tracking-wider uppercase font-mono">
                  {selectedNode.label}
                </span>
                <Info className="h-4 w-4 text-zinc-600" />
              </div>
              
              <div>
                <h4 className="text-xs font-bold text-white">{selectedNode.name}</h4>
                <p className="text-[9px] text-zinc-600 mt-0.5">ID: {selectedNode.id}</p>
              </div>
              
              <div className="space-y-3 pt-2 text-[10px] border-t border-zinc-900/40">
                {Object.entries(selectedNode.properties).map(([key, val]) => {
                  if (key === 'id' || key === 'description') return null;
                  return (
                    <div key={key}>
                      <span className="text-zinc-600 block capitalize">{key}</span>
                      <span className="text-zinc-400 font-medium leading-relaxed block break-words">
                        {String(val)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-zinc-600">
              <HelpCircle className="h-8 w-8 text-zinc-700 mb-2" />
              <p className="text-[10px]">Click a connection segment on the left to inspect properties.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Skeleton Screen
const JobMatchSkeleton: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6 animate-pulse">
      <div className="h-4 w-24 bg-zinc-900 rounded" />
      <div className="h-16 bg-zinc-900 rounded-2xl border border-zinc-900" />
      <div className="h-20 bg-zinc-900 rounded-2xl border border-zinc-900" />
      <div className="h-48 bg-zinc-900 rounded-2xl border border-zinc-900" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 h-48 bg-zinc-900 rounded-2xl border border-zinc-900" />
        <div className="h-48 bg-zinc-900 rounded-2xl border border-zinc-900" />
      </div>
    </div>
  );
};

const AlertCircle: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);
export default JobMatch;
