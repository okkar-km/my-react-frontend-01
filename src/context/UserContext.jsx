import { createContext, useEffect, useRef, useState } from "react";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const isInit = useRef(false);

  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginErrorMsg, setLoginErrorMsg] = useState("");
  const [isLogInError, setIsLoginError] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const me = async () => {
    try {
      const result = await fetch("/api/me", {
        method: "GET",
        credentials: "include",
      });

      if (result.ok) {
        const data = await result.json();

        console.log("==>user data: ", data);

        setUser(data.user);
        setIsLoggedIn(true);
        return true;
      } else {
        setUser(null);
        setIsLoggedIn(false);
        return false;
      }
    } catch (error) {
      console.error("==>ME error: ", error);

      setUser(null);
      setIsLoggedIn(false);
      return false;
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (isInit.current) return;

    isInit.current = true;
    me();
  }, []);

  const login = async (email, password) => {
    const body = {
      email: email,
      password: password,
    };

    console.log("==>Login body: ", body);

    setIsLoginError(false);
    setLoginErrorMsg("");

    try {
      const result = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (result.ok) {
        const data = await result.json();

        console.log("==>Login successful: ", data);

        // Verify the session by fetching the current user
        const meOk = await me();

        if (!meOk) {
          setIsLoginError(true);
          setLoginErrorMsg("Login succeeded but could not verify session.");
          return false;
        }

        return true;
      } else {
        const errData = await result.json();

        console.log("==>Login failed: ", errData.message);

        setUser(null);
        setIsLoggedIn(false);
        setIsLoginError(true);
        setLoginErrorMsg(errData.message || "Login failed");

        return false;
      }
    } catch (error) {
      console.error("==>Login error: ", error);

      setUser(null);
      setIsLoggedIn(false);
      setIsLoginError(true);
      setLoginErrorMsg("Cannot connect to backend");

      return false;
    }
  };

  const logout = async () => {
    try {
      const result = await fetch("/api/auth/logout", {
        method: "GET",
        credentials: "include",
      });

      if (result.ok) {
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("==>Logout error: ", error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        isLoggedIn,
        isLogInError,
        loginErrorMsg,
        isInitializing,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
