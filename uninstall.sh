#!/usr/bin/env bash
echo ""
echo "  Minifra Sentinel Customer Portal — Uninstall"
echo "  ─────────────────────────────────────────────"
echo ""
read -rp "  Are you sure you want to uninstall? (y/N): " CONFIRM
[[ "${CONFIRM,,}" != "y" ]] && echo "  Cancelled." && exit 0

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Stop service
if command -v systemctl &>/dev/null && systemctl is-active --quiet minifra-customer-portal 2>/dev/null; then
  systemctl stop minifra-customer-portal
  systemctl disable minifra-customer-portal
  rm -f /etc/systemd/system/minifra-customer-portal.service
  systemctl daemon-reload
  echo "  Systemd service removed."
fi

# Kill any running portal process
bash "$SCRIPT_DIR/scripts/stop-portal.sh" 2>/dev/null || true

# Remove build artifacts
rm -rf "$SCRIPT_DIR/portal/dist" "$SCRIPT_DIR/portal/node_modules"
echo "  Build artifacts removed."

read -rp "  Also delete config/sentinel.config? (y/N): " DELCFG
[[ "${DELCFG,,}" == "y" ]] && rm -f "$SCRIPT_DIR/config/sentinel.config" && echo "  Config deleted."

echo ""
echo "  Uninstall complete. Source files retained in portal/src/"
