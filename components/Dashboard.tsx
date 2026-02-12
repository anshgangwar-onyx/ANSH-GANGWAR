
import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Cell
} from 'recharts';
import { 
  CheckCircle2, AlertCircle, Target, TrendingUp, Briefcase, Award, 
  BookOpen, Compass, Download, RefreshCw
} from 'lucide-react';
import { FinalReport, ResumeData } from '../types';

interface DashboardProps {
  report: FinalReport;
  resume: ResumeData;
  onRestart: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ report, resume, onRestart }) => {
  const radarData = [
    { subject: 'Technical', A: report.overallScores.technicalKnowledge },
    { subject: 'Problem Solving', A: report.overallScores.problemSolving },
    { subject: 'Communication', A: report.overallScores.communication },
    { subject: 'Confidence', A: report.overallScores.confidence },
    { subject: 'Readiness', A: report.resumeScore },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[#111] border border-white/10 p-8 rounded-3xl flex items-center space-x-8">
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * report.overallScores.technicalKnowledge / 100)} className="text-blue-500" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">{report.overallScores.technicalKnowledge}</span>
              <span className="text-[10px] uppercase tracking-tighter text-gray-500">Score</span>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analysis for {resume.name}</h1>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${report.hiringRecommendation.includes('Strong') ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {report.hiringRecommendation}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400 text-sm">{resume.seniority} {resume.domain}</span>
            </div>
            <p className="mt-4 text-gray-400 text-sm leading-relaxed max-w-lg">{report.industryReadiness}</p>
          </div>
        </div>

        <div className="bg-blue-600 p-8 rounded-3xl text-white flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <Award className="w-10 h-10" />
            <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-2 py-1 rounded">ATS Rank</span>
          </div>
          <div>
            <div className="text-5xl font-black mb-1">{report.resumeScore}%</div>
            <div className="text-blue-100 font-medium">{report.atsCompatibility} Compatibility</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Skill Visualization */}
        <div className="bg-[#111] border border-white/10 p-8 rounded-3xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-500" />
            <span>Core Competencies</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 12 }} />
                <Radar name="Candidate" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="space-y-6">
          <div className="bg-[#111] border border-white/10 p-6 rounded-2xl">
            <h4 className="text-green-400 text-sm font-bold uppercase tracking-widest mb-4 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Key Strengths</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {report.strengths.map((s, i) => (
                <span key={i} className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg text-xs font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[#111] border border-white/10 p-6 rounded-2xl">
            <h4 className="text-red-400 text-sm font-bold uppercase tracking-widest mb-4 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>Area for Growth</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {report.areasToImprove.map((s, i) => (
                <span key={i} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[#111] border border-white/10 p-6 rounded-2xl">
            <h4 className="text-blue-400 text-sm font-bold uppercase tracking-widest mb-4 flex items-center space-x-2">
              <Compass className="w-4 h-4" />
              <span>Skill Gaps Identified</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {report.skillGaps.map((s, i) => (
                <span key={i} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-lg text-xs font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Plan & Growth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#111] border border-white/10 p-8 rounded-3xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <span>3-Month Improvement Plan</span>
          </h3>
          <div className="space-y-4">
            {report.threeMonthPlan.map((step, i) => (
              <div key={i} className="flex items-start space-x-4 p-4 bg-white/5 rounded-xl border border-white/5">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                <p className="text-sm text-gray-300 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[#111] border border-white/10 p-8 rounded-3xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-orange-500" />
              <span>Recommended Path</span>
            </h3>
            <div className="space-y-4">
              {report.recommendedCertifications.map((cert, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span className="text-sm text-gray-400">{cert}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#111] border border-white/10 p-8 rounded-3xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-cyan-500" />
              <span>Matching Roles</span>
            </h3>
            <div className="flex flex-wrap gap-3">
              {report.suitableJobRoles.map((role, i) => (
                <div key={i} className="px-4 py-2 bg-cyan-500/10 rounded-full text-cyan-400 text-sm font-bold">
                  {role}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4 pt-12 pb-24">
        <button className="flex items-center space-x-2 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all">
          <Download className="w-5 h-5" />
          <span>Export PDF Report</span>
        </button>
        <button onClick={onRestart} className="flex items-center space-x-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20">
          <RefreshCw className="w-5 h-5" />
          <span>Start New Session</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
