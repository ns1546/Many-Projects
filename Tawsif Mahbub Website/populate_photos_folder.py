import os
import shutil
import urllib.request
import urllib.parse
import re

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'}

FOLDER_NAME = "tawsif_handsome_photos_4years"
os.makedirs(FOLDER_NAME, exist_ok=True)
print(f"Created dedicated folder: {FOLDER_NAME}")

# 1. Copy curated top-resolution local photos from the project
local_sources = [
    ("public/assets/fb/tawsif_fb_cutout_original.png", "01_tawsif_sunglasses_jacket_editorial_2024.png"),
    ("public/assets/tawsif_hero.jpg", "02_tawsif_casual_denim_urban_photoshoot_2024.jpg"),
    ("public/assets/tawsif_bio_portrait.jpg", "03_tawsif_classic_studio_portrait_charcoal.jpg"),
    ("public/assets/gallery/portrait_editorial.jpg", "04_tawsif_editorial_mood_portrait_2023.jpg"),
    ("public/assets/gallery/portrait_studio.jpg", "05_tawsif_high_key_studio_portrait_2023.jpg"),
    ("public/assets/fb/tawsif_wiki.jpg", "06_tawsif_wikimedia_official_portrait.jpg"),
    ("public/assets/works/love_sab.jpg", "07_tawsif_love_sab_award_winning_look_2024.jpg"),
    ("public/assets/works/chokro_thriller.jpg", "08_tawsif_chokro_psychological_thriller_look_2024.jpg"),
    ("public/assets/fb/tawsif_interview_TDNsfrsd6gI.jpg", "09_tawsif_media_interview_candid_handsome_2024.jpg"),
    ("public/assets/fb/love_sub_real_ixLRVTBb7kY.jpg", "10_tawsif_love_sab_cinematic_close_2024.jpg"),
    ("public/assets/fb/chokro_real_ItUDjnVdfsI.jpg", "11_tawsif_chokro_ott_series_look_2024.jpg"),
    ("public/assets/fb/bachelor_point_real_7EY1_XxBGUc.jpg", "12_tawsif_nehal_bachelor_point_style.jpg"),
    ("public/assets/fb/shadhinota_o3RaucurRXg.jpg", "13_tawsif_shadhinota_tumi_historical_look_2022.jpg"),
    ("public/assets/fb/keya_pair_IbMWovXvIBk.jpg", "14_tawsif_moner_manush_romantic_hero_2023.jpg"),
    ("public/assets/fb/tisha_pair_7WsEPNKciLI.jpg", "15_tawsif_dramatic_lead_with_tisha_2023.jpg"),
    ("public/assets/fb/aro_ekbar_9xy_4lH5LrE.jpg", "16_tawsif_aro_ekbar_panjabi_stylish_2023.jpg"),
    ("public/assets/tawsif_standing_cutout.png", "17_tawsif_standing_full_pose_cutout.png"),
    ("public/assets/tawsif_sunglasses_cutout.png", "18_tawsif_sunglasses_close_cutout.png")
]

for src, dst_name in local_sources:
    if os.path.exists(src):
        dst = os.path.join(FOLDER_NAME, dst_name)
        shutil.copy2(src, dst)
        size_kb = os.path.getsize(dst) // 1024
        print(f"[Copied] {dst_name} ({size_kb} KB)")

# 2. Download additional 1080p full HD recent photoshoots and looks (2022-2026) via YouTube High Res
def fetch_yt_maxres(query, out_filename):
    url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(query)}"
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
        
        vids = re.findall(r'"videoId":"([a-zA-Z0-9_-]{11})"', html)
        for vid in list(dict.fromkeys(vids))[:5]:
            for res in ['maxresdefault.jpg', 'hq720.jpg', 'hqdefault.jpg']:
                thumb_url = f"https://img.youtube.com/vi/{vid}/{res}"
                try:
                    t_req = urllib.request.Request(thumb_url, headers=HEADERS)
                    with urllib.request.urlopen(t_req, timeout=8) as r:
                        content = r.read()
                    # ensure valid image size
                    if len(content) > 35000:
                        target_path = os.path.join(FOLDER_NAME, out_filename)
                        with open(target_path, 'wb') as f:
                            f.write(content)
                        size_kb = len(content) // 1024
                        print(f"[Downloaded HD] {out_filename} ({size_kb} KB) from vid={vid}")
                        return True
                except:
                    continue
    except Exception as e:
        print(f"Failed query '{query}': {e}")
    return False

web_fetches = [
    ("Tawsif Mahbub Meril Prothom Alo award 2024", "19_tawsif_meril_prothom_alo_award_stage_2024.jpg"),
    ("Tawsif Mahbub Meril Prothom Alo red carpet", "20_tawsif_red_carpet_award_ceremony_2024.jpg"),
    ("Beshi Bole Bulbuli Tawsif Mahbub natok", "21_tawsif_beshi_bole_bulbuli_romantic_look_2024.jpg"),
    ("Beshi Bole Bulbuli 2 Tawsif Mahbub", "22_tawsif_bulbuli_2_stylish_look_2024.jpg"),
    ("Tawsif Mahbub Hajot natok", "23_tawsif_hajot_intense_character_look_2024.jpg"),
    ("Tawsif Mahbub Not A Love Story natok", "24_tawsif_not_a_love_story_modern_look_2024.jpg"),
    ("Tawsif Mahbub Eid natok Panjabi look", "25_tawsif_eid_festive_panjabi_photoshoot.jpg"),
    ("Tawsif Mahbub Zara wedding anniversary interview", "26_tawsif_mahbub_with_zara_anniversary.jpg"),
    ("Tawsif Mahbub Celebrity Cricket Tournament CCT", "27_tawsif_celebrity_cricket_athletic_look.jpg"),
    ("Tawsif Mahbub Cholo Hariye Jai natok", "28_tawsif_cholo_hariye_jai_hero_look_2025.jpg"),
    ("Tawsif Mahbub Jokhom natok 2026", "29_tawsif_jokhom_dramatic_action_2026.jpg"),
    ("Tawsif Mahbub stylish interview 2024", "30_tawsif_urban_handsome_casual_2024.jpg")
]

for query, fname in web_fetches:
    fetch_yt_maxres(query, fname)

# Print summary
all_files = os.listdir(FOLDER_NAME)
print(f"\n==========================================")
print(f"Total Handsome Photos Collected: {len(all_files)}")
print(f"Folder Path: {os.path.abspath(FOLDER_NAME)}")
print(f"==========================================")
for f in sorted(all_files):
    size_kb = os.path.getsize(os.path.join(FOLDER_NAME, f)) // 1024
    print(f"  • {f} ({size_kb} KB)")
