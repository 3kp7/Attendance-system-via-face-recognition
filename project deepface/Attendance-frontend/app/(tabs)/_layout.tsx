import { Image } from 'react-native';
import React, { useContext } from 'react';
import { Tabs } from 'expo-router';
import { AuthContext } from '../contexts/authContext';

// Import images
const dashboardImg = require('../../assets/images/home.png');
const searchImg = require('../../assets/images/search.png');
const profileImg = require('../../assets/images/profile.png');

const TabsLayout = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#0f0D32',
          borderRadius: 0,
          height: 52,
          borderWidth: 1,
          borderColor: '#0f0d23',
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}
    >
      
      <Tabs.Screen
        name="index"
        options={{
          headerShown: true,
          title: "Dashboard",
          tabBarIcon: ({focused}) => (
            <Image 
              source={dashboardImg} 
              tintColor={focused ? "white" : "gray"}
              style={{
                transform: [{ scale: 0.075 }],
                marginTop: 12
              }}
            />
          )
        }}
      />
      <Tabs.Screen
        name="Search"
        options={{
          headerShown: true,
          title: "Search",
          tabBarIcon: ({focused}) => (
            <Image 
              source={searchImg}
              tintColor={focused ? "white" : "gray"}
              style={{
                transform: [{ scale: 0.075 }],
                marginTop: 10
              }}
            />
          )
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          headerShown: true,
          title: "Profile",
          tabBarIcon: ({focused}) => (
            <Image 
              source={profileImg}
              tintColor={focused ? "white" : "gray"}
              style={{
                transform: [{ scale: 0.075 }],
                marginTop: 10
              }}
            />
          )
        }}
      />
      
      
    </Tabs>
  );
};

export default TabsLayout;
