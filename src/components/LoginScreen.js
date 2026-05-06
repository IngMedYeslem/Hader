import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Button, Snackbar } from "react-native-paper";
import { useMutation } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LOGIN_MUTATION } from "../graphql/LOGIN_MUTATION";
import { useTranslation } from "react-i18next";
import LanguageToggle from "./LanguageToggle";
import { Linking } from "react-native";

export default function LoginScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: async (data) => {
      if (data.login.token) {
        await AsyncStorage.setItem("token", data.login.token);
        await AsyncStorage.setItem("user", JSON.stringify({
          username: data.login.username,
          email: data.login.email,
          profileImage: data.login.profileImage,
          role: data.login.roles,
        }));
        navigation.replace("HomeScreen");
      }
    },
    onError: () => {
      setSnackbarMessage("Identifiants incorrects.");
      setSnackbarVisible(true);
    },
  });

  const openWhatsApp = () => {
    const url = `whatsapp://send?phone=+22236251999&text=${encodeURIComponent(t("messagAide"))}`;
    Linking.openURL(url).catch(() => {
      setSnackbarMessage("WhatsApp n'est pas installé.");
      setSnackbarVisible(true);
    });
  };

  const handleLogin = async () => {
    if (!username || !password) {
      setSnackbarMessage("Veuillez entrer un username et un mot de passe.");
      setSnackbarVisible(true);
      return;
    }
    await login({ variables: { username, password } });
  };

  const inputStyle = {
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
    marginBottom: 12,
  };

  const isRTL = i18n.language === 'ar';

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* شريط برتقالي علوي */}
      <View style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
        backgroundColor: '#FF6B35',
        borderBottomLeftRadius: 60, borderBottomRightRadius: 60,
      }} />



      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* شعار */}
            <View style={{ alignItems: 'center', marginBottom: 32 }}>
              <Image source={require('../../assets/logof.png')} style={{ width: 90, height: 90, resizeMode: 'contain', marginBottom: 12 }} />
              <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold' }}>{t("cp")}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 }}>{t("Authentification")}</Text>
            </View>

            {/* بطاقة */}
            <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 10 }}>
              <LanguageToggle />

              <TextInput
                placeholder={t("username")}
                placeholderTextColor="#aaa"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                textAlign={isRTL ? 'right' : 'left'}
                style={inputStyle}
              />

              <View style={{ position: 'relative' }}>
                <TextInput
                  placeholder={t("password")}
                  placeholderTextColor="#aaa"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!passwordVisible}
                  textAlign={isRTL ? 'right' : 'left'}
                  style={[inputStyle, { paddingRight: isRTL ? 16 : 48, paddingLeft: isRTL ? 48 : 16 }]}
                />
                <TouchableOpacity
                  onPress={() => setPasswordVisible(!passwordVisible)}
                  style={{ position: 'absolute', right: isRTL ? undefined : 14, left: isRTL ? 14 : undefined, top: 12 }}
                >
                  <Text style={{ fontSize: 18 }}>{passwordVisible ? '👁️' : '👁️'}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                style={{ backgroundColor: loading ? '#ffaa88' : '#FF6B35', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4 }}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                  {loading ? '...' : t("SeConnecter")}
                </Text>
              </TouchableOpacity>

              <View style={{ height: 1, backgroundColor: '#FFF0EB', marginVertical: 16 }} />

              <TouchableOpacity onPress={() => navigation.navigate("RegisterScreen")} style={{ alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ color: '#FF6B35', fontSize: 14 }}>{t("Ccompte")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate("ShopRegisterScreen")}
                style={{ borderWidth: 1.5, borderColor: '#FF6B35', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginBottom: 10 }}
              >
                <Text style={{ color: '#FF6B35', fontWeight: '600', fontSize: 14 }}>🏪 {t('createShop') || 'Créer un compte boutique'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={openWhatsApp}
                style={{ borderWidth: 1.5, borderColor: '#25D366', borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
              >
                <Text style={{ color: '#25D366', fontWeight: '600', fontSize: 14 }}>💬 {t("ContactSupport") || "Contacter via WhatsApp"}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: '#FF6B35' }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}