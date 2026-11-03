import fs from 'fs';

// 1. Fix Footer.tsx heading hierarchy (h4 -> h3)
let footer = fs.readFileSync('src/components/shared/Footer.tsx', 'utf8');
footer = footer.replace(/<h4 className="text-xs font-bold uppercase tracking-\[0\.16em\] mb-6"/g, '<h3 className="text-xs font-bold uppercase tracking-[0.16em] mb-6"');
footer = footer.replace(/style=\{\{ color: "var\(--foreground-muted\)" \}\}>প্ল্যাটফর্ম<\/h4>/g, 'style={{ color: "var(--foreground-muted)" }}>প্ল্যাটফর্ম</h3>');
footer = footer.replace(/style=\{\{ color: "var\(--foreground-muted\)" \}\}>ক্যাটাগরি<\/h4>/g, 'style={{ color: "var(--foreground-muted)" }}>ক্যাটাগরি</h3>');
footer = footer.replace(/style=\{\{ color: "var\(--foreground-muted\)" \}\}>যোগাযোগ<\/h4>/g, 'style={{ color: "var(--foreground-muted)" }}>যোগাযোগ</h3>');
fs.writeFileSync('src/components/shared/Footer.tsx', footer, 'utf8');
console.log('Fixed Footer.tsx headings');

// 2. Fix page.tsx heading hierarchy (h4 -> h3)
let page = fs.readFileSync('src/app/page.tsx', 'utf8');
page = page.replace(
  '<h4 className="font-bold text-sm mb-0.5" style={{ color: "var(--ink-900)" }}>{f.title}</h4>',
  '<h3 className="font-bold text-sm mb-0.5" style={{ color: "var(--ink-900)" }}>{f.title}</h3>'
);
page = page.replace(
  '<h4 className="font-bold text-xs sm:text-sm mb-1 sm:mb-1.5" style={{ color: "var(--ink-900)" }}>{item.title}</h4>',
  '<h3 className="font-bold text-xs sm:text-sm mb-1 sm:mb-1.5" style={{ color: "var(--ink-900)" }}>{item.title}</h3>'
);
fs.writeFileSync('src/app/page.tsx', page, 'utf8');
console.log('Fixed page.tsx headings');

// 3. Fix CoursesClient.tsx heading hierarchy (h3 -> h2)
let coursesClient = fs.readFileSync('src/app/courses/CoursesClient.tsx', 'utf8');
coursesClient = coursesClient.replace(
  '<h3 className="font-bold text-foreground text-base leading-snug mb-2 hover:text-primary transition-colors line-clamp-2">',
  '<h2 className="font-bold text-foreground text-base leading-snug mb-2 hover:text-primary transition-colors line-clamp-2">'
);
coursesClient = coursesClient.replace(
  '{course.title}\n                          </h3>',
  '{course.title}\n                          </h2>'
);
coursesClient = coursesClient.replace(
  '{course.title}</h3>',
  '{course.title}</h2>'
);
coursesClient = coursesClient.replace(
  '<h3 className="text-xl font-black text-foreground mb-2">কোনো কোর্স পাওয়া যায়নি</h3>',
  '<h2 className="text-xl font-black text-foreground mb-2">কোনো কোর্স পাওয়া যায়নি</h2>'
);
fs.writeFileSync('src/app/courses/CoursesClient.tsx', coursesClient, 'utf8');
console.log('Fixed CoursesClient.tsx headings');

// 4. Boost Color Contrast in globals.css
let css = fs.readFileSync('src/app/globals.css', 'utf8');
css = css.replace('--foreground-muted:   #6B6B5A;', '--foreground-muted:   #545446;');
css = css.replace('--foreground-muted:   #9A9F84;', '--foreground-muted:   #B0B69B;');
fs.writeFileSync('src/app/globals.css', css, 'utf8');
console.log('Fixed globals.css color contrast');

