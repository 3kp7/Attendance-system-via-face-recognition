import React, { useState, useContext } from 'react';
import { View, Text, Button, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../contexts/authContext';
import { useLocalSearchParams } from 'expo-router';
import { markAttendance } from '../../api/attendance';

export default function AttendanceScreen() {
  const { authToken } = useContext(AuthContext);
  const { courseId } = useLocalSearchParams(); // We pass courseId from CourseDetails screen
  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const pickImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
  
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0]);
      setMessage('');
    }
  };

  const uploadImage = async () => {
    if (!image || !courseId) {
      Alert.alert('Error', 'Please capture a photo and select a course.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const result = await markAttendance(authToken, String(courseId), image.uri);

      if (result.success) {
        const msg = result.data?.message || 'Attendance recorded!';
        setMessage(msg);
        setMessageType('success');
        setImage(null);
      } else {
        setMessage(result.error || 'Failed to mark attendance');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage('Something went wrong');
      setMessageType('error');
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

      {message && (
        <Text
          style={{
            marginTop: 20,
            fontSize: 16,
            fontWeight: 'bold',
            color: messageType === 'success' ? '#22c55e' : '#ef4444',
            textAlign: 'center',
          }}
        >
          {message}
        </Text>
      )}
    </View>
  );
}
