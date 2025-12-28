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
    for vf in verse_files:
        with open(vf, 'r', encoding='utf-8') as f:
            verses = json.load(f)
            for v in verses:
                s_idx = v.get('surah_idx')
                a_idx = v.get('ayah_start')
                if s_idx is None or a_idx is None:
                    continue
                
                # Normalize key to int
                s_idx = int(s_idx)
                a_idx = int(a_idx)
                
                if s_idx in surahs and a_idx in surahs[s_idx]["verses"]:
                    surahs[s_idx]["verses"][a_idx]["matches"].append({
                        "book_id": f"vol{v.get('vol', 0)}_{v.get('original_file')}",
                        "vol": v.get('vol', 0),
                        "word_start": v.get('word_start', 0),
                        "word_end": v.get('word_end', 0),
                        "verse_in_text": v.get('text_matched', v.get('verse_text', '')),
                        "translation": v.get('translation', '')
                    })
                    match_count += 1

    print(f"Total matches indexed: {match_count}")

    # 4. Save to JSON
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(surahs, f, ensure_ascii=False, indent=2)
    
    print(f"Saved master index to {OUTPUT_FILE}")

if __name__ == "__main__":
    build_index()
