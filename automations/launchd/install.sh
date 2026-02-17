#!/bin/bash
# ============================================================================
# Auto-Eval launchd Installer
# ============================================================================
# Installs or uninstalls the auto-eval scheduled task via launchd.
#
# Usage:
#   ./install.sh install    # Install and start the scheduled task
#   ./install.sh uninstall  # Stop and remove the scheduled task
#   ./install.sh status     # Check if the task is loaded

set -euo pipefail

PLIST_NAME="com.needthisdone.auto-eval"
PLIST_SOURCE="$(cd "$(dirname "$0")" && pwd)/${PLIST_NAME}.plist"
PLIST_DEST="$HOME/Library/LaunchAgents/${PLIST_NAME}.plist"

case "${1:-help}" in
  install)
    echo "Installing auto-eval scheduled task..."

    # Unload existing if present
    launchctl unload "$PLIST_DEST" 2>/dev/null || true

    # Copy plist to LaunchAgents
    cp "$PLIST_SOURCE" "$PLIST_DEST"
    echo "Copied plist to $PLIST_DEST"

    # Load the agent
    launchctl load "$PLIST_DEST"
    echo "Loaded $PLIST_NAME"
    echo ""
    echo "Auto-eval will run every 4 hours."
    echo "Check status: $0 status"
    echo "View logs: tail -f $(dirname "$PLIST_SOURCE")/auto-eval.stdout.log"
    ;;

  uninstall)
    echo "Uninstalling auto-eval scheduled task..."
    launchctl unload "$PLIST_DEST" 2>/dev/null || true
    rm -f "$PLIST_DEST"
    echo "Removed $PLIST_NAME"
    ;;

  status)
    if launchctl list | grep -q "$PLIST_NAME"; then
      echo "Status: LOADED"
      launchctl list "$PLIST_NAME" 2>/dev/null || true
    else
      echo "Status: NOT LOADED"
    fi
    ;;

  *)
    echo "Usage: $0 {install|uninstall|status}"
    exit 1
    ;;
esac
