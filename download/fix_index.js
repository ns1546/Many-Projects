const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf-8');
const startIdx = content.indexOf('<div id="dynamic-works-grid"');
const endMarker = '<div class="mt-16 text-center gs-reveal">';
const endIdx = content.indexOf(endMarker, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    const newGrid = `<div id="dynamic-works-grid" class="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 md:gap-8">
                <!-- 1. Tomake Paoar Baji (New Song) -->
                <a href="https://www.youtube.com/watch?v=M2D5lK2l6V4&list=RDM2D5lK2l6V4&start_radio=1" target="_blank"
                    class="work-item block bento-border overflow-hidden group gs-reveal" data-category="songs">
                    <div class="h-[30vh] md:h-[40vh] relative overflow-hidden img-scale">
                        <img src="https://img.youtube.com/vi/M2D5lK2l6V4/maxresdefault.jpg"
                            class="w-full h-full object-cover filter grayscale group-hover:grayscale-0"
                            onerror="this.src='https://img.youtube.com/vi/M2D5lK2l6V4/hqdefault.jpg'">
                        <div class="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors"></div>
                        <div
                            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-500">
                            <i class="fas fa-play text-white text-xl ml-1"></i>
                        </div>
                    </div>
                    <div class="p-6 bg-dark border-t border-white/5">
                        <span
                            class="inline-block px-3 py-1 bg-white/10 rounded-full font-sans text-[8px] uppercase tracking-widest text-accent font-bold mb-3">Songs</span>
                        <h3
                            class="font-display text-2xl font-bold uppercase text-white group-hover:text-accent transition-colors line-clamp-1"
                            title="Tomake Paoar Baji | তোমাকে পাওয়ার বাজি">
                            Tomake Paoar Baji | তোমাকে পাওয়ার বাজি</h3>
                    </div>
                </a>

                <!-- 2. Bosh Korila Mon (New Song) -->
                <a href="https://www.youtube.com/watch?v=f6Gg23HC7JY" target="_blank"
                    class="work-item block bento-border overflow-hidden group gs-reveal" data-category="songs">
                    <div class="h-[30vh] md:h-[40vh] relative overflow-hidden img-scale">
                        <img src="https://img.youtube.com/vi/f6Gg23HC7JY/maxresdefault.jpg"
                            class="w-full h-full object-cover filter grayscale group-hover:grayscale-0"
                            onerror="this.src='https://img.youtube.com/vi/f6Gg23HC7JY/hqdefault.jpg'">
                        <div class="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors"></div>
                        <div
                            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-500">
                            <i class="fas fa-play text-white text-xl ml-1"></i>
                        </div>
                    </div>
                    <div class="p-6 bg-dark border-t border-white/5">
                        <span
                            class="inline-block px-3 py-1 bg-white/10 rounded-full font-sans text-[8px] uppercase tracking-widest text-accent font-bold mb-3">Songs</span>
                        <h3
                            class="font-display text-2xl font-bold uppercase text-white group-hover:text-accent transition-colors line-clamp-1"
                            title="Bosh Korila Mon (বশ করিলা মন)">
                            Bosh Korila Mon (বশ করিলা মন)</h3>
                    </div>
                </a>

                <!-- 3. Aponjon (New BGM) -->
                <a href="https://www.youtube.com/watch?v=_cqPDqx54RE" target="_blank"
                    class="work-item block bento-border overflow-hidden group gs-reveal" data-category="bgm">
                    <div class="h-[30vh] md:h-[40vh] relative overflow-hidden img-scale">
                        <img src="https://img.youtube.com/vi/_cqPDqx54RE/maxresdefault.jpg"
                            class="w-full h-full object-cover filter grayscale group-hover:grayscale-0"
                            onerror="this.src='https://img.youtube.com/vi/_cqPDqx54RE/hqdefault.jpg'">
                        <div class="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors"></div>
                        <div
                            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-500">
                            <i class="fas fa-play text-white text-xl ml-1"></i>
                        </div>
                    </div>
                    <div class="p-6 bg-dark border-t border-white/5">
                        <span
                            class="inline-block px-3 py-1 bg-white/10 rounded-full font-sans text-[8px] uppercase tracking-widest text-accent font-bold mb-3">BGM</span>
                        <h3
                            class="font-display text-2xl font-bold uppercase text-white group-hover:text-accent transition-colors line-clamp-1"
                            title="Aponjon | আপনজন">
                            Aponjon | আপনজন</h3>
                    </div>
                </a>

                <!-- 4. Anarkoli (New BGM) -->
                <a href="https://www.youtube.com/watch?v=80opMhwlldo" target="_blank"
                    class="work-item block bento-border overflow-hidden group gs-reveal" data-category="bgm">
                    <div class="h-[30vh] md:h-[40vh] relative overflow-hidden img-scale">
                        <img src="https://img.youtube.com/vi/80opMhwlldo/maxresdefault.jpg"
                            class="w-full h-full object-cover filter grayscale group-hover:grayscale-0"
                            onerror="this.src='https://img.youtube.com/vi/80opMhwlldo/hqdefault.jpg'">
                        <div class="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors"></div>
                        <div
                            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-500">
                            <i class="fas fa-play text-white text-xl ml-1"></i>
                        </div>
                    </div>
                    <div class="p-6 bg-dark border-t border-white/5">
                        <span
                            class="inline-block px-3 py-1 bg-white/10 rounded-full font-sans text-[8px] uppercase tracking-widest text-accent font-bold mb-3">BGM</span>
                        <h3
                            class="font-display text-2xl font-bold uppercase text-white group-hover:text-accent transition-colors line-clamp-1"
                            title="Anarkoli (আনারকলি)">
                            Anarkoli (আনারকলি)</h3>
                    </div>
                </a>

                <!-- 5. Ojana Maya (New BGM) -->
                <a href="https://www.youtube.com/watch?v=D9vDMc9_2AE&t=2529s" target="_blank"
                    class="work-item block bento-border overflow-hidden group gs-reveal" data-category="bgm">
                    <div class="h-[30vh] md:h-[40vh] relative overflow-hidden img-scale">
                        <img src="https://img.youtube.com/vi/D9vDMc9_2AE/maxresdefault.jpg"
                            class="w-full h-full object-cover filter grayscale group-hover:grayscale-0"
                            onerror="this.src='https://img.youtube.com/vi/D9vDMc9_2AE/hqdefault.jpg'">
                        <div class="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors"></div>
                        <div
                            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-500">
                            <i class="fas fa-play text-white text-xl ml-1"></i>
                        </div>
                    </div>
                    <div class="p-6 bg-dark border-t border-white/5">
                        <span
                            class="inline-block px-3 py-1 bg-white/10 rounded-full font-sans text-[8px] uppercase tracking-widest text-accent font-bold mb-3">BGM</span>
                        <h3
                            class="font-display text-2xl font-bold uppercase text-white group-hover:text-accent transition-colors line-clamp-1"
                            title="Ojana Maya | অজানা মায়া">
                            Ojana Maya | অজানা মায়া</h3>
                    </div>
                </a>

                <!-- 6. Premer Meye (New Song) -->
                <a href="https://www.youtube.com/watch?v=hO7xP4xwPzQ" target="_blank"
                    class="work-item block bento-border overflow-hidden group gs-reveal" data-category="songs">
                    <div class="h-[30vh] md:h-[40vh] relative overflow-hidden img-scale">
                        <img src="https://img.youtube.com/vi/hO7xP4xwPzQ/maxresdefault.jpg"
                            class="w-full h-full object-cover filter grayscale group-hover:grayscale-0"
                            onerror="this.src='https://img.youtube.com/vi/hO7xP4xwPzQ/hqdefault.jpg'">
                        <div class="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors"></div>
                        <div
                            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-500">
                            <i class="fas fa-play text-white text-xl ml-1"></i>
                        </div>
                    </div>
                    <div class="p-6 bg-dark border-t border-white/5">
                        <span
                            class="inline-block px-3 py-1 bg-white/10 rounded-full font-sans text-[8px] uppercase tracking-widest text-accent font-bold mb-3">Songs</span>
                        <h3
                            class="font-display text-2xl font-bold uppercase text-white group-hover:text-accent transition-colors line-clamp-1"
                            title="Premer Meye | প্রেমের মেয়ে">
                            Premer Meye | প্রেমের মেয়ে</h3>
                    </div>
                </a>
            </div>
            
            `;
    const before = content.substring(0, startIdx);
    const after = content.substring(endIdx);
    fs.writeFileSync('index.html', before + newGrid + after);
    console.log('Fixed index.html with latest 2026 releases');
} else {
    console.log('Could not find markers', startIdx, endIdx);
}
