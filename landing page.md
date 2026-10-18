# SomaiyaSat Mission Operations Landing Page

## 1. Purpose

The landing page introduces the SomaiyaSat Mission Operations platform and explains how it supports deployment monitoring, satellite health monitoring, AI-based decision-making, mission actions, and ground-station communication.

The primary purpose is to help visitors understand the mission and direct authorised users to the Mission Dashboard.

This document defines the landing-page content and functionality only. It does not define visual design, colours, typography, animations, spacing, or layout styling.

## 2. Target users

- Mission operators
- Ground-station operators
- Satellite and aerospace teams
- AI and embedded-systems teams
- Faculty and student researchers
- Amateur-radio and project stakeholders

## 3. Primary actions

- Open the Mission Dashboard
- Learn how the mission works
- View the system architecture
- Review supported communication modes
- Read mission documentation
- Contact the project team

## 4. Navigation content

The navigation should provide links to:

- Mission Overview
- System Architecture
- AI Decision Engine
- Communication Modes
- Ground Station
- Documentation
- Contact
- Open Mission Dashboard

## 5. Hero section

### Heading

**Autonomous intelligence for SomaiyaSat mission operations**

### Supporting copy

SomaiyaSat is a PocketQube mission supported by SomaiyaPod, an intelligent mission-management platform, and a multi-mode amateur-radio payload stack. The platform helps operators monitor deployment, evaluate spacecraft health, prioritise mission data, and coordinate communication with the ground station.

### Primary call to action

**Open Mission Dashboard**

This action takes an authorised user to the main mission dashboard.

### Secondary call to action

**Explore the Mission**

This action scrolls to or opens the mission overview section.

## 6. Mission status summary

The landing page should briefly communicate the current mission condition using the following information:

- Deployment status
- Satellite operational status
- AI decision engine status
- Ground-station connection status
- Current mission phase
- Last telemetry update time

If live data is unavailable, the page should clearly identify the values as demonstration or simulated data.

## 7. Mission overview section

### Heading

**One platform for the complete mission lifecycle**

### Copy

The SomaiyaSat mission combines a deployer, PocketQube satellite, autonomous data-routing logic, multi-mode communication payloads, and a ground station. The Mission Operations platform connects these parts so that mission teams can observe the spacecraft, understand operational risks, and perform authorised actions.

### Mission components

#### SomaiyaPod

The deployer safely houses and releases SomaiyaSat. The platform records release events, separation confirmation, and post-deployment handover information.

#### SomaiyaSat

The PocketQube satellite carries the flight computer, sensors, power system, radio system, and amateur-radio payloads.

#### Mission Dashboard

The dashboard combines deployment monitoring, mission status, satellite health, AI decisions, alerts, and mission actions in one operational view.

#### Ground Station

The ground station receives, decodes, stores, and visualises downlinked telemetry, housekeeping data, voice/data payloads, and SSTV images.

## 8. System architecture section

### Heading

**From spacecraft telemetry to mission action**

### Architecture sequence

1. SomaiyaSat and SomaiyaPod generate deployment, health, and operational data.
2. The Mission Dashboard collects and presents mission information.
3. The AI Decision Engine evaluates resources, link conditions, data priority, and possible failures.
4. The system recommends or triggers an approved mission action.
5. The Ground Station confirms communication and records the result.

### Architecture capabilities

- Deployment Monitoring
- Mission Status Tracking
- Satellite Health Monitoring
- Resource Allocation
- Failure Prediction
- Recovery Optimisation
- Mission Actions
- Ground-Station Communication

## 9. Core capabilities section

### Deployment Monitoring

Monitor SomaiyaPod release progress, separation-switch confirmation, deployment timing, satellite activation, and post-deployment initialisation.

### Mission Status

Track the current mission phase, operational state, recent events, communication windows, and mission-readiness information.

### Satellite Health

Monitor battery voltage, current consumption, power generation, temperature, memory, processor state, sensor readings, and subsystem health.

### AI Decision Engine

Use telemetry, link quality, power availability, data urgency, and pending payload queues to decide which information should be transmitted first.

### Failure Prediction

Identify abnormal readings, communication degradation, power risks, thermal issues, and possible subsystem failures before they affect mission operations.

### Recovery Optimisation

Recommend safe recovery steps, resource reallocation, communication-mode changes, and operational priorities when mission conditions change.

### Mission Actions

Provide authorised operators with approved actions such as requesting telemetry, changing payload mode, requesting an SSTV image, or acknowledging an alert.

