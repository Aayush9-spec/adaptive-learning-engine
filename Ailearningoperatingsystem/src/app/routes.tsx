import { createBrowserRouter, Navigate } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { LearningGPS } from "./pages/LearningGPS";
import { FlowMode } from "./pages/FlowMode";
import { Analytics } from "./pages/Analytics";
import { AIExplainer } from "./pages/AIExplainer";
import { Profile } from "./pages/Profile";
import { Explore } from "./pages/Explore";
import { TutorHub } from "./pages/TutorHub";
import { Tutor } from "./pages/Tutor";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/signup",
    Component: Signup,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/explore",
    element: (
      <ProtectedRoute>
        <Explore />
      </ProtectedRoute>
    ),
  },
  {
    path: "/tutor",
    element: (
      <ProtectedRoute>
        <Tutor />
      </ProtectedRoute>
    ),
  },
  {
    path: "/tutor-hub",
    element: (
      <ProtectedRoute>
        <TutorHub />
      </ProtectedRoute>
    ),
  },
  {
    path: "/gps",
    element: (
      <ProtectedRoute>
        <LearningGPS />
      </ProtectedRoute>
    ),
  },
  {
    path: "/flow",
    element: (
      <ProtectedRoute>
        <FlowMode />
      </ProtectedRoute>
    ),
  },
  {
    path: "/analytics",
    element: (
      <ProtectedRoute>
        <Analytics />
      </ProtectedRoute>
    ),
  },
  {
    path: "/explainer",
    element: (
      <ProtectedRoute>
        <AIExplainer />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
]);
