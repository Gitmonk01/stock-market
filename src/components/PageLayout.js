// PageLayout.js
import React from 'react';

const PageLayout = ({ children, marginTop }) => {
  return (
    <div style={{ marginTop: marginTop }}>
      {children}
    </div>
  );
};

export default PageLayout;
