import React, { useState } from 'react';
import { TextInput } from 'react-native-paper';
import { TouchableOpacity, Text } from 'react-native';

export default function PasswordInput({ 
  value, 
  onChangeText, 
  placeholder, 
  placeholderTextColor = "#C8A55F",
  style,
  mode = "outlined",
  isRTL = false,
  ...props 
}) {
  const [secureText, setSecureText] = useState(true);

  const EyeIcon = () => (
    <TouchableOpacity onPress={() => setSecureText(!secureText)}>
      <Text style={{ fontSize: 18 }}>{secureText ? '👁️' : '👁️‍🗨️'}</Text>
    </TouchableOpacity>
  );

  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
      mode={mode}
      secureTextEntry={secureText}
      value={value}
      onChangeText={onChangeText}
      style={style}
      right={!isRTL ? <TextInput.Icon icon={() => <EyeIcon />} /> : null}
      left={isRTL ? <TextInput.Icon icon={() => <EyeIcon />} /> : null}
      {...props}
    />
  );
}