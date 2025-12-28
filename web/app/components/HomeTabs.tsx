'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlusEntry } from '../../lib/types';

interface HomeTabsProps {
    surahs: any[];
    plusEntries: PlusEntry[];
}

export default function HomeTabs({ surahs, plusEntries }: HomeTabsProps) {
    const [activeTab, setActiveTab] = useState<'index' | 'plus'>('index');

    return (
        <>
            <header className="max-w-4xl mx-auto mb-16 text-center">
                <div className="inline-block px-4 py-1 mb-6 border-y border-gold-premium/40 text-gold-premium uppercase tracking-[0.3em] text-xs font-semibold">
                    Majlis Ihya Ulum-id-Din
                </div>
                <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 text-emerald-deep tracking-tight">
                    Tafsir <span className="italic font-normal">al-Ihya</span>
                </h1>
                <p className="text-xl text-stone-600 font-serif leading-relaxed max-w-2xl mx-auto mb-12">
                    Explore the Quran through the spiritual insights and ethical commentaries of Imam al-Ghazali.
                </p>

                {/* Tab Switcher */}
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => setActiveTab('index')}
                        className={`px-8 py-3 rounded-full font-serif font-bold transition-all duration-300 ${activeTab === 'index'
                            ? "bg-emerald-deep text-white shadow-xl scale-105"
                            : "bg-white text-emerald-deep/60 border border-emerald-deep/10 hover:border-gold-premium/30 hover:text-emerald-deep"
                            }`}
                    >
                        Surah Index
                    </button>
                    <button
                        onClick={() => setActiveTab('plus')}
                        className={`px-8 py-3 rounded-full font-serif font-bold transition-all duration-300 ${activeTab === 'plus'
                            ? "bg-gold-premium text-emerald-deep shadow-xl scale-105"
                            : "bg-white text-gold-premium/60 border border-gold-premium/10 hover:border-emerald-deep/30 hover:text-gold-premium"
                            }`}
                    >
                        IhyaTafsir<span className="font-sans ml-0.5">+</span>
                    </button>
                </div>
            </header>

            {activeTab === 'index' ? (
                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {surahs.map((surah) => (
                        <Link
                            key={surah.id}
                            href={`/surah/${surah.id}`}
                            className="group outline-hidden focus:ring-2 focus:ring-gold-premium/50 rounded-xl"
                        >
                            <div className="h-full bg-white border border-stone-200/60 rounded-xl p-6 shadow-sm group-hover:shadow-2xl group-hover:-translate-y-1 group-hover:border-gold-premium/50 transition-all duration-500 ease-out flex items-center gap-6">
                                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-emerald-deep/5 text-emerald-deep font-serif font-bold group-hover:bg-gold-premium group-hover:text-white transition-colors duration-300">
                                    {surah.id}
                                </div>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start mb-1">
                                        <h2 className="text-xl font-serif font-bold text-stone-800 group-hover:text-emerald-deep transition-colors">
                                            {surah.ename}
                                        </h2>
                                        <span className="arabic-text text-xl text-emerald-deep/60 group-hover:text-gold-premium transition-colors">
                                            {surah.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                                            {surah.ayahs} Verses
                                        </span>
                                        {surah.matchesCount > 0 && (
                                            <span className="text-[10px] uppercase tracking-widest text-gold-premium font-bold">
                                                • {surah.matchesCount} Commentaries
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {plusEntries.map((entry) => (
                        <Link
                            key={`${entry.surahId}:${entry.ayahId}`}
                            href={`/ayah/${entry.surahId}/${entry.ayahId}`}
                            className="block group"
                        >
                            <div className="bg-white border border-stone-200/60 rounded-2xl p-8 shadow-sm group-hover:shadow-2xl group-hover:-translate-y-1 group-hover:border-gold-premium/50 transition-all duration-300">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-3">
                                        <span className="w-10 h-10 rounded-full bg-emerald-deep text-white flex items-center justify-center font-bold text-sm">
                                            {entry.surahId}:{entry.ayahId}
                                        </span>
                                        <div>
                                            <h3 className="font-serif font-black text-stone-800 text-lg">
                                                {entry.surahEname}
                                            </h3>
                                            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                                                Surah {entry.surahId} • Verse {entry.ayahId}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="arabic-text text-2xl text-emerald-deep/80 group-hover:text-gold-premium transition-colors block">
                                            {entry.surahName}
                                        </span>
                                        <span className="text-[10px] uppercase tracking-widest text-gold-premium font-black">
                                            {entry.matchesCount} Commentar{entry.matchesCount === 1 ? 'y' : 'ies'}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <p className="arabic-text text-3xl text-stone-800 leading-[1.8] text-right bg-stone-50/50 p-6 rounded-xl border border-stone-100 group-hover:bg-white transition-colors" dir="rtl">
                                        {entry.ayahText}
                                    </p>
                                    <p className="text-stone-600 font-serif italic text-lg leading-relaxed border-l-4 border-gold-premium/20 pl-6">
                                        {entry.translation}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <footer className="mt-32 text-center text-stone-400 font-serif italic text-sm border-t border-stone-200 pt-12 max-w-4xl mx-auto">
                {activeTab === 'index'
                    ? "Organized chronologically as in the Noble Quran."
                    : `Showing ${plusEntries.length} verses with established links to Ihya Ulum al-Din.`}
            </footer>
        </>
    );
}
