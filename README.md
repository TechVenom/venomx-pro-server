<div align="center">
  <img src="dashboard/assets/logo.webp" width="100" alt="VenomX Pro Logo" />
  <h1>🚀 VenomX Pro</h1>
  <p><strong>The ultimate local streaming backend for professional creators.</strong></p>
  
  [![GitHub License](https://img.shields.io/github/license/TechVenom/venomx-pro-server?style=flat-square&color=blue)](LICENSE)
  [![Docker](https://img.shields.io/badge/docker-running-blue.svg?style=flat-square&logo=docker)](https://www.docker.com/)
  [![Platform](https://img.shields.io/badge/platform-windows%20%7C%20linux-lightgrey?style=flat-square)](README.md)
  [![Status](https://img.shields.io/badge/status-production--ready-success?style=flat-square)](README.md)
</div>

---

## 📖 Overview

**VenomX Pro** is a high-performance, ultra-reliable local streaming engine designed to replace outdated solutions like MonaServer. Built on top of the industry-leading **MediaMTX** engine, it provides a unified hub for RTMP, SRT, HLS, and WebRTC streaming with sub-second latency.

Whether you're streaming from OBS to a private audience, monitoring live feeds on mobile, or building a custom broadcast pipeline, VenomX Pro delivers the stability and modern protocol support you need.

---

## ✨ Key Features

- **⚡ Ultra-Low Latency**: Support for **WebRTC** (~500ms) and **SRT** (~500ms) for near-instant interaction.
- **📱 Universal Compatibility**: **HLS (m3u8)** support ensures your streams play on every iPhone, Android, and Smart TV.
- **🎨 Glassmorphism Dashboard**: A modern, real-time web interface to monitor active streams, client connections, and server health.
- **🛡️ Rock-Solid Stability**: Automatic container failover and memory-optimized buffers prevent stuttering and crashes.
- **🛠️ Zero-Config Startup**: One-click batch script for Windows detects your IP and configures the environment automatically.

---

## 🏗️ Architecture

VenomX Pro orchestrates two core services in a seamless Docker environment:

1.  **Streaming Engine (MediaMTX)**: Handles high-throughput video ingestion and distribution.
2.  **Control Center (Nginx)**: Serves the modern web dashboard and provides the API bridge.

---

## 🛠️ Quick Setup (Windows)

1.  **Prerequisites**:
    *   Install **[Docker Desktop](https://www.docker.com/products/docker-desktop/)**.
    *   Ensure Docker is running before starting the server.

2.  **Launch**:
    *   Clone this repository or download the ZIP.
    *   Double-click `run_venomx_pro.bat`.

3.  **Monitor**:
    *   The script will automatically detect your local IP and open the **VenomX Pro Dashboard** in your browser at `http://[YOUR-IP]:8080`.

---

## 🎨 Recommended OBS Settings

To achieve **1080p/60fps** with the lowest possible latency, use these settings in OBS:

| Category | Setting | Recommended Value |
| :--- | :--- | :--- |
| **Output Mode** | Advanced | — |
| **Encoder** | NVIDIA NVENC H.264 | (or Apple VT / QuickSync) |
| **Rate Control** | CBR | 6000 - 8000 Kbps |
| **Keyframe Interval** | 1 s | **Crucial for WebRTC/HLS** |
| **Preset** | P1 or P4 | Low-Latency / Medium |
| **B-frames** | 0 | **Set to 0 for lowest latency** |

### Stream Settings
- **Service**: Custom
- **Server**: `rtmp://[YOUR-IP]:1935/live`
- **Stream Key**: `stream` (or any custom name)

---

## 🔌 Connection Endpoints

| Protocol | Purpose | URL Template |
| :--- | :--- | :--- |
| **RTMP** | Publish (OBS) | `rtmp://[server-ip]:1935/live` |
| **SRT** | Ultra-Low Publish | `srt://[server-ip]:8890?streamid=publish:stream` |
| **HLS** | Mobile Viewing | `http://[server-ip]:8888/live/index.m3u8` |
| **WebRTC** | Web Preview | `http://[server-ip]:8889/live` |
| **API** | Management | `http://[server-ip]:9997/v3` |

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">
  <b>VenomX Pro</b> — Stability you can trust for 24/7 streaming.
</p>