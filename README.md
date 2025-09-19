scumadd

scumadd is a test project that provides access to a game server’s data (SCUM). It allows retrieving and exposing information such as:
	•	Number of connected players
	•	List of players and their states (position, health, basic inventory)
	•	List of administrators online
	•	List of vehicles and their status (location, fuel, damage)
	•	General server status (uptime, version, load)

⚠️ This repository only contains the service/collector code and the data access API. Never store private keys or passwords in the repository — use environment variables or a private repo instead.

⸻

Table of Contents
	1.	Features
	2.	Architecture
	3.	Requirements
	4.	Installation
	5.	Configuration
	6.	Usage
	7.	API
	8.	Security and Best Practices
	9.	Development & Contribution
	10.	Troubleshooting
	11.	License

⸻

Features
	•	Periodic collection of server information (polling or push via plugin).
	•	REST endpoint (or WebSocket) to fetch real-time data.
	•	Simple filtering and aggregation (e.g., number of players per team, out-of-service vehicles).
	•	Basic authentication to restrict access (API token / JWT) — optional.
	•	JSON export for integration into dashboards or bots.

⸻

Architecture (Overview)

SCUM Server  <-- plugin/exporter --> scumadd collector --> scumadd API --> client (dashboard / bot)

	•	Collector: module that gathers data from the server (via plugin, RCON, logs, or server API).
	•	API: web service that exposes this data to external clients.
	•	Store (optional): lightweight database (e.g., SQLite, PostgreSQL, or MongoDB).
