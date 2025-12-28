export interface Verse {
    original_file: string;
    vol: number;
    surah: string;
    surah_idx: number | null;
    ayah_start: number;
    ayah_end: number;
    text_matched: string; // The Arabic text segment in the book
    translation: string;
    key: string; // "Surah:Ayah"
    word_start: number;
    word_end: number;
}

export interface Chapter {
    title: string;
    word_start: number;
}

export interface BookStructure {
    book_id: string;
    arabic_title: string;
    english_title: string;
    vol: number;
    global_id: number;
    chapters: Chapter[];
}

export interface Quarter {
    id: number;
    title: string;
    arabic_title: string;
    books: BookMetadata[];
}

export interface BookMetadata {
    id: string;
    title: string;
    arabic_title?: string;
    vol: number;
    global_id?: number;
}

export interface Book {
    id: string;
    title: string;
    arabic_title?: string;
    vol: number;
    raw_text: string;
    verses: Verse[];
}

export interface PlusEntry {
    surahId: string;
    surahName: string;
    surahEname: string;
    ayahId: string;
    ayahText: string;
    translation: string;
    matchesCount: number;
}
