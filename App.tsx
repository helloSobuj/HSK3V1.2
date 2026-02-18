import React, { useState, useEffect } from 'react';
import { INITIAL_WORDS } from './constants';
import { Word, HSKLevel, AppMode, Difficulty } from './types';
import { WordList } from './components/WordList';
import { Flashcard } from './components/Flashcard';
import { ProgressBar } from './components/ProgressBar';
import { GrammarSection } from './components/GrammarSection';
import { authService } from './services/authService';
import { Layers, Book, GraduationCap, Menu, List, X as XIcon, User as UserIcon, ChevronLeft, ChevronRight } from 'lucide-react';

// Helper to deterministically assign difficulty based on the character code
const assignDifficulty = (word: Word): Word => {
  const code = word.char.charCodeAt(0);
  let difficulty = Difficulty.EASY;
  
  if (code % 3 === 1) difficulty = Difficulty.MEDIUM;
  if (code % 3 === 2) difficulty = Difficulty.HARD;
  
  return { ...word, difficulty };
};

export default function App() {
  // App State
  const [level, setLevel] = useState<HSKLevel>(HSKLevel.HSK1);
  const [mode, setMode] = useState<AppMode>(AppMode.FLASHCARDS);
  const [words, setWords] = useState<Word[]>(() => INITIAL_WORDS.map(assignDifficulty));
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load progress for guest user on mount
  useEffect(() => {
    const userProgress = authService.loadProgress('guest');
    setMasteredIds(userProgress);
  }, []);

  // Set initial word based on level when words or level changes
  // Randomize the initial word to avoid predictability
  useEffect(() => {
    const levelWords = words.filter(w => w.level === level);
    if (levelWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * levelWords.length);
      setCurrentWord(levelWords[randomIndex]);
    }
  }, [words, level]);

  // Filter words by level
  const currentLevelWords = words.filter(w => w.level === level);

  const handleLevelChange = (newLevel: HSKLevel) => {
    setLevel(newLevel);
    // useEffect will handle setting the new random word
    setSidebarOpen(false);
  };

  const goToNextWord = () => {
    const levelWords = words.filter(w => w.level === level);
    if (levelWords.length === 0) return;
    if (levelWords.length === 1) return; // Can't switch if only 1 word

    let newWord;
    // Pick a random word that is not the current one
    do {
      const randomIndex = Math.floor(Math.random() * levelWords.length);
      newWord = levelWords[randomIndex];
    } while (currentWord && newWord.id === currentWord.id);

    setCurrentWord(newWord);
  };

  const handleToggleStatus = (wordId: string, isMastered: boolean) => {
    // Explicitly type the Set to string to prevent inference errors
    const newSet = new Set<string>(masteredIds);
    if (isMastered) {
      newSet.add(wordId);
    } else {
      newSet.delete(wordId);
    }
    
    setMasteredIds(newSet);
    // Save to guest storage
    authService.saveProgress('guest', newSet);

    // Auto-advance logic
    goToNextWord();
  };

  const getThemeColor = (lvl: HSKLevel) => {
    switch (lvl) {
      case HSKLevel.HSK1: return 'text-emerald-500';
      case HSKLevel.HSK2: return 'text-blue-500';
      case HSKLevel.HSK3: return 'text-amber-500';
      default: return 'text-slate-500';
    }
  };

  const getThemeBg = (lvl: HSKLevel) => {
    switch (lvl) {
      case HSKLevel.HSK1: return 'bg-emerald-500';
      case HSKLevel.HSK2: return 'bg-blue-500';
      case HSKLevel.HSK3: return 'bg-amber-500';
      default: return 'bg-slate-500';
    }
  };

  const handleWordSelect = (w: Word) => {
    setCurrentWord(w);
    setMode(AppMode.FLASHCARDS); 
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-full flex-col md:flex-row bg-slate-50">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 z-20 relative">
         <div className="font-serif font-bold text-xl text-slate-800 flex items-center gap-2">
           <GraduationCap className={getThemeColor(level)} />
           HanziHero
         </div>
         <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-600">
           {sidebarOpen ? <XIcon /> : <Menu />}
         </button>
      </div>

      {/* Sidebar (Desktop: Fixed, Mobile: Overlay) */}
      <div className={`
        fixed inset-0 z-50 md:static md:z-0 flex transition-all duration-300 transform 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className={`
            flex flex-col h-full bg-white border-r border-slate-200 shadow-xl md:shadow-none flex-shrink-0 transition-all duration-300 ease-in-out
            w-64 ${isCollapsed ? 'md:w-20' : 'md:w-64 lg:w-72'}
          `}>
          {/* Brand & Mobile Header */}
          <div className={`
             flex items-center p-4 md:p-6 border-b border-slate-100 relative
             ${isCollapsed ? 'justify-center' : 'justify-between'}
          `}>
             <div className="flex items-center gap-2 overflow-hidden">
               <div className={`p-1.5 md:p-2 rounded-lg text-white flex-shrink-0 ${getThemeBg(level)}`}>
                 <GraduationCap className="w-5 h-5 md:w-6 md:h-6" />
               </div>
               <div className={`transition-opacity duration-200 ${isCollapsed ? 'hidden opacity-0 w-0' : 'block opacity-100'}`}>
                 <h1 className="font-serif font-bold text-lg md:text-xl text-slate-800 tracking-tight whitespace-nowrap">HanziHero</h1>
                 <p className="text-[10px] md:text-xs text-slate-400 font-medium tracking-wide whitespace-nowrap">HSK MASTERY</p>
               </div>
             </div>

             {/* Desktop Collapse Button */}
             <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden md:flex absolute -right-3 top-8 bg-white border border-slate-200 rounded-full p-1 text-slate-400 hover:text-indigo-600 shadow-sm z-50 hover:scale-110 transition-transform"
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
             >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
             </button>

             {/* Mobile Close Button */}
             <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 text-slate-400 hover:text-slate-600">
               <XIcon className="w-5 h-5" />
             </button>
          </div>

          {/* User Profile Snippet (Static) */}
          <div className={`
             px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center gap-3
             ${isCollapsed ? 'justify-center' : ''}
          `}>
             <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0" title="Guest User">
               <UserIcon className="w-4 h-4" />
             </div>
             <div className={`flex-1 min-w-0 transition-opacity duration-200 ${isCollapsed ? 'hidden opacity-0 w-0' : 'block opacity-100'}`}>
               <p className="text-sm font-semibold text-slate-700 truncate">Guest Learner</p>
               <p className="text-xs text-slate-400">Student</p>
             </div>
          </div>

          {/* Level Selector */}
          <div className={`
             p-4 grid gap-2 border-b border-slate-100 bg-slate-50/50
             ${isCollapsed ? 'grid-cols-1' : 'grid-cols-3'}
          `}>
            {[HSKLevel.HSK1, HSKLevel.HSK2, HSKLevel.HSK3].map((l) => (
              <button
                key={l}
                onClick={() => handleLevelChange(l)}
                title={`Switch to HSK ${l}`}
                className={`
                  py-2 px-1 rounded-lg text-xs font-bold transition-all border
                  ${level === l 
                    ? 'bg-white border-slate-300 shadow-sm text-slate-800' 
                    : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-100 hover:text-slate-600'}
                `}
              >
                {isCollapsed ? l : `HSK ${l}`}
              </button>
            ))}
          </div>

          {/* Mode Selector */}
          <div className="flex flex-col gap-1 p-3">
             <button 
               onClick={() => { setMode(AppMode.FLASHCARDS); setSidebarOpen(false); }}
               title="Flashcards"
               className={`
                 w-full py-3 rounded-xl flex items-center transition-all
                 ${isCollapsed ? 'justify-center px-2' : 'px-4 gap-3'}
                 ${mode === AppMode.FLASHCARDS ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
               `}
             >
               <Layers className="w-5 h-5 flex-shrink-0" /> 
               <span className={`${isCollapsed ? 'hidden' : 'block'} text-sm font-medium whitespace-nowrap`}>Flashcards</span>
             </button>
             <button 
               onClick={() => { setMode(AppMode.WORDLIST); setSidebarOpen(false); }}
               title="Word List"
               className={`
                 w-full py-3 rounded-xl flex items-center transition-all
                 ${isCollapsed ? 'justify-center px-2' : 'px-4 gap-3'}
                 ${mode === AppMode.WORDLIST ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
               `}
             >
               <List className="w-5 h-5 flex-shrink-0" />
               <span className={`${isCollapsed ? 'hidden' : 'block'} text-sm font-medium whitespace-nowrap`}>Word List</span>
             </button>
             <button 
               onClick={() => { setMode(AppMode.GRAMMAR); setSidebarOpen(false); }}
               title="Grammar"
               className={`
                 w-full py-3 rounded-xl flex items-center transition-all
                 ${isCollapsed ? 'justify-center px-2' : 'px-4 gap-3'}
                 ${mode === AppMode.GRAMMAR ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
               `}
             >
               <Book className="w-5 h-5 flex-shrink-0" />
               <span className={`${isCollapsed ? 'hidden' : 'block'} text-sm font-medium whitespace-nowrap`}>Grammar</span>
             </button>
          </div>

          {/* Sidebar Footer */}
          <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50 space-y-4">
             {!isCollapsed && (
                <div className="animate-in fade-in duration-300">
                  <ProgressBar 
                    label={`HSK ${level} Progress`} 
                    current={currentLevelWords.filter(w => masteredIds.has(w.id)).length} 
                    total={currentLevelWords.length} 
                    colorClass={getThemeBg(level)}
                  />
                </div>
             )}
          </div>
        </div>
        
        {/* Overlay backdrop for mobile */}
        <div 
          className="flex-1 bg-slate-900/20 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none"></div>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col">
           <div className="max-w-6xl w-full mx-auto h-full flex flex-col">
             {mode === AppMode.FLASHCARDS && (
               <div className="h-full flex flex-col justify-center">
                   {currentWord ? (
                     <div className="space-y-8">
                       <div className="text-center md:text-left">
                         <h2 className="text-2xl font-bold text-slate-800">Flashcards</h2>
                         <p className="text-slate-500">Master the HSK {level} vocabulary list.</p>
                       </div>
                       <Flashcard 
                          word={currentWord}
                          isMastered={masteredIds.has(currentWord.id)}
                          onToggleStatus={handleToggleStatus}
                          colorTheme={getThemeColor(level)}
                       />
                     </div>
                   ) : (
                     <div className="text-center text-slate-400">
                       No words available for this level.
                     </div>
                   )}
               </div>
             )}
             
             {mode === AppMode.WORDLIST && (
                <WordList 
                  words={words} 
                  currentLevel={level}
                  masteredIds={masteredIds}
                  onSelectWord={handleWordSelect}
                  selectedWordId={currentWord?.id || null}
                />
             )}
             
             {mode === AppMode.GRAMMAR && (
               <GrammarSection level={level} />
             )}
           </div>
        </div>
      </main>
    </div>
  );
}