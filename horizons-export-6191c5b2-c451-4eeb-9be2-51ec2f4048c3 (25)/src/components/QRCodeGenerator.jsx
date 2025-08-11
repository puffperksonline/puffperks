import React, { useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';

const QRCodeGenerator = ({ value, size = 200, fgColor = '#000000', bgColor = '#FFFFFF', getCanvasRef }) => {
  const canvasRef = useRef(null);

  const drawQRCode = useCallback(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor
        }
      }, (error) => {
        if (error) console.error('QR Code generation error:', error);
      });
    }
  }, [value, size, fgColor, bgColor]);
  
  useEffect(() => {
    drawQRCode();
    if(getCanvasRef){
      getCanvasRef(canvasRef);
    }
  }, [drawQRCode, getCanvasRef]);

  return <canvas ref={canvasRef} className="rounded-lg" />;
};

export default QRCodeGenerator;