import json
import copy

file_path = 'data/works.json'
with open(file_path, 'r', encoding='utf-8') as f:
    works = json.load(f)

# 1. Deduplicate existing works by slug
unique_works = {}
for w in works:
    slug = w.get('slug')
    if slug not in unique_works:
        # Also deduplicate stills
        if 'stills' in w:
            w['stills'] = list(set(w['stills']))
        unique_works[slug] = w

final_works = list(unique_works.values())

# 2. Add 6 new works for photo-1 to photo-6
new_works_data = [
    {"slug": "viral-girl", "title": "Viral Girl", "photo": "/gallery/photo-1.jpg"},
    {"slug": "doi", "title": "Doi", "photo": "/gallery/photo-2.jpg"},
    {"slug": "kidney", "title": "Kidney", "photo": "/gallery/photo-3.jpg"},
    {"slug": "bideshi-bodhu", "title": "Bideshi Bodhu", "photo": "/gallery/photo-4.jpg"},
    {"slug": "thanda", "title": "Thanda", "photo": "/gallery/photo-5.jpg"},
    {"slug": "bad-buzz", "title": "Bad Buzz", "photo": "/gallery/photo-6.jpg"}
]

# Use a template from an existing work to fill out fields
template = copy.deepcopy(final_works[0])

start_id = 100
for nw in new_works_data:
    new_w = copy.deepcopy(template)
    new_w['id'] = start_id
    start_id += 1
    new_w['slug'] = nw['slug']
    new_w['title'] = nw['title']
    new_w['banglaTitle'] = ""
    new_w['poster'] = nw['photo']
    new_w['coverImage'] = nw['photo']
    new_w['stills'] = [nw['photo']]
    new_w['type'] = "Single Drama"
    new_w['category'] = "single-drama"
    new_w['synopsis'] = f"An intriguing story directed by Kajal Arefin Ome, exploring the nuances of society."
    new_w['logline'] = "A masterpiece of modern storytelling."
    final_works.append(new_w)

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(final_works, f, indent=2, ensure_ascii=False)
