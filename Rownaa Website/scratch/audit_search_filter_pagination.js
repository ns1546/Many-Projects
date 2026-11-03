const fs = require('fs');

['find-cars.html', 'customer-panel.html', 'owner-panel.html', 'admin-panel.html'].forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  console.log(`=== ${f} ===`);
  const searchInputs = [...c.matchAll(/<input[^>]+(placeholder=[^>]+search[^>]*|id=[^>]*search[^>]*)/gi)].map(m => m[0]);
  const filterSelects = [...c.matchAll(/<select[^>]+(id=[^>]*filter[^>]*|id=[^>]*category[^>]*|onchange=[^>]*filter[^>]*)/gi)].map(m => m[0]);
  const paginationElements = [...c.matchAll(/class=["'][^"']*pagination[^"']*["']|id=["'][^"']*pagination[^"']*["']|function\s+(nextPage|prevPage|renderPagination|changePage)/gi)].map(m => m[0]);
  
  console.log('Search inputs:', searchInputs.length);
  searchInputs.forEach(s => console.log('  ', s.substring(0, 100)));
  console.log('Filter selects:', filterSelects.length);
  filterSelects.forEach(s => console.log('  ', s.substring(0, 100)));
  console.log('Pagination hooks:', paginationElements.length);
  paginationElements.forEach(s => console.log('  ', s.substring(0, 100)));
});

