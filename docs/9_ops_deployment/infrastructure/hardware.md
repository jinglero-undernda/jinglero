# Infrastructure: Raspberry Pi 3B Hardware

## Status
- **Status**: current_implementation
- **Last Updated**: 2025-11-25
- **Last Validated**: not yet validated

## Overview

This document describes the hardware infrastructure for the Jinglero application deployment. The application runs on a Raspberry Pi 3B single-board computer, providing a cost-effective and energy-efficient server solution.

## Infrastructure Components

### Raspberry Pi 3B

**Type**: Single-Board Computer (SBC)

**Specifications**:
- **CPU**: Broadcom BCM2837, Quad-core Cortex-A53 (ARMv8) 64-bit @ 1.2GHz
- **RAM**: 1GB LPDDR2 SDRAM
- **Storage**: microSD card (minimum 16GB, Class 10 recommended)
- **Networking**: 
  - 10/100 Ethernet
  - 2.4GHz 802.11n Wireless LAN
  - Bluetooth 4.1
- **USB**: 4x USB 2.0 ports
- **Video**: HDMI, Composite video, DSI display port
- **GPIO**: 40-pin GPIO header
- **Power**: 5V via micro USB (minimum 2.5A power supply recommended)

**Code Reference**: N/A (hardware specification)

**Provisioning**:

1. **Hardware Acquisition**: Obtain Raspberry Pi 3B board
2. **Storage Setup**: 
   - Format microSD card (minimum 16GB, Class 10)
   - Flash Raspberry Pi OS (64-bit recommended) using Raspberry Pi Imager
3. **Initial Configuration**:
   - Enable SSH by creating empty `ssh` file in boot partition
   - Configure WiFi (if using) via `wpa_supplicant.conf` in boot partition
4. **Power and Boot**: Connect power supply and boot the device
5. **Network Configuration**: 
   - Connect via SSH: `ssh pi@<raspberry-pi-ip>`
   - Optionally configure static IP address
6. **System Updates**: `sudo apt update && sudo apt upgrade -y`

**Management**:

1. **Remote Access**: SSH access for administration
2. **System Monitoring**: 
   - Temperature monitoring: `vcgencmd measure_temp`
   - CPU usage: `top` or `htop`
   - Memory usage: `free -h`
   - Disk usage: `df -h`
3. **Service Management**: Systemd services for application components
4. **Backup Strategy**: Regular backups of application data and configuration
5. **Update Management**: Regular system and application updates

**Security Measures**:

1. **SSH Security**:
   - Change default password: `passwd`
   - Consider disabling password authentication and using SSH keys
   - Configure firewall to restrict SSH access if needed
2. **Firewall**: Configure ufw to only allow necessary ports (22, 80, 443)
3. **System Updates**: Keep system packages updated for security patches
4. **User Permissions**: Run services as non-root user (`pi` user)
5. **Physical Security**: Secure physical access to the device

**Validation**:

1. Verify hardware is detected: `vcgencmd get_throttled` (should return `0x0` if no throttling)
2. Verify CPU temperature: `vcgencmd measure_temp` (should be below 80°C under load)
3. Verify network connectivity: `ping google.com`
4. Verify disk space: `df -h` (should have sufficient free space)
5. Verify system stability: Monitor for crashes or unexpected reboots

---

### Operating System: Raspberry Pi OS (64-bit)

**Type**: Operating System

**Specification**: Raspberry Pi OS (formerly Raspbian) 64-bit version

**Code Reference**: N/A (OS configuration)

**Provisioning**:

1. Download Raspberry Pi OS 64-bit image
2. Flash to microSD card using Raspberry Pi Imager
3. Configure initial settings (SSH, WiFi) in boot partition
4. Boot device and complete initial setup

**Management**:

1. **Package Management**: Use `apt` package manager
2. **System Updates**: Regular `apt update && apt upgrade`
3. **Service Management**: Systemd for service management
4. **Log Management**: Systemd journal and syslog

**Security Measures**:

1. Regular security updates: `sudo apt update && sudo apt upgrade`
2. Firewall configuration: ufw
3. SSH hardening: Disable root login, use SSH keys
4. Service isolation: Run services as non-root users

**Validation**:

1. Verify OS version: `cat /etc/os-release`
2. Verify system is up to date: `apt list --upgradable`
3. Verify services are running: `systemctl list-units --type=service --state=running`

---

### Network Infrastructure

**Type**: Network Configuration

**Components**:
- **Ethernet**: 10/100 Ethernet connection (recommended for server use)
- **WiFi**: 2.4GHz 802.11n (optional, for wireless deployment)
- **Firewall**: ufw (Uncomplicated Firewall)

**Code Reference**: N/A (network configuration)

**Provisioning**:

1. **Wired Connection** (Recommended):
   - Connect Ethernet cable to router/switch
   - Configure static IP (optional): Edit `/etc/dhcpcd.conf`
2. **Wireless Connection** (Optional):
   - Configure via `wpa_supplicant.conf` in boot partition
   - Or configure after boot: `sudo raspi-config`
