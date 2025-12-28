import os
import json
import re

DATA_DIR = '/home/absolut7/Documents/ghazali/ihyatafsir/data'
PROCESSED_DIR = os.path.join(DATA_DIR, 'processed')
OUTPUT_FILE = os.path.join(DATA_DIR, 'book_metadata.json')

# The 40 books of Ihya Ulum al-Din
IHYA_BOOKS = [
    {"id": 1, "ename": "Book of Knowledge", "aname": "كتاب العلم"},
    {"id": 2, "ename": "Foundations of Belief", "aname": "كتاب قواعد العقائد"},
    {"id": 3, "ename": "Mysteries of Purity", "aname": "كتاب أسرار الطهارة"},
    {"id": 4, "ename": "Secrets of Prayer", "aname": "كتاب أسرار الصلاة"},
    {"id": 5, "ename": "Secrets of Zakat", "aname": "كتاب أسرار الزكاة"},
    {"id": 6, "ename": "Secrets of Fasting", "aname": "كتاب أسرار الصوم"},
    {"id": 7, "ename": "Secrets of Hajj", "aname": "كتاب أسرار الحج"},
    {"id": 8, "ename": "Etiquette of Quran Recitation", "aname": "كتاب آداب تلاوة القرآن"},
    {"id": 9, "ename": "Invocations and Supplications", "aname": "كتاب الأذكار والدعوات"},
    {"id": 10, "ename": "Arrangement of Litanies", "aname": "كتاب ترتيب الأوراد وتفصيل إحياء الليل"},
    {"id": 11, "ename": "Etiquette of Eating", "aname": "كتاب آداب الأكل"},
    {"id": 12, "ename": "Etiquette of Marriage", "aname": "كتاب آداب النكاح"},
    {"id": 13, "ename": "Etiquette of Earning a Livelihood", "aname": "كتاب آداب الكسب والمعاش"},
    {"id": 14, "ename": "The Lawful and Prohibited", "aname": "كتاب الحلال والحرام"},
    {"id": 15, "ename": "Etiquette of Companionship", "aname": "كتاب آداب الصحبة والمعاشرة"},
    {"id": 16, "ename": "Etiquette of Seclusion", "aname": "كتاب آداب العزلة"},
    {"id": 17, "ename": "Etiquette of Travel", "aname": "كتاب آداب السفر"},
    {"id": 18, "ename": "Etiquette of Sama and Wajd", "aname": "كتاب آداب السماع والوجد"},
    {"id": 19, "ename": "Enjoining Good and Forbidding Evil", "aname": "كتاب الأمر بالمعروف والنهي عن المنكر"},
    {"id": 20, "ename": "Prophetic Mannerisms", "aname": "كتاب آداب المعيشة وأخلاق النبوة"},
    {"id": 21, "ename": "Wonders of the Heart", "aname": "كتاب عجائب القلب"},
    {"id": 22, "ename": "Disciplining the Soul", "aname": "كتاب رياضة النفس"},
    {"id": 23, "ename": "Breaking the Two Desires", "aname": "كتاب كسر الشهوتين"},
    {"id": 24, "ename": "Harms of the Tongue", "aname": "كتاب آفات اللسان"},
    {"id": 25, "ename": "Condemnation of Anger and Envy", "aname": "كتاب ذم الغضب والحقد والحسد"},
    {"id": 26, "ename": "Condemnation of the World", "aname": "كتاب ذم الدنيا"},
    {"id": 27, "ename": "Condemnation of Miserliness", "aname": "كتاب ذم البخل وذم حب المال"},
    {"id": 28, "ename": "Condemnation of Status and Ostentation", "aname": "كتاب ذم الجاه والرياء"},
    {"id": 29, "ename": "Condemnation of Pride and Conceit", "aname": "كتاب ذم الكبر والعجب"},
    {"id": 30, "ename": "Condemnation of Self-Delusion", "aname": "كتاب ذم الغرور"},
    {"id": 31, "ename": "Repentance", "aname": "كتاب التوبة"},
    {"id": 32, "ename": "Patience and Gratitude", "aname": "كتاب الصبر والشكر"},
    {"id": 33, "ename": "Fear and Hope", "aname": "كتاب الخوف والرجاء"},
    {"id": 34, "ename": "Poverty and Abstinence", "aname": "كتاب الفقر والزهد"},
    {"id": 35, "ename": "Tawhid and Trust", "aname": "كتاب التوحيد والتوكل"},
    {"id": 36, "ename": "Love, Longing, and Intimacy", "aname": "كتاب المحبة والشوق والأنس والرضا"},
    {"id": 37, "ename": "Intention, Sincerity, and Truthfulness", "aname": "كتاب النية والإخلاص والصدق"},
    {"id": 38, "ename": "Watchfulness and Self-Examination", "aname": "كتاب المراقبة والمحاسبة"},
    {"id": 39, "ename": "Meditation", "aname": "كتاب التفكر"},
    {"id": 40, "ename": "Remembrance of Death", "aname": "كتاب ذكر الموت وما بعده"}
]

def clean_arabic(text):
    # Basic normalization for matching
    text = re.sub(r'[^\u0621-\u064A\s]', '', text)
    return ' '.join(text.split())

def extract_title(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()[:50]
        for line in lines:
            if 'كتاب' in line:
                # Find the longest string starting with 'كتاب'
                match = re.search(r'كتاب\s+[\u0621-\u064A\s]+', line)
                if match:
                    return match.group(0).strip()
    return None

def main():
    metadata = {}
    processed_files = [f for f in os.listdir(PROCESSED_DIR) if f.endswith('.doc.txt')]
    
    # Sort for consistent processing
    processed_files.sort()
    
    print(f"Processing {len(processed_files)} files...")
    
    for filename in processed_files:
        full_path = os.path.join(PROCESSED_DIR, filename)
        book_id = filename.replace('.txt', '')
        
        # Determine volume from filename
        vol = 0
        if 'vol1' in filename: vol = 1
        elif 'vol2' in filename: vol = 2
        elif 'vol3' in filename: vol = 3
        elif 'vol4' in filename: vol = 4
        
        extracted = extract_title(full_path)
        
        # Try to match with IHYA_BOOKS
        best_match = None
        if extracted:
            clean_extracted = clean_arabic(extracted)
            for b in IHYA_BOOKS:
                clean_target = clean_arabic(b['aname'])
                # If target is in extracted or vice versa (fuzzy match)
                if clean_target in clean_extracted or clean_extracted in clean_target:
                    best_match = b
                    break
        
        # Fallback to filename if no match (e.g. if title is split or missing)
        # Using the number in filename as a hint
        if not best_match:
            num_match = re.search(r'book-?(\d+)', filename)
            if not num_match:
                num_match = re.search(r'k(\d+)', filename)
            
            if num_match:
                book_num = int(num_match.group(1))
                # Map to global book number (1-40)
                global_num = (vol - 1) * 10 + book_num
                if 1 <= global_num <= 40:
                    best_match = IHYA_BOOKS[global_num - 1]

        metadata[book_id] = {
            "id": book_id,
            "original_file": filename,
            "vol": vol,
            "arabic_title": extracted if extracted else (best_match['aname'] if best_match else "Unknown"),
            "english_title": best_match['ename'] if best_match else "Unknown",
            "global_id": best_match['id'] if best_match else None
        }

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    
    print(f"Exported metadata to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
