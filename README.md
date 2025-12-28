# Ihya Tafsir: A Quran-Centric Exploration of Ihya Ulum al-Din

This project is a scholarly and spiritual platform that maps Imam al-Ghazali's magnum opus, *Ihya Ulum al-Din* (The Revival of the Religious Sciences), as a commentary (Tafsir) on the Holy Quran. It provides a reverse-indexed portal where users can explore Quranic verses alongside relevant spiritual insights from Ghazali's 40 books.

## Features

- **IhyaTafsir+**: A curated stream of all Quranic verses containing direct commentary from the Ihya.
- **Surah Index**: Explore the Quran chronologically with highlighted verses that appear in Ghazali's works.
- **Unified Library**: Access all 40 books of the Ihya, organized into their traditional four quarters (Rub').
- **Deep Linking**: Seamlessly jump from an Ayah commentary directly to its context within the original book.

---

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **Python 3.x**
- **npm** (usually comes with Node.js)

---

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/ihyatafsir/ihya.git
cd ihya
```

### 2. Frontend Setup (Next.js)
```bash
cd web
npm install
```

### 3. Backend/Scripts Setup (Python)
It is recommended to use a virtual environment:
```bash
# From the root directory
python3 -m venv .venv
source .venv/bin/activate  # On Windows use `.venv\Scripts\activate`
pip install -r scripts/requirements.txt
```

---

## Running the Application

### Development Mode
To start the web application in development mode:
```bash
cd web
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
```bash
cd web
npm run build
npm run start
```

---

## Data Utilities (Scripts)

The project includes several utilities for data processing and indexing located in the `scripts/` directory.

### Build Tafsir Index
Used to refresh the master mapping between the Quran and the Ihya text:
```bash
python3 scripts/build_tafsir_index.py
```

### Extract Chapters
Extracts structural markers (Bab, Bayan, Fasl) from processed books:
```bash
python3 scripts/extract_chapters.py
```

---

## Directory Structure

- `web/`: The Next.js 16 frontend application.
- `data/`: Processed text files, metadata, and the master Tafsir index.
- `scripts/`: Python utilities for text ingestion, Quran detection, and indexing.
- `source/`: Original source documents (DOCX/TXT).

---

## License
*Internal project for Majlis al-Ghazali.*
