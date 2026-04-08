import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import ProtectedRoute from '../components/ProtectedRoute';
import { fetchCourses, Course } from '../../api/course'; // Use your real API function
import { AuthContext } from '../contexts/authContext'; // Adjust path if needed

export default function Courses() {
  const { authToken } = useContext(AuthContext);
  const [courseList, setCourseList] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await fetchCourses(authToken);
        if (response.success && response.data) {
          setCourseList(response.data);
        }
      } catch (error) {
        console.error('Error loading courses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const handleCoursePress = (courseId: string) => {
    router.push(`/courses/${courseId}`);
  };

  const renderCourseCard = ({ item }: { item: Course }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => handleCoursePress(item.id)}
    >
      <Text style={styles.courseName}>{item.name}</Text>
      {/* You can show instructor if you have it in your backend */}
      {/* <Text style={styles.instructor}>Instructor: {item.instructor}</Text> */}
      <Text style={styles.description}>{item.description || 'No description available'}</Text>
    </TouchableOpacity>
  );

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        <Text style={styles.header}>My Courses</Text>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <FlatList
            data={courseList}
            renderItem={renderCourseCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333'
  },
  listContainer: {
    padding: 8
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50'
  },
  instructor: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8
  },
  description: {
    fontSize: 14,
    color: '#34495e',
    lineHeight: 20
  }
});
