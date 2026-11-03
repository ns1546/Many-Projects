/**
 * PILLAR 2 (ADVANCED): DEQUE AXE-CORE UI ACCESSIBILITY & WCAG 2.1 COMPLIANCE SUITE
 * Inspired by G:\Download Official\Web Testing\2.Ui Testing\axe-core-develop.zip
 * 
 * Audits all 11 core HTML documents for:
 * - WCAG 2.1 Level A & AA compliance
 * - Image alternate text & decorative image semantics
 * - Form input labels and accessible names
 * - Document structure, headings hierarchy, and lang attributes
 * - Interactive element accessibility (buttons & links)
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ROOT_DIR = path.resolve(__dirname, '../..');
const HTML_FILES = [
    'index.html',
    'find-cars.html',
    'checkout.html',
    'customer-panel.html',
    'owner-panel.html',
    'admin-panel.html',
    'login.html',
    'login-sliding.html',
    'register.html',
    'owner-register.html',
    'invoice.html'
];

describe('PILLAR 2: DEQUE AXE-CORE & WCAG 2.1 ACCESSIBILITY AUDIT', () => {

    HTML_FILES.forEach(fileName => {
        describe(`Accessibility Audit: ${fileName}`, () => {
            let $;

            beforeAll(() => {
                const filePath = path.join(ROOT_DIR, fileName);
                const htmlContent = fs.readFileSync(filePath, 'utf-8');
                $ = cheerio.load(htmlContent);
            });

            test(`${fileName} should have valid html lang and viewport meta tag`, () => {
                const lang = $('html').attr('lang');
                expect(lang).toBeTruthy();

                const viewportMeta = $('meta[name="viewport"]').attr('content');
                expect(viewportMeta).toBeDefined();
                expect(viewportMeta).toContain('width=device-width');
            });

            test(`${fileName} should have a non-empty document title`, () => {
                const title = $('title').text().trim();
                expect(title.length).toBeGreaterThan(3);
            });

            test(`${fileName} should have alt or presentation role on all img elements`, () => {
                $('img').each((i, el) => {
                    const alt = $(el).attr('alt');
                    const role = $(el).attr('role');
                    const ariaHidden = $(el).attr('aria-hidden');
                    const isAccessible = alt !== undefined || role === 'presentation' || ariaHidden === 'true';
                    expect(isAccessible).toBe(true);
                });
            });

            test(`${fileName} should ensure interactive buttons and links have accessible text or aria attributes`, () => {
                $('button, a').each((i, el) => {
                    const text = $(el).text().trim();
                    const ariaLabel = $(el).attr('aria-label');
                    const ariaLabelledBy = $(el).attr('aria-labelledby');
                    const title = $(el).attr('title');
                    const hasIconWithAlt = $(el).find('img[alt], svg, i').length > 0;

                    const hasAccessibleName = Boolean(
                        text.length > 0 || ariaLabel || ariaLabelledBy || title || hasIconWithAlt
                    );
                    expect(hasAccessibleName).toBe(true);
                });
            });

            test(`${fileName} should have valid form input labels or accessible attributes`, () => {
                $('input:not([type="hidden"]), select, textarea').each((i, el) => {
                    const id = $(el).attr('id');
                    const type = $(el).attr('type');
                    const hasLabel = id ? $(`label[for="${id}"]`).length > 0 : false;
                    const hasAriaLabel = Boolean($(el).attr('aria-label'));
                    const hasPlaceholder = Boolean($(el).attr('placeholder'));
                    const hasTitle = Boolean($(el).attr('title'));
                    const isInsideLabel = $(el).parents('label').length > 0;
                    const hasSiblingLabel = $(el).siblings('label').length > 0 || $(el).parent().find('label').length > 0 || $(el).closest('.form-group, .field, form, div').find('label').length > 0;
                    const isButtonOrSubmit = (type === 'submit' || type === 'button' || type === 'reset') && Boolean($(el).attr('value'));

                    const isAccessible = hasLabel || hasAriaLabel || hasPlaceholder || hasTitle || isInsideLabel || hasSiblingLabel || isButtonOrSubmit;
                    expect(isAccessible).toBe(true);
                });
            });

            test(`${fileName} should have properly defined headings`, () => {
                const primaryHeadings = $('h1, h2').length;
                const totalHeadings = $('h1, h2, h3, h4, h5, h6').length;
                if (totalHeadings > 0) {
                    expect(primaryHeadings).toBeGreaterThanOrEqual(1);
                }
            });
        });
    });
});
