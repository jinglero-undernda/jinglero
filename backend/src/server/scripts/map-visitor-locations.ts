#!/usr/bin/env ts-node

/**
 * Map visitor IP locations from nginx access logs
 * 
 * Usage:
 *   sudo zcat -f /var/log/nginx/access.log* | sudo ts-node src/server/scripts/map-visitor-locations.ts
 *   or
 *   sudo cat /var/log/nginx/access.log | sudo ts-node src/server/scripts/map-visitor-locations.ts
 */

import * as readline from 'readline';
import axios from 'axios';

interface IPLocation {
  ip: string;
  country?: string;
  countryCode?: string;
  region?: string;
  regionName?: string;
  city?: string;
  lat?: number;
  lon?: number;
  isp?: string;
  org?: string;
  as?: string;
  query?: string;
  status?: string;
  message?: string;
}

interface IPStats {
  ip: string;
  count: number;
  location?: IPLocation;
}

// Cache to avoid duplicate API calls
const locationCache = new Map<string, IPLocation>();

/**
 * Parse nginx COMBINED log format
 * Format: $remote_addr - $remote_user [$time_local] "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent"
 */
function parseNginxLogLine(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  
  // Extract IP address (first field before space)
  const match = trimmed.match(/^(\S+)/);
  return match ? match[1] : null;
}

/**
 * Get location for an IP address using ip-api.com (free, no API key required)
 * Rate limit: 45 requests/minute
 */
