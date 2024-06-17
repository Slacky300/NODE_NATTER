import { Navigate } from "react-router-dom";
import { getLocalStorageWithExpiry } from "../helpers/auth/authFn";

export const PrivateRoutes = ({ children }) => {
    const token = getLocalStorageWithExpiry('auth')?.token;
  if (!token) {
    // user is not authenticated
    return <Navigate to="/" />;
  }
  return children;
};

export default PrivateRoutes;