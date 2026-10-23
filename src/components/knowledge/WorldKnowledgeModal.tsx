'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  WORLD_KNOWLEDGE_BASE,
  KNOWLEDGE_CATEGORIES,
  searchWorldKnowledge,
} from '@/data/worldKnowledge';
import { WorldKnowledgeItem, KnowledgeCategory } from '@/types';
import {
  X,
  Search,
  Globe,
  Newspaper,
  HeartPulse,
  Atom,
  Zap,
  Sparkles,
  ExternalLink,
  Share2,
  Copy,
  Check,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  Clock,
  Tag,
  Activity,
  Bookmark,
  BookOpen,
} from 'lucide-react';

export default function WorldKnowledgeModal() {
  const {
    isKnowledgeModalOpen,
    setIsKnowledgeModalOpen,
    selectedKnowledgeCategory,
    setSelectedKnowledgeCategory,
    askAboutKnowledgeTopic,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<WorldKnowledgeItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // Filter items
  const filteredItems = useMemo(() => {
    return searchWorldKnowledge(searchQuery, selectedKnowledgeCategory);
  }, [searchQuery, selectedKnowledgeCategory]);

  // Set default selected item if none selected
  const activeItem = selectedItem || filteredItems[0] || WORLD_KNOWLEDGE_BASE[0];

  if (!isKnowledgeModalOpen) return null;

  const handleCopySummary = (item: WorldKnowledgeItem) => {
    const text = `${item.title}\nSource: ${item.source}\n\n${item.summary}\n\nKey Takeaways:\n${item.keyTakeaways.map((t) => `• ${t}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSave = (id: string) => {
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const getCategoryIcon = (cat: KnowledgeCategory) => {
    switch (cat) {
      case 'news':
        return <Newspaper className="w-4 h-4 text-emerald-400" />;
      case 'health':
        return <HeartPulse className="w-4 h-4 text-rose-400" />;
      case 'science':
        return <Atom className="w-4 h-4 text-blue-400" />;
      case 'productivity':
        return <Zap className="w-4 h-4 text-amber-400" />;
      default:
        return <Globe className="w-4 h-4 text-teal-400" />;
    }
  };

  const getCategoryColor = (cat: KnowledgeCategory) => {
    switch (cat) {
      case 'news':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25';
      case 'health':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/25';
      case 'science':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/25';
      case 'productivity':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/25';
      default:
        return 'text-teal-400 bg-teal-500/10 border-teal-500/25';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative flex flex-col w-full max-w-6xl h-[92vh] max-h-[860px] bg-[#0b1320]/90 backdrop-blur-2xl border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="knowledge-hub-title"
      >
        {/* 1. Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-blue-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="knowledge-hub-title" className="text-base sm:text-lg font-bold text-white tracking-tight">
                  World Knowledge & Intelligence Center
                </h2>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Global Feed Live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Verified Global News, Evidence-Based Healthcare Protocols & Scientific Frontiers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="close-knowledge-modal-btn"
              onClick={() => setIsKnowledgeModalOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Filter & Search Toolbar */}
        <div className="px-6 py-3 border-b border-slate-800/70 bg-[#0a0f1b]/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {KNOWLEDGE_CATEGORIES.map((cat) => {
              const isSelected = selectedKnowledgeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`cat-filter-${cat.id}`}
                  onClick={() => setSelectedKnowledgeCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-sm'
                      : 'bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  {cat.id === 'news' && <Newspaper className="w-3.5 h-3.5 text-emerald-400" />}
                  {cat.id === 'health' && <HeartPulse className="w-3.5 h-3.5 text-rose-400" />}
                  {cat.id === 'science' && <Atom className="w-3.5 h-3.5 text-blue-400" />}
                  {cat.id === 'productivity' && <Zap className="w-3.5 h-3.5 text-amber-400" />}
                  {cat.id === 'all' && <Globe className="w-3.5 h-3.5 text-teal-400" />}
                  <span>{cat.label}</span>
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-emerald-500/30 text-emerald-200' : 'bg-slate-700/50 text-slate-400'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px] md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="knowledge-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news, health tips, science..."
              className="w-full pl-9 pr-8 py-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/50 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 3. Main Split View: Left List, Right Detailed Reader */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Topics List */}
          <div className="w-full md:w-5/12 lg:w-4/12 border-b md:border-b-0 md:border-r border-slate-800/80 overflow-y-auto p-4 space-y-2.5 bg-[#090d16]/40">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1 pb-1">
              <span>{filteredItems.length} Knowledge Topics Found</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Real-time
              </span>
            </div>

            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No world knowledge found matching &quot;{searchQuery}&quot;. Try searching for &quot;fusion&quot;, &quot;sleep&quot;, &quot;cardio&quot;, or &quot;AI&quot;.
              </div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = activeItem?.id === item.id;
                const isSaved = savedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    id={`knowledge-item-${item.id}`}
                    onClick={() => setSelectedItem(item)}
                    className={`group p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20'
                        : 'bg-slate-900/50 hover:bg-slate-800/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getCategoryColor(item.category)}`}>
                        {getCategoryIcon(item.category)}
                        <span className="capitalize">{item.category}</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {item.readTime}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSave(item.id);
                          }}
                          className={`p-1 rounded hover:bg-slate-700/50 transition-colors ${
                            isSaved ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                          }`}
                          title="Bookmark"
                        >
                          <Bookmark className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors line-clamp-2 leading-snug mb-1">
                      {item.title}
                    </h3>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
                      {item.summary}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/50">
                      <span className="truncate max-w-[150px]">{item.source}</span>
                      <span className="flex items-center gap-0.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                        Read full <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Detailed Knowledge Article Reader */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#080c14]/90 space-y-6">
            {activeItem && (
              <>
                {/* Article Header & Actions */}
                <div className="space-y-3 pb-5 border-b border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${getCategoryColor(activeItem.category)}`}>
                        {getCategoryIcon(activeItem.category)}
                        <span className="capitalize">{activeItem.category}</span>
                        <span>•</span>
                        <span>{activeItem.subcategory}</span>
                      </span>
                      {activeItem.impact && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                          {activeItem.impact} Impact
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        id="copy-summary-btn"
                        onClick={() => handleCopySummary(activeItem)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                      >
                        {copiedId === activeItem.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Brief</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        id="ask-ai-topic-btn"
                        onClick={() => askAboutKnowledgeTopic(activeItem.title)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Investigate with AI</span>
                      </button>
                    </div>
                  </div>

                  <h1 className="text-lg sm:text-2xl font-bold text-white tracking-tight leading-snug">
                    {activeItem.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                      {activeItem.source}
                    </span>
                    <span>•</span>
                    <span className="font-mono">{activeItem.date}</span>
                    <span>•</span>
                    <span className="font-mono">{activeItem.readTime}</span>
                  </div>
                </div>

                {/* Article Overview Summary */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-400">
                    Executive Intelligence Summary
                  </span>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {activeItem.summary}
                  </p>
                </div>

                {/* Full Article Content */}
                <div className="prose prose-invert max-w-none text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {activeItem.content}
                </div>

                {/* Key Takeaways Section */}
                {activeItem.keyTakeaways && activeItem.keyTakeaways.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Key Scientific Takeaways & Developments
                    </h3>
                    <ul className="space-y-2">
                      {activeItem.keyTakeaways.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Healthcare Action Tips Section */}
                {activeItem.actionTips && activeItem.actionTips.length > 0 && (
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4 text-emerald-400" />
                      Actionable Healthcare Protocols & Daily Routine
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {activeItem.actionTips.map((tip, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-100"
                        >
                          <span className="font-mono text-emerald-400 font-bold shrink-0">{idx + 1}.</span>
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Biometric Health Data Metrics */}
                {activeItem.metrics && activeItem.metrics.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-rose-400" />
                      Target Biomarker Reference Metrics
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {activeItem.metrics.map((m, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1"
                        >
                          <div className="text-[10px] text-slate-400 truncate">{m.label}</div>
                          <div className="text-base font-bold text-white font-mono">{m.value}</div>
                          <div className="text-[10px] text-emerald-400 font-mono">Target: {m.targetRange}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clinical Warning / Disclaimer */}
                {activeItem.clinicalDisclaimer && (
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200/90 text-xs leading-relaxed">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p>{activeItem.clinicalDisclaimer}</p>
                  </div>
                )}

                {/* Tags */}
                {activeItem.tags && activeItem.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap pt-2">
                    <Tag className="w-3.5 h-3.5 text-slate-500" />
                    {activeItem.tags.map((tag) => (
                      <span
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 cursor-pointer transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 4. Footer Quick Actions */}
        <div className="px-6 py-3 border-t border-slate-800/80 bg-[#090d16]/90 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-3">
            <span>Powered by LMLS Multimodal Intelligence v2.4</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Sources: Reuters, Nature, WHO, Mayo Clinic, IEEE</span>
          </div>

          <div className="flex items-center gap-2">
            {activeItem && (
              <button
                type="button"
                id="footer-discuss-ai-btn"
                onClick={() => askAboutKnowledgeTopic(activeItem.title)}
                className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                <span>Discuss with AI in chat</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
