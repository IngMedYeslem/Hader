# Guide d'utilisation du système RTL (Right-to-Left)

## Vue d'ensemble

Le système RTL a été implémenté pour gérer automatiquement le sens d'écriture lors du changement de langue. L'arabe (`ar`) et d'autres langues RTL sont automatiquement détectées et appliquées.

## Fonctionnalités

### 1. Détection automatique RTL
- **Langues RTL supportées** : `ar` (arabe), `he` (hébreu), `fa` (persan), `ur` (ourdou)
- **Changement automatique** : Le sens d'écriture change automatiquement lors du changement de langue
- **Persistance** : La direction est sauvegardée et restaurée au redémarrage

### 2. Composants utilitaires

#### RTLView
```javascript
import { RTLView } from '../components/RTLComponents';

<RTLView style={{ flexDirection: 'row' }}>
  {/* Le flexDirection sera automatiquement 'row-reverse' en arabe */}
</RTLView>
```

#### RTLText
```javascript
import { RTLText } from '../components/RTLComponents';

<RTLText style={{ fontSize: 16 }}>
  {/* L'alignement sera automatiquement 'right' en arabe */}
  Texte qui s'adapte automatiquement
</RTLText>
```

#### Hook useRTLStyles
```javascript
import { useRTLStyles } from '../components/RTLComponents';

const MyComponent = () => {
  const { isRTL, getFlexDirection, getTextAlign, getMarginStyle } = useRTLStyles();
  
  return (
    <View style={{ 
      flexDirection: getFlexDirection('row'),
      ...getMarginStyle(10, 20) // marginLeft: 10, marginRight: 20 (inversé en RTL)
    }}>
      <Text style={{ textAlign: getTextAlign('left') }}>
        Texte adaptatif
      </Text>
    </View>
  );
};
```

### 3. Utilisation manuelle dans les styles

```javascript
import { useTranslation, isCurrentLanguageRTL } from '../translations';

const MyComponent = () => {
  const { t } = useTranslation();
  const isRTL = isCurrentLanguageRTL();
  
  return (
    <View style={{
      flexDirection: isRTL ? 'row-reverse' : 'row',
      textAlign: isRTL ? 'right' : 'left'
    }}>
      {/* Contenu */}
    </View>
  );
};
```

## Configuration

### Langues RTL
Les langues RTL sont définies dans `src/translations.js` :
```javascript
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];
```

### Ajout d'une nouvelle langue RTL
1. Ajouter la langue dans `RTL_LANGUAGES`
2. Ajouter les traductions dans l'objet `translations`
3. Le système RTL s'appliquera automatiquement

## Fonctions utilitaires disponibles

### Dans translations.js
- `isCurrentLanguageRTL()` : Retourne true si la langue actuelle est RTL
- `isRTLLanguage(lang)` : Vérifie si une langue spécifique est RTL
- `setLanguage(lang)` : Change la langue et applique automatiquement RTL

### Dans RTLComponents.js
- `useRTLStyles()` : Hook pour obtenir des utilitaires de style RTL
- `RTLView` : Composant View avec support RTL automatique
- `RTLText` : Composant Text avec support RTL automatique

## Exemples d'utilisation

### Exemple 1 : Navigation avec icônes
```javascript
<View style={{ 
  flexDirection: isRTL ? 'row-reverse' : 'row',
  alignItems: 'center'
}}>
  <Icon name="arrow-back" />
  <Text style={{ 
    marginLeft: isRTL ? 0 : 8,
    marginRight: isRTL ? 8 : 0 
  }}>
    {t('back')}
  </Text>
</View>
```

### Exemple 2 : Formulaire
```javascript
<RTLView style={{ flexDirection: 'row', alignItems: 'center' }}>
  <RTLText style={{ flex: 1 }}>{t('label')}</RTLText>
  <TextInput 
    style={{ 
      flex: 2,
      textAlign: isRTL ? 'right' : 'left'
    }}
  />
</RTLView>
```

## Support plateforme

- **Web** : Utilise `document.documentElement.dir` et CSS `direction`
- **React Native** : Utilise `I18nManager.forceRTL()`
- **Persistance** : AsyncStorage (mobile) / localStorage (web)

## Notes importantes

1. **Redémarrage requis** : Sur React Native, un redémarrage peut être nécessaire pour certains changements RTL
2. **Styles existants** : Les styles existants continuent de fonctionner, RTL est additionnel
3. **Performance** : Le système est optimisé pour éviter les re-rendus inutiles
4. **Compatibilité** : Compatible avec react-i18next et autres systèmes de traduction