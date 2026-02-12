
export interface ResumeData {
  name: string;
  email: string;
  experienceYears: number;
  domain: string;
  seniority: string;
  skills: string[];
  summary: string;
}

export interface InterviewEvaluation {
  question: string;
  answer: string;
  technicalScore: number;
  clarityScore: number;
  confidenceScore: number;
  weakConcepts: string[];
}

export interface FinalReport {
  overallScores: {
    technicalKnowledge: number;
    problemSolving: number;
    communication: number;
    confidence: number;
  };
  industryReadiness: string;
  strengths: string[];
  areasToImprove: string[];
  hiringRecommendation: string;
  resumeScore: number;
  atsCompatibility: string;
  skillGaps: string[];
  threeMonthPlan: string[];
  recommendedCertifications: string[];
  suitableJobRoles: string[];
}

export enum InterviewStatus {
  IDLE = 'IDLE',
  PARSING = 'PARSING',
  INTERVIEWING = 'INTERVIEWING',
  GENERATING_REPORT = 'GENERATING_REPORT',
  COMPLETED = 'COMPLETED'
}

export enum VoiceState {
  INACTIVE = 'INACTIVE',
  LISTENING = 'LISTENING',
  SPEAKING = 'SPEAKING',
  THINKING = 'THINKING'
}
