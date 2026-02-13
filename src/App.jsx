import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Mod from "./pages/Mod";

import RequireAuth from "./routes/RequireAuth";
import RequireModerator from "./routes/RequireModerator";

import MatchDetails from "./pages/MatchDetails";
import PublicMatches from "./pages/PublicMatches";
import PublicMatchDetails from "./pages/PublicMatchDetails";

import DebateDetails from "./pages/DebateDetails";
import CreateDebate from "./pages/CreateDebate";
import MatchResults from "./pages/MatchResults";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="dp-app">
      <Navbar />

      <main className="dp-main">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/public/matches" element={<PublicMatches />} />
          <Route path="/public/matches/:id" element={<PublicMatchDetails />} />
          <Route path="/debates/:id" element={<DebateDetails />} />
          <Route path="/results" element={<MatchResults />} />

          {/* Authenticated */}
          <Route element={<RequireAuth />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/matches/:id" element={<MatchDetails />} />
            <Route path="/debates/new" element={<CreateDebate />} />
          </Route>

          {/* Moderator only */}
          <Route element={<RequireModerator />}>
            <Route path="/mod" element={<Mod />} />
          </Route>
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
