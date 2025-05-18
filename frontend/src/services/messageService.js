
import axiosInstance from '@/lib/axiosInstance';

export const fetchMessageThreads = async () => {
  try {
    console.log('CLIENT-SIDE: fetchMessageThreads executing.');
    const response = await axiosInstance.get('/messages/thread/me');
    console.log('CLIENT-SIDE: fetchMessageThreads successful. Status:', response.status, 'Found threads:', response.data.threads.length);
    return response.data;
  } catch (error) {
    console.error('CLIENT-SIDE ERROR: Failed to fetch message threads.');
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

export const fetchMessagesForThread = async (
  userId, 
  page = 1, 
  limit = 30
) => {
  try {
    console.log(`CLIENT-SIDE: fetchMessagesForThread executing for userId: ${userId}, page: ${page}, limit: ${limit}`);
    const response = await axiosInstance.get(`/messages/thread/${userId}/me`, {
      params: { page, limit },
    });
    console.log(`CLIENT-SIDE: fetchMessagesForThread successful for userId: ${userId}. Status:`, response.status, 'Received messages:', response.data.messages.length);
    return response.data;
  } catch (error) {
    console.error(`CLIENT-SIDE ERROR: Failed to fetch messages for thread with user ID: ${userId}.`);
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

export const markThreadAsRead = async (fromUserId) => {
  try {
    console.log(`CLIENT-SIDE: markThreadAsRead executing for fromUserId: ${fromUserId}`);
    await axiosInstance.post('/messages/thread/mark-as-read', { fromUserId });
    console.log(`CLIENT-SIDE: markThreadAsRead successful for fromUserId: ${fromUserId}.`);
  } catch (error) {
    console.error(`CLIENT-SIDE ERROR: Failed to mark thread as read for fromUserId: ${fromUserId}.`);
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
