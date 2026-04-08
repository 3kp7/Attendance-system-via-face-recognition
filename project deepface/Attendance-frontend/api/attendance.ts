import { API_ENDPOINTS } from "@/config/api";

export interface AttendanceResponse {
  success: boolean;
  data?: { message: string };
  error?: string;
}

export const fetchAttendance = async (
  authToken: string,
  courseId?: string
): Promise<AttendanceResponse> => {
  try {
    const url = courseId
      ? `${API_ENDPOINTS.base}/student/attendance/${courseId}`
      : `${API_ENDPOINTS.base}/student/attendance`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: 'application/json',
      },
    });

    const text = await response.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      console.warn("Non-JSON response:", text);
    }

    if (response.ok) {
      return { success: true, data };
    } else {
      return {
        success: false,
        error: data?.detail || 'Failed to fetch attendance',
      };
    }
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return {
      success: false,
      error: 'An error occurred while fetching attendance',
    };
  }
};

/**
 * Verify face using base64-encoded image and record attendance
 */
export const markAttendance = async (
  authToken: string,
  courseId: string,
  imageUri: string
): Promise<AttendanceResponse> => {
  try {
    // Fetch and convert image to base64
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = (reader.result as string).split(',')[1] || reader.result;
          
          const apiResponse = await fetch(
            `${API_ENDPOINTS.base}/verify_face_base64/`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                course_id: parseInt(courseId),
                image_base64: base64String,
              }),
            }
          );

          const data = await apiResponse.json();

          if (apiResponse.ok) {
            resolve({ success: true, data });
          } else {
            resolve({
              success: false,
              error: data.detail || 'Failed to verify face',
            });
          }
        } catch (error) {
          console.error('Error sending verification request:', error);
          resolve({
            success: false,
            error: 'Network error during face verification',
          });
        }
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    return {
      success: false,
      error: 'Failed to process image',
    };
  }
};
