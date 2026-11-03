import React from 'react';

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="animate-pageIn">{children}</div>
);

export default PageTransition;
