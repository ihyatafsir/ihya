import os
import glob
import comtypes.client


# Set the directory containing the .doc files
directory = './'

# Create a list to store the paths to the converted .docx files
docx_filenames = []

# Iterate through all the .doc files in the directory
for filename in glob.glob(os.path.join(directory, '*.doc')):
    # Convert the .doc file to .docx using comtypes
    docx_filename = os.path.splitext(filename)[0] + '.docx'
    word = comtypes.client.CreateObject('Word.Application')
    doc = word.Documents.Open(filename)
    doc.SaveAs(docx_filename, FileFormat=16)
    doc.Close()
    word.Quit()
    docx_filenames.append(docx_filename)

# Sort the list of .docx filenames alphabetically
docx_filenames.sort()

# Create a string containing the paths to the .docx files, separated by spaces
docx_files = ' '.join(docx_filenames)

# Use pandoc to merge the .docx files into a single file
os.system(f'pandoc {docx_files} -s -o combined_document.docx')
