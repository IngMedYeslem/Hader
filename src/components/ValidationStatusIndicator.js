import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useTranslation } from '../translations';

const ValidationStatusIndicator = ({ isApproved, isChecking, style }) => {
  const { t } = useTranslation();

  const getStatusColor = () => {
    if (isChecking) return '#007AFF';
    return isApproved ? '#4CAF50' : '#FF9800';
  };

  const getStatusText = () => {
    if (isChecking) return t('checking');
    return isApproved ? t('approved') : t('pending');
  };

  const getStatusIcon = () => {
    if (isChecking) return '🔄';
    return isApproved ? '✅' : '⏳';
  };

  return (
    <View style={[{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${getStatusColor()}15`,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: `${getStatusColor()}30`
    }, style]}>
      {isChecking ? (
        <ActivityIndicator size="small" color={getStatusColor()} style={{ marginRight: 6 }} />
      ) : (
        <Text style={{ fontSize: 12, marginRight: 6 }}>{getStatusIcon()}</Text>
      )}
      <Text style={{
        color: getStatusColor(),
        fontSize: 12,
        fontWeight: 'bold'
      }}>
        {getStatusText()}
      </Text>
    </View>
  );
};

export default ValidationStatusIndicator;