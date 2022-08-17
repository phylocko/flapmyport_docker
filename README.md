# FlapMyPort Docker

Dockerized [FlapMyPort](https://flapmyport.com) monitoring system bundle.

## What is FlapMyPort

FlapMyPort is a fast and easy monitoring system with the following components.

![Scheme](assets/scheme.png)

**[snmpflapd](https://github.com/phylocko/snmpflapd)** — A high performance daemon that collects SNMP Link UP/DOWN traps

**[flapmyport_api](https://github.com/phylocko/flapmyport_api)** — API that shows the data collected by the snmplapd

**[iOS client](https://github.com/phylocko/FlapMyPort-iPhone)** — A native iOS client with handy UX

**[macOS client](https://github.com/phylocko/FlapMyPort-Mac)** — A native desktop client for Mac

**[AppleTV client](https://github.com/phylocko/FlapMyPort-AppleTV)** — Client for network enthusiasts with AppleTV

**[Web client](web)** — Responsve web application for desktop and mobile devices


## Quick Start

### 1. Run FlapMyPort
`docker-compose up -d`

- Web client URL: `http://<ip_address>/`
- API URL: `http://<ip_address>/api`

### 2. Configure network devices

After that you need to configure your network devices to:
- Send SNMP traps to the FlapMyPort server
- Answer to SNMPGet from **snmpflapd**

> Note that your network devices must be accessable from the server, 
> as snmpflapd strikes back with snmp get queries to fetch information about hostname.

You're all set!

---

## Custom settings

Edit `.env` file if you need custom SNMP community or nginx configuration.

---
*And may a stable network be with you!*
