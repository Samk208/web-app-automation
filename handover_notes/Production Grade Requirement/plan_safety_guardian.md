# Production Upgrade Plan: Safety Guardian (Smart Factory)

## 1. Goal
Upgrade the **Safety Guardian** agent from a basic log analyzer to a comprehensive **ISO 45001-compliant AI Safety Officer**. The agent will move beyond reactive logging to **predictive hazard detection**, real-time IoT integration, and automated regulatory compliance reporting.

## 2. Production Grade Requirements

### A. Core Features
1.  **Real-Time IoT Stream Integration**:
    *   Ingest simulated sensor data (temperature, vibration, noise, air quality) via MQTT or WebSocket or Supabase Realtime.
    *   **Predictive Maintenance (PdM)**: Analyze sensor trends to predict equipment failure (e.g., "Vibrometers on Conveyor Belt A indicate bearing failure in 48h").
2.  **ISO 45001 Compliance Automator**:
    *   Auto-generate safety audit logs mapped to specific ISO clauses (e.g., Clause 6.1.2 Hazard identification).
    *   Maintain a "Digital Safety Logbook" that is audit-ready and tamper-evident (using immutable database logs).
3.  **Computer Vision Safety Checks (Simulated)**:
    *   Capability to process "image snapshots" (base64 or URL) to detect PPE violations (e.g., missing helmet) or unsafe zones.
4.  **Critical Alert Escalation**:
    *   Multi-channel alerts: Application Dashboard + Email + automated "Emergency Stop" signal simulation (webhook).

### B. Advanced Capabilities
*   **Behavioral Anomaly Detection**: Analyze worker movement patterns (simulated data) to identify fatigue or unsafe shortcuts.
*   **Dynamic Risk Assessment**: Calculate a real-time "Plant Safety Score" (0-100) based on active hazards and sensor readings.

## 3. Tech Stack & APIs
*   **Database**: Supabase `safety_logs` (enhanced), new `sensor_readings` table (TimeSeries optimized or standard table with partitioning).
*   **AI Model**: Gemini 1.5 Flash (for high-frequency log analysis) + Perplexity (for checking latest OSHA/ISO regulation updates).
*   **Integration**:
    *   **Simulated IoT**: Custom Node.js script pumping data to Supabase.
    *   **Vector DB**: Store safety protocols and past incident reports for RAG-based recommendations.

## 4. Implementation Strategy

### Phase 1: Data Ingestion & Schema
1.  Create `sensor_readings` table.
2.  Create `safety_incidents` table with ISO 45001 mapping columns (clause, severity, corrective_action).
3.  Build a simulated IoT generator script (`scripts/mock-iot-stream.ts`) to pump data.

### Phase 2: Predictive Engine
1.  Implement sliding window analysis on sensor data (e.g., last 15 mins).
2.  Create `analyzeHazardTrends` server action using AI to spot anomalies in the stream.
3.  **Critic Loop**: "Safety Auditor" agent reviews AI alerts to prevent false positives (e.g., distinguishing maintenance mode from failure) before dispatching.

### Phase 3: Dashboard & Reporting
1.  Build Real-Time Safety Dashboard (`/dashboard/safety-guardian`).
2.  Visualize "Plant Safety Score" and live sensor charts using Recharts.
3.  Add "One-Click Audit Report" generation (PDF/Markdown) referencing specific ISO clauses.

## 5. Verification Plan
*   **Unit Test**: Feed critical simulation data (e.g., temperature > 80°C) and verify Alert triggered.
*   **Compliance Check**: Generate an audit report and manually verify it cites correct ISO codes.
*   **Latency Test**: Ensure "Critical Stop" alerts are processed < 2 seconds from ingestion.
