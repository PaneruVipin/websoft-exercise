
import axiosInstance from '@/lib/axiosInstance';

export const searchUsers = async (query) => {
  if (!query.trim()) {
    return { page: 1, limit: 0, total: 0, totalPages: 1, users: [] };
  }
  try {
    console.log('CLIENT-SIDE: searchUsers executing with query:', query);
    const response = await axiosInstance.get(`/users/me/contacts?q=${encodeURIComponent(query)}`);
    console.log('CLIENT-SIDE: searchUsers successful. Status:', response.status, 'Found users:', response.data.users.length);
    return response.data;
  } catch (error) {
    console.error('CLIENT-SIDE ERROR: Failed to search users with query:', query);
     if (error.isAxiosError) {
      console.error('Axios Error Message:', error.message);
      if (error.response) {
        console.error('Axios Error Response Status:', error.response.status);
        console.error('Axios Error Response Data:', error.response.data);
        console.error('Request URL that failed:', error.config?.url);
      } else if (error.request) {
        console.error('Axios Error Request (no response received):', error.request);
      }
    } else {
      console.error('Non-Axios Error:', error);
    }
    throw error;
  }
};
