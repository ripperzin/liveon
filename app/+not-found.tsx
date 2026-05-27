import { Link, Stack } from 'expo-router';
import { View, Text } from 'react-native';
import { Colors } from '@/constants/Colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          backgroundColor: Colors.surfaceDark,
        }}
      >
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🗺️</Text>
        <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.textPrimary }}>
          This screen doesn't exist.
        </Text>
        <Link href="/" style={{ marginTop: 20, paddingVertical: 15 }}>
          <Text style={{ fontSize: 14, color: Colors.primary, fontWeight: '600' }}>
            Go to home screen!
          </Text>
        </Link>
      </View>
    </>
  );
}
