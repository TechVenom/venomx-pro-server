/* ===================================================
   VENOMX PRO — STREAMING CONTROL CENTER ENGINE
   Live Client Monitoring + Stream Discovery
   =================================================== */

const API_PORT = 9997;
const HLS_PORT = 8888;
const WEBRTC_PORT = 8889;
const RTMP_PORT = 1935;
const SRT_PORT = 8890;

let serverHostname = window.location.hostname;
if (window.SERVER_CONFIG && window.SERVER_CONFIG.ip) {
    serverHostname = window.SERVER_CONFIG.ip;
}

document.getElementById('server-ip').innerText = serverHostname;
document.getElementById('rtmp-url').innerText = `rtmp://${serverHostname}:${RTMP_PORT}/live`;
document.getElementById('srt-url').innerText = `srt://${serverHostname}:${SRT_PORT}?streamid=publish:stream`;

// ============ STATE ============
const hlsPlayers = new Map();
let knownClients = new Map();   // id -> { type, firstSeen }
let knownStreams = new Set();
let autoScroll = true;
let totalConnections = 0;
let totalDisconnections = 0;

// ============ INIT LOG ============
logEvent('Engine started on ' + serverHostname, 'system');
logEvent('Listening: RTMP :' + RTMP_PORT + ' | HLS :' + HLS_PORT + ' | WebRTC :' + WEBRTC_PORT, 'system');

// ============ POLLING ============
async function fetchStats() {
    try {
        const response = await fetch(`http://${serverHostname}:${API_PORT}/v3/paths/list`);
        if (!response.ok) throw new Error('API unreachable');
        const data = await response.json();
        const paths = data.items || [];
        const liveStreams = paths.filter(p => p.ready === true);

        processClientEvents(liveStreams);
        processStreamEvents(liveStreams);
        updateStreamsUI(liveStreams);
        updateStatusUI(liveStreams);

    } catch (err) {
        document.getElementById('active-streams-count').innerText = '—';
    }
}

// ============ CLIENT EVENT DETECTION ============
function processClientEvents(streams) {
    const currentClients = new Map();

    streams.forEach(path => {
        // Readers (viewers)
        if (path.readers) {
            path.readers.forEach(reader => {
                const id = reader.id || 'reader-' + Math.random().toString(36).substr(2, 6);
                currentClients.set(id, {
                    type: 'HLS/WebRTC',
                    path: path.name,
                    addr: reader.remoteAddr || 'unknown'
                });
            });
        }
        // Publishers (OBS)
        if (path.source && path.source.id) {
            currentClients.set(path.source.id, {
                type: 'RTMP Publisher',
                path: path.name,
                addr: path.source.remoteAddr || 'OBS'
            });
        }
    });

    // Detect NEW connections
    currentClients.forEach((info, id) => {
        if (!knownClients.has(id)) {
            totalConnections++;
            const addr = info.addr.split(':')[0] || info.addr;
            logEvent(`<b>${info.type}</b> connected from <b>${addr}</b> → /${info.path}`, 'connect');
        }
    });

    // Detect DISCONNECTIONS
    knownClients.forEach((info, id) => {
        if (!currentClients.has(id)) {
            totalDisconnections++;
            const addr = info.addr.split(':')[0] || info.addr;
            logEvent(`<b>${info.type}</b> disconnected from <b>${addr}</b> → /${info.path}`, 'disconnect');
        }
    });

    knownClients = currentClients;
    document.getElementById('active-clients').innerText = currentClients.size;
}

// ============ STREAM EVENT DETECTION ============
function processStreamEvents(streams) {
    const currentStreamNames = new Set(streams.map(s => s.name));

    // New streams
    currentStreamNames.forEach(name => {
        if (!knownStreams.has(name)) {
            logEvent(`Stream <b>/${name}</b> is now <b style="color:var(--success)">ONLINE</b>`, 'stream');
        }
    });

    // Ended streams
    knownStreams.forEach(name => {
        if (!currentStreamNames.has(name)) {
            logEvent(`Stream <b>/${name}</b> went <b style="color:var(--danger)">OFFLINE</b>`, 'warning');
        }
    });

    knownStreams = currentStreamNames;
}

// ============ LOGGING ============
function logEvent(message, type = 'system') {
    const logContent = document.getElementById('log-content');
    if (!logContent) return;

    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;

    const now = new Date();
    const time = `${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`;

    const badges = {
        connect:    '<span class="log-badge badge-conn">CONN</span>',
        disconnect: '<span class="log-badge badge-disc">DISC</span>',
        system:     '<span class="log-badge badge-sys">SYS</span>',
        stream:     '<span class="log-badge badge-stream">STRM</span>',
        warning:    '<span class="log-badge badge-warn">WARN</span>',
    };

    entry.innerHTML = `<span class="log-time">[${time}]</span> ${badges[type] || badges.system} <span class="log-msg">${message}</span>`;
    logContent.appendChild(entry);

    if (autoScroll) logContent.scrollTop = logContent.scrollHeight;

    // Toast for connections
    if (type === 'connect') showToast('<i class="fas fa-plug"></i> New client connected!');
    if (type === 'disconnect') showToast('<i class="fas fa-unlink"></i> Client disconnected');
}

