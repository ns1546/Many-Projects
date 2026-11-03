import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

/**
 * Standard-Compliant SVG QR Code Component
 * Generates official, scannable QR Codes with Reed-Solomon error correction
 * compatible with 100% of mobile camera apps, Google Lens, and QR barcode readers.
 */
export default function QRCodeSVG({
  value,
  size = 200,
  fgColor = '#0f172a',
  bgColor = '#ffffff',
  className = '',
}) {
  const [svgHtml, setSvgHtml] = useState('');
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    if (!value) return;

    let isMounted = true;

    // Generate standard SVG QR string
    QRCode.toString(
      value,
      {
        type: 'svg',
        margin: 1,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: 'M',
      },
      (err, svg) => {
        if (!err && isMounted && svg) {
          setSvgHtml(svg);
        }
      }
    );

    // Also generate PNG DataURL as a bulletproof image fallback
    QRCode.toDataURL(
      value,
      {
        margin: 1,
        width: size * 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: 'M',
      },
      (err, url) => {
        if (!err && isMounted && url) {
          setDataUrl(url);
        }
      }
    );

    return () => {
      isMounted = false;
    };
  }, [value, size, fgColor, bgColor]);

  return (
    <div
      className={`inline-flex items-center justify-center p-3 rounded-2xl bg-white shadow-md border border-slate-200 overflow-hidden ${className}`}
      style={{ width: size + 24, height: size + 24 }}
    >
      {dataUrl ? (
        <img
          src={dataUrl}
          alt={`QR Code: ${value}`}
          className="w-full h-full object-contain block"
          style={{ width: size, height: size }}
        />
      ) : svgHtml ? (
        <div
          dangerouslySetInnerHTML={{ __html: svgHtml }}
          className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 animate-pulse">
          Generating QR...
        </div>
      )}
    </div>
  );
}
