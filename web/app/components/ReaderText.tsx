'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Verse, BookStructure } from '../../lib/types';

interface ReaderTextProps {
    tokens: string[];
    verseMap: Record<number, Verse[]>;
    structure?: BookStructure | null;
}

export default function ReaderText({ tokens, verseMap, structure }: ReaderTextProps) {
    const [activeVerse, setActiveVerse] = useState<{ translation: string, key: string, word_start: number, word_end: number } | null>(null);
    const [isTocOpen, setIsTocOpen] = useState(false);
    const searchParams = useSearchParams();
    const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

    useEffect(() => {
        const targetWordIndex = searchParams.get('word');
        if (targetWordIndex !== null) {
            const index = parseInt(targetWordIndex);
            scrollToWord(index);
        }
    }, [searchParams]);

    const scrollToWord = (index: number) => {
        // Give a small delay to ensure rendering and refs are ready
        setTimeout(() => {
            const el = wordRefs.current[index];
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Add a brief highlight flash
                el.classList.add('ring-4', 'ring-gold-premium', 'bg-gold-premium/10');
                setTimeout(() => {
                    el.classList.remove('ring-4', 'ring-gold-premium', 'bg-gold-premium/10');
                }, 2000);
            }
        }, 100);
    };

    // Pre-calculate which verse each word belongs to
    const wordToVerseMap: Record<number, Verse> = {};
    Object.values(verseMap).flat().forEach(v => {
        for (let i = v.word_start; i <= v.word_end; i++) {
            wordToVerseMap[i] = v;
        }
    });

    return (
        <div className="relative">
            {/* Table of Contents Trigger */}
            {structure && structure.chapters.length > 0 && (
                <button
                    onClick={() => setIsTocOpen(true)}
                    className="fixed left-8 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md border border-stone-200 p-4 rounded-full shadow-lg hover:shadow-2xl hover:scale-110 transition-all z-[60] flex flex-col items-center gap-1 group"
                    title="Table of Contents"
                >
                    <div className="w-6 h-0.5 bg-emerald-deep rounded-full transition-all group-hover:w-8"></div>
                    <div className="w-8 h-0.5 bg-emerald-deep rounded-full"></div>
                    <div className="w-6 h-0.5 bg-emerald-deep rounded-full transition-all group-hover:w-8"></div>
                    <span className="text-[8px] uppercase tracking-widest font-black text-emerald-deep mt-1">ToC</span>
                </button>
            )}

            {/* Table of Contents Sidebar */}
            {isTocOpen && (
                <div className="fixed inset-0 z-[100] flex animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setIsTocOpen(false)}></div>
                    <aside className="relative w-full max-w-sm bg-stone-50 h-full shadow-2xl animate-in slide-in-from-left duration-500 overflow-y-auto">
                        <div className="p-8 border-b border-stone-200 sticky top-0 bg-stone-50 z-10 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-serif font-black text-stone-800">Contents</h3>
                                <p className="text-xs text-stone-500 uppercase tracking-widest font-bold mt-1">Ihya Structural Index</p>
                            </div>
                            <button onClick={() => setIsTocOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-200 transition-colors">
                                ✕
                            </button>
                        </div>
                        <div className="p-4 space-y-2">
                            {structure?.chapters.map((chapter, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        scrollToWord(chapter.word_start);
                                        setIsTocOpen(false);
                                    }}
                                    className="w-full text-right p-4 rounded-xl hover:bg-emerald-deep/5 hover:border-emerald-deep/20 border border-transparent transition-all group"
                                    dir="rtl"
                                >
                                    <span className="block text-stone-500 text-[10px] uppercase tracking-widest font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Jump to Section
                                    </span>
                                    <span className="arabic-text text-xl text-stone-700 leading-tight group-hover:text-emerald-deep transition-colors">
                                        {chapter.title}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </aside>
                </div>
            )}

            <div className="arabic-text leading-[2.5] text-4xl text-stone-800 text-justify tracking-wide" dir="rtl">
                {tokens.map((token, index) => {
                    const versesStartingHere = verseMap[index];
                    const verseAtThisWord = wordToVerseMap[index];

                    return (
                        <span
                            key={index}
                            ref={el => { wordRefs.current[index] = el; }}
                            className={`relative inline-block ml-2 transition-all duration-300 ${verseAtThisWord ? "cursor-pointer group" : ""
                                }`}
                            onClick={() => {
                                if (verseAtThisWord) {
                                    setActiveVerse({
                                        translation: verseAtThisWord.translation,
                                        key: verseAtThisWord.key,
                                        word_start: verseAtThisWord.word_start,
                                        word_end: verseAtThisWord.word_end
                                    });
                                }
                            }}
                        >
                            {versesStartingHere && (
                                <span className="absolute -top-4 right-0 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {versesStartingHere.map((v, i) => (
                                        <span key={i} className="bg-gold-premium text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                                            {v.key}
                                        </span>
                                    ))}
                                </span>
                            )}

                            <span
                                className={`rounded px-1 transition-colors duration-300 ${searchParams.get('word') === index.toString()
                                    ? "bg-gold-premium/30 ring-2 ring-gold-premium"
                                    : verseAtThisWord
                                        ? "text-emerald-deep font-bold bg-emerald-deep/5 group-hover:bg-emerald-deep/15"
                                        : "hover:text-emerald-deep/40"
                                    }`}
                            >
                                {token}
                            </span>
                        </span>
                    );
                })}
            </div>

            {/* Premium Translation Overlay */}
            {activeVerse && (
                <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gold-premium/30 p-8 shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.15)] z-[100] animate-in slide-in-from-bottom duration-500 ease-out" dir="ltr">
                    <div className="max-w-4xl mx-auto relative">
                        <button
                            onClick={() => setActiveVerse(null)}
                            className="absolute -top-4 -right-4 w-10 h-10 flex items-center justify-center rounded-full bg-stone-100 text-stone-400 hover:text-emerald-deep hover:bg-stone-200 transition-all shadow-sm"
                        >
                            ✕
                        </button>
                        <div className="flex items-center gap-4 mb-4">
                            <span className="px-3 py-1 bg-emerald-deep text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                                Quranic Verse {activeVerse.key}
                            </span>
                            <span className="text-stone-400 text-xs font-serif italic">Abdel Haleem Translation</span>
                        </div>
                        <p className="text-2xl font-serif text-stone-800 leading-relaxed italic mb-6">
                            "{activeVerse.translation}"
                        </p>

                        <div className="border-t border-stone-100 pt-6">
                            <div className="text-[10px] uppercase tracking-widest text-emerald-deep font-bold mb-2">Ihya Commentary Snippet</div>
                            <p className="arabic-text text-xl text-stone-600 leading-relaxed text-right" dir="rtl">
                                ...{tokens.slice(activeVerse.word_start, activeVerse.word_end + 1).join(' ')}...
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

