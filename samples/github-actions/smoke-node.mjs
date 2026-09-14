// Jalankan dari root repo: node samples/github-actions/smoke-node.mjs
// Tidak memasang dependency. Proses server selalu dihentikan sesudah tes.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';

// OS memilih port bebas agar tes tidak berbenturan dengan aplikasi lokal.
const server = spawn(process.execPath, ['-e', `
  const http = require('node:http');
  const listen = http.Server.prototype.listen;
  http.Server.prototype.listen = function (...args) {
    this.once('listening', () => console.log('TEST_PORT=' + this.address().port));
    return listen.apply(this, args);
  };
  require('./node-demo/server.js');
`], { env: { ...process.env, PORT: '0' }, stdio: ['ignore', 'pipe', 'pipe'] });
let output = '';
let spawnError;
server.on('error', (err) => { spawnError = err; });
server.stdout.on('data', (data) => { output += data; });
server.stderr.on('data', (data) => { output += data; });
try {
  let port;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (spawnError) throw spawnError;
    assert.equal(server.exitCode, null, `Server berhenti: ${output}`);
    port = output.match(/TEST_PORT=(\d+)/)?.[1];
    if (port) break;
    await delay(100);
  }
  assert.ok(port, `Server belum siap dalam 10 detik: ${output}`);
  const base = `http://127.0.0.1:${port}`;
  const get = (path) => fetch(base + path, { signal: AbortSignal.timeout(3000) });
  const health = await get('/health');
  assert.equal(health.status, 200);
  assert.equal((await health.json()).status, 'ok');
  const info = await get('/api/info');
  assert.equal(info.status, 200);
  const body = await info.json();
  assert.match(body.nodeVersion, /^v\d+\./);
  assert.ok(body.hostname);
  assert.equal(typeof body.uptimeSeconds, 'number');
  assert.equal((await get('/tidak-ada')).status, 404);
  console.log('PASS: health 200, API valid, route tidak dikenal 404');
} finally {
  if (server.pid && server.exitCode === null && server.signalCode === null) {
    const exited = once(server, 'exit');
    server.kill('SIGTERM');
    const timeout = setTimeout(() => server.kill('SIGKILL'), 3000);
    try { await exited; } finally { clearTimeout(timeout); }
  }
  if (process.exitCode) console.error(output);
}
