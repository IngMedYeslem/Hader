import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useTranslation } from '../translations';

const ValidationStatusIndicator = ({ isApproved, isRejected, isChecking, style }) => {
  const { t } = useTranslation();

  const getStatusColor = () => {
    if (isChecking) return '#FF6B35';
    if (isRejected) return '#e74c3c';
    return isApproved ? '#2ecc71' : '#FF6B35';
  };

  const getBgColor = () => {
    if (isChecking) return 'rgba(255,107,53,0.1)';
    if (isRejected) return 'rgba(231,76,60,0.1)';
    return isApproved ? 'rgba(46,204,113,0.1)' : 'rgba(255,107,53,0.1)';
  };

  const getStatusText = () => {
    if (isChecking) return t('checking');
    if (isRejected) return 'Rejetée';
    return isApproved ? t('approved') : t('pending');
  };

  const getStatusIcon = () => {
    if (isChecking) return '🔄';
    if (isRejected) return '❌';
    return isApproved ? '✅' : '⏳';
  };

  return (
    <View style={[{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: getBgColor(),
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: getStatusColor(),
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