import { View, Text, TextInput, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
import filter from 'lodash.filter';
import { router } from 'expo-router';
import { fetchCourses, Course } from '../../api/course';
import { AuthContext } from '../contexts/authContext'; // Adjust path if needed

const Search = () => {
  const { authToken } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await fetchCourses(authToken);
        if (response.success && response.data) {
          setCourses(response.data);
        }
      } catch (error) {
        console.error("Error loading courses:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      return courses; // If no search query, show all courses
    }
    return filter(courses, (course) =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredCourses = handleSearch();

  return (
    <View style={{ flex: 1, marginHorizontal: 20 }}>
      <TextInput 
        placeholder='Search'
        clearButtonMode='always'
        style={styles.searchBox}
        autoCapitalize='none'
        autoCorrect={false}
        value={searchQuery}
        onChangeText={(text) => setSearchQuery(text)}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#0f0D32" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredCourses}
          keyExtractor={(course) => course.id.toString()}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`../courses/${item.id}`)}
              style={{ paddingVertical: 10 }}
            >
              <Text style={styles.textName}>{item.name}</Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 20 }}>
              No course found
            </Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchBox: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 20,
  },
  textName: {
    fontSize: 18,
    marginLeft: 10,
    fontWeight: '600',
  },
});

export default Search;
