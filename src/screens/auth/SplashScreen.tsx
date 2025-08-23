// SplashScreen.js
import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";

import type { StackNavigationProp } from '@react-navigation/stack';

type SplashScreenProps = {
  navigation: StackNavigationProp<any>;
};

const SplashScreen = ({ navigation }: SplashScreenProps) => {
  useEffect(() => {
    // Simulate loading time then navigate
    const timer = setTimeout(() => {
      navigation.replace("Login");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Replace with your logo */}
      
      <Text style={styles.title}>billboard</Text>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e", 
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 1,
  },
});
