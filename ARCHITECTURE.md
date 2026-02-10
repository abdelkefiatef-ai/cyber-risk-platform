# Enhanced Risk Platform Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LOG SOURCES (INPUT)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────┐  ┌────────────────┐    │
│  │   Syslog     │  │ Windows Event │  │   M365   │  │   Defender     │    │
│  │   Files      │  │   Logs (JSON) │  │  Audit   │  │    Alerts      │    │
│  └──────┬───────┘  └───────┬───────┘  └────┬─────┘  └────────┬───────┘    │
│         │                   │               │                  │             │
└─────────┼───────────────────┼───────────────┼──────────────────┼─────────────┘
          │                   │               │                  │
          ▼                   ▼               ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PARSERS LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  SyslogParser                                                       │    │
│  │  ─────────────                                                      │    │
│  │  • Parse RFC 3164/5424 format                                      │    │
│  │  • Detect failed logins (brute force)                              │    │
│  │  • Identify port scanning                                          │    │
│  │  • Find malware signatures                                         │    │
│  │  • Flag suspicious commands                                        │    │
│  │  ────────────────────────────────────────────────────────────────► │    │
│  │  Output: LogEvent objects, Vulnerability objects                   │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  WindowsEventParser                                                 │    │
│  │  ───────────────────                                               │    │
│  │  • Parse 30+ Event IDs (4625, 4688, 1102, etc.)                   │    │
│  │  • Detect failed authentication                                    │    │
│  │  • Identify privilege escalation                                   │    │
│  │  • Flag suspicious processes                                       │    │
│  │  • Alert on log clearing                                           │    │
│  │  ────────────────────────────────────────────────────────────────► │    │
│  │  Output: LogEvent objects, Vulnerability objects                   │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  M365DefenderParser                                                 │    │
│  │  ───────────────────                                               │    │
│  │  • Parse M365 Unified Audit Logs                                   │    │
│  │  • Analyze 20+ critical operations                                 │    │
│  │  • Detect data exfiltration                                        │    │
│  │  • Identify suspicious inbox rules                                 │    │
│  │  • Convert Defender alerts                                         │    │
│  │  ────────────────────────────────────────────────────────────────► │    │
│  │  Output: LogEvent objects, Vulnerability objects                   │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ORCHESTRATOR LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  RiskPlatformOrchestrator                                                   │
│  ─────────────────────────                                                  │
│  • Coordinate all parsers                                                   │
│  • Collect vulnerabilities from all sources                                 │
│  • Map vulnerabilities to assets                                            │
│  • Auto-discover assets from logs                                           │
│  • Trigger risk calculations                                                │
│                                                                               │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       RISK CALCULATION ENGINE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  Risk Score = (Vuln × 35%) + (Exploit × 25%) +                     │    │
│  │               (Criticality × 20%) + (Exposure × 10%) +             │    │
│  │               (ThreatIntel × 10%)                                   │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
│  Step 1: Calculate Vulnerability Risk                                       │
│  ────────────────────────────────────                                       │
│  ┌──────────────────────────────────────────────────────┐                  │
│  │  • CVSS base score (0-10) × 10 = base points        │                  │
│  │  • Severity multiplier (Critical=1.0, High=0.8)     │                  │
│  │  • Exploit factor (Public=1.5x, Available=1.3x)     │                  │
│  │  • Patch factor (Available=0.7x, None=1.0x)         │                  │
│  │  • Attack vector (Network=1.3x, Local=0.9x)         │                  │
│  │  • Threat intel (Active=1.5x, None=1.0x)            │                  │
│  └──────────────────────────────────────────────────────┘                  │
│                           ↓                                                  │
│  Step 2: Calculate Exposure Risk                                            │
│  ────────────────────────────────                                           │
│  ┌──────────────────────────────────────────────────────┐                  │
│  │  • Internet-facing: +30 points                       │                  │
│  │  • Sensitive data: +25 points                        │                  │
│  │  • Patch level: 0-30 points                          │                  │
│  │  • Antivirus status: 0-20 points                     │                  │
│  │  • Firewall disabled: +15 points                     │                  │
│  └──────────────────────────────────────────────────────┘                  │
│                           ↓                                                  │
│  Step 3: Apply Asset Criticality                                            │
│  ─────────────────────────────────                                          │
│  ┌──────────────────────────────────────────────────────┐                  │
│  │  • Mission Critical: 2.0x multiplier                 │                  │
│  │  • High: 1.5x multiplier                             │                  │
│  │  • Medium: 1.0x multiplier                           │                  │
│  │  • Low: 0.5x multiplier                              │                  │
│  └──────────────────────────────────────────────────────┘                  │
│                           ↓                                                  │
│  Step 4: Generate Risk Scenarios                                            │
│  ────────────────────────────────                                           │
│  ┌──────────────────────────────────────────────────────┐                  │
│  │  • Find vulnerability chains                         │                  │
│  │  • Identify lateral movement paths                   │                  │
│  │  • Map internet-exposed critical assets              │                  │
│  │  • Calculate business impact                         │                  │
│  │  • Apply MITRE ATT&CK framework                      │                  │
│  └──────────────────────────────────────────────────────┘                  │
│                           ↓                                                  │
│  Step 5: Generate Recommendations                                           │
│  ─────────────────────────────────────                                      │
│  ┌──────────────────────────────────────────────────────┐                  │
│  │  • Prioritize critical vulnerabilities               │                  │
│  │  • Suggest patching order                            │                  │
│  │  • Recommend network controls                        │                  │
│  │  • Identify defense gaps                             │                  │
│  └──────────────────────────────────────────────────────┘                  │
│                                                                               │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           OUTPUT LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  JSON Export (Frontend Compatible)                                          │
│  ──────────────────────────────────                                         │
│                                                                               │
│  ┌────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐     │
│  │  assets.json   │  │ vulnerabilities.json│  │ risk_scenarios.json │     │
│  ├────────────────┤  ├─────────────────────┤  ├─────────────────────┤     │
│  │ [              │  │ [                   │  │ [                   │     │
│  │   {            │  │   {                 │  │   {                 │     │
│  │     id,        │  │     id,             │  │     id,             │     │
│  │     name,      │  │     cveId,          │  │     title,          │     │
│  │     riskScore, │  │     severity,       │  │     severity,       │     │
│  │     ...        │  │     cvssScore,      │  │     businessRisk,   │     │
│  │   }            │  │     ...             │  │     ...             │     │
│  │ ]              │  │   }                 │  │   }                 │     │
│  │                │  │ ]                   │  │ ]                   │     │
│  └────────────────┘  └─────────────────────┘  └─────────────────────┘     │
│                                                                               │
│  Text Report                                                                 │
│  ────────────                                                                │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  CYBER RISK ASSESSMENT REPORT                                      │    │
│  │  ═══════════════════════════════                                   │    │
│  │                                                                     │    │
│  │  EXECUTIVE SUMMARY                                                 │    │
│  │  ─────────────────                                                 │    │
│  │  Total Assets: 15                                                  │    │
│  │  Total Vulnerabilities: 23                                         │    │
│  │  Average Risk Score: 67.3/100                                      │    │
│  │                                                                     │    │
│  │  RISK DISTRIBUTION                                                 │    │
│  │  ─────────────────                                                 │    │
│  │  Critical: 3    High: 5    Medium: 4    Low: 3                    │    │
│  │                                                                     │    │
│  │  TOP RISK SCENARIOS                                                │    │
│  │  ──────────────────                                                │    │
│  │  1. Internet-Facing Asset Compromise...                           │    │
│  │  2. Multi-Stage Exploitation...                                    │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND INTEGRATION                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  React/TypeScript Frontend (Your Existing Code)                             │
│  ───────────────────────────────────────────────                            │
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  import assets from './data/assets.json'                           │    │
│  │  import vulnerabilities from './data/vulnerabilities.json'         │    │
│  │  import scenarios from './data/risk_scenarios.json'                │    │
│  │                                                                     │    │
│  │  // Works with existing components!                                │    │
│  │  <AssetRiskCard asset={assets[0]} />                               │    │
│  │  <VulnerabilityCard vulnerability={vulnerabilities[0]} />          │    │
│  │  <RiskScenarioCard riskScenario={scenarios[0]} />                  │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
│  Components (No Changes Needed!)                                            │
│  ────────────────────────────────                                           │
│  • RiskCards.tsx        ✓ Compatible                                       │
│  • Assets.tsx           ✓ Compatible                                       │
│  • Vulnerabilities.tsx  ✓ Compatible                                       │
│  • RiskScenarios.tsx    ✓ Compatible                                       │
│  • useRiskData hook     ✓ Compatible                                       │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Example