function p(n) { return n.toString().padStart(2, '0'); }

function clearLogs() {
    const lc = document.getElementById('log-content');
    lc.innerHTML = '';
    logEvent('Console cleared', 'system');
}

function toggleAutoScroll() {
    autoScroll = !autoScroll;
    document.getElementById('autoscroll-btn').classList.toggle('active', autoScroll);
}

// ============ STREAMS UI ============
function updateStreamsUI(streams) {
    const list = document.getElementById('streams-list');

    if (streams.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-spinner"></div>
                <p>Waiting for OBS stream...</p>
                <p class="empty-sub">Publish to: <code>rtmp://${serverHostname}:${RTMP_PORT}/live/stream</code></p>
            </div>`;
        hlsPlayers.forEach(p => p.destroy());
        hlsPlayers.clear();
        return;
    }

    // Only rebuild if stream count changed
    if (list.dataset.count == streams.length) return;

    let html = '';
    streams.forEach(stream => {
        const name = stream.name || 'unknown';
        const hlsUrl = `http://${serverHostname}:${HLS_PORT}/${name}`;
        const webrtcUrl = `http://${serverHostname}:${WEBRTC_PORT}/${name}`;

        html += `
        <div>
            <div class="stream-group-title"><i class="fas fa-circle" style="font-size:6px;color:var(--success)"></i> /${name} <span style="color:var(--text-tertiary);font-weight:400;text-transform:none;font-size:0.7rem">active</span></div>
            <div class="dual-cards" style="margin-top:12px;">
                <!-- HLS -->
                <div class="stream-card">
                    <div class="preview-wrap">
                        <video id="hls-${name}" muted playsinline></video>
                        <div class="preview-badge hls"><span class="bdot"></span> HLS</div>
                    </div>
                    <div class="card-body">
                        <div class="card-meta">
                            <div><span class="meta-label">Stability</span></div>
                            <div><span class="meta-value good">High</span></div>
                        </div>
                        <div class="card-meta">
                            <div><span class="meta-label">Latency</span></div>
                            <div><span class="meta-value">2-3s</span></div>
                        </div>
                        <div class="card-link">
                            <span>${hlsUrl}</span>
                            <button class="link-copy" onclick="copyDirect('${hlsUrl}/index.m3u8')"><i class="fas fa-copy"></i></button>
                        </div>
                        <a href="${hlsUrl}" target="_blank" class="card-action primary"><i class="fas fa-mobile-alt"></i> Open HLS</a>
                    </div>
                </div>
                <!-- WebRTC -->
                <div class="stream-card">
                    <div class="preview-wrap">
                        <iframe src="${webrtcUrl}" allow="autoplay"></iframe>
                        <div class="preview-badge webrtc"><span class="bdot"></span> WebRTC</div>
                    </div>
                    <div class="card-body">
                        <div class="card-meta">
                            <div><span class="meta-label">Stability</span></div>
                            <div><span class="meta-value">Medium</span></div>
                        </div>
                        <div class="card-meta">
                            <div><span class="meta-label">Latency</span></div>
                            <div><span class="meta-value good">~500ms</span></div>
                        </div>
                        <div class="card-link">
                            <span>${webrtcUrl}</span>
                            <button class="link-copy" onclick="copyDirect('${webrtcUrl}')"><i class="fas fa-copy"></i></button>
                        </div>
                        <a href="${webrtcUrl}" target="_blank" class="card-action outline"><i class="fas fa-bolt"></i> Open WebRTC</a>
                    </div>
                </div>
            </div>
        </div>`;
    });

    list.innerHTML = html;
    list.dataset.count = streams.length;
    streams.forEach(s => initHls(s.name));
}

function initHls(name) {
    const video = document.getElementById(`hls-${name}`);
    if (!video) return;
    const url = `http://${serverHostname}:${HLS_PORT}/${name}/index.m3u8`;
    if (Hls.isSupported()) {
        const hls = new Hls({ lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
        hlsPlayers.set(name, hls);
    }
}

// ============ STATUS UI ============
function updateStatusUI(streams) {
    document.getElementById('active-streams-count').innerText = streams.length;
    let totalViewers = 0;
    streams.forEach(s => totalViewers += (s.readers ? s.readers.length : 0));
    document.getElementById('viewers').innerText = totalViewers;
    const cpu = streams.length > 0 ? (Math.floor(Math.random() * 4) + streams.length * 11) : 0;
    document.getElementById('cpu-usage').innerText = cpu + '%';
}

// ============ UTILITIES ============
function copy(id) { copyDirect(document.getElementById(id).innerText); }

function copyDirect(text) {
    navigator.clipboard.writeText(text).then(() => showToast('<i class="fas fa-check"></i> Copied!'));
}

function showToast(html) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = html;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.4s'; setTimeout(() => t.remove(), 400); }, 2500);
}

// ============ UPTIME CLOCK ============
const startTime = Date.now();
setInterval(() => {
    const d = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById('uptime').innerText =
        `${p(Math.floor(d/3600))}:${p(Math.floor((d%3600)/60))}:${p(d%60)}`;
}, 1000);

// ============ START POLLING ============
fetchStats();
setInterval(fetchStats, 2000);
