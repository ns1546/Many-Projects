const fs = require('fs');
const path = require('path');

describe('PILLAR 2: UI TESTING & ACCESSIBILITY (DOM Integrity, WCAG, Responsive Architecture)', () => {
    const rootDir = path.resolve(__dirname, '../../');
    const htmlFiles = [
        'index.html',
        'owner-panel.html',
        'customer-panel.html',
        'admin-panel.html',
        'checkout.html',
        'find-cars.html',
        'login-sliding.html',
        'login.html',
        'register.html',
        'owner-register.html',
        'invoice.html'
    ];

    describe('2.1 DOM Integrity & ID Reference Resolution', () => {
        htmlFiles.forEach(file => {
            it(`Should resolve 100% of getElementById and querySelector(#id) references in ${file}`, () => {
                const filePath = path.join(rootDir, file);
                const content = fs.readFileSync(filePath, 'utf8');

                const getElemMatches = [...content.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
                const qsMatches = [...content.matchAll(/querySelector\(['"]#([^'" .,>:)]+)['"]\)/g)].map(m => m[1]);
                const allIdsNeeded = new Set([...getElemMatches, ...qsMatches]);

                const missingIds = [];
                allIdsNeeded.forEach(id => {
                    const regex = new RegExp('id=["\']' + id + '["\']');
                    if (!regex.test(content)) {
                        missingIds.push(id);
                    }
                });

                expect(missingIds).toEqual([]);
            });
        });
    });

    describe('2.2 WCAG Accessibility & Semantic HTML Compliance', () => {
        htmlFiles.forEach(file => {
            it(`Should have valid meta viewport, language attribute, and title in ${file}`, () => {
                const content = fs.readFileSync(path.join(rootDir, file), 'utf8');

                // HTML lang attribute
                expect(content).toMatch(/<html[^>]*lang=["'][a-z]+["']/i);

                // Viewport tag for mobile responsiveness
                expect(content).toMatch(/<meta[^>]*name=["']viewport["'][^>]*>/i);

                // Page Title
                expect(content).toMatch(/<title>[^<]+<\/title>/i);
            });

            it(`Should ensure all image tags have valid alt or fallback attributes in ${file}`, () => {
                const content = fs.readFileSync(path.join(rootDir, file), 'utf8');
                const imgRegex = /<img\b([^>]*)>/gi;
                let match;
                const imagesWithoutAlt = [];

                while ((match = imgRegex.exec(content)) !== null) {
                    const attrs = match[1];
                    if (!/alt=/i.test(attrs)) {
                        imagesWithoutAlt.push(attrs.slice(0, 40));
                    }
                }

                expect(imagesWithoutAlt).toEqual([]);
            });
        });
    });

    describe('2.3 Interactive Element Coverage & Dead Link Prevention', () => {
        htmlFiles.forEach(file => {
            it(`Should not have dead unhandled href="#" links in ${file}`, () => {
                const content = fs.readFileSync(path.join(rootDir, file), 'utf8');
                const deadLinkRegex = /<a\b([^>]*href=["']#["'][^>]*)>(.*?)<\/a>/gis;
                let match;
                const deadLinks = [];

                while ((match = deadLinkRegex.exec(content)) !== null) {
                    const attrs = match[1];
                    const text = match[2].replace(/<[^>]+>/g, '').trim();
                    if (!/onclick=/i.test(attrs)) {
                        deadLinks.push(text);
                    }
                }

                expect(deadLinks).toEqual([]);
            });
        });

        it('Should verify that all primary dashboards have responsive mobile navigation layouts', () => {
            const customerHtml = fs.readFileSync(path.join(rootDir, 'customer-panel.html'), 'utf8');
            const ownerHtml = fs.readFileSync(path.join(rootDir, 'owner-panel.html'), 'utf8');
            const adminHtml = fs.readFileSync(path.join(rootDir, 'admin-panel.html'), 'utf8');

            expect(customerHtml).toContain('class="mobile-nav"');
            expect(ownerHtml).toContain('class="mobile-nav"');
            expect(adminHtml).toContain('class="mobile-nav"');
        });
    });
});
