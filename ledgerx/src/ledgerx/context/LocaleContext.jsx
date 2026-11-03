import React, { createContext, useContext, useState, useEffect } from 'react';
import { t as translate, toBengaliNumerals, formatNumber } from '../locales/i18n';

const LocaleContext = createContext(null);

export const LocaleProvider = ({ children }) => {
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('ledgerx_locale') || 'bn';
  });

  const [useBengaliNumerals, setUseBengaliNumerals] = useState(() => {
    return localStorage.getItem('ledgerx_bn_numerals') !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('ledgerx_locale', locale);
  }, [locale]);

  useEffect(() => {
    localStorage.setItem('ledgerx_bn_numerals', String(useBengaliNumerals));
  }, [useBengaliNumerals]);

  // Global Ctrl+L shortcut to toggle language
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        toggleLocale();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [locale]);

  const toggleLocale = () => {
    setLocale((prev) => (prev === 'bn' ? 'en' : 'bn'));
  };

  const t = (key, params = {}) => translate(key, locale, params);

  const formatNum = (val) => {
    return formatNumber(val, locale, locale === 'bn' && useBengaliNumerals);
  };

  return (
    <LocaleContext.Provider
      value={{
        locale,
        setLocale,
        toggleLocale,
        useBengaliNumerals,
        setUseBengaliNumerals,
        t,
        formatNum,
        formatNumber: formatNum,
        toBengaliNumerals,
        isBengali: locale === 'bn'
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};
