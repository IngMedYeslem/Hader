import React from 'react';
import { Image, TouchableOpacity } from 'react-native';

const VideoThumbnail = ({ uri, style, onPress }) => (
  <TouchableOpacity onPress={onPress} style={style}>
    <Image source={{ uri }} style={style} resizeMode="cover" />
  </TouchableOpacity>
);

export default VideoThumbnail;
