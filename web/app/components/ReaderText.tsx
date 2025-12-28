'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Verse } from '../../../lib/types';

interface ReaderTextProps {
    tokens: string[];
    verseMap: Record<number, Verse[]>;
}

export default function ReaderText({ tokens, verseMap }: ReaderTextProps) {
    const [activeVerse, setActiveVerse] = useState<{ translation: string, key: string } | null>(null);
    const searchParams = useSearchParams();
    const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

    useEffect(() => {
        const targetWordIndex = searchParams.get('word');
        if (targetWordIndex !== null) {
            const index = parseInt(targetWordIndex);
            // Give a small delay to ensure rendering and refs are ready
            const timer = setTimeout(() => {
                const el = wordRefs.current[index];
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Add a brief highlight flash
                    el.classList.add('ring-4', 'ring-gold-premium', 'bg-gold-premium/10');
                    setTimeout(() => {
                        el.classList.remove('ring-4', 'ring-gold-premium', 'bg-gold-premium/10');
                    }, 2000);
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [searchParams]);

    // Pre-calculate which verse each word belongs to
    const wordToVerseMap: Record<number, Verse> = {};
    Object.values(verseMap).flat().forEach(v => {
        for (let i = v.word_start; i <= v.word_end; i++) {
            wordToVerseMap[i] = v;
        }
    });

    return (
        <div className="relative">
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
                                        key: verseAtThisWord.key
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
                                ...{tokens.slice(Math.max(0, wordToVerseMap[parseInt(searchParams.get('word') || '0')]?.word_start || 0), (wordToVerseMap[parseInt(searchParams.get('word') || '0')]?.word_end || 0) + 1).join(' ')}...
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

