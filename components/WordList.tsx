import React, { useState, useMemo } from 'react';
import { Word, HSKLevel, Difficulty } from '../types';
import { CheckCircle2, Circle, Search, Volume2, Filter, Layers } from 'lucide-react';

interface WordListProps {
  words: Word[];
  masteredIds: Set<string>;
  onSelectWord: (word: Word) => void;
  selectedWordId: string | null;
  currentLevel: HSKLevel;
}

export const WordList: React.FC<WordListProps> = ({ 
  words, 
  masteredIds, 
  onSelectWord, 
  selectedWordId,
  currentLevel
}) => {
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'MASTERED' | 'LEARNING'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // First, filter by Level and Difficulty to get the base set for this view
  // We use this for the stats (Mastered/Learning counts) so they remain visible
  // even when filtering the list itself.
  const baseWords = useMemo(() => {
    return words.filter(w => {
      const levelMatch = w.level === currentLevel;
      const difficultyMatch = difficultyFilter === 'ALL' || w.difficulty === difficultyFilter;
      return levelMatch && difficultyMatch;
    });
  }, [words, currentLevel, difficultyFilter]);

  // Then apply the status filter and search filter for the actual list display
  const displayWords = useMemo(() => {
    return baseWords.filter(w => {
      // Status Filter
      const isMastered = masteredIds.has(w.id);
      let statusMatch = true;
      if (statusFilter === 'MASTERED') statusMatch = isMastered;
      if (statusFilter === 'LEARNING') statusMatch = !isMastered;

      // Search Filter
      let searchMatch = true;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        searchMatch = 
          w.char.toLowerCase().includes(term) ||
          w.pinyin.toLowerCase().includes(term) ||
          w.en.toLowerCase().includes(term);
      }

      return statusMatch && searchMatch;
    });
  }, [baseWords, masteredIds, statusFilter, searchTerm]);

  // Calculate stats based on baseWords (Level + Difficulty context)
  const masteredCount = baseWords.filter(w => masteredIds.has(w.id)).length;
  const totalCount = baseWords.length;
  const learningCount = totalCount - masteredCount;

  const handlePlayAudio = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    window.speechSynthesis.speak(utterance);
  };

  const getDifficultyColor = (diff?: Difficulty) => {
    switch(diff) {
      case Difficulty.EASY: return 'text-green-500 bg-green-50';
      case Difficulty.MEDIUM: return 'text-amber-500 bg-amber-50';
      case Difficulty.HARD: return 'text-red-500 bg-red-50';
      default: return 'text-slate-400 bg-slate-50';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-bold text-slate-800">
             HSK {currentLevel} Vocabulary List
           </h2>
           <p className="text-sm text-slate-500 mt-1">Review all words for this level.</p>
        </div>
        
        <div className="flex flex-col gap-4">
           {/* Controls Row */}
           <div className="flex flex-col sm:flex-row gap-2">
             {/* Search Input */}
             <div className="relative group w-full sm:w-64">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
               </div>
               <input
                 type="text"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 placeholder="Search words..."
                 className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
               />
             </div>

             <div className="flex gap-2">
               {/* Difficulty Filter */}
               <div className="relative group flex-1 sm:flex-none">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-4 w-4 text-slate-400" />
                 </div>
                 <select
                   value={difficultyFilter}
                   onChange={(e) => setDifficultyFilter(e.target.value as any)}
                   className="w-full sm:w-auto pl-9 pr-8 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none cursor-pointer hover:border-indigo-300 transition-colors"
                 >
                   <option value="ALL">All Difficulties</option>
                   <option value={Difficulty.EASY}>Easy</option>
                   <option value={Difficulty.MEDIUM}>Medium</option>
                   <option value={Difficulty.HARD}>Hard</option>
                 </select>
               </div>

               {/* Status Filter */}
               <div className="relative group flex-1 sm:flex-none">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Layers className="h-4 w-4 text-slate-400" />
                 </div>
                 <select
                   value={statusFilter}
                   onChange={(e) => setStatusFilter(e.target.value as any)}
                   className="w-full sm:w-auto pl-9 pr-8 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none cursor-pointer hover:border-indigo-300 transition-colors"
                 >
                   <option value="ALL">All Statuses</option>
                   <option value="MASTERED">Mastered Only</option>
                   <option value="LEARNING">Learning Only</option>
                 </select>
               </div>
             </div>
           </div>

           {/* Stats Row */}
           <div className="flex items-center gap-2 self-start sm:self-end text-sm">
             <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
               <CheckCircle2 className="w-4 h-4 text-green-500" /> 
               <span className="font-medium">{masteredCount}</span> Mastered
             </div>
             <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
               <Circle className="w-4 h-4 text-slate-400" /> 
               <span className="font-medium">{learningCount}</span> Learning
             </div>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">
        {displayWords.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            No words found matching your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {displayWords.map((word) => {
              const isMastered = masteredIds.has(word.id);
              const isSelected = selectedWordId === word.id;
              
              return (
                <div
                  key={word.id}
                  onClick={() => onSelectWord(word)}
                  className={`
                    flex items-center justify-between p-3 rounded-xl border transition-all duration-200 text-left relative overflow-hidden group cursor-pointer
                    ${isSelected 
                      ? 'bg-white border-indigo-500 ring-2 ring-indigo-100' 
                      : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'}
                  `}
                >
                  <div className="flex items-center gap-3 z-10 flex-1 min-w-0">
                    <div className={`
                      flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-serif
                      ${isMastered ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}
                    `}>
                      {word.char}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 truncate">{word.pinyin}</span>
                        {word.difficulty && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getDifficultyColor(word.difficulty)}`}>
                            {word.difficulty}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 truncate" title={word.en}>{word.en}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 z-10 ml-2">
                    <button
                        onClick={(e) => handlePlayAudio(e, word.char)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                        title="Listen"
                    >
                        <Volume2 className="w-4 h-4" />
                    </button>
                    {isMastered && (
                       <CheckCircle2 className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};