import zipfile
import xml.etree.ElementTree as ET
import sys
import os

doc_path = 'Tawsif Website.docx'
z = zipfile.ZipFile(doc_path)

rels_xml = z.read('word/_rels/document.xml.rels')
rels_root = ET.fromstring(rels_xml)
rel_map = {rel.attrib['Id']: rel.attrib.get('Target', '') for rel in rels_root}

doc_xml = z.read('word/document.xml')
doc_root = ET.fromstring(doc_xml)

ns = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
}

with open('docx_summary.txt', 'w', encoding='utf-8') as out:
    tables = doc_root.findall('.//w:tbl', ns)
    out.write(f"Total tables: {len(tables)}\n")
    for t_idx, tbl in enumerate(tables):
        out.write(f"\n=== TABLE {t_idx} ===\n")
        rows = tbl.findall('.//w:tr', ns)
        for r_idx, row in enumerate(rows):
            cells = row.findall('.//w:tc', ns)
            out.write(f"\n--- ROW {r_idx} (cells: {len(cells)}) ---\n")
            for c_idx, cell in enumerate(cells):
                texts = [t.text for t in cell.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if t.text]
                cell_text = '\n'.join(texts).strip()
                cell_imgs = []
                for blip in cell.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}blip'):
                    eid = blip.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed')
                    if eid and eid in rel_map:
                        cell_imgs.append(rel_map[eid])
                out.write(f"Col {c_idx}:\nText:\n{cell_text}\nImages ({len(cell_imgs)}): {cell_imgs}\n\n")

    out.write("\n=== ALL PARAGRAPHS ===\n")
    for p in doc_root.findall('.//w:p', ns):
        texts = [t.text for t in p.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if t.text]
        txt = ''.join(texts).strip()
        if txt:
            out.write(f"P: {txt}\n")

print("Wrote docx_summary.txt successfully")
