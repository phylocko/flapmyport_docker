# FlapMyPort bundle
Dockerized FlapMyPort monitoring system

## What is FlapMyPort
FlapMyPort is a fast and easy monitoring system with the following components:

**snmpflapd** — A high performance daemon that receives SNMP Link UP/DOWN traps, stores them to MySQL and sends combined emails

**iOS client** — a native iOS client with handy UX

**AppleTV client** — Client for network enthusiast with AppleTV. Based on TVML.

**Web client** — Responsve web application for desktop and mobile devices

## Quick Start
- Install Docker if it's not installed yet
- Edit .env file if you need custom SNMP community (default is `public`)
- Go to the directory containing this file and `docker-compose.yml` file and run `docker-compose up -d`

Web client will be available by the following URL: `http://your_host_ip_address/`

API URL for clients is `http://your_host_ip_address/api`

After that you need to configure sending SNMP traps from your network devices to the FlapMyPort server. 

> Note that your network devices must be accessable from the server, 
> as snmpflapd strikes back with snmp get queries to fetch information about hostname.

*And may a stable network be with you!*
