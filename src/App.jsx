import { Route, Routes } from "react-router-dom";
import "./App.css";
import { useState } from "react";

import Navbar from "./Component/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Mod from "./pages/Mod";

function App() {
  const [user, setUser] = useState(null);
  return (
    <>
      <Navbar user={user} />

      <main className="container py-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mod" element={<Mod />} />
        </Routes>

        {/* SOLO PER TEST, poi lo togliamo */}
        <div className="mt-4">
          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => setUser({ username: "Mario", roles: ["User"] })}>
            Fake login
          </button>

          <button className="btn btn-sm btn-outline-success me-2" onClick={() => setUser({ username: "Mod", roles: ["Moderator"] })}>
            Fake moderator
          </button>

          <button className="btn btn-sm btn-outline-secondary" onClick={() => setUser(null)}>
            Logout
          </button>
        </div>
      </main>
    </>
  );
}

export default App;
