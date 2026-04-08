import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import React, { useContext } from 'react'
import { AuthContext } from '../contexts/authContext'
import { useRouter } from 'expo-router'

const Profile = () => {
  const { user, signOut } = useContext(AuthContext);
  const router = useRouter();

  const handleLogout = () => {
    signOut();
    router.replace('/login');
  }

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="p-6 bg-white rounded-lg shadow-md m-4">
        <Text className="text-2xl font-bold text-center text-blue-500 mb-6">Profile Information</Text>
        
        {user ? (
          <View className="space-y-4">
            <View className="bg-gray-50 p-4 rounded-md">
              <Text className="text-gray-500 text-sm">Username</Text>
              <Text className="text-lg font-semibold">{user.username}</Text>
            </View>
            
            {user.email && (
              <View className="bg-gray-50 p-4 rounded-md">
                <Text className="text-gray-500 text-sm">Email</Text>
                <Text className="text-lg font-semibold">{user.email}</Text>
              </View>
            )}
            
            {user.full_name && (
              <View className="bg-gray-50 p-4 rounded-md">
                <Text className="text-gray-500 text-sm">Full Name</Text>
                <Text className="text-lg font-semibold">{user.full_name}</Text>
              </View>
            )}
          </View>
        ) : (
          <View className="items-center justify-center py-4">
            <Text className="text-lg text-gray-500">Not logged in</Text>
          </View>
        )}
        
        <TouchableOpacity 
          className="mt-8 bg-red-500 py-3 px-6 rounded-lg items-center"
          onPress={handleLogout}
        >
          <Text className="text-white font-semibold text-lg">Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

export default Profile