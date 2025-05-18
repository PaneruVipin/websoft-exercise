
"use client";

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser, setToken, initialAuthDone } from '@/store/authSlice';


const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { 
    token: reduxToken, 
    isAuthenticated, 
    user, 
    isLoading: authSliceIsLoading 
  } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!authSliceIsLoading) {
      return;
    }

    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (storedToken) {
      if (!reduxToken) {
        dispatch(setToken(storedToken));
      }
    } else {
      if (authSliceIsLoading) { 
         dispatch(initialAuthDone());
      }
    }
  }, [dispatch, reduxToken, authSliceIsLoading]);

  useEffect(() => {
    if (reduxToken && !isAuthenticated && !user) {
      dispatch(fetchUser());
    }
  }, [reduxToken, isAuthenticated, user, dispatch]);

  return <>{children}</>;
};

export default AuthInitializer;