### Ground Station

Receive, decode, verify, store, and visualise data received from SomaiyaSat during available communication windows.

## 10. AI decision workflow section

### Heading

**How the autonomous decision process works**

### Workflow copy

The AI Decision Engine continuously evaluates the satellite's available resources and communication conditions. It uses these inputs to select a safe transmission priority and communication mode while ensuring that critical telemetry and housekeeping data remain protected.

### Workflow steps

1. Collect battery, temperature, link-quality, and subsystem telemetry.
2. Read the queue of pending TT&C, housekeeping, SSTV, M17, and Codec2 data.
3. Assign priority according to urgency, mission rules, link conditions, and available power.
4. Predict possible failures or communication risks.
5. Select the most suitable payload mode and transmission order.
6. Execute or recommend an approved mission action.
7. Confirm delivery through ground-station feedback.
8. Store the outcome for analysis and future model improvement.

## 11. Communication modes section

### Heading

**Multi-mode communication for different mission needs**

### TT&C and housekeeping

Carries essential telemetry, tracking information, commands, and spacecraft-health data. This should receive the highest operational priority.

### SSTV

Transmits images captured by the satellite camera. The landing page should explain that images may be queued and transmitted when link quality and power availability permit.

### M17

Supports digital voice and data communication through the amateur-radio payload.

### Codec2

Provides low-bitrate digital voice communication suited to bandwidth-constrained links.

## 12. Mission objectives section

The landing page should present the mission objectives in concise form:

- Demonstrate safe and reliable PocketQube deployment.
- Confirm satellite separation and post-deployment initialisation.
- Demonstrate autonomous data prioritisation and communication management.
- Support TT&C, housekeeping, SSTV, M17, and Codec2 communication.
- Validate spacecraft health, payload operation, and ground-station communication.
- Create a multidisciplinary platform for student-led space-technology research.

## 13. Mission metrics section

The platform may display the following mission metrics:

- Deployment success rate
- Separation-confirmation success rate
- Communication-link success rate
- Packet delivery rate
- Data-prioritisation accuracy
- Average power efficiency
- Number of ground-station contacts
- Number of received telemetry packets
- Number of decoded SSTV images
- Number of detected and resolved anomalies

Values should be connected to live mission data when available. Otherwise, they should be labelled as simulated, test, or historical values.

## 14. Mission dashboard invitation

### Heading

**Monitor the mission in real time**

### Copy

Open the Mission Dashboard to inspect spacecraft health, review AI decisions, monitor communication activity, investigate alerts, and perform authorised mission actions.

### Call to action

**Open Mission Dashboard**

## 15. Documentation section

The landing page should provide access to relevant project information:

- Mission objectives
- SomaiyaSat and SomaiyaPod architecture
- Payload descriptions
- AI routing methodology
- Ground-station workflow
- Telemetry definitions
- Testing and qualification reports
- Communication protocols
- Regulatory and amateur-radio information

## 16. Contact section

Include a contact area for:

- Project team
- Faculty or institutional coordinator
- Ground-station team
- Collaboration partners
- Technical enquiries

The contact section should provide the appropriate email address or contact form.

## 17. Footer content

The footer should contain:

- SomaiyaSat project name
- SomaiyaPod project name
- Institution and team information
- Links to the Mission Dashboard and documentation
- Contact information
- Copyright or project ownership information

## 18. Functional requirements

- The Mission Dashboard button must open the correct dashboard route.
- The page must clearly distinguish live, simulated, test, and historical data.
- Mission-status information should support periodic refresh when connected to a backend.
- Documentation links must open the relevant document or resource.
- Restricted mission actions must require authentication inside the dashboard.
- The page must remain informative even when live satellite data is unavailable.
- All terminology should be consistent with the Mission Dashboard, especially names for payload modes, subsystem states, alerts, and mission phases.

## 19. Suggested page order

1. Navigation
2. Hero section
3. Mission status summary
4. Mission overview
5. System architecture
6. Core capabilities
7. AI decision workflow
8. Communication modes
9. Mission objectives
10. Mission metrics
11. Mission Dashboard invitation
12. Documentation
13. Contact
14. Footer

## 20. Landing-page success criteria

The landing page is successful if a new visitor can answer these questions quickly:

- What is SomaiyaSat?
- What is SomaiyaPod?
- What problem does the platform solve?
- What does the AI Decision Engine do?
- Which communication modes are supported?
- How does the system connect to the ground station?
- Where can an authorised user open the Mission Dashboard?

