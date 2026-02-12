
import React, { useState } from 'react';
import { Cpu, ChevronRight, LayoutDashboard, MessageSquare, UserCircle, Settings } from 'lucide-react';
import ResumeUpload from './components/ResumeUpload';
import InterviewSession from './components/InterviewSession';
import Dashboard from './components/Dashboard';
import { ResumeData, InterviewStatus, FinalReport } from './types';
import { generateFinalReport } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<InterviewStatus>(InterviewStatus.IDLE);
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [report, setReport] = useState<FinalReport | null>(null);
  const [loadingMsg, setLoadingMsg] = useState<string>('');

  const handleResumeParsed = (data: ResumeData) => {
    setResume(data);
    setStatus(InterviewStatus.INTERVIEWING);
  };

  const handleInterviewFinished = async (history: {question: string, answer: string}[]) => {
    if (!resume) return;
    setStatus(InterviewStatus.GENERATING_REPORT);
    setLoadingMsg('Analyzing interview performance and cross-referencing with resume data...');
    
    try {
      const finalReport = await generateFinalReport(resume, history);
      setReport(finalReport);
      setStatus(InterviewStatus.COMPLETED);
    } catch (err) {
      console.error(err);
      setLoadingMsg('Error generating report. Retrying...');
      // In a real app, implement retry logic
    }
  };

  const restart = () => {
    setStatus(InterviewStatus.IDLE);
    setResume(null);
    setReport(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300">
      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-0 bottom-0 w-20 hidden lg:flex flex-col items-center py-8 border-r border-white/5 bg-[#0d0d0d]">
        <div className="p-3 bg-blue-600 rounded-2xl mb-12 shadow-lg shadow-blue-500/20">
          <Cpu className="w-6 h-6 text-white" />
        </div>
        <nav className="flex flex-col space-y-8">
          <button className={`p-3 rounded-xl transition-all ${status === InterviewStatus.IDLE ? 'text-blue-500 bg-blue-500/10' : 'text-gray-600 hover:text-gray-400'}`}>
            <UserCircle className="w-6 h-6" />
          </button>
          <button className={`p-3 rounded-xl transition-all ${status === InterviewStatus.INTERVIEWING ? 'text-blue-500 bg-blue-500/10' : 'text-gray-600 hover:text-gray-400'}`}>
            <MessageSquare className="w-6 h-6" />
          </button>
          <button className={`p-3 rounded-xl transition-all ${status === InterviewStatus.COMPLETED ? 'text-blue-500 bg-blue-500/10' : 'text-gray-600 hover:text-gray-400'}`}>
            <LayoutDashboard className="w-6 h-6" />
          </button>
          <button className="p-3 text-gray-600 hover:text-gray-400">
            <Settings className="w-6 h-6" />
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="lg:pl-20 min-h-screen">
        <header className="px-8 py-6 border-b border-white/5 bg-[#0d0d0d]/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-xl font-black text-white tracking-tighter">INTERVIEW<span className="text-blue-500">IQ</span></span>
              <div className="h-4 w-[1px] bg-white/10"></div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">Enterprise v1.0</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-xs font-bold text-gray-500">
                <div className={`w-2 h-2 rounded-full ${status === InterviewStatus.IDLE ? 'bg-gray-500' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'}`}></div>
                <span>LIVE SYSTEM STATUS: {status === InterviewStatus.IDLE ? 'READY' : 'ACTIVE'}</span>
              </div>
            </div>
          </div>
        </header>

        <section className="px-6 py-12">
          {status === InterviewStatus.IDLE && (
            <div className="animate-in fade-in duration-500">
               <div className="text-center max-w-2xl mx-auto mb-16">
                  <h1 className="text-5xl font-black text-white mb-6">AI Voice-First Career Assessment</h1>
                  <p className="text-lg text-gray-400">Upload your credentials and experience an adaptive, professional interview driven by next-generation voice intelligence.</p>
               </div>
               <ResumeUpload onParsed={handleResumeParsed} />
            </div>
          )}

          {status === InterviewStatus.INTERVIEWING && resume && (
            <div className="animate-in slide-in-from-right-4 duration-500">
              <InterviewSession resume={resume} onFinished={handleInterviewFinished} />
            </div>
          )}

          {status === InterviewStatus.GENERATING_REPORT && (
             <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-white">Generating AI Intelligence Report</h2>
                  <p className="text-gray-500 max-w-sm">{loadingMsg}</p>
                </div>
             </div>
          )}

          {status === InterviewStatus.COMPLETED && report && resume && (
            <Dashboard report={report} resume={resume} onRestart={restart} />
          )}
        </section>
      </main>

      {/* Global Toast Placeholder */}
      <div id="toast-container" className="fixed bottom-0 right-0 p-8 z-[100]"></div>
    </div>
  );
};

export default App;
