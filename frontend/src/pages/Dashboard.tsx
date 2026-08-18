import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useActiveCandidate } from '../hooks/useActiveCandidate';
import { api } from '../services/api';
import type { JobRecommendation, IndirectRecommendation, Skill } from '../types';
import ReactFlow, { type Node, type Edge, Background } from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  MapPin, 
  ChevronRight, AlertCircle, RefreshCw, Sparkles 
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { activeCandidate, activeCandidateId, loading: globalLoading, error: globalError, refetch } = useActiveCandidate();
  
  const [skills, setSkills] = useState<Skill[]>([]);
  const [recommendations, setRecommendations] = useState<{
    direct: JobRecommendation[];
    indirect: IndirectRecommendation[];
  }>({ direct: [], indirect: [] });
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [miniGraph, setMiniGraph] = useState<{ nodes: Node[]; edges: Edge[] }>({ nodes: [], edges: [] });

  const loadDashboardData = async () => {
    if (!activeCandidateId) return;
    setLoading(true);
    setError(null);
    try {
      const [skillsData, recsData] = await Promise.all([
        api.getCandidateSkills(activeCandidateId),
        api.getCandidateRecommendations(activeCandidateId)
      ]);
      setSkills(skillsData);
      setRecommendations(recsData);

      // Construct a dynamic mini ego-graph for the central dashboard card
      const rfNodes: Node[] = [];
      const rfEdges: Edge[] = [];

      // 1. Center Candidate Node
      rfNodes.push({
        id: activeCandidateId,
        type: 'input',
        data: { label: activeCandidate?.name || 'Candidate' },
        position: { x: 220, y: 150 },
        style: {
          background: '#090a16',
          color: '#c084fc',
          border: '2px solid #8b5cf6',
          borderRadius: '20px',
          padding: '8px 16px',
          fontWeight: 'bold',
          fontSize: '11px',
          width: 130,
          textAlign: 'center',
          boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)'
        }
      });

      // 2. Primary Skills (Radiating Outwards)
      const primarySkills = skillsData.slice(0, 4);
      primarySkills.forEach((skill, index) => {
        // Calculate coordinates in a circle around the center (x=220, y=150)
        const angle = (index * (2 * Math.PI)) / 4;
        const radius = 100;
        const x = 220 + radius * Math.cos(angle);
        const y = 150 + radius * Math.sin(angle);

        rfNodes.push({
          id: skill.id,
          data: { label: skill.name },
          position: { x, y },
          style: {
            background: '#090a16',
            color: '#34d399',
            border: '1.5px solid #10b981',
            borderRadius: '12px',
            padding: '6px 12px',
            fontSize: '9px',
            width: 100,
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)'
          }
        });

        rfEdges.push({
          id: `e-cand-${skill.id}`,
          source: activeCandidateId,
          target: skill.id,
          animated: true,
          style: { stroke: '#3f3f46', strokeWidth: 1 }
        });
      });

      // 3. Add 1-2 Recommended Company Nodes (connected to skills/candidate)
      const topRec = recsData.direct[0];
      if (topRec && topRec.company) {
        rfNodes.push({
          id: topRec.company.id,
          type: 'output',
          data: { label: topRec.company.name },
          position: { x: 380, y: 80 },
          style: {
            background: '#090a16',
            color: '#fbbf24',
            border: '1.5px solid #f59e0b',
            borderRadius: '12px',
            padding: '6px 12px',
            fontSize: '9px',
            width: 110,
            textAlign: 'center'
          }
        });

        rfEdges.push({
          id: `e-comp-${topRec.company.id}`,
          source: activeCandidateId,
          target: topRec.company.id,
          style: { stroke: '#f59e0b', strokeWidth: 1, strokeDasharray: '4 4' }
        });
      }

      setMiniGraph({ nodes: rfNodes, edges: rfEdges });
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError(err.code === 'DATABASE_UNAVAILABLE'
        ? 'The database is currently offline.'
        : 'Failed to load recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [activeCandidateId]);

  // Derived stats
  const skillCount = skills.length;
  const directMatchCount = recommendations.direct.length;
  const uniqueCompanies = new Set(
    [...recommendations.direct, ...recommendations.indirect]
      .map(r => r.company?.id)
      .filter(Boolean)
  ).size;
  const uniqueTechnologies = new Set(
    recommendations.indirect.flatMap(r => r.relatedTechnologies.map(t => t.id))
  ).size;

  if (globalLoading || (loading && !globalError)) {
    return <DashboardSkeleton />;
  }

  const activeError = globalError || error;

  if (activeError) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="bg-error/15 border border-error/30 p-8 rounded-2xl max-w-md text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-error mx-auto" />
          <h2 className="text-xl font-bold text-white">Connection Problem</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">{activeError}</p>
          <button
            onClick={() => {
              refetch();
              loadDashboardData();
            }}
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 space-y-8">
      {/* Greetings Block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1.5">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Good evening, {activeCandidate?.name.split(' ')[0]} 👋
          </h1>
          <p className="text-zinc-500 text-xs md:text-sm font-medium">
            Explore opportunities through your professional skill graph.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to="/jobs"
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-violet-900/30"
          >
            Explore jobs
          </Link>
          <Link
            to="/graph"
            className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold rounded-lg transition-all"
          >
            Open graph
          </Link>
        </div>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-zinc-900 flex flex-col justify-between">
          <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Skills</span>
          <div className="text-3xl font-extrabold text-white font-mono mt-3">{skillCount}</div>
          <span className="text-emerald-400 text-[10px] font-bold mt-2 inline-flex items-center gap-1">
            +3 this week
          </span>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-zinc-900 flex flex-col justify-between">
          <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Matching Jobs</span>
          <div className="text-3xl font-extrabold text-white font-mono mt-3">{directMatchCount}</div>
          <span className="text-zinc-400 text-[10px] font-semibold mt-2">
            85% avg match
          </span>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-zinc-900 flex flex-col justify-between">
          <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Technologies</span>
          <div className="text-3xl font-extrabold text-white font-mono mt-3">{uniqueTechnologies}</div>
          <span className="text-zinc-500 text-[10px] font-semibold mt-2">Connected</span>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-zinc-900 flex flex-col justify-between">
          <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Companies</span>
          <div className="text-3xl font-extrabold text-white font-mono mt-3">{uniqueCompanies}</div>
          <span className="text-zinc-500 text-[10px] font-semibold mt-2">Connected</span>
        </div>
      </div>

      {/* Your Skill Graph widget */}
      <div className="glass-card p-6 rounded-2xl border border-zinc-900 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">Your Skill Graph</h3>
          <Link
            to="/graph"
            className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
          >
            View full graph
          </Link>
        </div>

        {/* Live Mini Graph WorkSpace */}
        <div className="h-64 bg-zinc-950/60 border border-zinc-900 rounded-xl overflow-hidden relative">
          <ReactFlow
            nodes={miniGraph.nodes}
            edges={miniGraph.edges}
            fitView
            zoomOnScroll={false}
            zoomOnPinch={false}
            panOnDrag={false}
            preventScrolling={true}
            nodesDraggable={false}
            nodesConnectable={false}
            attributionPosition="bottom-left"
          >
            <Background color="#18181b" gap={14} size={1} />
          </ReactFlow>
        </div>
      </div>

      {/* Recommended Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-violet-400" />
            Recommended for you
          </h3>
          <Link
            to="/jobs"
            className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors inline-flex items-center"
          >
            View all jobs <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.direct.slice(0, 3).map(rec => {
            const circleRadius = 16;
            const circumference = 2 * Math.PI * circleRadius;
            const strokeDashoffset = circumference - (rec.matchScore / 100) * circumference;

            return (
              <div
                key={rec.job.id}
                className="glass-card p-5 rounded-2xl border border-zinc-900 flex flex-col justify-between hover:border-violet-500/20 hover:bg-[#0c0d15] transition-all duration-300 group"
              >
                <div className="space-y-4">
                  {/* Card Header with circular SVG progress match */}
                  <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-sm leading-snug group-hover:text-violet-400 transition-colors">
                        {rec.job.title}
                      </h4>
                      <p className="text-xs text-zinc-500 font-semibold">{rec.company?.name}</p>
                    </div>

                    {/* Circular Score Badge */}
                    <div className="relative h-10 w-10 flex items-center justify-center shrink-0">
                      <svg className="h-full w-full transform -rotate-90">
                        <circle
                          cx="20"
                          cy="20"
                          r={circleRadius}
                          fill="transparent"
                          stroke="#18181b"
                          strokeWidth="3.5"
                        />
                        <circle
                          cx="20"
                          cy="20"
                          r={circleRadius}
                          fill="transparent"
                          stroke="#8b5cf6"
                          strokeWidth="3.5"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-[9px] font-extrabold text-white">{rec.matchScore}%</span>
                    </div>
                  </div>

                  {/* Location Info */}
                  <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium">
                    <MapPin className="h-3 w-3" />
                    <span>{rec.job.location} • {rec.job.experienceLevel}</span>
                  </div>

                  {/* matching skills list */}
                  <div className="flex flex-wrap gap-1">
                    {skills.slice(0, 3).map(sk => (
                      <span
                        key={sk.id}
                        className="px-2 py-0.5 rounded bg-violet-500/5 border border-violet-500/10 text-violet-400 text-[9px] font-bold"
                      >
                        {sk.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-zinc-900/60 flex justify-between items-center text-[10px] text-zinc-500">
                  <span>{rec.matchedSkills} of {rec.totalSkills} skills matched</span>
                  <Link
                    to={`/jobs/${rec.job.id}`}
                    className="font-bold text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-0.5 group/link"
                  >
                    View match
                    <ChevronRight className="h-3 w-3 transform group-hover/link:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-zinc-900 rounded" />
        <div className="h-4 w-72 bg-zinc-900 rounded" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="h-24 bg-zinc-900 rounded-2xl border border-zinc-900" />
        <div className="h-24 bg-zinc-900 rounded-2xl border border-zinc-900" />
        <div className="h-24 bg-zinc-900 rounded-2xl border border-zinc-900" />
        <div className="h-24 bg-zinc-900 rounded-2xl border border-zinc-900" />
      </div>
      <div className="h-64 bg-zinc-900 rounded-2xl border border-zinc-900" />
      <div className="space-y-4">
        <div className="h-6 w-32 bg-zinc-900 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-44 bg-zinc-900 rounded-2xl border border-zinc-900" />
          <div className="h-44 bg-zinc-900 rounded-2xl border border-zinc-900" />
          <div className="h-44 bg-zinc-900 rounded-2xl border border-zinc-900" />
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
