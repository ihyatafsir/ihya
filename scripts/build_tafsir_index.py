import json
import os
import xml.etree.ElementTree as ET
import glob

# Constants
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROCESSED_DATA_DIR = os.path.join(BASE_DIR, 'data', 'processed')
OUTPUT_FILE = os.path.join(BASE_DIR, 'data', 'quran_tafsir_index.json')
QURAN_INDEX_XML = '/home/absolut7/Documents/ghazali/Quran_Detector/dfiles/quran-index.xml'
QURAN_TEXT_FILE = '/home/absolut7/Documents/ghazali/Quran_Detector/dfiles/quran-simple.txt'

def build_index():
    print("Starting Tafsir index build...")
    
    # 1. Load Surah metadata
    surahs = {}
    tree = ET.parse(QURAN_INDEX_XML)
    root = tree.getroot()
    for sura in root.findall('sura'):
        idx = int(sura.get('index'))
        surahs[idx] = {
            "name": sura.get('name'),
            "tname": sura.get('tname'),
            "ename": sura.get('ename'),
            "ayahs": int(sura.get('ayas')),
            "verses": {} # AyahIndex -> { text, matches: [] }
        }

    # 2. Load Quran text
    with open(QURAN_TEXT_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            parts = line.strip().split('|')
            if len(parts) == 3:
                s_idx = int(parts[0])
                a_idx = int(parts[1])
                text = parts[2]
                if s_idx in surahs:
                    surahs[s_idx]["verses"][a_idx] = {
                        "text": text,
                        "matches": []
                    }

    # 3. Load processed Ihya verses
    verse_files = glob.glob(os.path.join(PROCESSED_DATA_DIR, "*_verses.json"))
    print(f"Loading {len(verse_files)} book verse files...")
    
    match_count = 0
    skipped_bismillah = 0
    skipped_short = 0
    
    # User-requested constraints: 
    # 1. Bismillah repetitions should not be listed as commentary.
    # 2. Only matches longer than 3 words (min 4 words).
    
    for vf in verse_files:
        with open(vf, 'r', encoding='utf-8') as f:
            try:
                verses_data = json.load(f)
            except json.JSONDecodeError:
                print(f"Error decoding {vf}")
                continue
                
            for v in verses_data:
                s_idx = v.get('surah_idx')
                a_idx = v.get('ayah_start')
                text_matched = v.get('text_matched', v.get('verse_text', '')).strip()
                
                if s_idx is None or a_idx is None:
                    continue
                
                # Normalize key to int
                s_idx = int(s_idx)
                a_idx = int(a_idx)
                
                # 1. Bismillah filtering
                # Check for exact Bismillah matches (sometimes indexed for 27:30 or 1:1)
                # We skip them if they are the exact canonical string "بسم الله الرحمن الرحيم"
                if text_matched == "بسم الله الرحمن الرحيم":
                    skipped_bismillah += 1
                    continue

                # 2. Minimum word count filtering (strictly > 3 words, so >= 4)
                words = text_matched.split()
                if len(words) < 4:
                    skipped_short += 1
                    continue

                if s_idx in surahs and a_idx in surahs[s_idx]["verses"]:
                    surahs[s_idx]["verses"][a_idx]["matches"].append({
                        "book_id": f"vol{v.get('vol', 0)}_{v.get('original_file')}",
                        "vol": v.get('vol', 0),
                        "word_start": v.get('word_start', 0),
                        "word_end": v.get('word_end', 0),
                        "verse_in_text": text_matched,
                        "translation": v.get('translation', '')
                    })
                    match_count += 1

    print(f"Total matches indexed: {match_count}")
    print(f"Skipped Bismillah headers: {skipped_bismillah}")
    print(f"Skipped short matches (<4 words): {skipped_short}")

    # 4. Save to JSON
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(surahs, f, ensure_ascii=False, indent=2)
    
    print(f"Saved master index to {OUTPUT_FILE}")

if __name__ == "__main__":
    build_index()
