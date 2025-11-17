import { createBrowserRouter } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import TestStrategy from "./pages/TestStrategy";
import Results from "./pages/Results";
import AppLayout from "./layout/AppLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/app",
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "test", element: <TestStrategy /> },
      { path: "results", element: <Results /> }
    ],
  },
]);

export default router;