import React from 'react';
import { View, Text } from 'react-native';
import { isCurrentLanguageRTL } from '../translations';

// Composant utilitaire pour wrapper les éléments avec support RTL
export const RTLView = ({ children, style, ...props }) => {
  const isRTL = isCurrentLanguageRTL();
  
  return (
    <View 
      style={[
        style,
        {
          flexDirection: isRTL && style?.flexDirection === 'row' ? 'row-reverse' : style?.flexDirection
        }
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

// Composant utilitaire pour le texte avec support RTL
export const RTLText = ({ children, style, ...props }) => {
  const isRTL = isCurrentLanguageRTL();
  
  return (
    <Text 
      style={[
        style,
        {
          textAlign: isRTL ? 'right' : (style?.textAlign || 'left'),
          writingDirection: isRTL ? 'rtl' : 'ltr'
        }
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

// Hook utilitaire pour obtenir les styles adaptés à RTL
export const useRTLStyles = () => {
  const isRTL = isCurrentLanguageRTL();
  
  const getDirectionalStyle = (ltrStyle, rtlStyle = {}) => {
    return isRTL ? { ...ltrStyle, ...rtlStyle } : ltrStyle;
  };

  const getFlexDirection = (direction = 'row') => {
    if (!isRTL) return direction;
    
    switch (direction) {
      case 'row':
        return 'row-reverse';
      case 'row-reverse':
        return 'row';
      default:
        return direction;
    }
  };

  const getTextAlign = (align = 'left') => {
    if (!isRTL) return align;
    
    switch (align) {
      case 'left':
        return 'right';
      case 'right':
        return 'left';
      default:
        return align;
    }
  };

  const getMarginStyle = (marginLeft = 0, marginRight = 0) => {
    return isRTL 
      ? { marginLeft: marginRight, marginRight: marginLeft }
      : { marginLeft, marginRight };
  };

  const getPaddingStyle = (paddingLeft = 0, paddingRight = 0) => {
    return isRTL 
      ? { paddingLeft: paddingRight, paddingRight: paddingLeft }
      : { paddingLeft, paddingRight };
  };

  return {
    isRTL,
    getDirectionalStyle,
    getFlexDirection,
    getTextAlign,
    getMarginStyle,
    getPaddingStyle
  };
};