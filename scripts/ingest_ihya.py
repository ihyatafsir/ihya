import os
import re
import json
import glob
from pathlib import Path

import subprocess
from docx import Document
import sys
import xml.etree.ElementTree as ET

# Add current directory to path so we can import local modules if needed
sys.path.append(str(Path(__file__).parent))

try:
    from QuranDetectorAnnotater import qMatcherAnnotater
except ImportError:
    print("Warning: QuranDetectorAnnotater not found. Verse extraction will be skipped.")
    qMatcherAnnotater = None

SOURCE_DIR = Path(__file__).parent.parent / "source"
OUTPUT_DIR = Path(__file__).parent.parent / "data/processed"


def ingest_files():
    """
    Iterates through Vol1-4, reads files, and organizes them by book.
    Assumes 40 books total, 10 per volume.
    """
    structure = {}
    
    # Load Translation if available
    translation_map = {}
    trans_file = Path(__file__).parent.parent / "data/translations/abdel_haleem.txt"
    if trans_file.exists():
        try:
            print(f"Loading translations from {trans_file}...")
            with open(trans_file, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line: continue
                    parts = line.split("|")
                    if len(parts) >= 3:
                        surah = parts[0]
                        ayah = parts[1]
                        # Join the rest in case text contains pipes
                        text = "|".join(parts[2:]).strip()
                        
                        # Key format: match what we generate in extraction
                        # Extraction generates "SurahName:AyahNum"
                        # But wait, logic in QuranDetector might use names like "Al-Fatiha", not numbers?
                        # I need to check what "ayaName" in matcher returns.
                        # The Matcher uses 'dfiles/quran-index.xml' to map. 
                        # Let's check quran-index.xml to see if it uses numbers or names.
                        # If names, I need a map from Surah Number -> Surah Name.
                        
                        # For now, let's store both "S:A" and potentially "Name:A" if we can build a map.
                        # Or just store by "S:A" and update ingestion to use numbers if possible?
                        # The matcher likely uses Names.
                        
                        key = f"{surah}:{ayah}" 
                        translation_map[key] = text
            print(f"Loaded {len(translation_map)} translations.")
        except Exception as e:
            print(f"Failed to load translation: {e}")

    # Load Name to Index Map from XML
    # Matcher uses Arabic names (from 'name' attr in XML). Translation uses Index.
    name_to_index = {}
    xml_path = Path("scripts/dfiles/quran-index.xml") # Relative to CWD (root of ihyatafsir)
    if not xml_path.exists():
        # Try relative to script if we are running from scripts dir (logic handled below for matcher but here for map)
        xml_path = Path(__file__).parent / "dfiles/quran-index.xml"
        
    if xml_path.exists():
        try:
             tree = ET.parse(xml_path)
             root = tree.getroot()
             for sura in root.findall('sura'):
                 idx = sura.get('index')
                 name = sura.get('name')
                 if idx and name:
                     name_to_index[name] = idx
             print(f"Loaded {len(name_to_index)} Surah mappings.")
        except Exception as e:
             print(f"Error parse quran-index: {e}")
    else:
        print(f"Warning: quran-index.xml not found at {xml_path}")


    # Initialize Matcher
    matcher = None
    if qMatcherAnnotater:
        print("Initializing Quran Matcher...")
        # Ensure we are in the scripts directory or paths are correct for matcher
        # qMatcherAnnotater expects dfiles relative to CWD
        original_cwd = os.getcwd()
        try:
            os.chdir(Path(__file__).parent) # Change to scripts dir for matcher loading
            matcher = qMatcherAnnotater()
        finally:
            os.chdir(original_cwd)

    for vol_num in range(1, 41): # 40 Books, not just volumes.
        # Check structure again. User said "four folders name vol 1 vol2 vol3 vol4 . name the chapters correclty each folder has 10 files"
        # So Vol1 has Book 1-10, Vol2 has 11-20, etc.
        pass

    for vol_num in range(1, 5):
        vol_path = SOURCE_DIR / f"Vol{vol_num}"
        if not vol_path.exists():
            print(f"Warning: {vol_path} does not exist")
            continue
            
        files = sorted([f for f in os.listdir(vol_path) if not f.startswith('~')]) # Ignore temp files
        print(f"Volume {vol_num}: Found {len(files)} files")
        
        for file in files:
            file_path = vol_path / file
            print(f"Processing {file}...")
            text = extract_text(file_path)
            
            if text:
                 # SAVE RAW TEXT
                 output_filename = f"vol{vol_num}_{file}.txt"
                 with open(OUTPUT_DIR / output_filename, "w", encoding="utf-8") as f:
                     f.write(text)
                 print(f"Saved raw text to {output_filename}")
                 
                 # EXTRACT VERSES
                 if matcher:
                    print(f"Extracting verses from {file}...")
                    # matchVersesInText return: result (dict of matches), errs
                    try:
                        # Normalize a bit before passing? valid Arabic text is expected.
                        # The matcher does its own normalization.
                        results, errs = matcher.matchVersesInText(text, matcher.all)
                        
                        # Process results into a list of found verses
                        found_verses = []
                        for verse_name, matches in results.items():
                            for m in matches:
                                # m is matchRec object
                                # verse_name e.g. "Al-Fatiha", "Al-Baqarah"
                                # m.verses contains the text segments
                                # m.startInText, m.endInText are WORD indices (index in text.split())
                                
                                # We want to save: Verse Key (Surah:Ayah), Arabic Text, Context?
                                # Structure: SurahName, AyahNr, Arabic
                                
                                # m.ayaName = Surah Name
                                # m.startIdx = Start Ayah Number
                                # m.endIdx = End Ayah Number (if multi-ayah match)
                                
                                verse_key = f"{m.ayaName}:{m.startIdx}"
                                if m.endIdx > m.startIdx:
                                     verse_key += f"-{m.endIdx}"
                                
                                
                                # Lookup Translation
                                # 1. Get Index from Name
                                surah_idx = name_to_index.get(m.ayaName)
                                translation_text = ""
                                verse_key_trans = ""
                                
                                if surah_idx:
                                    verse_key_trans = f"{surah_idx}:{m.startIdx}"
                                    # Handle multi-verse match if needed?
                                    # Usually translation is per verse. If match spans multiple, we might want to join them.
                                    # For now, just get start verse.
                                    translation_text = translation_map.get(verse_key_trans, "")
                                    
                                    if m.endIdx > m.startIdx:
                                         # If multi-verse match, try to append subsequent verses?
                                         # e.g. 1:1-2
                                         for i in range(m.startIdx + 1, m.endIdx + 1):
                                             k = f"{surah_idx}:{i}"
                                             t = translation_map.get(k, "")
                                             if t:
                                                 translation_text += " " + t

                                # Key for JSON output (Standardized)
                                # prefer Index:Ayah if possible, else ArabicName:Ayah
                                verse_key = verse_key_trans if verse_key_trans else f"{m.ayaName}:{m.startIdx}"
                                if m.endIdx > m.startIdx:
                                     verse_key += f"-{m.endIdx}"
                                
                                found_verses.append({
                                    "original_file": file,
                                    "vol": vol_num,
                                    "surah": m.ayaName,
                                    "surah_idx": int(surah_idx) if surah_idx else None,
                                    "surah_idx": int(surah_idx) if surah_idx else None,
                                    "ayah_start": m.startIdx,
                                    "ayah_end": m.endIdx,
                                    "word_start": m.startInText,
                                    "word_end": m.endInText,
                                    "text_matched": m.getStr(),
                                    "translation": translation_text,
                                    "key": verse_key
                                })
                        
                        # Save extracted verses
                        if found_verses:
                            verses_filename = f"vol{vol_num}_{file}_verses.json"
                            with open(OUTPUT_DIR / verses_filename, "w", encoding="utf-8") as f:
                                json.dump(found_verses, f, ensure_ascii=False, indent=2)
                            print(f"Found {len(found_verses)} verses, saved to {verses_filename}")
                        else:
                            print("No verses found.")
                            
                    except Exception as e:
                        print(f"Error matching verses in {file}: {e}")
                        import traceback
                        traceback.print_exc()


def extract_text(path):
    path_str = str(path)
    if path_str.endswith(".docx"):
        try:
            doc = Document(path_str)
            return "\n".join([p.text for p in doc.paragraphs])
        except Exception as e:
            print(f"Error reading docx {path}: {e}")
            return None
    elif path_str.endswith(".doc"):
        try:
            # Use antiword
            result = subprocess.run(['antiword', path_str], capture_output=True, text=True)
            return result.stdout
        except Exception as e:
            print(f"Error reading doc {path}: {e}")
            return None
    return None

if __name__ == "__main__":
    if not OUTPUT_DIR.exists():
        os.makedirs(OUTPUT_DIR)
    ingest_files()
