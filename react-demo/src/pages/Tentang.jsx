export default function Tentang() {
  return (
    <div className="card">
      <div className="logo">🐳</div>
      <h1>Tentang Aplikasi Ini</h1>
      <p className="subtitle">
        Contoh multi-stage build untuk materi dasar Docker.
      </p>
      <p>
        Image dibangun dalam dua tahap. Tahap pertama memakai{" "}
        <code>node:22-alpine</code> untuk meng-install dependensi dan
        menjalankan <code>npm run build</code>. Tahap kedua hanya menyalin hasil
        build (folder <code>dist</code>) ke <code>nginx:alpine</code>.
      </p>
      <p>
        Hasilnya: image akhir hanya berisi file statis dan Nginx — tanpa
        Node.js, tanpa <code>node_modules</code> — sehingga ukurannya puluhan
        MB, bukan ratusan.
      </p>
      <ul>
        <li>
          <span>Framework</span> <span>React 18 + React Router</span>
        </li>
        <li>
          <span>Build tool</span> <span>Vite</span>
        </li>
        <li>
          <span>Web server</span> <span>Nginx (alpine)</span>
        </li>
        <li>
          <span>Jumlah halaman</span> <span>3 (Beranda, Materi, Tentang)</span>
        </li>
      </ul>
    </div>
  );
}
