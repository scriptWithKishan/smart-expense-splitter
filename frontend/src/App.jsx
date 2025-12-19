import { Routes, Route, useLocation } from "react-router"
import Home from "./components/Home"
import Login from "./components/Auth/Login"
import Register from "./components/Auth/Register"
import { Navbar } from "./components/navbar"
import { Toaster } from "sonner";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./components/Groups/Dashboard"
import GroupDetails from "./components/Groups/GroupDetails"

function App() {
  const location = useLocation();
  const hideNavbar = ["/login", "/register"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 text-black font-mono">
      {!hideNavbar && <Navbar />}
      <Toaster />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/groups/:id" element={<GroupDetails />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
