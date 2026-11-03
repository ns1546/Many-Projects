const fs = require('fs');
const https = require('https');

const songs = [
  "https://www.youtube.com/watch?v=M2D5lK2l6V4&list=RDM2D5lK2l6V4&start_radio=1",
  "https://www.youtube.com/watch?v=f6Gg23HC7JY",
  "https://www.youtube.com/watch?v=FnsjJAc6j18",
  "https://www.youtube.com/watch?v=hO7xP4xwPzQ",
  "https://youtu.be/f023KdTlYBk?si=43XzOfpfUN1Eupmv",
  "https://youtu.be/PwU--Y4GWJg?si=70dm8Zn5PtMLtS81",
  "https://youtu.be/yKhV_1lLE0Q?si=Zj4QPqcy6RnhTckf",
  "https://youtu.be/u3iIPmQJS4s?si=7DXk4ktRgb9gR991",
  "https://youtu.be/W9lTUy8p47I?si=UQs3qMl4PaZuox81",
  "https://youtu.be/ybNJSAGuB4A?si=E2cpLroc4xR9pFFD",
  "https://youtu.be/k8Xo24X8BHI?si=5IS70pcbbQpa-4Ed",
  "https://youtu.be/Es5JDBkuwc8?si=BfYfQyhz_X1dz8lU",
  "https://youtu.be/PArY5IlUv-M?si=QMb3g1MYis-xh6qM",
  "https://youtu.be/rzEDueOImBw?si=McBNHUagC5L8yCMq",
  "https://youtu.be/ud_wbIJC8rA?si=K_bA2ihGj73oUCHk",
  "https://youtu.be/Ge8M1ftv-Iw?si=KsD1ASlWaG-BK8pk",
  "https://youtu.be/yZepliCx834?si=PATfrFp7bloGhl-Q",
  "https://youtu.be/1YXws-tgfIg?si=ce8-5KC0vC6yDx5H",
  "https://youtu.be/clDnz-5Gsic?si=HvmyvtR9D6xrpL15",
  "https://youtu.be/MIV7qttqZZQ?si=CCj6qOjRalTC6Ybh",
  "https://youtu.be/h8-KRFGaqHM?si=c5RRV1IHULJUfIVB",
  "https://youtu.be/9DYNfWq6MOY?si=vUS9uUYVuNRWJ6bU"
];

const mixMaster = [
  "https://youtu.be/sAihFhODiXA?si=wxGcNNYq6CZsH_jG",
  "https://youtu.be/YJaAkLxK4X8?si=W20PUHd7_Tc8cfZf"
];

const bgm = [
  "https://www.youtube.com/watch?v=_cqPDqx54RE",
  "https://www.youtube.com/watch?v=80opMhwlldo",
  "https://www.youtube.com/watch?v=D9vDMc9_2AE&t=2529s",
  "https://youtu.be/iE6oGjaQS1M?si=0MM3OjD0s3-ec-Nj",
  "https://youtu.be/-Ce-mXLqzJw?si=cysqV1XOyEnxcASq",
  "https://youtu.be/fC4N3rGwyzI?si=yOPgeLSFVTzQP1vX"
];

const customTitles = {
  "_cqPDqx54RE": "Aponjon | আপনজন | Full Natok | Nirjon Nahuel | Arohi Mim | Prio Ahmed | Bangla New Natok 2026",
  "80opMhwlldo": "Anarkoli (আনারকলি ) Saad Naovi | Sadnima Binte Noman | L R Sohel | New Natok 2026",
  "D9vDMc9_2AE": "Ojana Maya | অজানা মায়া | Saad Naovi | Priyontee Urbee | Naresh Bhuiyan | Sohel | New Natok 2026",
  "M2D5lK2l6V4": "Tomake Paoar Baji | তোমাকে পাওয়ার বাজি | Apurbo & Totini | Pinky & Jesan | New Song | Capital Music",
  "f6Gg23HC7JY": "Bosh Korila Mon (বশ করিলা মন) Jkh Jesan | Saad Naovi | Sadnima Binte Noman | New Song 2026",
  "FnsjJAc6j18": "Ek Jibone Eto Betha (এক জীবনে এত ব্যথা) Khairul Wasi | Naovi | Priyontee | Ojana Maya | Natok Song",
  "hO7xP4xwPzQ": "Premer Meye | প্রেমের মেয়ে | Mahtim Shakib | Sabbir Ahmed MS | Bangla Official Music Video 2026",
  "f023KdTlYBk": "Kothay Pabo Tare | JKH Jesan",
  "PwU--Y4GWJg": "Hridoy Nayer Boitha | JKH Jesan",
  "k8Xo24X8BHI": "Khub Nervous Lage | Atiya Anisha",
  "sAihFhODiXA": "Shab Sakhire Par Korite | Sadat Hossain"
};

const getYTId = (url) => {
    try {
        const urlObj = new URL(url);
        if(urlObj.hostname === 'youtu.be') {
            return urlObj.pathname.slice(1);
        }
        return urlObj.searchParams.get('v');
    } catch(e) { return 'default'; }
};

const fetchTitle = (url) => {
  const ytId = getYTId(url);
  if (customTitles[ytId]) {
    return Promise.resolve(customTitles[ytId]);
  }
  return new Promise((resolve) => {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const options = {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    };
    https.get(oembedUrl, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          let title = parsed.title;
          resolve(title);
        } catch(e) {
          resolve("Track Name Unavailable");
        }
      });
    }).on('error', () => resolve("Track Name Unavailable"));
  });
};

const processList = async (list, categoryName, categoryClass) => {
  let html = '';
  for (let url of list) {
    let ytId = getYTId(url);
    let title = await fetchTitle(url);
    
    html += `
                <a href="${url}" target="_blank" class="work-item block bento-border overflow-hidden group gs-reveal" data-category="${categoryClass}">
                    <div class="h-[30vh] md:h-[40vh] relative overflow-hidden img-scale">
                        <img src="https://img.youtube.com/vi/${ytId}/maxresdefault.jpg" class="w-full h-full object-cover filter grayscale group-hover:grayscale-0" onerror="this.src='https://img.youtube.com/vi/${ytId}/hqdefault.jpg'">
                        <div class="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors"></div>
                        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-500">
                            <i class="fas fa-play text-white text-xl ml-1"></i>
                        </div>
                    </div>
                    <div class="p-[clamp(1rem,3vw,1.5rem)] bg-dark border-t border-white/5">
                        <span class="inline-block px-3 py-1 bg-white/10 rounded-full font-sans text-[8px] uppercase tracking-widest text-accent font-bold mb-3">${categoryName}</span>
                        <h3 class="font-display text-[clamp(1rem,3vw,1.5rem)] font-bold uppercase text-white group-hover:text-accent transition-colors line-clamp-1" title="${title}">${title}</h3>
                    </div>
                </a>`;
  }
  return html;
};

const run = async () => {
  let finalHTML = '';
  finalHTML += await processList(songs, "Songs", "songs");
  finalHTML += await processList(mixMaster, "Mix Master", "mix-master");
  finalHTML += await processList(bgm, "BGM", "bgm");
  
  fs.writeFileSync('generated_grid.html', finalHTML);
  console.log("Done generating grid. Total items:", songs.length + mixMaster.length + bgm.length);
};

run();
