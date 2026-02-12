
import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { parseResume } from '../services/geminiService';
import { ResumeData } from '../types';

interface ResumeUploadProps {
  onParsed: (data: ResumeData) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onParsed }) => {
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setError(null);

    try {
      // For MVP, we extract text from file. In a real app, use a PDF library.
      // Here we read as text for simplicity or simulate it.
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        try {
          const data = await parseResume(text);
          onParsed(data);
        } catch (err) {
          setError("Failed to analyze resume. Please ensure it's a clear text file.");
          setIsParsing(false);
        }
      };
      reader.readAsText(file);
    } catch (err) {
      setError("Error reading file.");
      setIsParsing(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-8 bg-[#111] border border-white/10 rounded-2xl shadow-2xl">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center">
          <Upload className="w-8 h-8 text-blue-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Upload Your Resume</h2>
          <p className="text-gray-400 mt-2">Upload your resume (TXT format for now) to start the interview process.</p>
        </div>

        <label className="w-full relative group cursor-pointer">
          <input 
            type="file" 
            className="hidden" 
            accept=".txt,.pdf" 
            onChange={handleFileUpload}
            disabled={isParsing}
          />
          <div className={`w-full py-12 border-2 border-dashed rounded-xl transition-all ${isParsing ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10 group-hover:border-blue-500/50 group-hover:bg-blue-500/5'}`}>
            {isParsing ? (
              <div className="flex flex-col items-center space-y-3">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <span className="text-blue-400 font-medium">Extracting professional data...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <FileText className="w-10 h-10 text-gray-500 group-hover:text-blue-500 transition-colors" />
                <span className="text-gray-400 group-hover:text-gray-200">Click to select or drag and drop</span>
                <span className="text-xs text-gray-600">PDF, TXT accepted</span>
              </div>
            )}
          </div>
        </label>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span>Privacy Guaranteed • Data used only for assessment</span>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
