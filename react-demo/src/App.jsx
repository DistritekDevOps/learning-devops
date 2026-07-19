import { NavLink, Route, Routes } from "react-router-dom";
import Beranda from "./pages/Beranda.jsx";
import Materi from "./pages/Materi.jsx";
import Tentang from "./pages/Tentang.jsx";

export default function App() {
  return (
    <div className="layout">
      <nav className="navbar">
        <span className="brand">⚛️ React Demo</span>
        <div className="links">
          <NavLink to="/" end>Beranda</NavLink>
          <NavLink to="/materi">Materi</NavLink>
          <NavLink to="/tentang">Tentang</NavLink>
        </div>
      </nav>

      <main className="content">
        <Routes>
          <Route path="/" element={<Beranda />} />
          <Route path="/materi" element={<Materi />} />
          <Route path="/tentang" element={<Tentang />} />
        </Routes>
      </main>

      <footer className="footer">Materi Dasar Docker — Distritek DevOps</footer>
    </div>
  );
}
