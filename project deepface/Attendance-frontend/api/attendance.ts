import { API_ENDPOINTS } from "@/config/api"

export interface Attendance {
  id: string;
  courseId: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent';
  // Add other attendance properties as needed
}

export interface AttendanceResponse {
  success: boolean;
  data?: Attendance[];
  error?: string;
}

export const fetchAttendance = async (authToken: string, courseId?: string): Promise<AttendanceResponse> => {
  try {
    const url = courseId 
      ? `${API_ENDPOINTS.base}/student/attendance/${courseId}`
      : `${API_ENDPOINTS.base}/student/attendance`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.detail || 'Failed to fetch attendance' };
    }
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return { success: false, error: 'An error occurred while fetching attendance' };
  }
};

export const markAttendance = async (
  authToken: string,
  courseId: string,
  imageData: string
): Promise<AttendanceResponse> => {
  try {
    const response = await fetch(`${API_ENDPOINTS.base}/student/attendance/${courseId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image_data: imageData }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.detail || 'Failed to mark attendance' };
    }
  } catch (error) {
    console.error('Error marking attendance:', error);
    return { success: false, error: 'An error occurred while marking attendance' };
  }
};