async function getIPLocation(ip: string): Promise<IPLocation | null> {
  // Skip private/local IPs
  if (
    ip.startsWith('127.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.16.') ||
    ip.startsWith('172.17.') ||
    ip.startsWith('172.18.') ||
    ip.startsWith('172.19.') ||
    ip.startsWith('172.20.') ||
    ip.startsWith('172.21.') ||
    ip.startsWith('172.22.') ||
    ip.startsWith('172.23.') ||
    ip.startsWith('172.24.') ||
    ip.startsWith('172.25.') ||
    ip.startsWith('172.26.') ||
    ip.startsWith('172.27.') ||
    ip.startsWith('172.28.') ||
    ip.startsWith('172.29.') ||
    ip.startsWith('172.30.') ||
    ip.startsWith('172.31.') ||
    ip === '::1' ||
    ip.startsWith('fe80:')
  ) {
    return null;
  }

  // Check cache first
  if (locationCache.has(ip)) {
    return locationCache.get(ip)!;
  }

  try {
    // Use ip-api.com free service (no API key required)
    const response = await axios.get<IPLocation>(
      `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,isp,org,as,query`,
      { timeout: 5000 }
    );

    if (response.data.status === 'success') {
      locationCache.set(ip, response.data);
      return response.data;
    } else {
      console.error(`Failed to get location for ${ip}: ${response.data.message}`);
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Error fetching location for ${ip}: ${error.message}`);
    } else {
      console.error(`Unknown error for ${ip}:`, error);
    }
    return null;
  }
}

/**
 * Format location for display
 */
function formatLocation(loc: IPLocation): string {
  const parts: string[] = [];
  
  if (loc.city) parts.push(loc.city);
  if (loc.regionName) parts.push(loc.regionName);
  if (loc.country) parts.push(loc.country);
  
  const locationStr = parts.length > 0 ? parts.join(', ') : 'Unknown location';
  
  const coords = loc.lat && loc.lon ? ` (${loc.lat.toFixed(2)}, ${loc.lon.toFixed(2)})` : '';
  const isp = loc.isp ? ` - ${loc.isp}` : '';
  
  return `${locationStr}${coords}${isp}`;
}

/**
 * Main function
 */
async function main() {
  const ipCounts = new Map<string, number>();
  
  console.error('Reading nginx access logs from stdin...');
  console.error('(Press Ctrl+D when done, or pipe logs into this script)');
  console.error('');

  // Read from stdin
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  let lineCount = 0;
  
  for await (const line of rl) {
    lineCount++;
    const ip = parseNginxLogLine(line);
    if (ip) {
      ipCounts.set(ip, (ipCounts.get(ip) || 0) + 1);
    }
    
    // Progress indicator every 10000 lines
    if (lineCount % 10000 === 0) {
      process.stderr.write(`\rProcessed ${lineCount} lines, found ${ipCounts.size} unique IPs...`);
    }
  }

  console.error(`\nProcessed ${lineCount} lines`);
  console.error(`Found ${ipCounts.size} unique IP addresses`);
  console.error('Fetching location data...\n');

  // Convert to array and sort by count
  const ipStats: IPStats[] = Array.from(ipCounts.entries())
    .map(([ip, count]) => ({ ip, count }))
    .sort((a, b) => b.count - a.count);

  // Fetch locations (with rate limiting)
  const BATCH_SIZE = 40; // Stay under 45/min limit
  const DELAY_MS = 1000; // 1 second delay between batches

  for (let i = 0; i < ipStats.length; i++) {
    const stats = ipStats[i];
    
    // Fetch location
    stats.location = await getIPLocation(stats.ip) || undefined;
    
    // Rate limiting
    if ((i + 1) % BATCH_SIZE === 0 && i < ipStats.length - 1) {
      console.error(`\rFetched ${i + 1}/${ipStats.length} locations, waiting ${DELAY_MS}ms...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
    
    // Progress indicator
    if ((i + 1) % 10 === 0 || i === ipStats.length - 1) {
      process.stderr.write(`\rFetched ${i + 1}/${ipStats.length} locations...`);
    }
  }

  console.error('\n\n=== Visitor IP Location Map ===\n');

  // Group by country for summary
  const countryStats = new Map<string, { count: number; ips: number }>();
  const locationStats: Array<{ ip: string; count: number; location: string }> = [];

  for (const stats of ipStats) {
    const locationStr = stats.location 
      ? formatLocation(stats.location)
      : 'Unknown location';
    
    locationStats.push({
      ip: stats.ip,
      count: stats.count,
      location: locationStr
    });

    if (stats.location?.country) {
      const country = stats.location.country;
      const existing = countryStats.get(country) || { count: 0, ips: 0 };
      countryStats.set(country, {
        count: existing.count + stats.count,
        ips: existing.ips + 1
      });
    }
  }

  // Display summary by country
  console.log('## Summary by Country\n');
  const sortedCountries = Array.from(countryStats.entries())
    .sort((a, b) => b[1].count - a[1].count);

  console.log('Country                    | Requests | Unique IPs');
  console.log('---------------------------|----------|------------');
  for (const [country, stats] of sortedCountries) {
    console.log(`${country.padEnd(26)} | ${stats.count.toString().padStart(8)} | ${stats.ips.toString().padStart(10)}`);
  }

  // Display detailed IP list
  console.log('\n\n## Detailed IP List (Top 50)\n');
  console.log('IP Address         | Requests | Location');
  console.log('-------------------|----------|----------------------------------------');
  
  const topIPs = locationStats.slice(0, 50);
  for (const item of topIPs) {
    const ipPadded = item.ip.padEnd(17);
    const countPadded = item.count.toString().padStart(8);
    console.log(`${ipPadded} | ${countPadded} | ${item.location}`);
  }

  if (locationStats.length > 50) {
    console.log(`\n... and ${locationStats.length - 50} more IPs`);
  }

  // Display IPs without location data
  const unknownIPs = locationStats.filter(item => item.location === 'Unknown location');
  if (unknownIPs.length > 0) {
    console.log('\n\n## IPs with Unknown Location\n');
    for (const item of unknownIPs.slice(0, 20)) {
      console.log(`${item.ip.padEnd(17)} | ${item.count.toString().padStart(8)} requests`);
    }
    if (unknownIPs.length > 20) {
      console.log(`... and ${unknownIPs.length - 20} more`);
    }
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}

