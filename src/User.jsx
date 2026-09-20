// src/User.jsx

import { useEffect, useRef, useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

export default function User() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [openDialog, setOpenDialog] = useState(false);

  const newUsername = useRef(null);
  const newEmail = useRef(null);
  const newFirstname = useRef(null);
  const newLastname = useRef(null);
  const newPassword = useRef(null);

  useEffect(() => {
    getUsers();
  }, []);

  async function getUsers() {
    const result = await fetch("/api/user", {
      credentials: "include",
    });

    const data = await result.json();

    if (result.ok) {
      setUsers(data.users || []);
    } else {
      alert(data.message);
    }
  }

  async function changePassword() {
    if (!selectedUser) {
      alert("Please select a user");
      return;
    }

    if (!password || !confirmPassword) {
      alert("Please enter the password");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    const result = await fetch("/api/user/password", {
      method: "PUT",

      credentials: "include",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        userId: selectedUser,
        password: password,
      }),
    });

    const data = await result.json();

    if (result.ok) {
      alert("Password changed successfully");

      setSelectedUser("");
      setPassword("");
      setConfirmPassword("");
    } else {
      alert(data.message);
    }
  }

  const closeDialog = () => {
    if (newUsername.current) newUsername.current.value = "";
    if (newEmail.current) newEmail.current.value = "";
    if (newFirstname.current) newFirstname.current.value = "";
    if (newLastname.current) newLastname.current.value = "";
    if (newPassword.current) newPassword.current.value = "";

    setOpenDialog(false);
  };

  const onAddUser = async () => {
    const username = newUsername.current?.value?.trim();
    const email = newEmail.current?.value?.trim();
    const firstname = newFirstname.current?.value?.trim();
    const lastname = newLastname.current?.value?.trim();
    const password = newPassword.current?.value;

    if (!username || !email || !password) {
      alert("Username, email, and password are required");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    const result = await fetch("/api/user", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        firstname,
        lastname,
        password,
      }),
    });

    const data = await result.json();

    if (result.ok) {
      alert("User created successfully");
      closeDialog();
      await getUsers();
    } else {
      alert(data.message || data.errorMsg || "Failed to create user");
    }
  };

  if (!users) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ maxWidth: 500 }}>
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h4">User Management</Typography>

        <Button
          variant="contained"
          onClick={() => {
            setOpenDialog(true);
          }}
        >
          Add User
        </Button>
      </div>

      <TextField
        select
        fullWidth
        label="Select User"
        value={selectedUser}
        onChange={(event) => {
          setSelectedUser(event.target.value);
        }}
        sx={{ mb: 2 }}
      >
        {users.map((user) => (
          <MenuItem key={user._id} value={user._id}>
            {user.username} - {user.email}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        fullWidth
        type="password"
        label="New Password"
        value={password}
        onChange={(event) => {
          setPassword(event.target.value);
        }}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        type="password"
        label="Confirm Password"
        value={confirmPassword}
        onChange={(event) => {
          setConfirmPassword(event.target.value);
        }}
        sx={{ mb: 2 }}
      />

      <Button variant="contained" onClick={changePassword}>
        Change Password
      </Button>

      <Dialog open={openDialog} onClose={closeDialog} fullWidth>
        <DialogTitle>Add New User</DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter the details for the new user.
          </DialogContentText>

          <div className="flex flex-col gap-2">
            <TextField
              required
              inputRef={newUsername}
              label="Username"
              fullWidth
            />

            <TextField
              required
              inputRef={newEmail}
              label="Email"
              type="email"
              fullWidth
            />

            <TextField
              inputRef={newFirstname}
              label="First Name"
              fullWidth
            />

            <TextField
              inputRef={newLastname}
              label="Last Name"
              fullWidth
            />

            <TextField
              required
              inputRef={newPassword}
              label="Password"
              type="password"
              fullWidth
            />
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={onAddUser}>
            Create User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
