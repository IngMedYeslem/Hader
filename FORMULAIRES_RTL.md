# Guide des Formulaires RTL

## Composants disponibles

### RTLTextInput
Remplace `TextInput` avec support RTL automatique :
```javascript
import { RTLTextInput } from './RTLInput';

<RTLTextInput
  style={styles.input}
  placeholder="Nom du produit"
  value={productName}
  onChangeText={setProductName}
/>
```

### RTLFormField
Wrapper pour créer des champs de formulaire avec label :
```javascript
import { RTLFormField } from './RTLInput';

<RTLFormField label="Nom du produit" labelStyle={styles.label}>
  <RTLTextInput
    style={styles.input}
    placeholder="Entrez le nom"
    value={name}
    onChangeText={setName}
  />
</RTLFormField>
```

### RTLPasswordInput
Champ de mot de passe avec bouton œil adapté RTL :
```javascript
import { RTLPasswordInput } from './RTLInput';

<RTLPasswordInput
  style={styles.input}
  placeholder="Mot de passe"
  value={password}
  onChangeText={setPassword}
/>
```

### SimplePasswordInput (mis à jour)
Le composant existant maintenant avec support RTL automatique.

## Adaptation automatique

### Direction du texte
- **LTR** : `textAlign: 'left'`, `writingDirection: 'ltr'`
- **RTL** : `textAlign: 'right'`, `writingDirection: 'rtl'`

### Position des icônes
- **LTR** : Icônes à droite (`right: 15`)
- **RTL** : Icônes à gauche (`left: 15`)

### Padding adaptatif
- **LTR** : `paddingRight` pour les icônes
- **RTL** : `paddingLeft` pour les icônes

## Exemples d'utilisation

### Formulaire simple
```javascript
const MonFormulaire = () => {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');

  return (
    <View>
      <RTLFormField label="Nom complet">
        <RTLTextInput
          value={nom}
          onChangeText={setNom}
          placeholder="Votre nom"
        />
      </RTLFormField>

      <RTLFormField label="Email">
        <RTLTextInput
          value={email}
          onChangeText={setEmail}
          placeholder="votre@email.com"
          keyboardType="email-address"
        />
      </RTLFormField>

      <RTLFormField label="Mot de passe">
        <RTLPasswordInput
          value={motDePasse}
          onChangeText={setMotDePasse}
          placeholder="Mot de passe"
        />
      </RTLFormField>
    </View>
  );
};
```

### Formulaire avec validation
```javascript
const FormulaireAvecValidation = () => {
  const { t } = useTranslation();
  const isRTL = isCurrentLanguageRTL();

  return (
    <RTLView style={{ flexDirection: 'column' }}>
      <RTLFormField 
        label={t('productName')} 
        labelStyle={{ 
          color: isRTL ? '#C8A55F' : '#333',
          textAlign: isRTL ? 'right' : 'left'
        }}
      >
        <RTLTextInput
          style={[
            styles.input,
            { borderColor: isRTL ? '#C8A55F' : '#ddd' }
          ]}
          placeholder={t('enterProductName')}
        />
      </RTLFormField>
    </RTLView>
  );
};
```

## Migration des formulaires existants

### Avant (TextInput standard)
```javascript
<TextInput
  style={styles.input}
  placeholder="Nom du produit"
  value={name}
  onChangeText={setName}
/>
```

### Après (RTL adaptatif)
```javascript
<RTLTextInput
  style={styles.input}
  placeholder="Nom du produit"
  value={name}
  onChangeText={setName}
/>
```

## Composants déjà adaptés

✅ **AddProduct.js** - Formulaire d'ajout de produit
✅ **ShopLogin.js** - Formulaire de connexion/inscription boutique  
✅ **SimplePasswordInput.js** - Champ mot de passe

## À adapter

- EditProduct.js
- CreateShop.js
- AdminLogin.js
- RegisterScreen.js
- UpdateUserScreen.js

## Notes importantes

1. **Compatibilité** : Les composants RTL sont rétrocompatibles
2. **Performance** : Pas d'impact sur les performances
3. **Styles** : Les styles existants continuent de fonctionner
4. **Validation** : La validation des formulaires n'est pas affectée