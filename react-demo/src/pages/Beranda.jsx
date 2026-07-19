import { useState } from "react";

export default function Beranda() {
  const [count, setCount] = useState(0);

  return (
    <div className="card">
      <div className="logo">⚛️</div>
      <h1>Halo dari React!</h1>
      <p className="subtitle">
        Aplikasi ini di-build dengan Vite lalu di-serve oleh Nginx — semuanya di
        dalam container lewat multi-stage build.
      </p>
      <p>
        Coba pindah halaman lewat menu di atas. Perpindahannya instan tanpa
        reload karena routing ditangani React Router di sisi browser
        (client-side routing).
      </p>
      <p>
        Tombol di bawah membuktikan JavaScript-nya hidup — bukan sekadar HTML
        statis:
      </p>
      <button className="counter-btn" onClick={() => setCount(count + 1)}>
        Sudah diklik {count} kali
      </button>
    </div>
  );
}
