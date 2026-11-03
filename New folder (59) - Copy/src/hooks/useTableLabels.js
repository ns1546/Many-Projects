import { useEffect } from 'react';

export function useTableLabels() {
  useEffect(() => {
    const applyLabels = () => {
      const tables = document.querySelectorAll('table');
      tables.forEach(table => {
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.innerText.trim());
        if (headers.length === 0) return;

        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
          const cells = Array.from(row.querySelectorAll('td'));
          // Skip rows that are clearly empty states or spanned rows
          if (cells.length === 1 && cells[0].hasAttribute('colspan')) return;

          cells.forEach((cell, index) => {
            if (headers[index] && !cell.hasAttribute('data-label')) {
              cell.setAttribute('data-label', headers[index]);
            }
          });
        });
      });
    };

    applyLabels();

    const observer = new MutationObserver(() => {
      applyLabels();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);
}
