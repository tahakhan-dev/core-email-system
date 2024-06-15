import { Navigate, useNavigate } from "react-router-dom";
import React from "react";

interface WithAuthProps {
  children?: React.ReactNode; // If your components expect children or any other standard React props, declare them here
}

function withAuth<P extends WithAuthProps>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function AuthenticatedComponent(props: P) {
    const navigate = useNavigate();
    const isAuthenticated = localStorage.getItem("authToken");

    React.useEffect(() => {
      if (!isAuthenticated) {
        navigate("/login");
      }
    }, [isAuthenticated, navigate]);

    // Render the component or navigate to the login page
    return isAuthenticated ? (
      <Component {...props} />
    ) : (
      <Navigate to="/login" replace />
    );
  };
}

export default withAuth;
