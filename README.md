# Anywhere: WireGuard VPN Server & n8n API Server Setup Guide

This guide provides an **error-proof and simplified walkthrough** to set up a **WireGuard VPN server** along with an **API server powered by n8n workflows**, using a **single automated script**.

---

## 📌 Prerequisites

This setup has been **tested on Ubuntu Server** and is guaranteed to work on it.

Before proceeding:
- Create an **Ubuntu Server VM** on any cloud provider.
- Ensure the firewall allows the following ports:
  - **80** (HTTP)
  - **443** (HTTPS)
  - **51820** (WireGuard UDP)

---

## 📌 Recommended Hardware Specifications

| Resource | Minimum Requirement |
|--------|---------------------|
| CPU    | 4 vCPU (4 cores)    |
| Memory | 4 GB RAM            |
| Storage| 10 GB               |

> **Note:**  
> The setup script installs Docker and runs multiple services.  
> **At least 4 GB RAM is mandatory** for stable and better performance.

---

## 📌 Script Execution

Run the following command to **install and configure the WireGuard VPN server and API server automatically**.

⚠️ Make sure:
- You are logged in as a **root user**, or
- You are using a **sudo-enabled user**

### Run the setup script
```bash
curl -O https://raw.githubusercontent.com/Er-Ragul/Anywhere/refs/heads/server/anywhere-setup.sh
chmod +x anywhere-setup.sh
sudo ./anywhere-setup.sh
```

> **The script will:**
> Install Docker and required dependencies
> Configure WireGuard
> Set up the n8n-based API server
> Start all required services automatically

> 🔄 **Next Update**
> In the upcoming release:
> The setup process will be optimized to consume fewer system resources
> Improved performance on lower-spec servers