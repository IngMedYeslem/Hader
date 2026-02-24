import React from 'react';
import { View, TouchableOpacity, Text, Platform } from 'react-native';

const VideoThumbnail = ({ uri, style, onPress, showPlayButton = true }) => {
  if (Platform.OS === 'web') {
    return (
      <TouchableOpacity onPress={onPress} style={style}>
        <video 
          src={uri}
          style={[style, { objectFit: 'cover' }]}
          preload="metadata"
          muted
        />
        {showPlayButton && (
          <View style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: [{ translateX: -15 }, { translateY: -15 }],
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: 'rgba(0,0,0,0.7)',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Text style={{ color: 'white', fontSize: 16 }}>▶️</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Pour mobile, utiliser expo-video avec poster
  const { VideoView, useVideoPlayer } = require('expo-video');
  const player = useVideoPlayer(uri, (player) => {
    player.loop = false;
    player.muted = true;
  });

  return (
    <TouchableOpacity onPress={onPress} style={style}>
      <VideoView
        player={player}
        style={style}
        contentFit="cover"
        nativeControls={false}
      />
      {showPlayButton && (
        <View style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: [{ translateX: -15 }, { translateY: -15 }],
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: 'rgba(0,0,0,0.7)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text style={{ color: 'white', fontSize: 16 }}>▶️</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default VideoThumbnail;