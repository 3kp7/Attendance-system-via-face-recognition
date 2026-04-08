import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AuthContext } from '../contexts/authContext';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchCourses, Course } from '../../api/course';
import { fetchAttendance, Attendance } from '../../api/attendance';

interface CourseSchedule extends Course {
  time: string;
}

interface Stats {
  todayClasses: number;
  attendanceRate: number;
}

export default function Dashboard() {
  const { user, authToken } = useContext(AuthContext); // ✅ Fixed here
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({ todayClasses: 0, attendanceRate: 0 });

  const calculateStats = (courses: Course[], attendanceRecords: Attendance[]) => {
    const todayClasses = courses.length;
    
    // Calculate attendance rate
    const totalAttendance = attendanceRecords.length;
    const presentAttendance = attendanceRecords.filter(record => record.status === 'present').length;
    const attendanceRate = totalAttendance > 0 ? (presentAttendance / totalAttendance) * 100 : 0;

    return {
      todayClasses,
      attendanceRate: Math.round(attendanceRate)
    };
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const coursesResponse = await fetchCourses(authToken);
        if (coursesResponse.success && coursesResponse.data) {
          setCourses(coursesResponse.data);
          
          // Fetch attendance for all courses
          const attendanceResponse = await fetchAttendance(authToken);
          if (attendanceResponse.success && attendanceResponse.data) {
            setAttendance(attendanceResponse.data);
          // Calculate stats
          setStats(calculateStats(coursesResponse.data, attendanceResponse.data));
          }
        } else {
          setError(coursesResponse.error || 'Failed to fetch data');
        }
      } catch (error) {
        setError('An error occurred while loading data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const todaySchedule: CourseSchedule[] = courses.map((course) => ({
    ...course,
    time: '9:00 AM', // TODO: Replace with actual course schedule time
  }));

  const hasAttendanceToday = (courseId: string) => {
    const today = new Date().toISOString().split('T')[0]; // '2025-04-26'
    return attendance.some(
      (record) =>
        record.courseId === courseId && record.date === today
    );
  };
  
  

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="flex-1 bg-gray-100 pb-32">
        {loading ? (
          <View className="flex-1 justify-center items-center p-5">
            <ActivityIndicator size="large" color="#0f0D32" />
            <Text className="mt-2 text-gray-600">Loading your dashboard...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center p-5">
            <Text className="text-red-500">{error}</Text>
            <TouchableOpacity
              className="mt-3 bg-[#0f0D32] py-2 px-4 rounded"
              onPress={() => window.location.reload()}
            >
              <Text className="text-white">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Welcome Section */}
        <View className="p-5 bg-white border-b border-gray-200">
          <Text className="text-2xl font-bold text-[#0f0D32]">Welcome, {user?.username || 'User'}!</Text>
          <Text className="text-base text-gray-600 mt-1">Your Dashboard</Text>
        </View>

        {/* Stats Section */}
        <View className="bg-white mt-5 mx-4 p-5 rounded-xl shadow">
          <Text className="text-lg font-semibold text-[#0f0D32] mb-4">Stats</Text>
          <View className="flex-row justify-around">
            <View className="bg-white p-4 rounded-lg w-5/12 items-center shadow-md">
              <Text className="text-xl font-bold text-blue-500">{stats.todayClasses}</Text>
              <Text className="text-sm text-gray-600 mt-1">Today's Classes</Text>
            </View>
            <View className="bg-white p-4 rounded-lg w-5/12 items-center shadow-md">
              <Text className="text-xl font-bold text-blue-500">{stats.attendanceRate}%</Text>
              <Text className="text-sm text-gray-600 mt-1">Attendance Rate</Text>
            </View>
          </View>
        </View>

        {/* Today's Schedule */}
        <View className="bg-white mt-5 mx-4 p-5 rounded-xl shadow">
          <Text className="text-lg font-semibold text-[#0f0D32] mb-4">Today's Schedule</Text>
          {todaySchedule.map((course: any) => (
  <TouchableOpacity
    key={course.id}
    className="bg-gray-100 p-4 rounded-lg mb-3 border border-gray-200"
    onPress={() => router.push(`/courses/${course.id}`)}
  >
    <View className="flex-row justify-between items-center">
      <View>
        <Text className="text-base font-medium text-gray-800">{course.name}</Text>
        <Text className="text-sm text-gray-500 mt-1">{course.time}</Text>
      </View>
      <View className={`px-3 py-1 rounded-full ${
        hasAttendanceToday(course.id) ? 'bg-green-400' : 'bg-yellow-400'
      }`}>
        <Text className="text-xs font-bold text-white">
          {hasAttendanceToday(course.id) ? 'Present' : 'Pending'}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
))}

        </View>

        {/* Quick Actions */}
        <View className="bg-white mt-5 mx-4 p-5 rounded-xl shadow mb-6">
          <Text className="text-lg font-semibold text-[#0f0D32] mb-4">Quick Actions</Text>
          <View className="flex-row justify-between">
            <TouchableOpacity
              className="bg-[#0f0D32] py-3 px-4 rounded-lg flex-1 mr-2 items-center"
              onPress={() => router.push('/screens/attendance')}
            >
              <Text className="text-white text-sm font-medium">Mark Attendance</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-[#0f0D32] py-3 px-4 rounded-lg flex-1 ml-2 items-center"
              onPress={() => router.push('/screens/subjects')}
            >
              <Text className="text-white text-sm font-medium">View All Courses</Text>
            </TouchableOpacity>
          </View>
        </View>

          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
