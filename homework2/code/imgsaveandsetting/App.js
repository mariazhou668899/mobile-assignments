import React, { useState, useEffect } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, View, StyleSheet, Image, Text, TextInput, FlatList, Keyboard } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Notifications } from 'expo';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ header: () => <Header /> }} />
        <Stack.Screen name="SavedImage" component={SavedImagesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};


const Header = () => {
  const navigation = useNavigation();

  const handleSourceCenterPress = () => {
    navigation.navigate('SavedImage');
  };

  return (
    <View style={[styles.header, { paddingTop: 40 }]}>
      <Button title="Source Center" onPress={handleSourceCenterPress} />
      <Button title="Logout" onPress={() => navigation.replace('Login')} />
    </View>
  );
};

const LoginScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (username === 'Admin' && password === '12345') {
      navigation.navigate('Home');
    } else {
      // Display error message or notification for invalid credentials
      console.log('Invalid credentials');
    }
  };

  return (
      <View style={styles.container}>
      <TextInput
        style={[styles.input, styles.inputMargin]}
        placeholder="Username"
        onChangeText={setUsername}
        value={username}
      />
      <TextInput
        style={[styles.input, styles.inputMargin]}
        placeholder="Password"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
      />
      <View style={styles.buttonContainer}>
        <Button title="Login" onPress={handleLogin} />
      </View>
    </View>
  );
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const [imageUri, setImageUri] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 150, height: 150 });
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');

  useEffect(() => {
    // Load the custom image size from AsyncStorage when the component mounts
    const loadCustomImageSize = async () => {
      try {
        const storedWidth = await AsyncStorage.getItem('customWidth');
        const storedHeight = await AsyncStorage.getItem('customHeight');

        if (storedWidth && storedHeight) {
          // Set custom width and height states with retrieved values
          setCustomWidth(storedWidth);
          setCustomHeight(storedHeight);

          // Set image size state with retrieved values
          setImageSize({ width: parseInt(storedWidth), height: parseInt(storedHeight) });
        }
      } catch (error) {
        console.error('Error loading custom image size:', error);
      }
    };

    loadCustomImageSize();
  }, []);

  const handleStoreImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error selecting image:", error);
    }
  };

  const handleLoadImage = () => {
    handleStoreImage();
  };

  const setCustomSize = async () => {
    const width = parseInt(customWidth);
    const height = parseInt(customHeight);

    if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
      // Update custom width and height in state
      setCustomWidth(width.toString());
      setCustomHeight(height.toString());

      // Store custom width and height in AsyncStorage
      try {
        await AsyncStorage.setItem('customWidth', width.toString());
        await AsyncStorage.setItem('customHeight', height.toString());
      } catch (error) {
        console.error('Error storing custom image size:', error);
      }

      // Update image size state
      setImageSize({ width, height });
    }
    Keyboard.dismiss();
  };

  const handleSaveImage = async () => {
    if (imageUri) {
      try {
        // Get original image size
        const imageSize = await getImageSize(imageUri);

        // Create a new image object with URI, size, name, and createdAt
        const image = {
          uri: imageUri,
          size: imageSize,
          name: `Image_${new Date().getTime()}`, // Example: Image_1618631011000
          createdAt: new Date(),
        };

        // Retrieve existing saved images or initialize an empty array
        const existingImages = await AsyncStorage.getItem('savedImages');
        const images = existingImages ? JSON.parse(existingImages) : [];

        // Add the new image to the array of saved images
        images.push(image);

        // Save the updated array of images to AsyncStorage
        await AsyncStorage.setItem('savedImages', JSON.stringify(images));

        console.log('Image saved successfully:', image); // Add this line for debugging

        // Display a notification for successful save
        Notifications.presentLocalNotificationAsync({
          title: 'Save Successful',
          body: 'Image saved successfully!',
        });
      } catch (error) {
        console.error('Error saving image:', error);
        // Display a notification for error
        Notifications.presentLocalNotificationAsync({
          title: 'Save Error',
          body: 'An error occurred while saving the image. Please try again later.',
        });
      }
    } else {
      // Display a notification if no image is selected
      Notifications.presentLocalNotificationAsync({
        title: 'No Image Selected',
        body: 'Please select an image before saving.',
      });
    }
  };

  const getImageSize = async (uri) => {
    return new Promise((resolve, reject) => {
      Image.getSize(
        uri,
        (width, height) => {
          resolve({ width, height });
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  const handleViewSource = () => {
    navigation.navigate('SavedImages'); // Navigate to SavedImages screen
  };

  return (
    <View style={styles.container}>
      <View style={[styles.buttonContainer, { alignItems: 'flex-start' }]}>
        <View style={[styles.buttonWrapper, styles.button]}>
          <Button
            title={'Load / Display'}
            onPress={handleLoadImage}
          />
        </View>
        <View style={[styles.buttonWrapper, styles.button]}>
          <Button
            title="Save Image"
            onPress={handleSaveImage}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text>Display Set :</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Width"
            onChangeText={setCustomWidth}
            keyboardType="numeric"
            value={customWidth}
          />
        </View>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Height"
            onChangeText={setCustomHeight}
            keyboardType="numeric"
            value={customHeight}
          />
        </View>

        <Button
          title="Confirm"
          onPress={setCustomSize}
          style={styles.button}
        />
      </View>

      <View style={styles.mediaContainer}>
        {imageUri && (
          <Image source={{ uri: imageUri }} style={[styles.image, { width: imageSize.width, height: imageSize.height }]} />
        )}
      </View>
    </View>
  );
};

const SavedImagesScreen = () => {
  const [savedImages, setSavedImages] = useState([]);

  // Function to delete an image
  const handleDeleteImage = async (image) => {
    try {
      // Retrieve saved images from AsyncStorage
      const imagesData = await AsyncStorage.getItem('savedImages');
      if (imagesData) {
        let images = JSON.parse(imagesData);
        // Filter out the image to be deleted
        images = images.filter((img) => img.uri !== image.uri || img.name !== image.name);
        // Update the saved images in AsyncStorage
        await AsyncStorage.setItem('savedImages', JSON.stringify(images));
        // Update state to reflect the changes
        setSavedImages(images);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  useEffect(() => {
    const getSavedImages = async () => {
      try {
        // Retrieve saved images data from AsyncStorage
        const imagesData = await AsyncStorage.getItem('savedImages');
        console.log('Retrieved images data:', imagesData); // For debugging
        if (imagesData) {
          const images = JSON.parse(imagesData);
          setSavedImages(images);
        }
      } catch (error) {
        console.error('Error retrieving saved images:', error);
      }
    };

    getSavedImages();
  }, []);

  return (
    <View style={styles.container}>
      {savedImages.length > 0 ? (
        <FlatList
          data={savedImages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.imageItem}>
              <View style={styles.imageInfo}>
                <Image source={{ uri: item.uri }} style={styles.thumbnail} />
                <Text style={styles.imageName}>{item.name}</Text>
              </View>
              <Button title="Delete" onPress={() => handleDeleteImage(item)} />
            </View>
          )}
        />
      ) : (
        <Text>No saved images found</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
  },

  mediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  image: {
    resizeMode: 'contain',
  },

  button: {
    width: 150, // Adjust the width as needed
    backgroundColor: 'orange', // Set the background color here
  },

  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  inputWrapper: {
    marginHorizontal: 5,
  },
  input: {
    width: 90,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },

    inputMargin: {
    marginBottom: 10,
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonWrapper: {
    marginHorizontal: 5,
  },


  imageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
  },

  thumbnail: {
    width: 80, // Adjust as needed
    height: 80, // Adjust as needed
    resizeMode: 'cover', // or 'contain' based on your preference
    borderRadius: 5,
  },

  imageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  imageName: {
    marginTop: 5, // Adjust as needed
    textAlign: 'center', // Adjust as needed
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default App;
