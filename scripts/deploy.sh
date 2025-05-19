#!/bin/bash
set -e

# Configuration
TEST_VAULT_PATH="/Users/liumingwei/01-project/31-obsidian/01-cognilink/cognilink"
PLUGIN_NAME="cognilink-assistant"
PLUGIN_PATH="$TEST_VAULT_PATH/.obsidian/plugins/$PLUGIN_NAME"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print status messages
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

# Function to print warning messages
print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Function to print error messages
print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 写入 buildTime 到 manifest.json（使用 jq，兼容 macOS/Linux）
BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
MANIFEST_FILE="manifest.json"
TMP_MANIFEST="manifest.tmp.json"

if ! command -v jq &> /dev/null; then
  print_error "jq 未安装，请先运行: brew install jq"
  exit 1
fi

jq --arg time "$BUILD_TIME" '.buildTime = $time' "$MANIFEST_FILE" > "$TMP_MANIFEST" && mv "$TMP_MANIFEST" "$MANIFEST_FILE"

# Check if test vault exists
if [ ! -d "$TEST_VAULT_PATH" ]; then
    print_warning "Test vault not found at $TEST_VAULT_PATH"
    read -p "Do you want to create it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        mkdir -p "$TEST_VAULT_PATH"
        print_status "Created test vault at $TEST_VAULT_PATH"
    else
        print_error "Test vault is required for deployment"
        exit 1
    fi
fi

# Create plugin directory if it doesn't exist
mkdir -p "$PLUGIN_PATH"

# Build the plugin
print_status "Building plugin..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    print_error "Build failed"
    exit 1
fi

# Copy files to test vault
print_status "Deploying to test vault..."
cp dist/main.js "$PLUGIN_PATH/"
cp manifest.json "$PLUGIN_PATH/"
cp styles.css "$PLUGIN_PATH/"

# Check if files were copied successfully
if [ $? -ne 0 ]; then
    print_error "Failed to copy files to test vault"
    exit 1
fi

print_status "Deployment complete!"
print_status "Please reload Obsidian or restart the plugin to see changes" 