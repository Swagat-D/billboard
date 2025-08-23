import React from "react";
import { View, ActivityIndicator, StyleSheet, Text, Modal } from "react-native";

interface LoadingSpinnerProps {
  message?: string;
  visible?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message, visible }) => {
  if (!visible) return null; // don't render when not needed

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#4CAF50" />
          {message && <Text style={styles.text}>{message}</Text>}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)", // dim background
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
});

export default LoadingSpinner;
