'use client';

import { useState } from 'react';
import { Verse } from '../../lib/types';

interface ReaderTextProps {
    tokens: string[];
    verseMap: Record<number, Verse[]>;
}

export default function ReaderText({ tokens, verseMap }: ReaderTextProps) {
    const [activeVerse, setActiveVerse] = useState<string | null>(null);

    return (
        <div className="leading-loose text-2xl text-justify" dir="rtl">
            {tokens.map((token, index) => {
                const versesStartingHere = verseMap[index];
                // Check if this token is part of any active verse range
                // This requires checking all verses to see if index is between start and end.
                // Optimization: Pre-calculate "active verses" for each token?
                // Or just map starts and ends.

                // For simple highlighting, let's just mark starts.
                // Ideally we want to highlight the WHOLE phrase.
                // We can pass a `verseRanges` map: index -> verseId[]

                return (
                    <span key={index} className="relative inline-block ml-1.5 hover:text-emerald-700 transition-colors">
                        {versesStartingHere && (
                            <span className="absolute -top-6 right-0 flex gap-1 z-10 pointer-events-none">
                                {versesStartingHere.map((v, i) => (
                                    <span key={i} className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full border border-emerald-300">
                                        {v.key}
                                    </span>
                                ))}
                            </span>
                        )}

                        <span
                            className={versesStartingHere ? "text-emerald-900 font-bold" : ""}
                            onClick={() => versesStartingHere && setActiveVerse(versesStartingHere[0].translation)}
                        >
                            {token}
                        </span>

                        {/* Simple Modal/Overlay for translation if clicked - simplified for now */}
                    </span>
                );
            })}

            {activeVerse && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-emerald-500 p-6 shadow-2xl z-50 text-left" dir="ltr">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-emerald-800 uppercase tracking-widest text-sm">Translation (Abdel Haleem)</h3>
                            <button onClick={() => setActiveVerse(null)} className="text-stone-400 hover:text-red-500">✕</button>
                        </div>
                        <p className="text-lg text-stone-800 leading-relaxed font-sans">{activeVerse}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
