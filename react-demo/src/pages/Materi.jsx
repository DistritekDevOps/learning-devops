const daftarMateri = [
  { topik: "Pengenalan Docker", detail: "Image, container, registry" },
  { topik: "Perintah dasar", detail: "run, ps, logs, exec" },
  { topik: "Dockerfile", detail: "Build image sendiri" },
  { topik: "Multi-stage build", detail: "Dipakai di aplikasi ini!" },
  { topik: "Volume & Network", detail: "Data persisten, antar-container" },
  { topik: "Docker Compose", detail: "Multi-container sekali jalan" },
];

export default function Materi() {
  return (
    <div className="card">
      <div className="logo">📚</div>
      <h1>Daftar Materi</h1>
      <p className="subtitle">
        Topik yang dibahas di <code>docker.md</code> pada repo ini.
      </p>
      <ul>
        {daftarMateri.map((item) => (
          <li key={item.topik}>
            <span>{item.topik}</span>
            <span>{item.detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
