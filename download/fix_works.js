const fs = require('fs');
let works = fs.readFileSync('works.html', 'utf-8');

// The top part
const headEnd = works.indexOf('<!-- 2. MASSIVE FEATURED GRID -->');
const headHTML = works.substring(0, headEnd);

// The generated grid
const generatedGrid = fs.readFileSync('generated_grid.html', 'utf-8');

const middleHTML = `<!-- 2. MASSIVE FEATURED GRID -->
    <section class="py-20 px-4 md:px-12 relative z-20 bg-dark min-h-screen">
        <div class="container mx-auto max-w-[1600px]">
            
            <!-- Categories / Filters -->
            <div class="flex justify-center flex-wrap gap-4 mb-16 gs-reveal" id="work-filters">
                <button class="filter-btn active px-6 py-2 rounded-full border border-accent bg-accent text-white font-sans text-xs uppercase tracking-widest font-bold transition-all" data-filter="all">All</button>
                <button class="filter-btn px-6 py-2 rounded-full border border-white/20 text-white font-sans text-xs uppercase tracking-widest font-bold hover:border-accent hover:text-accent transition-all" data-filter="songs">Songs</button>
                <button class="filter-btn px-6 py-2 rounded-full border border-white/20 text-white font-sans text-xs uppercase tracking-widest font-bold hover:border-accent hover:text-accent transition-all" data-filter="mix-master">Mix Master</button>
                <button class="filter-btn px-6 py-2 rounded-full border border-white/20 text-white font-sans text-xs uppercase tracking-widest font-bold hover:border-accent hover:text-accent transition-all" data-filter="bgm">BGM</button>
            </div>

            <div id="dynamic-works-grid" class="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 md:gap-8">
${generatedGrid}
            </div>
            
            <div class="mt-16 text-center w-full">
                <button id="load-more-btn" class="inline-block border border-white/20 px-8 py-4 rounded-full font-sans text-xs font-bold uppercase tracking-widest hover:bg-accent hover:border-accent hover:text-black transition-all gs-reveal">See More</button>
            </div>
            
            <div class="mt-24 text-center gs-reveal">
                <a href="https://youtube.com/@jkhjesan?si=00dHez7xnIWZATza" target="_blank" class="inline-block border border-white/20 px-12 py-6 rounded-full font-sans text-sm font-bold uppercase tracking-widest hover:bg-accent hover:border-accent hover:text-black transition-colors">Listen on YouTube</a>
            </div>
        </div>
    </section>
`;

