import os
import json
import re

DATA_DIR = "/home/absolut7/Documents/ghazali/ihyatafsir/data"
PROCESSED_DIR = os.path.join(DATA_DIR, "processed")
OUTPUT_FILE = os.path.join(DATA_DIR, "book_structure.json")
METADATA_FILE = os.path.join(DATA_DIR, "book_metadata.json")

# Structural Markers in Ihya
# ^الباب (Chapter/Door)
# ^فصل (Section)
# ^بيان (Explanation/Discourse)
# ^ذكر (Mentioning/Details)
MARKERS = [
    r"^الباب\s+[\u0621-\u064A]+",
    r"^فصل",
    r"^بيان\s",
    r"^ذكر\s"
]

def extract_chapters():
    if not os.path.exists(METADATA_FILE):
        print("Metadata file not found.")
        return

    with open(METADATA_FILE, 'r', encoding='utf-8') as f:
        metadata = json.load(f)

    structure = {}

    for book_id, info in metadata.items():
        txt_file = os.path.join(PROCESSED_DIR, info['original_file'])
        if not os.path.exists(txt_file):
            print(f"Skipping {book_id}, file not found: {txt_file}")
            continue

        print(f"Processing {book_id}...")
        with open(txt_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Split into words to get indices
        words = content.split()
        
        # We also need to process line by line to detect markers at the beginning of lines
        lines = content.split('\n')
        
        chapters = []
        current_word_idx = 0
        
        # Keep track of words per line to map line start to word index
        line_word_offsets = []
        temp_idx = 0
        for line in lines:
            line_word_offsets.append(temp_idx)
            temp_idx += len(line.split())

        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue
                
            is_marker = False
            for marker in MARKERS:
                if re.match(marker, line):
                    is_marker = True
                    break
            
            # Additional check: often markers are centered or have specific length
            # and they are followed by a title. 
            # We filter out the table of contents list if it's too short or in a list
            if is_marker:
                # Basic heuristic: ignore if it's part of the initial list (usually first 50 lines)
                # but keep the actual headers. 
                # Actually, in Book 1, 'الباب الأول' appears on line 22, while the list starts on line 9.
                # Let's check for colon or if it looks like a list item.
                if ":" in line and i < 50:
                    continue # Likely TOC entry
                
                chapters.append({
                    "title": line,
                    "word_start": line_word_offsets[i]
                })

        structure[book_id] = {
            "book_id": book_id,
            "arabic_title": info['arabic_title'],
            "english_title": info['english_title'],
            "vol": info['vol'],
            "global_id": info['global_id'],
            "chapters": chapters
        }

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(structure, f, ensure_ascii=False, indent=2)

    print(f"Structure saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    extract_chapters()
