# Dispatch Assist

Dispatch Assist is a lightweight dispatcher tool built on top of the GPS Dozor API.  
It helps operators quickly identify the best vehicle to respond to an incident and manage interventions directly on a map.

The application visualizes live vehicle data, calculates distances and estimated arrival times, and allows dispatchers to create and manage incidents in a simple workflow.

---

# Who is this app for and why

The app is designed for **dispatchers managing fleets of service vehicles** (e.g. roadside assistance, service technicians, logistics support).

In real operations, dispatchers typically need to:

- quickly identify the nearest available vehicle
- evaluate travel distance and estimated arrival time
- assign the right vehicle to a new incident
- keep track of incidents and vehicle status

Dispatch Assist simplifies this workflow by combining **live vehicle tracking, routing, filtering and incident management in one interface**.

The main goal of the app is to help a dispatcher answer one core question:

> *Which vehicle should respond to this incident?*

---

# Data sources and APIs used

The app integrates multiple endpoints from the **GPS Dozor API**:

- vehicle groups
- vehicles in a selected group
- vehicle history (route visualization)
- vehicle trips

Additional APIs used:

- **OpenStreetMap Nominatim** – address search and reverse geocoding
- **OSRM routing API** – route calculation between incident and vehicle
- **Czech Road Authority GIS API** – highway kilometre detection

These external APIs enrich the GPS data with map context, routing and location detection.

---

# Main features

- Live map with vehicles
- Incident creation directly from map click or address search
- Automatic detection of highway and kilometre location
- Nearest vehicle calculation with ETA
- Vehicle route visualization
- Vehicle trip history
- Incident assignment to vehicles
- Incident editing and management
- Filtering vehicles by branch, radius and status

---

# AI tools and development workflow

The entire project was built using AI-assisted development.

Main tools used:

- **ChatGPT**
- **Cursor AI**

Typical workflow:

1. Define feature goal
2. Use AI to generate initial implementation
3. Review and adjust the logic
4. Refactor structure and improve architecture
5. Test with real API data
6. Iterate on UX and functionality

AI significantly accelerated development, especially for:

- API integration
- data transformations
- UI scaffolding
- refactoring and code organization

However, all logic and architectural decisions were reviewed and adjusted manually.

---

# Challenges and how they were solved

### 1. Vehicle distance and ETA calculation
Vehicles only provide coordinates and speed.  
Distance and ETA were calculated using custom utility functions and sorted dynamically.

### 2. Road and kilometre detection
Incidents needed to reference highway kilometres.  
This required combining coordinates with the Czech road GIS dataset and implementing fallback geocoding.

### 3. State management complexity
The dashboard originally handled too many responsibilities in one component.

This was solved by refactoring the architecture into composables:

- `useIncidents`
- `useVehicleDirectory`
- `useVehicleSelection`
- `useRoadLocation`
- `useIncidentForm`

This significantly improved maintainability.

### 4. Vehicle highlighting and assignment logic
When opening an incident, the previously assigned vehicle had to be restored and highlighted in the nearest vehicles list.

This required synchronizing incident data with the current vehicle state.

---

# What I would improve with more time

If I had more time, I would extend the application with:

- backend persistence for incidents (database instead of in-memory state)
- real authentication and user roles
- live vehicle updates using WebSockets
- advanced dispatcher workflows (incident status tracking)
- vehicle availability logic
- improved mobile layout
- performance optimizations for large fleets

---

# Tech stack

- Vue 3
- TypeScript
- Vite
- Leaflet (map visualization)
- GPS Dozor API
- OpenStreetMap Nominatim
- OSRM routing API