const footerHTML = `
    <!-- 3. MASSIVE FOOTER CTA -->
    <section class="min-h-screen flex flex-col justify-between pt-32 px-4 md:px-12 bg-white text-black relative z-30">
        <div class="container mx-auto max-w-[1600px] flex-grow flex flex-col justify-center text-center gs-reveal">
            <p id="footer-cta-sub" class="font-sans font-bold text-xs uppercase tracking-[0.4em] text-gray-400 mb-10">Ready to build the sound?</p>
            <a href="contact.html" class="hover-flip" data-text="START A PROJECT">
                <span id="footer-cta-main" class="font-display font-extrabold text-[12vw] leading-[0.8] uppercase tracking-tighter text-black mix-blend-difference">START A PROJECT</span>
            </a>

            <div class="mt-20 flex flex-wrap justify-center gap-8 md:gap-16">
                <a href="https://wa.me/8801938172454" target="_blank" id="footer-wa" class="font-sans font-bold text-sm uppercase tracking-widest hover:text-accent transition-colors">WhatsApp</a>
                <a href="https://www.facebook.com/jkh.jesan.9/" target="_blank" id="footer-fb" class="font-sans font-bold text-sm uppercase tracking-widest hover:text-accent transition-colors">Facebook</a>
                <a href="https://youtube.com/@jkhjesan?si=00dHez7xnIWZATza" target="_blank" id="footer-yt" class="font-sans font-bold text-sm uppercase tracking-widest hover:text-accent transition-colors">YouTube</a>
            </div>
        </div>
        <div class="w-full py-8 border-t border-black/10 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] font-sans text-gray-500 relative">
            <p id="copyright">&copy; 2026 JKH JESAN</p>
        </div>
    </section>

    <script>
        const lenis = new Lenis({ duration: 1.2, smooth: true });
        function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);

        gsap.registerPlugin(ScrollTrigger);
        gsap.utils.toArray('.gs-reveal').forEach(elem => {
            gsap.fromTo(elem, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: elem, start: "top 85%" } });
        });

        fetch('/api/data')
            .then(res => res.json())
            .then(data => {
                if (data.branding && data.branding.logo) document.querySelectorAll('img[alt="JKH Logo"]').forEach(img => img.src = data.branding.logo);

                const setHtml = (id, val) => { const el = document.getElementById(id); if (el && val) el.innerHTML = val; };

                if (data.content && data.content.Global) {
                    setHtml('nav-home', data.content.Global.nav_home); setHtml('nav-about', data.content.Global.nav_about); setHtml('nav-works', data.content.Global.nav_works); setHtml('nav-archive', data.content.Global.nav_archive); setHtml('nav-contact', data.content.Global.nav_contact);
                    setHtml('footer-cta-sub', data.content.Global.footer_cta_sub); setHtml('footer-cta-main', data.content.Global.footer_cta_main); setHtml('footer-wa', data.content.Global.footer_wa); setHtml('footer-fb', data.content.Global.footer_fb); setHtml('footer-yt', data.content.Global.footer_yt); setHtml('copyright', data.content.Global.copyright);
                }

                if (data.content && data.content.Works) {
                    const wk = data.content.Works;
                    setHtml('works-hero-kicker', wk.hero_kicker); setHtml('works-hero-title', wk.hero_title);
                }
            }).catch(e => console.log("Static mode"));

        const style = document.createElement('style');
        style.innerHTML = \`@keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }\`;
        document.head.appendChild(style);

        // Filter and Pagination Logic
        function initFiltersAndPagination() {
            const filterBtns = document.querySelectorAll('.filter-btn');
            const workItems = document.querySelectorAll('.work-item');
            const loadMoreBtn = document.getElementById('load-more-btn');
            let visibleCount = 6;

            function updateVisibility() {
                const activeBtn = document.querySelector('.filter-btn.active');
                if (!activeBtn) return;
                const activeFilter = activeBtn.getAttribute('data-filter');
                let count = 0;
                let totalMatched = 0;

                workItems.forEach(item => {
                    const category = item.getAttribute('data-category');
                    if (activeFilter === 'all' || category === activeFilter) {
                        totalMatched++;
                        if (count < visibleCount) {
                            item.style.display = 'block';
                            setTimeout(() => {
                                item.style.opacity = '1';
                                item.style.transform = 'translateY(0)';
                            }, 50);
                            count++;
                        } else {
                            item.style.opacity = '0';
                            item.style.transform = 'translateY(20px)';
                            setTimeout(() => {
                                item.style.display = 'none';
                            }, 300);
                        }
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            item.style.display = 'none';
                        }, 300);
                    }
                });

                if (totalMatched > visibleCount) {
                    loadMoreBtn.style.display = 'inline-block';
                } else {
                    loadMoreBtn.style.display = 'none';
                }
                
                setTimeout(() => ScrollTrigger.refresh(), 350);
            }

            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    filterBtns.forEach(b => {
                        b.classList.remove('active', 'bg-accent', 'border-accent');
                        b.classList.add('border-white/20');
                    });

                    btn.classList.add('active', 'bg-accent', 'border-accent');
                    btn.classList.remove('border-white/20');

                    visibleCount = 6; // Reset to 6 when filter changes
                    updateVisibility();
                });
            });

            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', () => {
                    visibleCount += 100; // Show all remaining
                    updateVisibility();
                });
            }

            // Initial call
            updateVisibility();
        }

        document.addEventListener('DOMContentLoaded', initFiltersAndPagination);
    </script>
    <!-- EvoRise Solutions Creator Tag -->
    <a href="https://www.facebook.com/EvoRiseSolutions/" target="_blank" class="block relative w-full border-t border-white/10 bg-[#050505] overflow-hidden group py-10 cursor-pointer z-50 hover:bg-[#0a0a0a] transition-colors duration-500">
        <!-- Animated Background Gradient -->
        <div class="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div class="container mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-6 relative z-10">
            <span class="font-sans text-[10px] md:text-xs uppercase tracking-[0.5em] text-gray-500 group-hover:text-white transition-colors duration-300">Engineered & Designed By</span>
            
            <div class="relative inline-flex items-center justify-center">
                <span class="font-display font-extrabold text-2xl md:text-4xl uppercase tracking-widest text-transparent group-hover:scale-105 transition-transform duration-500 ease-out" style="-webkit-text-stroke: 1px rgba(255,255,255,0.4);">
                    <span class="text-white group-hover:text-accent transition-colors duration-500 drop-shadow-[0_0_15px_rgba(255,69,0,0)] group-hover:drop-shadow-[0_0_25px_rgba(255,69,0,0.8)]">EvoRise</span> Solutions
                </span>
                
                <!-- Glowing Particle (Animated) -->
                <div class="absolute -right-6 top-0 w-3 h-3 rounded-full bg-accent opacity-0 group-hover:opacity-100 group-hover:animate-ping"></div>
                <div class="absolute -left-6 bottom-0 w-2 h-2 rounded-full bg-white opacity-0 group-hover:opacity-100 group-hover:animate-ping" style="animation-delay: 0.3s"></div>
            </div>
        </div>
    </a>
</body>
</html>
`;

fs.writeFileSync('works.html', headHTML + middleHTML + footerHTML);
console.log("Successfully assembled works.html");
