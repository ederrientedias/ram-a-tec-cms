import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  return (
    <>
      <AuthenticatedTemplate>{children ? children : <Outlet />}</AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <Navigate to="/" replace state={{ from: location }} />
      </UnauthenticatedTemplate>
    </>
  );
};