3. **Firewall Setup**:
   - Install ufw: `sudo apt-get install -y ufw`
   - Configure rules: Allow SSH (22), HTTP (80), HTTPS (443)
   - Enable firewall: `sudo ufw enable`

**Management**:

1. **Network Monitoring**: 
   - Check connectivity: `ping google.com`
   - Check IP address: `hostname -I`
   - Monitor network traffic: `iftop` or `nethogs`
2. **Firewall Management**: 
   - View rules: `sudo ufw status verbose`
   - Add rules: `sudo ufw allow <port>/<protocol>`
   - View logs: `sudo tail -f /var/log/ufw.log`

**Security Measures**:

1. **Firewall Rules**: Only allow necessary ports
2. **SSH Security**: Restrict SSH access if possible
3. **Network Isolation**: Consider VLANs for production deployment
4. **Monitoring**: Monitor for suspicious network activity

**Validation**:

1. Verify network connectivity: `ping 8.8.8.8`
2. Verify DNS resolution: `nslookup google.com`
3. Verify firewall is active: `sudo ufw status`
4. Test port accessibility: From external machine, test HTTP/HTTPS access

---

### Storage Infrastructure

**Type**: Storage

**Components**:
- **Primary Storage**: microSD card (minimum 16GB, Class 10)
- **Backup Storage**: External USB drive or network storage (optional)

**Code Reference**: N/A (storage configuration)

**Provisioning**:

1. **Primary Storage**: microSD card formatted and flashed with OS
2. **Application Storage**: Application files stored on microSD card
3. **Backup Storage** (Optional): External USB drive or network-attached storage

**Management**:

1. **Disk Monitoring**: 
   - Check disk usage: `df -h`
   - Check disk health: `sudo smartctl -a /dev/mmcblk0` (if supported)
2. **Backup Strategy**:
   - Regular backups of application data
   - Backup configuration files
   - Consider automated backup scripts
3. **Disk Cleanup**: 
   - Remove old logs: `sudo journalctl --vacuum-time=7d`
   - Clean package cache: `sudo apt-get clean`
   - Remove unused packages: `sudo apt-get autoremove`

**Security Measures**:

1. **Data Encryption**: Consider encrypting sensitive data (future enhancement)
2. **Backup Security**: Encrypt backups if containing sensitive data
3. **Access Control**: Restrict access to backup storage

**Validation**:

1. Verify sufficient disk space: `df -h` (should have at least 2GB free)
2. Verify disk health: Monitor for I/O errors in system logs
3. Test backup and restore procedures

---

## Infrastructure Dependencies

### External Services

1. **Neo4j Aura**: Cloud-hosted Neo4j database (no local database required)
   - Connection via internet
   - Requires `NEO4J_URI` and `NEO4J_PASSWORD` environment variables
   - Optional: Aura Management API for auto-resume functionality

2. **Internet Connectivity**: Required for:
   - Neo4j Aura database access
   - System updates
   - SSL certificate renewal (if using Let's Encrypt)

### Internal Services

1. **Backend API Server**: Node.js/Express server (port 3000)
2. **Frontend Web Server**: Nginx serving static files (port 80/443)
3. **System Services**: Systemd for service management

## Infrastructure Monitoring

### Hardware Monitoring

1. **Temperature**: `vcgencmd measure_temp` (should be below 80°C)
2. **CPU Throttling**: `vcgencmd get_throttled` (should return `0x0`)
3. **Memory Usage**: `free -h`
4. **Disk Usage**: `df -h`
5. **CPU Load**: `top` or `htop`

### Service Monitoring

1. **Backend Service**: `sudo systemctl status jinglero-backend.service`
2. **Nginx Service**: `sudo systemctl status nginx`
3. **Service Logs**: `sudo journalctl -u <service-name> -f`

### Network Monitoring

1. **Connectivity**: `ping google.com`
2. **Port Accessibility**: Test from external machine
3. **Firewall Status**: `sudo ufw status verbose`

## Infrastructure Constraints

### Raspberry Pi 3B Limitations

1. **RAM**: 1GB RAM may limit concurrent connections and application size
2. **CPU**: Quad-core 1.2GHz may limit performance under heavy load
3. **Storage**: microSD card I/O performance may be slower than traditional storage
4. **Network**: 10/100 Ethernet limits network throughput to 100Mbps
5. **Power**: Requires stable 5V 2.5A power supply

### Recommendations

1. **Monitor Resource Usage**: Regularly check CPU, memory, and disk usage
2. **Optimize Application**: Ensure application is optimized for resource constraints
3. **Consider Upgrades**: If performance becomes an issue, consider Raspberry Pi 4 or other hardware
4. **Backup Strategy**: Implement regular backups due to microSD card reliability concerns

## Change History

| Date       | Change Description                    | Changed By |
| ---------- | ------------------------------------- | ---------- |
| 2025-11-25 | Initial hardware infrastructure documentation | AI Assistant |

