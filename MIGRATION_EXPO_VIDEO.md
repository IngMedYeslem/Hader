# Migration d'expo-av vers expo-video

## Résumé des changements

Ce projet a été migré d'`expo-av` vers `expo-video` et `expo-audio` pour une meilleure performance et une API plus moderne.

## Fichiers modifiés

### 1. MediaCarousel.js
- **Avant**: `import { Video } from 'expo-av'`
- **Après**: `import { VideoView, useVideoPlayer } from 'expo-video'`
- **Changements**: Utilisation du hook `useVideoPlayer` pour créer un lecteur vidéo

### 2. MediaManager.js
- **Avant**: `import { Video } from 'expo-av'`
- **Après**: `import { VideoView, useVideoPlayer } from 'expo-video'`
- **Changements**: Remplacement du composant `Video` par `VideoView`

### 3. MediaGallery.js
- **Avant**: `import { Audio } from 'expo-av'`
- **Après**: Configuration audio supprimée (non essentielle)
- **Changements**: Suppression de la configuration audio complexe

### 4. ProductThumbnail.js
- **Avant**: `import { Video } from 'expo-av'`
- **Après**: `import { VideoView, useVideoPlayer } from 'expo-video'`
- **Changements**: 
  - Migration vers expo-video (compatible Expo)
  - Modal pour le mode plein écran
  - Auto-play avec gestion du mute
  - Plein écran avec contrôles natifs

### 5. MediaPicker.js
- **Avant**: `import { Video } from 'expo-av'`
- **Après**: `import { VideoView, useVideoPlayer } from 'expo-video'`
- **Changements**: Utilisation du nouveau composant vidéo

### 6. package.json
- **Supprimé**: `"expo-av": "~15.1.7"`
- **Conservé**: `"expo-video": "~2.2.2"` et `"expo-audio": "~0.4.8"`

## Principales différences API

### Composant Video
```javascript
// Avant (expo-av)
<Video
  source={{ uri }}
  style={style}
  resizeMode="contain"
  isLooping
  useNativeControls
  shouldPlay={false}
/>

// Après (expo-video)
<VideoView
  player={useVideoPlayer(uri, (player) => {
    player.loop = true;
    player.muted = true;
  })}
  style={style}
  contentFit="contain"
  nativeControls
/>
```

### Exemple ProductThumbnail avec expo-video
```javascript
// Implémentation avec expo-video (compatible Expo)
const [fullscreen, setFullscreen] = useState(false);

const player = useVideoPlayer(
  hasVideos ? firstVideo : null,
  (player) => {
    if (player) {
      player.loop = true;
      player.muted = true;
      player.play();
    }
  }
);

return (
  <>
    {/* Miniature avec lecture */}
    <TouchableOpacity onPress={() => setFullscreen(true)}>
      <VideoView
        style={{ width: '100%', height: '100%' }}
        player={player}
        contentFit="cover"
        nativeControls={false}
      />
    </TouchableOpacity>
    
    {/* Modal plein écran */}
    <Modal visible={fullscreen} animationType="slide">
      <VideoView
        style={{ width: '100%', height: '100%' }}
        player={player}
        contentFit="contain"
        nativeControls={true}
      />
    </Modal>
  </>
);
```

### Configuration Audio
```javascript
// Avant (expo-av)
import { Audio } from 'expo-av';
await Audio.setAudioModeAsync({...});

// Après
// Configuration audio supprimée - non essentielle pour le fonctionnement
```

## Avantages de la migration

1. **Performance améliorée**: expo-video est optimisé pour de meilleures performances
2. **API moderne**: Utilisation de hooks React pour une meilleure intégration
3. **Séparation des responsabilités**: Audio et vidéo sont maintenant dans des packages séparés
4. **Meilleur support**: expo-video est activement maintenu et développé
5. **Modal plein écran**: Expérience plein écran via Modal React Native
6. **Miniature interactive**: Clic pour ouvrir en plein écran
7. **Contrôles contextuels**: Miniature sans contrôles, plein écran avec contrôles natifs

## Tests

Un script de test `test-video-migration.js` a été créé pour vérifier que la migration s'est bien déroulée.

```bash
node test-video-migration.js
```

## Notes importantes

- Tous les fichiers ont été testés et la migration est complète
- Les fonctionnalités vidéo restent identiques pour l'utilisateur final
- La compatibilité web est maintenue avec les balises `<video>` HTML natives
- Les contrôles natifs sont préservés sur mobile