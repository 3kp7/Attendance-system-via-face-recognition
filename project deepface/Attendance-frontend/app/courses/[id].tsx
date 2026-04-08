import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchCourses, Course } from '../../api/course'; // Import your real fetchCourses function
import { AuthContext } from '../contexts/authContext';
import { useContext } from 'react';

const CourseDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { authToken } = useContext(AuthContext);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const response = await fetchCourses(authToken);
        if (response.success && response.data) {
          const found = response.data.find(c => c.id.toString() === id);
          setCourse(found || null);
        }
      } catch (error) {
        console.error('Failed to load course:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadCourse();
    }
  }, [id]);

  const handleTakeAttendance = () => {
    router.push({ pathname: '/screens/attendance', params: { courseId: course?.id } });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0f0D32" />
        <Text className="mt-4 text-gray-600">Loading course...</Text>
      </View>
    );
  }

  if (!course) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-xl font-bold text-gray-600">Course not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold text-[#0f0D32] mb-4">{course.name}</Text>

      <Text className="text-base font-semibold mt-4 text-gray-800">Instructor:</Text>
      <Text className="text-gray-600">Dr. Placeholder</Text>

      <Text className="text-base font-semibold mt-4 text-gray-800">Description:</Text>
      <Text className="text-gray-700">
        {course.description || 'No description available'}
      </Text>

      <TouchableOpacity
        onPress={handleTakeAttendance}
        className="mt-8 bg-[#0f0D32] py-3 px-6 rounded-lg items-center"
      >
        <Text className="text-white text-base font-medium">Take Attendance</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CourseDetails;
