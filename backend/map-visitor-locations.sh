#!/bin/bash

# Map visitor IP locations from nginx access logs
# 
# Usage:
#   sudo zcat -f /var/log/nginx/access.log* | sudo ./map-visitor-locations.sh
#   or
#   sudo cat /var/log/nginx/access.log | sudo ./map-visitor-locations.sh

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Run the TypeScript script
cd "$SCRIPT_DIR"
npm run map:visitor-locations

