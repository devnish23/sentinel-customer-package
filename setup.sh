#!/usr/bin/env bash
set -euo pipefail

CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'; BOLD='\033[1m'

banner() {
  echo -e "${CYAN}"
  echo "  ╔══════════════════════════════════════════════════════════════╗"
  echo "  ║     MINIFRA SENTINEL — Customer Portal Installer v3.0.1     ║"
  echo "  ║              Linux / macOS Setup Script                      ║"
  echo "  ╚══════════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
}

step() { echo -e "${CYAN}  [${1}] ${2}${NC}"; }
ok()   { echo -e "${GREEN}        ✓ ${1}${NC}"; }
warn() { echo -e "${YELLOW}  [WARN] ${1}${NC}"; }
err()  { echo -e "${RED}  [ERROR] ${1}${NC}"; exit 1; }

banner

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/config/sentinel.config"

# ── Check Node.js ───────────────────────────────────────────────
step "1/6" "Checking prerequisites..."
if ! command -v node &>/dev/null; then
  err "Node.js is not installed.\n  Install: https://nodejs.org/en/download/\n  Or via nvm: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash"
fi
NODE_VER=$(node -v)
ok "Node.js $NODE_VER"

if ! command -v npm &>/dev/null; then
  err "npm is not installed. Reinstall Node.js."
fi
ok "npm $(npm -v)"

# ── Configuration ───────────────────────────────────────────────
step "2/6" "Configuration"
echo ""

RECONFIG="y"
if [ -f "$CONFIG_FILE" ]; then
  source "$CONFIG_FILE" 2>/dev/null || true
  echo -e "  Existing config found:"
  echo -e "    API URL   : ${API_BASE_URL:-not set}"
  echo -e "    Port      : ${PORTAL_PORT:-not set}"
  echo -e "    Company   : ${COMPANY_NAME:-not set}"
  echo ""
  read -rp "  Re-configure? (y/N): " RECONFIG
  RECONFIG="${RECONFIG:-n}"
fi

if [[ "${RECONFIG,,}" == "y" ]]; then
  echo ""
  echo "  Enter your Minifra Sentinel Hub API URL"
  echo "  Example: https://192.168.1.10:8443/api/sentinel"
  read -rp "  Hub API URL [http://localhost:3001/api/sentinel]: " API_BASE_URL
  API_BASE_URL="${API_BASE_URL:-http://localhost:3001/api/sentinel}"

  read -rp "  Portal port [3000]: " PORTAL_PORT
  PORTAL_PORT="${PORTAL_PORT:-3000}"

  read -rp "  Your company name [My Organisation]: " COMPANY_NAME
  COMPANY_NAME="${COMPANY_NAME:-My Organisation}"

  read -rp "  Install as systemd service? (Y/n): " INSTALL_SVC
  INSTALL_SVC="${INSTALL_SVC:-y}"
  if [[ "${INSTALL_SVC,,}" == "n" ]]; then
    INSTALL_AS_SERVICE="false"
  else
    INSTALL_AS_SERVICE="true"
  fi

  mkdir -p "$SCRIPT_DIR/config"
  cat > "$CONFIG_FILE" <<EOF
API_BASE_URL=${API_BASE_URL}
PORTAL_PORT=${PORTAL_PORT}
COMPANY_NAME=${COMPANY_NAME}
INSTALL_AS_SERVICE=${INSTALL_AS_SERVICE}
INSTALLED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
VERSION=3.0.1
EOF
  ok "Config saved to config/sentinel.config"
fi

# Load config
source "$CONFIG_FILE"

# ── Patch index.html ────────────────────────────────────────────
step "3/6" "Writing runtime configuration into portal..."
sed -i.bak "s|SENTINEL_API_BASE_URL_PLACEHOLDER|${API_BASE_URL}|g" \
  "$SCRIPT_DIR/portal/index.html"
ok "API endpoint: ${API_BASE_URL}"

# ── Install dependencies ─────────────────────────────────────────
step "4/6" "Installing portal dependencies..."
cd "$SCRIPT_DIR/portal"
npm install --silent
ok "Dependencies installed"

# ── Build portal ─────────────────────────────────────────────────
step "5/6" "Building portal for production..."
VITE_API_BASE_URL="$API_BASE_URL" npm run build
ok "Build complete — output in portal/dist/"
cd "$SCRIPT_DIR"

# ── Service setup ────────────────────────────────────────────────
step "6/6" "Setting up service..."
npm install -g http-server --silent 2>/dev/null || warn "Could not install http-server globally; using npx"

mkdir -p "$SCRIPT_DIR/scripts"

# Generate start script
cat > "$SCRIPT_DIR/scripts/start-portal.sh" <<STARTSCRIPT
#!/usr/bin/env bash
cd "$(dirname "\$0")/../portal"
npx http-server dist -p ${PORTAL_PORT} --cors -c-1
STARTSCRIPT
chmod +x "$SCRIPT_DIR/scripts/start-portal.sh"

# Generate stop script
cat > "$SCRIPT_DIR/scripts/stop-portal.sh" <<STOPSCRIPT
#!/usr/bin/env bash
pkill -f "http-server.*${PORTAL_PORT}" && echo "Portal stopped" || echo "Portal was not running"
STOPSCRIPT
chmod +x "$SCRIPT_DIR/scripts/stop-portal.sh"

if [[ "${INSTALL_AS_SERVICE:-false}" == "true" ]]; then
  SYSTEMD_AVAILABLE=false
  if command -v systemctl &>/dev/null && [[ $EUID -eq 0 ]]; then
    SYSTEMD_AVAILABLE=true
  fi

  if [[ "$SYSTEMD_AVAILABLE" == "true" ]]; then
    cat > /etc/systemd/system/minifra-customer-portal.service <<SVC
[Unit]
Description=Minifra Sentinel Customer Portal
After=network.target

[Service]
Type=simple
WorkingDirectory=${SCRIPT_DIR}/portal
ExecStart=/usr/bin/npx http-server dist -p ${PORTAL_PORT} --cors -c-1
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
SVC
    systemctl daemon-reload
    systemctl enable minifra-customer-portal
    systemctl start minifra-customer-portal
    ok "Systemd service installed and started: minifra-customer-portal"
  else
    # launchd on macOS or non-root Linux — use nohup
    nohup "$SCRIPT_DIR/scripts/start-portal.sh" > "$SCRIPT_DIR/logs/portal.log" 2>&1 &
    mkdir -p "$SCRIPT_DIR/logs"
    echo $! > "$SCRIPT_DIR/scripts/portal.pid"
    ok "Portal started (PID: $(cat "$SCRIPT_DIR/scripts/portal.pid"))"
    warn "Not running as root — could not install systemd service. Use scripts/start-portal.sh to restart."
  fi
else
  ok "Manual mode — run: scripts/start-portal.sh"
fi

# ── Done ────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}"
echo "  ╔══════════════════════════════════════════════════════════════╗"
echo "  ║                  Installation Complete!                      ║"
echo "  ╠══════════════════════════════════════════════════════════════╣"
printf "  ║  Portal URL  : http://$(hostname -I 2>/dev/null | awk '{print $1}' || echo 'localhost'):%-30s║\n" "${PORTAL_PORT}"
printf "  ║  Hub API     : %-47s║\n" "${API_BASE_URL}"
echo "  ║  Docs        : file://${SCRIPT_DIR}/docs/index.html"
echo "  ║  KB Articles : file://${SCRIPT_DIR}/docs/kb/index.html"
echo "  ║                                                              ║"
echo "  ║  Reconfigure : run ./setup.sh again                          ║"
echo "  ║  Uninstall   : run ./uninstall.sh                            ║"
echo "  ╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
