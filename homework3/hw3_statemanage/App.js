import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const App = () => {
  const [inputText, setInputText] = useState('');

  // Load the input text from AsyncStorage when the component mounts
  useEffect(() => {
    const loadInputText = async () => {
      try {
        const storedText = await AsyncStorage.getItem('inputText');
        if (storedText !== null) {
          setInputText(storedText);
        }
      } catch (error) {
        console.error('Error loading input text:', error);
      }
    };

    loadInputText();
  }, []);

  // Save the input text to AsyncStorage whenever it changes
  useEffect(() => {
    const saveInputText = async () => {
      try {
        await AsyncStorage.setItem('inputText', inputText);
      } catch (error) {
        console.error('Error saving input text:', error);
      }
    };

    saveInputText();
  }, [inputText]); // This effect runs whenever inputText changes

  // Function to handle text input change
  const handleTextChange = (text) => {
    setInputText(text);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Input Text Screen</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter text"
        value={inputText}
        onChangeText={handleTextChange}
        multiline={true}
        numberOfLines={4}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 20,
  },
});

export default App;
