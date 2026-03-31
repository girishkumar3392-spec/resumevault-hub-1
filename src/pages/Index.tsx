import { Navigate } from "react-router-dom";
import { isLoggedIn, initDefaults } from "@/lib/store";

const Index = () => {
  initDefaults();
  return isLoggedIn() ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />;
};

export default Index;
