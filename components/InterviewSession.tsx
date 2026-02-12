
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Mic, MicOff, PlayCircle, LogOut } from 'lucide-react';
import { getGeminiClient, decodeAudioData, decodeBase64, encodeBase64 } from '../services/geminiService';
import { ResumeData, VoiceState } from '../types';
import { INTERVIEW_SYSTEM_INSTRUCTION, INTERVIEWER_VOICE } from '../constants';
import { LiveServerMessage, Modality } from '@google/genai';

interface InterviewSessionProps {
  resume: ResumeData;
  onFinished: (history: {question: string, answer: string}[]) => void;
}

const InterviewSession: React.FC<InterviewSessionProps> = ({ resume, onFinished }) => {
  const [voiceState, setVoiceState] = useState<VoiceState>(VoiceState.INACTIVE);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const historyRef = useRef<{question: string, answer: string}[]>([]);
  const currentQRef = useRef<string>('');
  const currentARef = useRef<string>('');
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startSession = useCallback(async () => {
    try {
      setError(null);
      setVoiceState(VoiceState.THINKING);

      const ai = getGeminiClient();
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: INTERVIEWER_VOICE } },
          },
          systemInstruction: INTERVIEW_SYSTEM_INSTRUCTION(resume),
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setVoiceState(VoiceState.THINKING); // AI is preparing to speak

            // 1. Send initial nudge to force the AI to start speaking immediately
            sessionPromise.then(s => {
              s.sendRealtimeInput({ 
                text: "The candidate is here and ready to begin. Please introduce yourself and start the interview." 
              });
            });

            // 2. Set up microphone streaming
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBase64 = encodeBase64(new Uint8Array(int16.buffer));
              
              sessionPromise.then(s => {
                s.sendRealtimeInput({ media: { data: pcmBase64, mimeType: 'audio/pcm;rate=16000' } });
              }).catch(err => {
                console.error("Failed to send audio input", err);
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              currentQRef.current += message.serverContent.outputTranscription.text;
            } else if (message.serverContent?.inputTranscription) {
              currentARef.current += message.serverContent.inputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
              if (currentQRef.current && currentARef.current) {
                historyRef.current.push({ question: currentQRef.current, answer: currentARef.current });
                currentQRef.current = '';
                currentARef.current = '';
              }
            }

            if (message.serverContent?.modelTurn?.parts) {
              for (const part of message.serverContent.modelTurn.parts) {
                if (part.inlineData?.data) {
                  setVoiceState(VoiceState.SPEAKING);
                  const audioData = part.inlineData.data;
                  const buffer = await decodeAudioData(decodeBase64(audioData), outputCtx, 24000, 1);
                  const source = outputCtx.createBufferSource();
                  source.buffer = buffer;
                  source.connect(outputCtx.destination);
                  
                  nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                  source.start(nextStartTimeRef.current);
                  nextStartTimeRef.current += buffer.duration;
                  
                  sourcesRef.current.add(source);
                  source.onended = () => {
                    sourcesRef.current.delete(source);
                    if (sourcesRef.current.size === 0) {
                      setVoiceState(VoiceState.LISTENING);
                    }
                  };
                }
              }
            }

            if (message.serverContent?.interrupted) {
              for (const s of sourcesRef.current.values()) {
                try { s.stop(); } catch(e) {}
              }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setVoiceState(VoiceState.LISTENING);
            }
          },
          onerror: (e: any) => {
            console.error("Live session error", e);
            const msg = e.message || "Voice connection interrupted.";
            setError(msg.includes("Requested entity was not found") 
              ? "Incompatible model or project configuration." 
              : "Network error. Retrying connection...");
            setVoiceState(VoiceState.INACTIVE);
          },
          onclose: () => {
            setVoiceState(VoiceState.INACTIVE);
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to initialize interview system.");
      setVoiceState(VoiceState.INACTIVE);
    }
  }, [resume, isMuted]);

  useEffect(() => {
    return () => {
      if (sessionRef.current) sessionRef.current.close();
      if (audioContextRef.current) audioContextRef.current.close();
      if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    };
  }, []);

  const finishInterview = () => {
    if (currentQRef.current || currentARef.current) {
        historyRef.current.push({ question: currentQRef.current || 'Final Session', answer: currentARef.current || 'Completed' });
    }
    onFinished(historyRef.current);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12">
      <div className="relative">
        <div className={`w-48 h-48 rounded-full border-4 border-white/5 flex items-center justify-center transition-all duration-500 ${voiceState === VoiceState.LISTENING ? 'bg-blue-500/10 border-blue-500/30' : voiceState === VoiceState.SPEAKING ? 'bg-green-500/10 border-green-500/30' : voiceState === VoiceState.THINKING ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/5'}`}>
          <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${voiceState === VoiceState.LISTENING ? 'bg-blue-500' : voiceState === VoiceState.SPEAKING ? 'bg-green-500' : voiceState === VoiceState.THINKING ? 'bg-purple-500' : 'hidden'}`}></div>
          {voiceState === VoiceState.INACTIVE ? (
             <PlayCircle className="w-20 h-20 text-blue-500 cursor-pointer hover:scale-105 transition-transform" onClick={startSession} />
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <span className={`text-xs font-bold tracking-widest uppercase ${voiceState === VoiceState.LISTENING ? 'text-blue-400' : voiceState === VoiceState.SPEAKING ? 'text-green-400' : 'text-purple-400'}`}>
                {voiceState}
              </span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`w-1 bg-white/50 rounded-full transition-all duration-300 ${voiceState !== VoiceState.INACTIVE ? 'h-8' : 'h-2'}`} 
                       style={{ animation: (voiceState !== VoiceState.INACTIVE) ? `pulse 1s ease-in-out infinite ${i * 0.1}s` : 'none' }}></div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">
          {voiceState === VoiceState.INACTIVE ? "Ready to start?" : "Interview in progress"}
        </h2>
        <p className="text-gray-400 max-w-md">
          {voiceState === VoiceState.INACTIVE 
            ? "Your interviewer is ready. Prepare to speak naturally as if you're in a real corporate setting." 
            : "The interviewer is assessing your domain expertise and communication skills."}
        </p>
      </div>

      <div className="flex items-center space-x-6">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className={`p-4 rounded-full border transition-all ${isMuted ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>
        <button 
          onClick={finishInterview}
          className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors flex items-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>End Interview</span>
        </button>
      </div>

      {error && (
        <div className="fixed bottom-8 px-6 py-3 bg-red-500 text-white rounded-lg shadow-xl animate-bounce">
          {error}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { height: 10px; }
          50% { height: 32px; }
        }
      `}</style>
    </div>
  );
};

export default InterviewSession;
