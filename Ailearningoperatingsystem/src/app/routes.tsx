import { createBrowserRouter, Navigate } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { StudentDashboard } from "./pages/StudentDashboard";
import { ConceptLearning } from "./pages/ConceptLearning";
import { LearningMemory } from "./pages/LearningMemory";
import { LandingPage } from "./pages/LandingPage";
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
import { SubscriptionUsage } from "../pages/SubscriptionUsage";
import { Settings } from "../pages/Settings";
import { DataPrivacyCenter } from "../pages/DataPrivacyCenter";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/signup",
    Component: Signup,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/student-dashboard",
    element: (
      <ProtectedRoute>
        <StudentDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/concept/:conceptId",
    element: (
      <ProtectedRoute>
        <ConceptLearning />
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
  {
    path: "/learning-memory",
    element: (
      <ProtectedRoute>
        <LearningMemory />
      </ProtectedRoute>
    ),
  },
  {
    path: "/subscription",
    element: (
      <ProtectedRoute>
        <SubscriptionUsage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },
  {
    path: "/data-privacy",
    element: (
      <ProtectedRoute>
        <DataPrivacyCenter />
      </ProtectedRoute>
    ),
  },
]);
