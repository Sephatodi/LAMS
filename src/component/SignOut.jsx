/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

import { signOut } from "firebase/auth";
import { auth } from "./firebase";

const SignOut = () => {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("User signed out");
      // Redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <button onClick={handleSignOut}>Sign Out</button>
  );
};

export default SignOut;