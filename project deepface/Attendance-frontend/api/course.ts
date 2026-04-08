import { API_ENDPOINTS } from "@/config/api"

export interface Course {
  id: string;
  name: string;
  description?: string;
  // Add other course properties as needed
}

export interface CourseResponse {
  success: boolean;
  data?: Course[];
  error?: string;
}

export const fetchCourses = async (authToken: string): Promise<CourseResponse> => {
    try {
      console.log('Auth Token being used:', authToken);
      const headers = {
        Authorization: `Bearer ${authToken}`, // ✅ MUST include Bearer
        'Content-Type': 'application/json',
      };
      console.log('Request headers:', headers);
      
      const response = await fetch(`${API_ENDPOINTS.base}/student/course`, {
        method: 'GET',
        headers,
      });
  
      const data = await response.json();
  
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.detail || 'Failed to fetch courses' };
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      return { success: false, error: 'An error occurred while fetching courses' };
    }
    
  };
  
  