```
Real-World Attack Sequence
──────────────────────────

1. Attacker attempts SSH brute force
   192.168.1.100 → WEB-PROD-01
   
   ↓ Logged to syslog

2. SyslogParser detects pattern
   "Failed password for admin from 192.168.1.100" × 6
   
   ↓ Creates Vulnerability

3. Vulnerability: Brute Force Attack
   • CVE: None (behavioral)
   • Severity: High
   • CVSS: 7.5
   • Exploit Public: Yes
   • Affected Asset: WEB-PROD-01
   
   ↓ Linked to Asset

4. Asset: WEB-PROD-01
   • Category: Server
   • Criticality: Mission Critical
   • Internet Exposed: Yes
   • Vulnerabilities: [vuln_bruteforce_xxx]
   
   ↓ Risk Calculation

5. Risk Engine Calculates:
   • Vuln Risk: (7.5/10 × 100) × 0.8 (High) × 1.5 (Public Exploit) = 90
   • Exposure: 30 (Internet) + 25 (Sensitive) + 15 (Outdated) = 70
   • Total: (90×0.35 + 70×0.10 + 90×2.0×0.20) × 2.0 = 94.3/100
   
   ↓ Scenario Generation

6. Risk Scenario Created:
   • Title: "Internet-Facing Asset Compromise"
   • Severity: Critical
   • Business Risk: 95.0
   • MITRE: Initial Access (T1190), Credential Access
   
   ↓ Export to JSON

7. Frontend Displays:
   • Asset card shows Risk Score: 94/100 (red)
   • Vulnerability card shows brute force attack
   • Scenario card shows remediation plan
   
   ↓ Action Taken

8. Admin patches system, enables 2FA
   • Next calculation shows Risk: 35/100 (yellow)
   • Continuous improvement!
```

## Key Architectural Decisions

1. **Parser Independence**
   - Each parser operates independently
   - Easy to add new log sources
   - Failures isolated to single parser

2. **Centralized Risk Engine**
   - Single source of truth for calculations
   - Consistent methodology
   - Easy to adjust weights/formulas

3. **Orchestrator Pattern**
   - Coordinates all components
   - Manages data flow
   - Handles integration

4. **JSON Output**
   - Frontend-agnostic
   - Easy to integrate
   - Human-readable

5. **No External Dependencies**
   - Uses Python stdlib only
   - Easy deployment
   - Minimal attack surface

6. **Type Safety**
   - Dataclasses for structure
   - Clear interfaces
   - Reduced bugs
