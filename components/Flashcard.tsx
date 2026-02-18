import React, { useState, useEffect } from 'react';
import { Word } from '../types';
import { RefreshCw, Check, X, Sparkles, Volume2 } from 'lucide-react';
import { generateExampleSentence } from '../services/geminiService';

interface FlashcardProps {
  word: Word;
  isMastered: boolean;
  onToggleStatus: (wordId: string, mastered: boolean) => void;
  colorTheme: string;
}

export const Flashcard: React.FC<FlashcardProps> = ({ word, isMastered, onToggleStatus, colorTheme }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [example, setExample] = useState<{ sentence: string; pinyin: string; translation: string } | null>(null);
  const [loadingExample, setLoadingExample] = useState(false);

  // Reset state when word changes
  useEffect(() => {
    setIsFlipped(false);
    setExample(null);
    setLoadingExample(false);
  }, [word]);

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(word.char);
    utterance.lang = 'zh-CN';
    window.speechSynthesis.speak(utterance);
  };

  const fetchExample = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (example || loadingExample) return;
    
    setLoadingExample(true);
    const result = await generateExampleSentence(word);
    setExample(result);
    setLoadingExample(false);
  };

  const statusColor = isMastered ? 'text-green-600 bg-green-50 border-green-200' : 'text-slate-500 bg-slate-50 border-slate-200';

  return (
    <div className="w-full max-w-lg mx-auto perspective-1000 h-[500px]">
      <div 
        className={`relative w-full h-full transition-all duration-500 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
        onClick={handleFlip}
      >
        {/* Front of Card */}
        <div className="absolute inset-0 w-full h-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 flex flex-col items-center justify-center backface-hidden">
            <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-semibold border ${statusColor} flex items-center gap-1`}>
              {isMastered ? <><Check className="w-3 h-3" /> Mastered</> : 'Learning'}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
              <h1 className="text-8xl font-serif mb-6 text-slate-800">{word.char}</h1>
              <p className="text-xl text-slate-400 font-light">Click to reveal</p>
            </div>
            
            <div className="w-full text-center text-xs text-slate-300 uppercase tracking-widest mt-auto">
              HSK Level {word.level}
            </div>
        </div>

        {/* Back of Card */}
        <div className="absolute inset-0 w-full h-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 flex flex-col rotate-y-180 backface-hidden">
          <div className="text-center pb-6 border-b border-slate-100">
            <h2 className="text-4xl font-serif text-slate-800 mb-2">{word.char}</h2>
            <div className="flex items-center justify-center gap-2 mb-1">
              <p className={`text-2xl font-medium ${colorTheme}`}>{word.pinyin}</p>
              <button 
                onClick={handlePlayAudio}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                title="Listen"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-500 italic">{word.en}</p>
          </div>

          <div className="flex-1 py-6 flex flex-col items-center justify-center overflow-y-auto">
            {example ? (
              <div className="bg-slate-50 p-4 rounded-lg text-center w-full relative group">
                 <button 
                   onClick={(e) => { e.stopPropagation(); const u = new SpeechSynthesisUtterance(example.sentence); u.lang = 'zh-CN'; window.speechSynthesis.speak(u); }}
                   className="absolute top-2 right-2 p-1.5 rounded-full text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-all"
                 >
                   <Volume2 className="w-4 h-4" />
                 </button>
                 <p className="text-lg text-slate-800 font-serif mb-1">{example.sentence}</p>
                 <p className="text-sm text-slate-500 mb-2">{example.pinyin}</p>
                 <p className="text-sm text-slate-400 italic">"{example.translation}"</p>
              </div>
            ) : (
              <div className="text-center">
                {loadingExample ? (
                  <div className="flex flex-col items-center gap-2 text-slate-400 animate-pulse">
                    <Sparkles className="w-6 h-6" />
                    <span className="text-sm">Creating example with AI...</span>
                  </div>
                ) : (
                  <button 
                    onClick={fetchExample}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium hover:bg-indigo-100 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate AI Example
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-auto pt-4 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
             <button 
               onClick={() => onToggleStatus(word.id, false)}
               className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition-colors
                 ${!isMastered ? 'bg-red-50 border-red-200 text-red-600' : 'border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600'}
               `}
             >
               <X className="w-5 h-5" /> Still Learning
             </button>
             <button 
               onClick={() => onToggleStatus(word.id, true)}
               className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition-colors
                 ${isMastered ? 'bg-green-50 border-green-200 text-green-600' : 'border-slate-200 text-slate-400 hover:border-green-200 hover:bg-green-50 hover:text-green-600'}
               `}
             >
               <Check className="w-5 h-5" /> Mastered
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};