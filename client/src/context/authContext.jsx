import { createContext, useContext, useEffect, useState } from "react";
import { getLocalStorageWithExpiry } from "../helpers/auth/authFn";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    token: ""
  });

  const [hasEnteredPassword, setHasEnteredPassword] = useState(false);

  useEffect(() => {
    const data = getLocalStorageWithExpiry("auth");

    if (data) {
       
        setAuth(prevAuth => ({
            ...prevAuth,
            user: data.user,
            token: data.token
        }));


    }
}, []);



  return (
    <AuthContext.Provider value={{ auth, setAuth, hasEnteredPassword, setHasEnteredPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { useAuth, AuthProvider };
