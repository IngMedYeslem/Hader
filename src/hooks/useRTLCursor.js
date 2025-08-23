import { useEffect } from 'react';
import { Platform } from 'react-native';

export const useRTLCursor = () => {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      // Injecter le CSS pour forcer la direction du curseur
      const styleId = 'rtl-cursor-styles';
      
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          input[dir="rtl"], 
          textarea[dir="rtl"],
          .rtl-input {
            direction: rtl !important;
            text-align: right !important;
            unicode-bidi: bidi-override !important;
          }

          input[dir="ltr"], 
          textarea[dir="ltr"],
          .ltr-input {
            direction: ltr !important;
            text-align: left !important;
            unicode-bidi: bidi-override !important;
          }

          .rn-text-input[dir="rtl"] {
            direction: rtl !important;
            text-align: right !important;
            unicode-bidi: bidi-override !important;
          }

          .rn-text-input[dir="ltr"] {
            direction: ltr !important;
            text-align: left !important;
            unicode-bidi: bidi-override !important;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);
};