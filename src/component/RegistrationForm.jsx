/** @jsxRuntime classic */
/** @jsx React.createElement */

import { Alert, Box, Button, MenuItem, Select, TextField, Typography } from "@mui/material";
import {
    createUserWithEmailAndPassword
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import  React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";

const RegistrationForm = () => {
  const [name, setName] = useState("userBond");
  const [email, setEmail] = useState("Bond@example");
  const [password, setPassword] = useState("12345");
  const [role, setRole] = useState("citizen");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store user role in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        role,
      });

      console.log("Registration successful:", user);
      navigate("/login"); // Redirect to login after registration
    } catch (error) {
      setError("Registration failed. Please try again.");
      console.error("Registration failed:", error);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 400, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Register
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <Select
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          fullWidth
          margin="normal"
          required
        >
          <MenuItem value="citizen">Citizen</MenuItem>
          <MenuItem value="staff">Staff</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
        </Select>
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Register
        </Button>
      </form>
    </Box>
  );
};

export default RegistrationForm;