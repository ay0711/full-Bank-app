import React from 'react';

const SloganSplash = () => (
  <div className="d-flex justify-content-center align-items-center min-vh-100 bg-white">
    <picture>
      <source srcSet="/image/ay-bank-slogan.avif" type="image/avif" />
      <source srcSet="/image/ay-bank-slogan.webp" type="image/webp" />
      <img src="/image/ay-bank-slogan.png" alt="AY Bank Slogan" style={{ width: 180 }} loading="eager" fetchPriority="high" decoding="async" />
    </picture>
  </div>
);

export default SloganSplash;
