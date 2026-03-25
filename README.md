# 🚀 VenomX Pro Streaming Server

A production-ready, ultra-reliable local streaming backend. Designed to replace MonaServer with better stability, lower latency, and modern protocol support (RTMP, SRT, HLS, WebRTC).

---

## 🏗️ Architecture
- **Engine**: [MediaMTX](https://github.com/bluenviron/mediamtx) (Single-binary Go server)
- **Protocols**: RTMP / SRT / HLS (m3u8) / WebRTC / RTMPS
- **Dashboard**: High-performance Nginx with a modern Glassmorphism UI
- **Latency**: WebRTC (500ms), SRT (500ms), Low-Latency HLS (2-3s)

---

## 🛠️ Quick Setup (Windows)

1. **Prerequisites**: Make sure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
2. **Launch**:
   ```bash
   cd venomx-pro-server
   docker-compose up -d
   ```
3. **Open Dashboard**: Go to `http://localhost:8080` or `http://[your-ip]:8080` in your browser.

---

## 🎨 Recommended OBS Settings

To achieve the best balance of **1080p/60fps quality** and **low latency**, use these settings in OBS:

### Output (Advanced Mode)
- **Encoder**: NVIDIA NVENC H.264 (or Apple VT H264 / QuickSync)
- **Rate Control**: CBR (Constant Bitrate)
- **Bitrate**: 6000 Kbps - 8000 Kbps (for 1080p60)
- **Keyframe Interval**: **1 s or 2 s** (CRITICAL for HLS and WebRTC)
- **Preset**: P1: Fastest (Low Latency) or P4: Medium (Higher Quality)
- **Tuning**: Low-Latency
- **B-frames**: 0 (Set this to 0 for the lowest possible latency)

### Stream Settings
- **Service**: Custom
- **Server**: `rtmp://[YOUR-IP]:1935/live`
- **Stream Key**: `stream`

---

## 📱 Mobile Viewing (Phones/Tablets)

1. Open the dashboard on your phone: `http://[YOUR-IP]:8080`
2. You will see active streams listed.
3. **HLS Link**: Tap "Watch HLS" for compatibility with all players (2-3s latency).
4. **WebRTC**: Tap "Ultra-Low Latency" for nearly instant video (500ms latency).

---

## 🛡️ Reliability Features
- **Auto-Restart**: Containers are set to `restart: unless-stopped`.
- **Health Checks**: MediaMTX is monitored every 10s; Docker will restart it if the API becomes unresponsive.
- **Buffers**: Memory-optimized buffer settings (2MB/stream) to prevent stuttering on LAN.
- **No MonaServer Flaws**: Unlike MonaServer which can crash with malformed RTMP packets, MediaMTX handles disconnects and reconnects gracefully.

---

## 📁 Connection Endpoints

| Protocol | Purpose | URL Template |
| :--- | :--- | :--- |
| **RTMP** | Publish (OBS) | `rtmp://[server-ip]:1935/live` |
| **SRT** | Ultra-Low Latency Publish | `srt://[server-ip]:8890?streamid=publish:stream` |
| **HLS** | Mobile Viewers | `http://[server-ip]:8888/live/index.m3u8` |
| **WebRTC** | Web Preview (Ultra-Low) | `http://[server-ip]:8889/live` |
| **API** | Management/Bots | `http://[server-ip]:9997/v3` |

---
**VenomX Pro** - Stability you can trust for 24/7 streaming.
