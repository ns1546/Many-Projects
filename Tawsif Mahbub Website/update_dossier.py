import re

# Read current dossierData.js
with open('src/data/dossierData.js', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update pillarCards
new_pillar_cards = '''export const pillarCards = [
  {
    id: "romance",
    title: "MODERN ROMANCE",
    subtitle: "Sensitive, nuanced urban romantic telefilms that moved a generation.",
    badge: "MERIL-PROTHOM ALO WINNER",
    linkText: "VIEW ROMANCE ARCHIVE",
    image: "/assets/works/chuye_dilam_tomay.jpg",
    worksCount: "60+ Telefilms"
  },
  {
    id: "thriller",
    title: "PSYCHOLOGICAL THRILLERS",
    subtitle: "Challenging scripts, occult cults, and intense character studies.",
    badge: "iSCREEN & HOICHOI ORIGINALS",
    linkText: "VIEW THRILLER ARCHIVE",
    image: "/assets/works/chokro_s2.jpg",
    worksCount: "Chokro S1 & S2"
  },
  {
    id: "comedy",
    title: "YOUTH & CULT COMEDIES",
    subtitle: "From Nehal in Bachelor Point to high-energy festive blockbusters.",
    badge: "CULT PHENOMENON",
    linkText: "VIEW COMEDY ARCHIVE",
    image: "/assets/works/bachelor_point_s5.jpg",
    worksCount: "100M+ Franchise Views"
  }
];'''

# Replace pillarCards
text = re.sub(r'export const pillarCards = \[.*?\];', new_pillar_cards, text, flags=re.DOTALL)

# 2. Update allFilmographyWorks
new_filmography = '''export const allFilmographyWorks = [
  {
    id: 1,
    title: "Chuye Dilam Tomay (ছুঁয়ে দিলাম তোমায়)",
    category: "Romance",
    year: "2026",
    platform: "Capital Drama / YouTube",
    badge: "2026 NEW RELEASE",
    director: "Rubel Hasan",
    roleName: "Lead Romantic Male",
    coStar: "Tanjim Saiara Totini & Naznin Niha",
    image: "/assets/works/chuye_dilam_tomay.jpg",
    youtubeUrl: "https://www.youtube.com/results?search_query=Chuye+Dilam+Tomay+Tawsif+Totini+Niha+Capital+Drama",
    synopsis: "A picturesque romantic telefilm directed by Rubel Hasan, capturing the delicate blossoming of affection amidst the gentle riverways and picturesque landscapes of rural Bengal. Starring Tawsif Mahbub alongside Tanjim Saiara Totini and Naznin Niha."
  },
  {
    id: 2,
    title: "Amar Rajje Tumi (আমার রাজ্যে তুমি)",
    category: "Romance",
    year: "2026",
    platform: "Capital Drama / YouTube",
    badge: "FESTIVAL BLOCKBUSTER",
    director: "Masrikul Alam",
    roleName: "The Devoted Suitor",
    coStar: "Keya Payel & Malaika",
    image: "/assets/works/amar_rajje_tumi.jpg",
    youtubeUrl: "https://www.youtube.com/results?search_query=Amar+Rajje+Tumi+Tawsif+Mahbub+Keya+Payel+Capital+Drama",
    synopsis: "Directed by Masrikul Alam, this vibrant romantic drama pairs Tawsif Mahbub with Keya Payel and Malaika in a charming story of courtship, familial expectations, and steadfast modern love."
  },
  {
    id: 3,
    title: "Aponpor (আপনপর)",
    category: "Drama",
    year: "2026",
    platform: "CMV Official / YouTube",
    badge: "CRITICALLY ACCLAIMED",
    director: "Rubel Hasan",
    roleName: "Lead Protagonist",
    coStar: "Sadnima",
    image: "/assets/works/aponpor.jpg",
    youtubeUrl: "https://www.youtube.com/results?search_query=Aponpor+Tawsif+Mahbub+Sadnima+Rubel+Hasan+CMV",
    synopsis: "A deeply moving social and family drama produced by CMV and directed by Rubel Hasan. Tawsif delivers a layered, introspective performance opposite Sadnima exploring the fine line between kinship and estrangement."
  },
  {
    id: 4,
    title: "Warish (ওয়ারিশ)",
    category: "Drama",
    year: "2026",
    platform: "CMV Official / YouTube",
    badge: "ENSEMBLE MASTERPIECE",
    director: "Imraul Rafat",
    roleName: "Family Heir",
    coStar: "Tariq Anam Khan, Safa Kabir, Yash Rohan, Priyontee Urbee",
    image: "/assets/works/warish.jpg",
    youtubeUrl: "https://www.youtube.com/results?search_query=Warish+Tawsif+Mahbub+Yash+Rohan+Safa+Kabir+CMV",
    synopsis: "An illustrious high-stakes family ensemble directed by Imraul Rafat. Alongside veteran actor Tariq Anam Khan, Safa Kabir, and Yash Rohan, Tawsif navigates generational inheritance, familial pride, and emotional reckoning."
  },
  {
    id: 5,
    title: "Dorodia (দরদিয়া)",
    category: "Romance",
    year: "2026",
    platform: "CMV Drama / YouTube",
    badge: "SUPERHIT SOUNDTRACK",
    director: "Mohidul Mohim",
    roleName: "Romantic Lead",
    coStar: "Naznin Niha",
    image: "/assets/works/dorodia.jpg",
    youtubeUrl: "https://www.youtube.com/results?search_query=Dorodia+Tawsif+Mahbub+Naznin+Niha+Amar+Ful+Tumi",
    synopsis: "A poignant, sweeping romantic special featuring the chart-topping hit OST 'Amar Ful Tumi' (sung by Imran Mahmudul and Atiya Anisha). Tawsif and Naznin Niha capture the tender, bittersweet essence of emotional longing."
  },
  {
    id: 6,
    title: "Tui Theke Tumi (তুই থেকে তুমি)",
    category: "Romance",
    year: "2025–2026",
    platform: "Sultan Entertainment",
    badge: "RECORD VIEWS",
    director: "Jakaria Showkhin",
    roleName: "Lifelong Companion",
    coStar: "Naznin Niha",
    image: "/assets/works/tui_theke_tumi.jpg",
    youtubeUrl: "https://www.youtube.com/results?search_query=Tui+Theke+Tumi+Tawsif+Mahbub+Naznin+Niha+Sultan",
    synopsis: "Chronicling the nostalgic transformation from childhood friendship to unconditional romantic devotion, featuring the popular duet 'Jonak Jola Rate' performed by Imran and Porshi."
  },
  {
    id: 7,
    title: "Bachelor Point Season 5 (ব্যাচেলর পয়েন্ট সিজন ৫)",
    category: "Comedy",
    year: "2024–2026",
    platform: "Boom Films / Bongo",
    badge: "CULT PHENOMENON",
    director: "Kajal Arefin Ome",
    roleName: "Nehal",
    coStar: "Mishu Sabbir, Marzuk Russell, Ziaul Hoque Polash",
    image: "/assets/works/bachelor_point_s5.jpg",
    youtubeUrl: "https://www.youtube.com/results?search_query=Bachelor+Point+Season+5+Nehal+Tawsif+Mahbub+Bongo",
    synopsis: "The triumphant continuation of Bangladesh's biggest television comedy franchise. Tawsif returns as the beloved anchor bachelor Nehal, balancing the chaotic flat dynamics with warmth and comedic precision."
  },
  {
    id: 8,
    title: "Chokro Season 2 (চক্র সিজন ২)",
    category: "Thriller",
    year: "2025–2026",
    platform: "iScreen Original Series",
    badge: "BIFA BEST ACTOR WINNER",
    director: "Vicky Zahed",
    roleName: "Gautam (Protagonist)",
    coStar: "Tasnia Farin, Azmeri Haque Badhon",
    image: "/assets/works/chokro_s2.jpg",
    youtubeUrl: "https://www.youtube.com/results?search_query=Chokro+Season+2+iScreen+Tawsif+Mahbub+Vicky+Zahed",
    synopsis: "The highly anticipated continuation of Vicky Zahed's occult psychological noir. Tawsif delves deeper into existential terror and dark esoteric cults following his BIFA Best Actor winning debut."
  },
  {
    id: 9,
    title: "Not A Love Story (নট আ লাভ স্টোরি)",
    category: "Drama",
    year: "2024",
    platform: "CMV Official / YouTube",
    badge: "MODERN CLASSIC",
    director: "Rubel Hasan",
    roleName: "Urban Professional",
    coStar: "Tanjim Saiara Totini",
    image: "/assets/works/not_a_love_story.jpg",
    youtubeUrl: "https://www.youtube.com/results?search_query=Not+A+Love+Story+Tawsif+Mahbub+Totini+CMV",
    synopsis: "An incisive, unvarnished portrait of contemporary relationship pragmatism in modern Dhaka. Tawsif and Totini showcase raw, understated dramatic maturity."
  },
  {
    id: 10,
    title: "First Love (ফার্স্ট লাভ)",
    category: "Romance",
    year: "2025–2026",
    platform: "Capital Drama / YouTube",
    badge: "FAN FAVORITE",
    director: "Hasib Hossain Rakhi",
    roleName: "First Love Suitor",
    coStar: "Co-Star Ensemble",
    image: "/assets/works/first_love.jpg",
    youtubeUrl: "https://www.youtube.com/results?search_query=First+Love+Tawsif+Mahbub+Capital+Drama",
    synopsis: "A lighthearted, nostalgic celebration of first romance, youthful idealism, and sweet comedic misunderstandings."
  },
  {
    id: 11,
    title: "Love Sab (লাভ সাব)",
    category: "Romance",
    year: "2024",
    platform: "CMV Drama / YouTube",
    badge: "MERIL-PROTHOM ALO WINNER",
    director: "Probir Roy Chowdhury",
    roleName: "Ashik (Lead Romantic)",
    coStar: "Tanjim Saiara Totini",
    image: "/assets/works/love_sab.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=wmFcXOIm4Cs",
    synopsis: "The landmark romantic drama that earned Tawsif Mahbub the Meril-Prothom Alo Award for Best TV Actor. A tender and deeply relatable exploration of contemporary urban relationship hesitation."
  },
  {
    id: 12,
    title: "Moneri Ronge Rangiye (মনেরই রঙে রাঙিয়ে)",
    category: "Romance",
    year: "2025",
    platform: "Valentine Special / YouTube",
    badge: "VALENTINE HIT",
    director: "KM Sohag Rana",
    roleName: "Charming Suitor",
    coStar: "Porshi",
    image: "/assets/works/chuye_dilam_tomay_totini.jpg",
    youtubeUrl: "https://www.youtube.com/results?search_query=Moneri+Ronge+Rangiye+Tawsif+Mahbub+Porshi",
    synopsis: "A vibrant musical Valentine's Day telefilm pairing Tawsif with songstress and actress Porshi, celebrating warmth, colorful melodies, and innocent romance."
  },
  {
    id: 13,
    title: "Emon Dine Tare Bola Jay (এমন দিনে তারে বলা যায়)",
    category: "Romance",
    year: "2025",
    platform: "Rain Special / YouTube",
    badge: "MONSOON POETRY",
    director: "Mir Rabby",
    roleName: "Poetic Lover",
    coStar: "Priyontee Urbee",
    image: "/assets/works/amar_rajje_tumi_trio.jpg",
    youtubeUrl: "https://www.youtube.com/results?search_query=Emon+Dine+Tare+Bola+Jay+Tawsif+Mahbub+Priyontee+Urbee",
    synopsis: "Inspired by classical Bengali rain poetry, this atmospheric romantic drama explores the magical intimacy of rainy afternoons and unspoken love confessions."
  },
  {
    id: 14,
    title: "Okarone Bhalobashi (অকারণে ভালোবাসি)",
    category: "Romance",
    year: "2026",
    platform: "Exclusive Drama / YouTube",
    badge: "EXCLUSIVE PREMIERE",
    director: "Mohidul Mohim",
    roleName: "Selfless Lover",
    coStar: "Keya Payel",
    image: "/assets/works/keya_payel_hit.jpg",
    youtubeUrl: "https://www.youtube.com/results?search_query=Okarone+Bhalobashi+Tawsif+Mahbub+Keya+Payel",
    synopsis: "An emotionally resonant telefilm chronicling love without preconditions or selfish calculations, starring the celebrated on-screen pairing of Tawsif and Keya Payel."
  },
  {
    id: 15,
    title: "Mon Dewana (মন দিওয়ানা)",
    category: "Romance",
    year: "2025",
    platform: "Eid Special / YouTube",
    badge: "EID BLOCKBUSTER",
    director: "Rafat Mozumder Rinku",
    roleName: "Passionate Devotee",
    coStar: "Tanjim Saiara Totini",
    image: "/assets/works/tisha_romantic.jpg",
    youtubeUrl: "https://www.youtube.com/results?search_query=Mon+Dewana+Tawsif+Mahbub+Totini+Eid+Natok",
    synopsis: "A high-spirited festive romantic telefilm full of comedic charm, energetic musical sequences, and radiant chemistry between Tawsif and Totini."
  },
  {
    id: 16,
    title: "Uraal Pakhi (উড়াল পাখি)",
    category: "Romance",
    year: "2023",
    platform: "Sultan Entertainment",
    badge: "35M+ RECORD VIEWS",
    director: "Jakaria Showkhin",
    roleName: "Devoted Lover",
    coStar: "Keya Payel",
    image: "/assets/works/uraal_pakhi.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=rFIBJbZbnMY",
    synopsis: "A soaring Eid romantic drama featuring the timeless hit song 'Sokhi Tomare Badibo'. Tawsif and Keya Payel deliver unforgettable screen chemistry."
  },
  {
    id: 17,
    title: "@18 All Time Dourer Upor (@১৮ অল টাইম দৌড়ের উপর)",
    category: "Comedy",
    year: "2013",
    platform: "NTV / G Series",
    badge: "HISTORIC DEBUT",
    director: "Redoan Rony & Adnan Al Rajeev",
    roleName: "Imran / Fahim",
    coStar: "Siam Ahmed, Sabila Nur, Allen Shubhro",
    image: "/assets/works/all_time_dourer_upor.jpg",
    youtubeUrl: "https://www.youtube.com/results?search_query=All+Time+Dourer+Upor+Redoan+Rony",
    synopsis: "The legendary 2013 youth telefilm that launched Tawsif Mahbub into stardom overnight. Playing the frantic teenager racing against time through Dhaka's streets, this film reshaped modern youth television in Bangladesh."
  },
  {
    id: 18,
    title: "Shukhi Attma (সুখী আত্মা)",
    category: "Drama",
    year: "2022",
    platform: "Channel i Prime / YouTube",
    badge: "CRITICS CHOICE",
    director: "Vicky Zahed",
    roleName: "The Tormented Soul",
    coStar: "Mehazabien Chowdhury",
    image: "/assets/works/shukhi_attma.jpg",
    youtubeUrl: "https://www.youtube.com/results?search_query=Shukhi+Attma+Tawsif+Mahbub+Vicky+Zahed",
    synopsis: "A surreal, poignant psychological mystery exploring guilt, grief, and the ethereal search for spiritual solace following tragic loss."
  },
  {
    id: 19,
    title: "Mayer Daak (মায়ের ডাক)",
    category: "Drama",
    year: "2021",
    platform: "RTV Drama",
    badge: "RTV STAR AWARDS NOMINEE",
    director: "Mizanur Rahman Aryan",
    roleName: "Eldest Son",
    coStar: "Dilara Zaman, Tanjin Tisha, Jovan",
    image: "/assets/works/mayer_daak.jpg",
    youtubeUrl: "https://www.youtube.com/results?search_query=Mayer+Daak+Tawsif+Mahbub+Mizanur+Rahman+Aryan",
    synopsis: "A critically praised family masterpiece chronicling the emotional struggles of siblings returning to their aging mother during difficult times."
  },
  {
    id: 20,
    title: "Dhaka Metro (ঢাকা মেট্রো)",
    category: "Thriller",
    year: "2019",
    platform: "Hoichoi Original Series",
    badge: "HOICHOI OTT ORIGINAL",
    director: "Amitabh Reza Chowdhury",
    roleName: "Guest Lead",
    coStar: "Neville Ferdous Hasan, Aupee Karim",
    image: "/assets/works/dhaka_metro.jpg",
    youtubeUrl: "https://www.youtube.com/results?search_query=Dhaka+Metro+Hoichoi+Amitabh+Reza",
    synopsis: "Amitabh Reza Chowdhury's existential highway thriller following a burnt-out man driving aimlessly away from Dhaka, encountering poetic souls along the highway."
  },
  {
    id: 21,
    title: "Shadhinota Tumi (স্বাধীনতা তুমি)",
    category: "Drama",
    year: "2022",
    platform: "Victory Day Special",
    badge: "LIBERATION WAR DRAMA",
    director: "Rafat Mozumder Rinku",
    roleName: "Guerrilla Freedom Fighter",
    coStar: "Tanjin Tisha",
    image: "/assets/works/shadhinota_1971.jpg",
    youtubeUrl: "https://www.youtube.com/results?search_query=Shadhinota+Tumi+Tawsif+Mahbub",
    synopsis: "A harrowing, deeply respectful historical drama recreating 1971 wartime bravery, supreme sacrifice, and the enduring resilience of Bengali freedom fighters."
  },
  {
    id: 22,
    title: "Bou Bojhena (বউ বোঝেনা 1 & 2)",
    category: "Comedy",
    year: "2023",
    platform: "CMV Official",
    badge: "VIRAL BLOCKBUSTER",
    director: "Masrikul Alam",
    roleName: "The Newlywed Husband",
    coStar: "Keya Payel, Monira Mithu",
    image: "/assets/works/bou_bojhena.jpg",
    youtubeUrl: "https://www.youtube.com/results?search_query=Bou+Bojhena+Tawsif+Mahbub+Keya+Payel",
    synopsis: "A laugh-out-loud matrimonial comedy highlighting the hilarious misadventures and heartwarming compromises of newlywed urban life in Dhaka."
  },
  {
    id: 23,
    title: "Nobabi Prem (নবাবী প্রেম)",
    category: "Romance",
    year: "2022",
    platform: "CMV Official",
    badge: "ROMANTIC HIT",
    director: "Mohidul Mohim",
    roleName: "Nawab",
    coStar: "Tanjin Tisha",
    image: "/assets/works/nobabi_prem.jpg",
    youtubeUrl: "https://www.youtube.com/results?search_query=Nobabi+Prem+Tawsif+Mahbub+Tanjin+Tisha",
    synopsis: "A high-spirited romance set against the vibrant cultural tapestry of Old Dhaka, showcasing effortless comedic timing between Tawsif Mahbub and Tanjin Tisha."
  },
  {
    id: 24,
    title: "Better Half (বেটার হাফ)",
    category: "Romance",
    year: "2021",
    platform: "NTV Natok / YouTube",
    badge: "FAN FAVORITE",
    director: "Chayanika Chowdhury",
    roleName: "Loving Husband",
    coStar: "Mehazabien Chowdhury",
    image: "/assets/works/better_half.jpg",
    youtubeUrl: "https://www.youtube.com/results?search_query=Better+Half+Tawsif+Mahbub+Mehazabien",
    synopsis: "An intimate, deeply moving portrait of marital compromise and emotional maturity, pairing two of television's finest actors in top dramatic form."
  }
];'''

# Replace allFilmographyWorks
text = re.sub(r'export const allFilmographyWorks = \[.*?\];', new_filmography, text, flags=re.DOTALL)

# 3. Update galleryItems with docx authentic assets
new_gallery = '''export const galleryItems = [
  {
    id: "g1",
    title: "Outdoor Garden Patio Editorial (2024)",
    category: "Studio Editorial",
    image: "/assets/gallery/docx/01_tawsif_editorial_patio.jpg",
    caption: "High-resolution daylight editorial portrait in earthy linen tones, capturing relaxed urban elegance."
  },
  {
    id: "g2",
    title: "Bespoke Couture Tuxedo — Akib Rahman (2024)",
    category: "Studio Editorial",
    image: "/assets/gallery/docx/02_tawsif_couture_tuxedo.jpg",
    caption: "Hand-embroidered evening couture tuxedo portrait photographed by Akib Rahman Studio."
  },
  {
    id: "g3",
    title: "BIFA Best Actor Trophy Win (2024)",
    category: "Awards & Red Carpet",
    image: "/assets/gallery/docx/11_tawsif_bifa_trophy.jpg",
    caption: "Official ceremony portrait holding the BAIFA / BIFA Best Actor (OTT) trophy for 'Chokro'."
  },
  {
    id: "g4",
    title: "Meril-Prothom Alo Award Citation — Khowabnama",
    category: "Awards & Red Carpet",
    image: "/assets/gallery/docx/12_tawsif_meril_khowabnama.jpg",
    caption: "Official nomination and recognition card for the prestigious Meril-Prothom Alo Awards."
  },
  {
    id: "g5",
    title: "Aviation Captain Characterization (2024)",
    category: "Production Still",
    image: "/assets/gallery/docx/03_tawsif_airline_captain.jpg",
    caption: "Authentic airline captain character study on the airport tarmac in front of commercial aircraft."
  },
  {
    id: "g6",
    title: "1970s Retro Vintage Look with Classic Beetle",
    category: "Character Study",
    image: "/assets/gallery/docx/04_tawsif_vintage_beetle.jpg",
    caption: "Period-accurate retro styling with emerald blazer, vintage mustache, and classic Volkswagen Beetle."
  },
  {
    id: "g7",
    title: "Cox's Bazar Coastal Linen Walk",
    category: "Production Still",
    image: "/assets/gallery/docx/05_tawsif_beach_linen.jpg",
    caption: "Breezy white linen coastal look against the scenic dunes of the Bay of Bengal."
  },
  {
    id: "g8",
    title: "Classic White Panjabi Heritage Portrait",
    category: "Studio Editorial",
    image: "/assets/gallery/docx/06_tawsif_white_panjabi.jpg",
    caption: "Understated Bengali festive elegance in crisp white panjabi by Akib Rahman Photography."
  },
  {
    id: "g9",
    title: "Himalayan Suspension Bridge Adventure",
    category: "Character Study",
    image: "/assets/gallery/docx/07_tawsif_adventure_bungee.jpg",
    caption: "High-octane adventure moment captured mid-air on a high suspension canyon bridge in Nepal."
  },
  {
    id: "g10",
    title: "Golden Hour Mountain Valley Sunset",
    category: "Character Study",
    image: "/assets/gallery/docx/08_tawsif_golden_hour.jpg",
    caption: "Contemplative sunset silhouette overlooking mist-shrouded mountain ridges."
  },
  {
    id: "g11",
    title: "Mountain Balcony Floral Co-ord Fashion",
    category: "Studio Editorial",
    image: "/assets/gallery/docx/09_tawsif_floral_coord.jpg",
    caption: "Modern relaxed vacation co-ord set with sunglasses against dramatic hillscapes."
  },
  {
    id: "g12",
    title: "Royal Embroidered Sherwani & Velvet Chair",
    category: "Studio Editorial",
    image: "/assets/gallery/docx/10_tawsif_royal_sherwani.jpg",
    caption: "Regal black-and-gold zardozi sherwani session with sleek sunglasses and wingback chair."
  },
  {
    id: "g13",
    title: "The Intellectual Thespian — Black Turtleneck Study",
    category: "Studio Editorial",
    image: "/assets/gallery/docx/13_tawsif_thespian_armchair.jpg",
    caption: "Classical dramatic portrait in black turtleneck, seated in an antique ivory thespian chair."
  },
  {
    id: "g14",
    title: "Contemporary Streetstyle Tie-Dye & Cargo",
    category: "Studio Editorial",
    image: "/assets/gallery/docx/14_tawsif_urban_streetstyle.jpg",
    caption: "Architectural urban streetstyle featuring corduroy tie-dye overshirt and dark sunglasses."
  },
  {
    id: "g15",
    title: "Bespoke Couture Marble Balustrade Study",
    category: "Studio Editorial",
    image: "/assets/gallery/docx/15_tawsif_couture_marble.jpg",
    caption: "Fine-art architectural fashion portrait in hand-beaded shawl-lapel evening jacket."
  },
  {
    id: "g16",
    title: "Chuye Dilam Tomay — Official Key Art Poster",
    category: "Production Still",
    image: "/assets/works/chuye_dilam_tomay.jpg",
    caption: "Official theatrical poster for Rubel Hasan's 2026 romance featuring Tawsif and Niha Chowdhury."
  },
  {
    id: "g17",
    title: "Chuye Dilam Tomay — Riverboat Romance Poster",
    category: "Production Still",
    image: "/assets/works/chuye_dilam_tomay_totini.jpg",
    caption: "Official key art poster with Tanjim Saiara Totini on the scenic waterways of rural Bengal."
  },
  {
    id: "g18",
    title: "Amar Rajje Tumi — Key Art Poster with Keya Payel",
    category: "Production Still",
    image: "/assets/works/amar_rajje_tumi.jpg",
    caption: "Official 2026 drama poster for Masrikul Alam's hit Capital Drama telefilm."
  },
  {
    id: "g19",
    title: "Aponpor — Official CMV Drama Key Art",
    category: "Production Still",
    image: "/assets/works/aponpor.jpg",
    caption: "Official key art poster for Rubel Hasan's emotional drama starring Tawsif and Sadnima."
  },
  {
    id: "g20",
    title: "Warish — Landmark Family Ensemble Poster",
    category: "Production Still",
    image: "/assets/works/warish.jpg",
    caption: "Official CMV poster featuring Tawsif alongside veteran Tariq Anam Khan and Yash Rohan."
  },
  {
    id: "g21",
    title: "Dorodia — Eid Special Key Art Poster",
    category: "Production Still",
    image: "/assets/works/dorodia.jpg",
    caption: "Official key art for CMV romantic drama starring Tawsif and Naznin Niha."
  },
  {
    id: "g22",
    title: "Tui Theke Tumi — Sultan Entertainment Key Art",
    category: "Production Still",
    image: "/assets/works/tui_theke_tumi.jpg",
    caption: "Official poster featuring Tawsif Mahbub and Naznin Niha."
  },
  {
    id: "g23",
    title: "Bachelor Point Season 5 — Bongo Digital Poster",
    category: "Production Still",
    image: "/assets/works/bachelor_point_s5.jpg",
    caption: "Official promotional key art celebrating Nehal's iconic return to the Bachelor Point flat."
  },
  {
    id: "g24",
    title: "Chokro Season 2 — iScreen Psychological Thriller",
    category: "Character Study",
    image: "/assets/works/chokro_s2.jpg",
    caption: "Official key art poster for Vicky Zahed's hit occult noir thriller starring Tawsif and Tasnia Farin."
  },
  {
    id: "g25",
    title: "Not A Love Story — Official CMV Key Art",
    category: "Production Still",
    image: "/assets/works/not_a_love_story.jpg",
    caption: "Official drama poster directed by Rubel Hasan, co-starring Tanjim Saiara Totini."
  },
  {
    id: "g26",
    title: "First Love — Capital Drama Official Poster",
    category: "Production Still",
    image: "/assets/works/first_love.jpg",
    caption: "Official key art poster for romantic drama directed by Hasib Hossain Rakhi."
  }
];'''

# Replace galleryItems
text = re.sub(r'export const galleryItems = \[.*?\];', new_gallery, text, flags=re.DOTALL)

# 4. Add soundtrackHits and pressArticles right before landmarkWorkDetails
new_extra_data = '''
// Hit Soundtracks & Original Songs featuring Tawsif Mahbub (from official archives)
export const soundtrackHits = [
  {
    id: "ost-1",
    title: "Amar Ful Tumi (আমার ফুল তুমি)",
    drama: "Dorodia (দরদিয়া - 2026)",
    artists: "Imran Mahmudul & Atiya Anisha",
    actors: "Tawsif Mahbub & Naznin Niha",
    platform: "CMV Official / YouTube",
    badge: "2026 HIT TRACK",
    youtubeSearch: "https://www.youtube.com/results?search_query=Amar+Ful+Tumi+Dorodia+Tawsif+Niha+Imran"
  },
  {
    id: "ost-2",
    title: "Jonak Jola Rate (জোনাক জ্বলা রাতে)",
    drama: "Tui Theke Tumi (তুই থেকে তুমি)",
    artists: "Imran Mahmudul & Porshi",
    actors: "Tawsif Mahbub & Naznin Niha",
    platform: "Sultan Entertainment",
    badge: "ROMANTIC DUET",
    youtubeSearch: "https://www.youtube.com/results?search_query=Jonak+Jola+Rate+Tui+Theke+Tumi+Tawsif+Imran+Porshi"
  },
  {
    id: "ost-3",
    title: "Bhalobasha Govir (ভালোবাসা গভীর)",
    drama: "Jokhom (জখম - 2026)",
    artists: "Imran Mahmudul & Haimanti Rakshit Das",
    actors: "Tawsif Mahbub & Tanjim Saiara Totini",
    platform: "CMV Official",
    badge: "2026 BLOCKBUSTER",
    youtubeSearch: "https://www.youtube.com/results?search_query=Bhalobasha+Govir+Jokhom+Tawsif+Totini+Imran"
  },
  {
    id: "ost-4",
    title: "Sokhi Tomare Badibo (সখী তোমারে বাঁধিব)",
    drama: "Uraal Pakhi (উড়াল পাখি)",
    artists: "Imran Mahmudul & Dilshad Nahar Kona",
    actors: "Tawsif Mahbub & Keya Payel",
    platform: "Sultan Entertainment",
    badge: "35M+ RECORD OST",
    youtubeSearch: "https://www.youtube.com/results?search_query=Sokhi+Tomare+Badibo+Imran+Kona+Tawsif+Mahbub"
  },
  {
    id: "ost-5",
    title: "Adore Astin (আদরে আস্তিন)",
    drama: "Aponpor / Romantic Special",
    artists: "Riyad & Dilshad Nahar Kona",
    actors: "Tawsif Mahbub & Sadnima",
    platform: "CMV Official",
    badge: "VIRAL SENSATION",
    youtubeSearch: "https://www.youtube.com/results?search_query=Adore+Astin+Riyad+Kona+Tawsif+Mahbub+Sadnima"
  },
  {
    id: "ost-6",
    title: "Amar Din Gulo Sob Jay Hariye Andhare (আমার দিন গুলো সব যায় হারিয়ে আঁধারে)",
    drama: "Hridoy Er Kotha (হৃদয়ের কথা)",
    artists: "Habib Wahid, Nancy & Imran Mahmudul",
    actors: "Tawsif Mahbub",
    platform: "Official Soundtrack",
    badge: "CLASSIC BALLAD",
    youtubeSearch: "https://www.youtube.com/results?search_query=Amar+Din+Gulo+Sob+Jay+Hariye+Andhare+Habib+Nancy+Imran"
  }
];

// Verified National Press & Media Coverage (from official archives)
export const pressArticles = [
  {
    id: "press-1",
    title: "The Daily Star: Tawsif Mahbub extends support to flood-affected communities",
    source: "The Daily Star (National English Daily)",
    date: "2024",
    summary: "Report detailing Tawsif Mahbub's grassroots humanitarian mobilization, directly providing emergency relief materials, clean drinking water, and essential supplies to vulnerable flood victims in eastern Bangladesh.",
    url: "https://www.thedailystar.net/culture/entertainment/news/tawsif-mahbub-extends-support-flood-affected-communities-4223441",
    badge: "HUMANITARIAN"
  },
  {
    id: "press-2",
    title: "Prothom Alo: Tawsif Mahbub Career & Performance Archive",
    source: "Prothom Alo (Highest-Circulated Bengali Daily)",
    date: "Continuous National Coverage",
    summary: "Extensive critical profile and news coverage of Tawsif's Meril-Prothom Alo Award win, method acting milestones, and festive television premieres.",
    url: "https://www.prothomalo.com/topic/%E0%A6%A4%E0%A7%8C%E0%A6%B8%E0%A6%BF%E0%A6%AB",
    badge: "NATIONAL PRESS"
  },
  {
    id: "press-3",
    title: "Dhaka Post: Tawsif Mahbub In-Depth Features & Interviews",
    source: "Dhaka Post",
    date: "2024–2026",
    summary: "Exclusive long-form interviews discussing script choices, television industry evolution, and his transition into psychological OTT streaming thrillers.",
    url: "https://www.dhakapost.com/topic/%E0%A6%A4%E0%A7%87%E0%A7%97%E0%A6%B8%E0%A6%BF%E0%A6%AB-%E0%A6%AE%E0%A6%BE%E0%A6%B9%E0%A6%AC%E0%A7%81%E0%A6%AC",
    badge: "INTERVIEW ARCHIVE"
  },
  {
    id: "press-4",
    title: "Kaler Alo: Tawsif Mahbub Special Retrospective (2026)",
    source: "Kaler Alo",
    date: "2026",
    summary: "Analysis of Tawsif Mahbub's record-breaking drama releases in 2026, including Chuye Dilam Tomay, Aponpor, and Amar Rajje Tumi.",
    url: "https://kaleralo.com/393827/2026/",
    badge: "2026 RETROSPECTIVE"
  },
  {
    id: "press-5",
    title: "BD24Live: Tawsif Mahbub Industry News & Box-Office Tracking",
    source: "BD24Live",
    date: "Entertainment Bureau",
    summary: "Digital viewership analytics, trending records, and collaborative insights into Tawsif's work across YouTube and OTT streaming platforms.",
    url: "https://www.bd24live.com/tag/tawsif-mahbub/",
    badge: "INDUSTRY ANALYTICS"
  }
];
'''

# Insert new_extra_data before "// Deep production dossiers for landmark works"
text = text.replace(
    '// Deep production dossiers for landmark works',
    new_extra_data + '\n// Deep production dossiers for landmark works'
)

# 5. Expand landmarkWorkDetails
additional_landmark_works = '''
  "chuye-dilam-tomay": {
    slug: "chuye-dilam-tomay",
    title: "Chuye Dilam Tomay (ছুঁয়ে দিলাম তোমায়)",
    tagline: "A delicate riverine romance capturing the unspoken magic of modern affection.",
    releaseDate: "2026",
    duration: "45 Minutes",
    productionHouse: "Capital Drama",
    producer: "Capital Productions",
    dop: "Rubel Hasan Visuals",
    musicComposer: "Piran Khan Crew",
    leadActors: [
      { name: "Tawsif Mahbub", role: "Romantic Lead" },
      { name: "Tanjim Saiara Totini", role: "Leading Lady" },
      { name: "Naznin Niha", role: "Key Role" }
    ],
    extendedSynopsis: "Chuye Dilam Tomay is a visually breathtaking 2026 romantic telefilm directed by Rubel Hasan and produced under the Capital Drama banner. Centering around Tawsif Mahbub with Tanjim Saiara Totini and Naznin Niha, the narrative takes place along misty riverways, lush meadows, and idyllic rural backdrops. Tawsif's tender emotional restraint and subtle glances define a modern romantic masterpiece.",
    characterBreakdown: {
      roleName: "Lead Romantic",
      psychology: "Gentle, devoted, and emotionally considerate. A man navigating quiet yearning and unspoken pledges.",
      actingMethod: "Relying on warm eye contact, relaxed posture, and natural conversational pauses that blend effortlessly with natural outdoor acoustics."
    },
    metrics: [
      { label: "STATUS", value: "2026 Major Premiere" },
      { label: "PRODUCTION", value: "Capital Drama Official" },
      { label: "CO-STARS", value: "Totini & Naznin Niha" }
    ],
    btsNotes: [
      "Extensive boat sequences filmed on real waterways under natural golden sunlight.",
      "Costume design emphasized authentic handloom cotton and soft natural textures."
    ]
  },

  "amar-rajje-tumi": {
    slug: "amar-rajje-tumi",
    title: "Amar Rajje Tumi (আমার রাজ্যে তুমি)",
    tagline: "A heartwarming matrimonial romance exploring devotion, trust, and shared dreams.",
    releaseDate: "2026",
    duration: "48 Minutes",
    productionHouse: "Capital Drama",
    producer: "Capital Entertainment",
    dop: "Masrikul Alam Camera Unit",
    musicComposer: "Naved Parvez",
    leadActors: [
      { name: "Tawsif Mahbub", role: "Devoted Suitor" },
      { name: "Keya Payel", role: "Female Lead" },
      { name: "Malaika", role: "Co-Lead" }
    ],
    extendedSynopsis: "Directed by Masrikul Alam, Amar Rajje Tumi reunites the acclaimed screen duo of Tawsif Mahbub and Keya Payel alongside Malaika. The telefilm chronicles the humorous challenges and heartwarming victories of a young couple building their kingdom of happiness against domestic complexities.",
    characterBreakdown: {
      roleName: "Devoted Suitor",
      psychology: "Unconditionally loyal, witty, and resilient. A protagonist whose love is measured by everyday thoughtfulness.",
      actingMethod: "Balancing charming comedic banter with earnest, heartfelt emotional confessions."
    },
    metrics: [
      { label: "BANNER", value: "Capital Drama" },
      { label: "POPULAR DUO", value: "Tawsif & Keya Payel" },
      { label: "GENRE", value: "Romantic Drama" }
    ],
    btsNotes: [
      "Filmed in picturesque residential and countryside locations across Gazipur.",
      "The comedic dialogues were celebrated across social media for naturalistic timing."
    ]
  },

  "aponpor": {
    slug: "aponpor",
    title: "Aponpor (আপনপর)",
    tagline: "The fragile boundaries between blood kin and sudden strangers.",
    releaseDate: "2026",
    duration: "52 Minutes",
    productionHouse: "CMV (Central Music & Video)",
    producer: "SK Shahed Ali Pappu",
    dop: "CMV Drama Unit",
    musicComposer: "Riyad & Kona Score",
    leadActors: [
      { name: "Tawsif Mahbub", role: "Protagonist" },
      { name: "Sadnima", role: "Female Lead" }
    ],
    extendedSynopsis: "Aponpor is an emotionally heavy, socially conscious drama directed by Rubel Hasan and produced by CMV. Tawsif Mahbub stars opposite Sadnima in a story examining how family expectations and societal pressures can turn the closest loved ones into emotional strangers.",
    characterBreakdown: {
      roleName: "Protagonist",
      psychology: "A deeply conflicted individual carrying silent emotional burdens for the well-being of his kin.",
      actingMethod: "Tawsif strips away charm, adopting a subdued vocal delivery and heavy, troubled gaze."
    },
    metrics: [
      { label: "LABEL", value: "CMV Official" },
      { label: "DIRECTOR", value: "Rubel Hasan" },
      { label: "RECEPTION", value: "Critical Acclaim" }
    ],
    btsNotes: [
      "Features the viral soundtrack hit 'Adore Astin' sung by Riyad and Kona.",
      "Shot in real family residences to maintain claustrophobic domestic intensity."
    ]
  },

  "warish": {
    slug: "warish",
    title: "Warish (ওয়ারিশ)",
    tagline: "An intense generational clash over legacy, heritage, and pride.",
    releaseDate: "2026",
    duration: "55 Minutes",
    productionHouse: "CMV (Central Music & Video)",
    producer: "SK Shahed Ali Pappu",
    dop: "Bidhan Sarker",
    musicComposer: "Piran Khan",
    leadActors: [
      { name: "Tawsif Mahbub", role: "Family Heir" },
      { name: "Tariq Anam Khan", role: "Family Patriarch" },
      { name: "Safa Kabir", role: "Key Lead" },
      { name: "Yash Rohan", role: "Brother" },
      { name: "Priyontee Urbee", role: "Supporting Lead" }
    ],
    extendedSynopsis: "Warish is one of 2026's most prestigious television dramas, directed by Imraul Rafat. Boasting a powerhouse ensemble including legendary National Award-winning thespian Tariq Anam Khan alongside Tawsif Mahbub, Yash Rohan, Safa Kabir, and Priyontee, the telefilm delves into patriarchal dominance and inheritance feuds.",
    characterBreakdown: {
      roleName: "Family Heir",
      psychology: "Principled, defiant, yet torn between filial duty and personal conscience.",
      actingMethod: "High-octane dramatic confrontation scenes opposite veteran Tariq Anam Khan, showcasing vocal authority and emotional poise."
    },
    metrics: [
      { label: "ENSEMBLE", value: "Powerhouse Star Cast" },
      { label: "DIRECTOR", value: "Imraul Rafat" },
      { label: "IMPACT", value: "Generational Masterpiece" }
    ],
    btsNotes: [
      "The climactic courtyard confrontation scene was filmed in a continuous 8-minute unbroken take.",
      "Critics commended Tawsif's dramatic maturity standing toe-to-toe with Tariq Anam Khan."
    ]
  },

  "dorodia": {
    slug: "dorodia",
    title: "Dorodia (দরদিয়া)",
    tagline: "A sweeping romantic ode to selfless devotion and healing love.",
    releaseDate: "2026",
    duration: "46 Minutes",
    productionHouse: "CMV (Central Music & Video)",
    producer: "SK Shahed Ali Pappu",
    dop: "CMV Studio Unit",
    musicComposer: "Imran Mahmudul (Track: Amar Ful Tumi)",
    leadActors: [
      { name: "Tawsif Mahbub", role: "Romantic Lead" },
      { name: "Naznin Niha", role: "Female Lead" }
    ],
    extendedSynopsis: "Dorodia stands as a major romantic showcase starring Tawsif Mahbub and Naznin Niha. Anchored by the mega-hit soundtrack 'Amar Ful Tumi' sung by Imran Mahmudul and Atiya Anisha, the telefilm captures the delicate tenderness of finding love during personal hardship.",
    characterBreakdown: {
      roleName: "Romantic Lead",
      psychology: "Compassionate, selfless protector whose devotion acts as emotional shelter.",
      actingMethod: "Warm, understated acting style emphasizing unspoken affection and listening."
    },
    metrics: [
      { label: "HIT OST", value: "Amar Ful Tumi (Imran & Atiya)" },
      { label: "BANNER", value: "CMV Drama" },
      { label: "CHEMISTRY", value: "Tawsif & Naznin Niha" }
    ],
    btsNotes: [
      "The title music video accumulated millions of views within 48 hours of release.",
      "Filmed in serene natural settings outside Dhaka."
    ]
  },

  "bachelor-point-s5": {
    slug: "bachelor-point-s5",
    title: "Bachelor Point Season 5 (ব্যাচেলর পয়েন্ট সিজন ৫)",
    tagline: "The king of youth comedy returns to the iconic bachelor flat.",
    releaseDate: "2024–2026",
    duration: "Multi-Episode Series",
    productionHouse: "Boom Films / Bongo",
    producer: "Bongo Studios",
    dop: "Fahad Hossain",
    musicComposer: "Kajal Arefin Ome Crew",
    leadActors: [
      { name: "Tawsif Mahbub", role: "Nehal (Anchor Bachelor)" },
      { name: "Mishu Sabbir", role: "Shuvo" },
      { name: "Marzuk Russell", role: "Pashan" },
      { name: "Ziaul Hoque Polash", role: "Kabila" }
    ],
    extendedSynopsis: "The historic fifth season of Kajal Arefin Ome's record-smashing franchise. Tawsif returns to his signature role as Nehal, the sensible, well-mannered bachelor who keeps the household anchored amid the hilarious mayhem of Kabila, Shuvo, and Pashan.",
    characterBreakdown: {
      roleName: "Nehal",
      psychology: "Mature, stylish, romantic, and patient. The emotional stabilizer of the group.",
      actingMethod: "Signature deadpan comic timing, nuanced reactions, and effortless bromance chemistry."
    },
    metrics: [
      { label: "VIEWERSHIP", value: "All-Time Record Engagement" },
      { label: "PLATFORM", value: "Bongo Digital & YouTube" },
      { label: "LEGACY", value: "Cult Television Icon" }
    ],
    btsNotes: [
      "Special Friendship Day and football tournament episodes shattered digital streaming records across South Asia.",
      "Nehal's wardrobe and hairstyle inspired new youth fashion trends across university campuses."
    ]
  },
'''

# Insert additional_landmark_works into landmarkWorkDetails after "export const landmarkWorkDetails = {"
text = text.replace(
    'export const landmarkWorkDetails = {',
    'export const landmarkWorkDetails = {' + additional_landmark_works
)

# Write updated file
with open('src/data/dossierData.js', 'w', encoding='utf-8') as f:
    f.write(text)

print("dossierData.js updated successfully!")
