import { jwtDecode } from "jwt-decode";

export const getOrgIdFromToken = () => {
  const token = localStorage.getItem("authToken");
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.orgId;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export const getUserFromToken = () => {
  const token = localStorage.getItem("authToken");
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return {
      role: decoded.role,
      orgId: decoded.orgId,
      email: decoded.email,
      fullName: decoded.fullName,
      userId: decoded.userId,
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export const getUserRoleFromToken = () => {
  const user = getUserFromToken();
  return user ? user.role : null;
};
