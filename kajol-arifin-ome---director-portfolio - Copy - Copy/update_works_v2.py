import json

file_path = 'data/works.json'
with open(file_path, 'r', encoding='utf-8') as f:
    works = json.load(f)

# Images map
images = {
    'bachelor-point': '/gallery/bachelor point.jpg',
    'female-3': '/gallery/female.jpg',
    'hotel-relax': '/gallery/hotel relax.jpg',
    'oshomoy': '/gallery/osomoy.jpg'
}

# Details update map
updates = {
    'bachelor-point': {
        'synopsis': 'Bachelor Point is a highly popular comedy-drama revolving around the everyday lives, friendships, struggles, and humorous experiences of a group of young men from different districts of Bangladesh living together in a shared apartment in Dhaka. It is celebrated for its authentic depiction of bachelor life and use of diverse regional dialects.',
        'logline': 'Six bachelors. One apartment. Infinite chaos and heartwarming friendship.',
        'cast': ['Mishu Sabbir', 'Ziaul Hoque Polash', 'Chashi Alam', 'Marzuk Russell', 'Tawsif Mahbub', 'Shamim Hasan Sarkar', 'Monira Akter Mithu', 'Tamim Mridha', 'Faria Shahrin', 'Parsa Evana', 'Sanjana Sarkar Riya', 'Mukit Zakaria'],
        'successStats': {
            "viewership": "500M+ total views",
            "milestone": "Most popular comedy series in Bangladesh",
            "audienceRating": "9.5/10",
            "culturalImpact": "Spawned countless memes, catchphrases ('Pasha Bhai', 'Kabila'), and massive fan communities.",
            "seasons": 5
        }
    },
    'female-3': {
        'synopsis': 'The Female series revolves around the lives, misadventures, and humorous conflicts of a group of friends. It focuses on their interactions, gang dynamics, and comical situations while navigating life, relationships, and societal pressures in their neighborhood.',
        'logline': 'The ultimate neighborhood rivalry continues with higher stakes and bigger laughs.',
        'cast': ['Ziaul Hoque Polash', 'Mishu Sabbir', 'Marzuk Russell', 'Chashi Alam', 'Saraf Ahmed Zibon', 'Shimul Sharma', 'Saidur Rahman Pavel', 'Musafire Syed Bacchu']
    },
    'hotel-relax': {
        'synopsis': 'The story follows a group of unusual individuals—including dacoits, cloth merchants, pickpockets, and conmen—who all gather at an infamous establishment called Hotel Relax. Their plan to rest unexpectedly leads to a series of chaotic and troublesome events in this comedy-thriller.',
        'logline': 'Checking in is easy, relaxing is impossible when a diverse group of quirky characters collide.',
        'cast': ['Mishu Sabbir', 'Ziaul Hoque Polash', 'Marzuk Russell', 'Chashi Alam', 'Parsa Evana', 'Saidur Rahman Pavel', 'Saraf Ahmed Zibon', 'Purnima', 'Musafire Syed Bacchu', 'Abdullah Rana', 'Schumonn Patwary']
    },
    'oshomoy': {
        'synopsis': 'The story follows Urbi, a university student from a middle-class background who becomes fascinated by the luxurious lives of her wealthy friends. As she navigates this world of privilege, she inadvertently becomes entangled in a homicide investigation. The film explores themes of societal show-off culture and the consequences of chasing material success.',
        'logline': 'A poignant reflection on contemporary societal issues, double-faced lives, and unexpected tragedy.',
        'cast': ['Tasnia Farin', 'Runa Khan', 'Tariq Anam Khan', 'Monira Mithu', 'Iresh Zaker', 'Saraf Ahmed Jibon', 'Shashwta Datta', 'Intekhab Dinar', 'Ziaul Hoque Polash', 'Shimul Sharma', 'Lamima Lam']
    }
}

for w in works:
    slug = w.get('slug')
    
    # Update Images
    if slug in images:
        img_url = images[slug]
        w['poster'] = img_url
        w['coverImage'] = img_url
        w['stills'] = [img_url, img_url] # Using the same image as stills for now
        
    # Update Details
    if slug in updates:
        for key, value in updates[slug].items():
            w[key] = value

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(works, f, indent=2, ensure_ascii=False)
