import React, { useState, useContext } from 'react';
import { View, Text, Button, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../contexts/authContext';
import { API_ENDPOINTS } from '../../config/api';
import { useLocalSearchParams } from 'expo-router';

export default function AttendanceScreen() {
  const { authToken } = useContext(AuthContext);
  const { courseId } = useLocalSearchParams(); // We pass courseId from CourseDetails screen
  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
  
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0]);
    }
  };

  const uploadImage = async () => {
    if (!image || !courseId) {
      Alert.alert('Error', 'Please capture a photo and select a course.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: image.uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any);

      const response = await fetch(`${API_ENDPOINTS.base}/verify_face/?course_id=${courseId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        Alert.alert('Success', data.message || 'Attendance recorded!');
      } else {
        Alert.alert('Error', data.detail || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 p-6 bg-white justify-center items-center">
      <Button title="Capture Photo" onPress={pickImage} />

      {image && (
        <Image
          source={{ uri: image.uri }}
          style={{ width: 250, height: 250, marginVertical: 20 }}
        />
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#0f0D32" />
      ) : (
        image && (
          <Button title="Verify Face & Mark Attendance" onPress={uploadImage} color="#0f0D32" />
        )
      )}
    </View>
  );
}
