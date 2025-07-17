/** @jsxRuntime classic */
/** @jsx React.createElement */

import { Alert, Box, CircularProgress } from '@mui/material';
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from 'react';
import { Navigate } from "react-router-dom";
import { auth, db } from "./firebase";

const ProtectedRoute = ({ allowedRoles, children, guestMode = false }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true);
        if (firebaseUser) {
          // Fetch user role from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              ...userData
            });
            setUserRole(userData.role);
          } else {
            setError("User data not found");
            await auth.signOut();
          }
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Handle guest mode
  if (guestMode) {
    return (
      <>
        <Alert severity="info" sx={{ mb: 2 }}>
          You are viewing in guest mode. Changes will not be saved.
        </Alert>
        {children}
      </>
    );
  }

  // Redirect unauthenticated users
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Render the protected content
  return children;
};

export default ProtectedRoute;