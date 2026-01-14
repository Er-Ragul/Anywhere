#!/bin/bash
set -e

echo ""
echo "💻 Anywhere VPN Setup: WireGuard & API Server"
echo "👨🏻‍💻 Project By: H.Ragul"
echo ""

read -rp "Enter domain name: " DOMAIN_NAME
read -rp "Enter subdomain: " SUBDOMAIN
read -rp "Enter timezone (Eg: Asia/Kolkata): " GENERIC_TIMEZONE
read -rp "Enter email: " SSL_EMAIL
read -rp "Enter Internal IP: " INTERNAL_IP

echo "$INTERNAL_IP local.anywhere.vpn" | sudo tee -a /etc/hosts > /dev/null
BASE_DIR="$HOME/.anywhere"
export DOMAIN_NAME SUBDOMAIN GENERIC_TIMEZONE SSL_EMAIL BASE_DIR

echo ""

echo "📌 1. Checking for docker"
if systemctl is-active --quiet docker; then
  echo "✔ Docker is running"
else
  echo "⚙ Installing docker"
  sudo apt update
  sudo apt install -y ca-certificates curl acl git
  sudo install -m 0755 -d /etc/apt/keyrings
  sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  sudo chmod a+r /etc/apt/keyrings/docker.asc

  sudo tee /etc/apt/sources.list.d/docker.sources >/dev/null <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOF

  sudo apt update
  sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
  echo "✔ Docker installed successfully"
fi

echo ""

echo "📌 2. Checking for Git"
if command -v git >/dev/null 2>&1; then
  echo "✔ Git is already installed"
else
  echo "⚙ Git not found. Installing git..."
  sudo apt update
  sudo apt install -y git
  echo "✔ Git installed successfully"
fi

echo ""

echo "📌 3. Checking for ACL"
if command -v getfacl >/dev/null 2>&1; then
  echo "✔ ACL is already installed"
else
  echo "⚙ ACL not found. Installing..."
  sudo apt update
  sudo apt install -y acl
  echo "✔ ACL installed successfully"
fi

echo ""

echo "📌 4. Creating directories"
mkdir -p "$HOME/.anywhere"
cd "$HOME/.anywhere"
mkdir -p "$BASE_DIR"/{mongodb,n8n_data,local-files,traefik_data}
sudo setfacl -m u:101:rwx "$BASE_DIR/mongodb"
sudo setfacl -m u:1000:rwx "$BASE_DIR"/{n8n_data,local-files,traefik_data}
echo "✔ Directories ready"

echo ""

echo "📌 5. Build Anywhere VPN"
git clone https://github.com/Er-Ragul/Anywhere.git
cd Anywhere
git checkout server
docker build -t anywhere .
docker compose up -d

echo ""

echo "✅ Anywhere VPN setup completed successfully"