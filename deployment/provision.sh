#!/bin/bash
set -euo pipefail

LOG_FILE="/var/log/provision.log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "=== Starting provisioning at $(date) ==="

# --- System Updates ---
apt-get update -y && apt-get upgrade -y
apt-get install -y curl git unzip awscli jq

# --- Create app user ---
if ! id -u tenant >/dev/null 2>&1; then
  useradd -m -s /bin/bash tenant
fi
mkdir -p /var/log/multi-tenancy
chown tenant:tenant /var/log/multi-tenancy

# Allow ubuntu/root to su into tenant without password (it already can as root)
echo "tenant ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/tenant
chmod 440 /etc/sudoers.d/tenant

# --- Node.js 20 LTS via NVM (installed under tenant) ---
sudo -u tenant -H bash -c '
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  source "$NVM_DIR/nvm.sh"
  nvm install 20
  nvm use 20
  nvm alias default 20
  npm install -g pm2 typescript ts-node
'

# --- PM2 startup (runs as root to register systemd service) ---
env PATH=$PATH:/home/tenant/.nvm/versions/node/v20/bin \
  pm2 startup systemd -u tenant --hp /home/tenant
systemctl enable pm2-tenant

# --- Redis ---
apt-get install -y redis-server
systemctl enable redis-server
systemctl start redis-server

echo "=== Provisioning complete at $(date) ==="