# Map Visitor IP Locations

This script analyzes nginx access logs to map visitor IP addresses to their geographic locations.

## Setup on Server

1. **Transfer the script to your server:**

   ```bash
   # From your local machine, copy the script to the server
   scp backend/src/server/scripts/map-visitor-locations.ts user@your-server:/path/to/jinglero/backend/src/server/scripts/
   ```

2. **Or clone/pull the repository on the server** (if you have the repo there)

3. **Install dependencies** (if not already installed):
   ```bash
   cd /path/to/jinglero/backend
   npm install
   ```

## Usage

### Option 1: Using npm script (recommended)

```bash
sudo zcat -f /var/log/nginx/access.log* | sudo npm run map:visitor-locations
```

### Option 2: Using ts-node directly

```bash
sudo zcat -f /var/log/nginx/access.log* | sudo ts-node src/server/scripts/map-visitor-locations.ts
```

### Option 3: Using the shell wrapper

```bash
# Make it executable first
chmod +x map-visitor-locations.sh

# Then use it
sudo zcat -f /var/log/nginx/access.log* | sudo ./map-visitor-locations.sh
```

### Option 4: Analyze a single log file

```bash
sudo cat /var/log/nginx/access.log | sudo npm run map:visitor-locations
```

## Output

The script provides:

1. **Summary by Country** - Aggregated statistics showing:

   - Total requests per country
   - Number of unique IPs per country

2. **Detailed IP List (Top 50)** - Shows:

   - IP address
   - Number of requests
   - Location (City, Region, Country)
   - Coordinates (if available)
   - ISP information

3. **IPs with Unknown Location** - Lists IPs that couldn't be geolocated (usually private/local IPs)

## Features

- ✅ Parses nginx COMBINED log format
- ✅ Extracts unique IP addresses
- ✅ Geolocates IPs using ip-api.com (free, no API key required)
- ✅ Rate limiting to respect API limits (45 requests/minute)
- ✅ Caching to avoid duplicate API calls
- ✅ Filters out private/local IPs
- ✅ Progress indicators for large log files

## Rate Limits

The script uses ip-api.com which has a free tier limit of 45 requests per minute. The script automatically implements rate limiting with delays between batches.

For large numbers of unique IPs, the script may take some time to complete. Consider:

- Analyzing a subset of logs first
- Using a paid geolocation service for faster processing
- Running during off-peak hours

## Example Output

```
=== Visitor IP Location Map ===

## Summary by Country

Country                    | Requests | Unique IPs
---------------------------|----------|------------
United States              |     1523 |         45
Germany                    |      234 |         12
United Kingdom             |      189 |          8
...

## Detailed IP List (Top 50)

IP Address         | Requests | Location
-------------------|----------|----------------------------------------
192.0.2.1          |      456 | New York, New York, United States (40.71, -74.01) - Verizon
203.0.113.1        |      234 | London, England, United Kingdom (51.51, -0.13) - BT
...
```

## Troubleshooting

**If you get "command not found" errors:**

- Make sure Node.js and npm are installed on the server
- Make sure you're in the backend directory when running the script
- Try using the full path: `sudo ts-node /path/to/backend/src/server/scripts/map-visitor-locations.ts`

**If the script is slow:**

- This is normal for large log files with many unique IPs
- The script respects API rate limits (45 requests/minute)
- Consider analyzing a smaller time range first

**If some IPs show "Unknown location":**

- Private/local IPs (192.168.x.x, 10.x.x.x, etc.) cannot be geolocated
- Some IPs may fail geolocation lookup (the script will continue)
