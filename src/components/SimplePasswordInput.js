import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';

export default function SimplePasswordInput({ 
  value, 
  onChangeText, 
  placeholder, 
  placeholderTextColor = "#999",
  style,
  ...props 
}) {
  const [secureText, setSecureText] = useState(true);

  return (
    <View style={{ position: 'relative' }}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        secureTextEntry={secureText}
        value={value}
        onChangeText={onChangeText}
        style={[style, { paddingRight: 50 }]}
        {...props}
      />
      <TouchableOpacity 
        onPress={() => setSecureText(!secureText)}
        style={{
          position: 'absolute',
          right: 15,
          top: '50%',
          transform: [{ translateY: -10 }]
        }}
      >
        <Text style={{ fontSize: 18 }}>{secureText ? '👁️' : '👁️🗨️'}</Text>
      </TouchableOpacity>
    </View>
  );
}