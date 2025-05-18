
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/lib/axiosInstance';


const initialState = {
  user: null,
  token: null, 
  isAuthenticated: false,
  isLoading: true, 
  error: null,
};


export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
      }
      dispatch(setToken(response.data.token)); 
      await dispatch(fetchUser()); 
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Registration failed');
    }
  }
);


export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
      }
      dispatch(setToken(response.data.token)); 
      await dispatch(fetchUser()); 
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
    }
  }
);


export const fetchUser = createAsyncThunk(
  'auth/fetchUser',
  async (_, { getState, rejectWithValue }) => {
    const token = (getState()).auth.token;
    if (!token) {
      return rejectWithValue('No token found for fetchUser');
    }
    try {
      const response = await axiosInstance.get('/users/me');
      return response.data;
    } catch (error) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user data');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      if (typeof window !== 'undefined') {
        if (action.payload) {
          localStorage.setItem('token', action.payload);
        } else {
          localStorage.removeItem('token');
        }
      }
    },
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false; 
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    initialAuthDone: (state) => { 
      state.isLoading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true; 
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false; 
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false; 
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true; 
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.isLoading = false; 
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false; 
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }
      })
      .addCase(fetchUser.pending, (state) => {
        state.isLoading = true; 
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null; 
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      });
  },
});

export const { logoutUser, setToken, clearError, initialAuthDone } = authSlice.actions;
export default authSlice.reducer;
