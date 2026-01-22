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

BASE_DIR="$HOME/.anywhere"
mkdir -p "$HOME/.anywhere"
ENV_FILE="$BASE_DIR/.env"

cat > "$ENV_FILE" <<EOF
DOMAIN_NAME=${DOMAIN_NAME}
SUBDOMAIN=${SUBDOMAIN}
SSL_EMAIL=${SSL_EMAIL}
GENERIC_TIMEZONE=${GENERIC_TIMEZONE}
BASE_DIR=${BASE_DIR}
EOF


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

echo "📌 2. Checking for ACL"
if command -v getfacl >/dev/null 2>&1; then
  echo "✔ ACL is already installed"
else
  echo "⚙ ACL not found. Installing..."
  sudo apt update
  sudo apt install -y acl
  echo "✔ ACL installed successfully"
fi

echo ""

echo "📌 3. Creating directories"
cd "$HOME/.anywhere"
mkdir -p "$BASE_DIR"/{mongodb,n8n_data,local-files,traefik_data}
sudo setfacl -m u:101:rwx "$BASE_DIR/mongodb"
sudo setfacl -m u:1000:rwx "$BASE_DIR"/{n8n_data,local-files,traefik_data}
echo "✔ Directories ready"

echo ""

echo "📌 4. Build Anywhere VPN"
wget -O /tmp/build.tar.gz https://github.com/Er-Ragul/Anywhere/releases/download/v1.0.0-alpha/build.tar.gz
tar -xzpf /tmp/build.tar.gz -C /tmp/
cp -pr /tmp/build/* "$BASE_DIR"
rm -rf /tmp/build/
rm -rf /tmp/build.tar.gz
cd "$HOME/.anywhere"
sudo docker build -t anywhere .
sudo docker compose up -d

echo ""

echo "📌 5. Starting Anywhere VPN"
sudo docker cp credentials.json n8n:/tmp/credentials.json
sudo docker cp anywhere.json n8n:/tmp/anywhere.json
sudo docker exec -it n8n n8n import:credentials --input=/tmp/credentials.json
sudo docker exec -it n8n n8n import:workflow --input=/tmp/anywhere.json
sudo docker exec -it n8n n8n publish:workflow --id=9lyTjrgI6u2iExuQAmbWh

echo ""

echo "✅ Anywhere VPN setup completed successfully"
echo "Hostname: local.anywhere.vpn"
echo "FQDN: ${SUBDOMAIN}.${DOMAIN_NAME}"
echo "N8N Endpoint: https://${SUBDOMAIN}.${DOMAIN_NAME}/"
echo ""