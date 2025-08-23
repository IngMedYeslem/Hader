import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Platform } from 'react-native';
import { isCurrentLanguageRTL } from '../translations';

export default function SimplePasswordInput({ 
  value, 
  onChangeText, 
  placeholder, 
  placeholderTextColor = "#999",
  style,
  ...props 
}) {
  const [secureText, setSecureText] = useState(true);
  const isRTL = isCurrentLanguageRTL();

  const webProps = Platform.OS === 'web' ? {
    dir: isRTL ? 'rtl' : 'ltr',
    className: isRTL ? 'rtl-input' : 'ltr-input'
  } : {};

  return (
    <View style={{ position: 'relative' }}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        secureTextEntry={secureText}
        value={value}
        onChangeText={onChangeText}
        style={[
          style, 
          { 
            paddingRight: isRTL ? 15 : 50,
            paddingLeft: isRTL ? 50 : 15,
            textAlign: isRTL ? 'right' : 'left',
            writingDirection: isRTL ? 'rtl' : 'ltr',
            direction: isRTL ? 'rtl' : 'ltr'
          }
        ]}
        textAlign={isRTL ? 'right' : 'left'}
        {...webProps}
        {...props}
      />
      <TouchableOpacity 
        onPress={() => setSecureText(!secureText)}
        style={{
          position: 'absolute',
          right: isRTL ? undefined : 15,
          left: isRTL ? 15 : undefined,
          top: '50%',
          transform: [{ translateY: -10 }]
        }}
      >
        <Text style={{ fontSize: 18 }}>{secureText ? '👁️' : '🗨️'}</Text>
      </TouchableOpacity>
    </View>
  );
}