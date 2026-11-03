import json

file_path = 'data/works.json'
with open(file_path, 'r', encoding='utf-8') as f:
    works = json.load(f)

bp_image = "https://image.tmdb.org/t/p/original/wwssjtMAYKwgNTyMld38Ivkfqyi.jpg"
doi_image = "https://a.ltrbxd.com/resized/film-poster/1/0/7/9/5/1/1/1079511-doi-0-1000-0-1500-crop.jpg?v=ea08732804"

for w in works:
    title = w.get('title', '').lower()
    if 'bachelor point' in title:
        w['poster'] = bp_image
        w['coverImage'] = bp_image
        w['stills'] = [bp_image, bp_image]
    elif 'doi' == title:
        w['poster'] = doi_image
        w['coverImage'] = doi_image
        w['stills'] = [doi_image, doi_image]

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(works, f, indent=2, ensure_ascii=False)
