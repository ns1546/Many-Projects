import { useEffect, useState, useCallback } from 'react';

export default function useMobileBottomSheet(sheetName = 'bottomSheet') {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handlePopState = (e) => {
      // If we are open, and the pop state happens, it means the user pressed the back button.
      // We should close the sheet.
      if (isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isOpen]);

  const openSheet = useCallback(() => {
    window.history.pushState({ sheet: sheetName }, '');
    setIsOpen(true);
  }, [sheetName]);

  const closeSheet = useCallback(() => {
    if (window.history.state?.sheet === sheetName) {
      window.history.back(); // This triggers popstate, which calls setIsOpen(false)
    } else {
      setIsOpen(false);
    }
  }, [sheetName]);

  return { isOpen, openSheet, closeSheet, setIsOpen };
}
