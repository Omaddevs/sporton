import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Text, { TextInput } from '../components/AppText';
import { Ionicons } from '@expo/vector-icons';
import { Button, ScreenHeader } from '../components/ui';
import { colors, radius, shadow } from '../theme';
import { useApp } from '../context/AppContext';

export default function EditProfileScreen({ navigation }) {
  const { user, updateUser } = useApp();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [email, setEmail] = useState(user.email || '');

  const save = () => {
    if (name.trim().length < 2) return Alert.alert('Xato', 'Ism kamida 2 ta harfdan iborat bo\'lsin.');
    if (phone.replace(/\D/g, '').length < 9) return Alert.alert('Xato', 'Telefon raqamni to\'g\'ri kiriting.');
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return Alert.alert('Xato', 'Email manzil noto\'g\'ri.');
    updateUser({ name: name.trim(), phone: phone.trim(), email: email.trim() });
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Shaxsiy ma'lumotlar" />
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <Input label="Ism familiya" icon="person-outline" value={name} onChangeText={setName} placeholder="Ismingiz" />
        <Input label="Telefon" icon="call-outline" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+998" />
        <Input
          label="Email (ixtiyoriy)"
          icon="mail-outline"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="email@misol.uz"
        />
        <Button title="Saqlash" icon="checkmark" onPress={save} style={{ marginTop: 12 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Input({ label, icon, ...props }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.box}>
        <Ionicons name={icon} size={19} color={colors.textLight} />
        <TextInput {...props} placeholderTextColor={colors.textLight} style={styles.input} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: 8, marginLeft: 4 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    height: 54,
    ...shadow,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: colors.text, height: '100%' },
});
