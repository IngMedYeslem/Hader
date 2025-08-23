import React from 'react';
import { TextInput, View, Text, TouchableOpacity, Platform } from 'react-native';
import { isCurrentLanguageRTL } from '../translations';

export const RTLTextInput = ({ style, placeholder, ...props }) => {
  const isRTL = isCurrentLanguageRTL();
  
  const webProps = Platform.OS === 'web' ? {
    dir: isRTL ? 'rtl' : 'ltr',
    className: isRTL ? 'rtl-input' : 'ltr-input'
  } : {};
  
  return (
    <TextInput
      style={[
        style,
        {
          textAlign: isRTL ? 'right' : 'left',
          writingDirection: isRTL ? 'rtl' : 'ltr',
          direction: isRTL ? 'rtl' : 'ltr'
        }
      ]}
      placeholder={placeholder}
      textAlign={isRTL ? 'right' : 'left'}
      {...webProps}
      {...props}
    />
  );
};

export const RTLFormField = ({ label, children, style, labelStyle }) => {
  const isRTL = isCurrentLanguageRTL();
  
  return (
    <View style={[{ marginBottom: 15 }, style]}>
      <Text style={[
        { 
          marginBottom: 5, 
          textAlign: isRTL ? 'right' : 'left',
          fontSize: 16,
          fontWeight: 'bold'
        }, 
        labelStyle
      ]}>
        {label}
      </Text>
      {children}
    </View>
  );
};

export const RTLPasswordInput = ({ style, ...props }) => {
  const isRTL = isCurrentLanguageRTL();
  const [showPassword, setShowPassword] = React.useState(false);
  
  const webProps = Platform.OS === 'web' ? {
    dir: isRTL ? 'rtl' : 'ltr',
    className: isRTL ? 'rtl-input' : 'ltr-input'
  } : {};
  
  return (
    <View style={[style, { position: 'relative' }]}>
      <TextInput
        style={[
          style,
          {
            textAlign: isRTL ? 'right' : 'left',
            writingDirection: isRTL ? 'rtl' : 'ltr',
            direction: isRTL ? 'rtl' : 'ltr',
            paddingRight: isRTL ? 50 : (style?.paddingRight || 15),
            paddingLeft: isRTL ? (style?.paddingLeft || 15) : 50
          }
        ]}
        textAlign={isRTL ? 'right' : 'left'}
        secureTextEntry={!showPassword}
        {...webProps}
        {...props}
      />
      <TouchableOpacity
        style={{
          position: 'absolute',
          right: isRTL ? undefined : 15,
          left: isRTL ? 15 : undefined,
          top: '50%',
          transform: [{ translateY: -12 }]
        }}
        onPress={() => setShowPassword(!showPassword)}
      >
        <Text style={{ fontSize: 20 }}>{showPassword ? '👁️' : '🗨️'}</Text>
      </TouchableOpacity>
    </View>
  );
};