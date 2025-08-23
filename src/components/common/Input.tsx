import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

interface InputProps {
  label: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  value: string | undefined;
  onChangeText: (text: string) => void;
  onBlur?: ()=> void;
  error?:string;
  leftIcon?:string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  required?: boolean;
  keyboardType?: string;
  autoCapitalize?: string;
  autoComplete?: string;
  editable?: boolean;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  secureTextEntry = false,
  value,
  onChangeText,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#aaa"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
});

export default Input;
