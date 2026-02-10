# Cyber Risk Platform - Enhanced Risk Calculation Engine

A comprehensive cybersecurity risk assessment platform that processes multiple log sources (Syslog, Windows Events, M365, Defender) and calculates dynamic risk scores based on assets, vulnerabilities, and threat intelligence.

## 🎯 Overview

This platform transforms your security logs into actionable risk intelligence by:

1. **Parsing Multiple Log Sources**
   - Syslog (RFC 3164/5424)
   - Windows Event Logs (EVTX/JSON)
   - Microsoft 365 Audit Logs
   - Microsoft Defender Alerts
   - Windows Security Events

2. **Detecting Vulnerabilities**
   - Brute force attacks
   - Malware infections
   - Suspicious process executions
   - Data exfiltration attempts
   - Privilege escalation
   - Lateral movement indicators

3. **Calculating Dynamic Risk Scores**
   - Asset-based risk calculation
   - CVSS-weighted vulnerability scoring
   - Exploitability assessment
   - Threat intelligence integration
   - Environmental factor analysis

4. **Generating Risk Scenarios**
   - Multi-stage attack chains
   - Lateral movement paths
   - Data breach scenarios
   - MITRE ATT&CK mapping

## 📁 Project Structure

```
enhanced_risk_platform/
├── models/
│   ├── __init__.py
│   └── risk_models.py          # Data models (Asset, Vulnerability, RiskScenario)
├── parsers/
│   ├── __init__.py
│   ├── syslog_parser.py        # Syslog event parser
│   ├── windows_event_parser.py # Windows Event Log parser
│   └── m365_defender_parser.py # M365 and Defender parser
├── engines/
│   ├── __init__.py
│   └── risk_engine.py          # Core risk calculation engine
├── core/
│   ├── __init__.py
│   └── orchestrator.py         # Main orchestration layer
├── examples/
│   ├── __init__.py
│   └── example_usage.py        # Complete usage examples
└── README.md
```

## 🚀 Quick Start

### Installation

```bash
# No external dependencies required! Uses Python standard library only.
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Basic Usage

```python
from core.orchestrator import RiskPlatformOrchestrator

# Initialize the platform
orchestrator = RiskPlatformOrchestrator()

# Add assets
asset = orchestrator.add_manual_asset({
    "id": "web_server_01",
    "name": "WEB-PROD-01",
    "category": "Server",
    "ip_address": "10.0.1.45",
    "os": "Ubuntu 22.04",
    "criticality": "Mission Critical",
    "exposed_to_internet": True,
    "contains_sensitive_data": True,
    "patch_level": "Outdated"
})

# Process logs
orchestrator.process_syslog_file("path/to/syslog.log")
orchestrator.process_windows_events_json("path/to/windows_events.json")
orchestrator.process_m365_audit_logs("path/to/m365_audit.json")
orchestrator.process_defender_alerts("path/to/defender_alerts.json")

# Calculate risks
results = orchestrator.calculate_all_risks()

# Export results
orchestrator.export_to_json("./output")

# Generate report
report = orchestrator.generate_report()
print(report)
```

### Run Example

```bash
cd enhanced_risk_platform
python examples/example_usage.py
```

## 🔍 Log Format Requirements

### Syslog
```
<priority>timestamp hostname process[pid]: message
```
Example:
```
<38>Feb 10 14:23:15 web-server sshd[1234]: Failed password for admin from 192.168.1.100
```

### Windows Events (JSON)
```json
{
  "EventID": 4625,
  "TimeCreated": "2024-02-10T14:25:00Z",
  "Computer": "SERVER-01",
  "EventData": {
    "TargetUserName": "administrator",
    "IpAddress": "192.168.1.100"
  }
}
```

### M365 Audit Logs (JSON)
```json
{
  "Id": "audit-001",
  "Operation": "UserLoginFailed",
  "UserId": "user@company.com",
  "CreationTime": "2024-02-10T14:20:00Z",
  "ClientIP": "203.0.113.50",
  "Workload": "AzureActiveDirectory"
}
```

### Defender Alerts (JSON)
```json
{
  "id": "alert-001",
  "title": "Suspicious PowerShell execution",
  "severity": "High",
  "category": "Execution",
  "creationTime": "2024-02-10T14:30:00Z",
  "machineId": "WORKSTATION-01",
  "mitreTechniques": ["T1059.001"]
}
```

## 📊 Risk Calculation Methodology

### Risk Score Components

1. **Vulnerability Severity (35%)**
   - CVSS base score
   - Severity level (Critical, High, Medium, Low)
   - Multiple vulnerabilities weighted

2. **Exploitability (25%)**
   - Public exploit availability
   - Attack vector (Network, Local, etc.)
   - Attack complexity
   - Required privileges

3. **Asset Criticality (20%)**
   - Mission Critical: 2.0x multiplier
   - High: 1.5x multiplier
   - Medium: 1.0x multiplier
   - Low: 0.5x multiplier

4. **Exposure (10%)**
   - Internet-facing: +30 points
   - Sensitive data: +25 points
   - Patch level: 0-30 points
   - Antivirus status: 0-20 points
   - Firewall disabled: +15 points

5. **Threat Intelligence (10%)**
   - Active exploitation in the wild
   - Trending CVEs
   - APT association

### Formula

```
Total Risk = (
    (Vuln_Risk × 0.35) +
    (Exposure_Risk × 0.10) +
    (Vuln_Risk × Criticality × 0.20) +
    (Vuln_Risk × Threat_Intel × 0.10)
) × Criticality_Multiplier
```

Normalized to 0-100 scale.

## 🎯 Detected Security Issues

### From Syslog
- ✅ Brute force authentication attacks
- ✅ Port scanning activity
- ✅ Malware detection
- ✅ Suspicious command execution
- ✅ Firewall blocks and DDoS patterns

### From Windows Events
- ✅ Failed login attempts (Event 4625)
- ✅ Privileged access (Event 4672)
- ✅ Account manipulation (Events 4720, 4722, 4738)
- ✅ Suspicious processes (Event 4688)
- ✅ Audit log clearing (Event 1102)
- ✅ Service installations (Event 7045)

### From M365
- ✅ Failed authentication attempts
- ✅ Mass file downloads (data exfiltration)
- ✅ Suspicious inbox rules
- ✅ Anonymous link creation
- ✅ Security policy modifications

### From Defender
- ✅ Malware alerts
- ✅ Suspicious script execution
- ✅ Behavioral detections
- ✅ MITRE ATT&CK technique mapping

## 📈 Output Formats

### JSON Export
- `assets.json` - All discovered and configured assets
- `vulnerabilities.json` - All detected vulnerabilities
- `risk_scenarios.json` - Generated risk scenarios
- `risk_summary.json` - Executive summary

### Text Report
Comprehensive text report including:
- Executive summary
- Risk distribution
- Top risk scenarios
- Affected assets
- Recommendations

## 🔧 Integration with Existing Frontend

The exported JSON files are compatible with the existing React/TypeScript frontend:

```typescript
// In your React app
import assets from './output/assets.json';
import vulnerabilities from './output/vulnerabilities.json';
import riskScenarios from './output/risk_scenarios.json';

// Data structures match your existing interfaces:
// - Asset
// - Vulnerability
// - RiskScenario
```

## 🏗️ Architecture Highlights

### Key Design Principles

1. **Modular Parser Architecture**
   - Each log source has dedicated parser
   - Parsers are independent and composable
   - Easy to add new log sources

2. **Flexible Risk Engine**
   - Configurable weights and multipliers
   - Extensible calculation methods
   - Threat intelligence integration ready

3. **Event-Driven Correlation**
   - Automatic asset discovery from logs
   - Vulnerability-to-asset mapping
   - Cross-source event correlation

4. **Production-Ready**
   - No external dependencies
   - Type-safe with dataclasses
   - Error handling and validation

## 🔐 Security Features

- **MITRE ATT&CK Mapping** - Maps detected activities to tactics and techniques
- **Attack Chain Detection** - Identifies multi-stage attack patterns
- **Lateral Movement Analysis** - Detects potential network traversal
- **Data Exfiltration Detection** - Flags unusual data access patterns
- **Privilege Escalation Tracking** - Monitors elevation attempts

## 📝 Example Output

```
CYBER RISK ASSESSMENT REPORT
======================================================================
Generated: 2024-02-10 14:45:23

EXECUTIVE SUMMARY
----------------------------------------------------------------------
Total Assets: 15
Total Vulnerabilities: 23
Average Risk Score: 67.3/100

RISK DISTRIBUTION
----------------------------------------------------------------------
Critical Risk Assets (90-100): 3
High Risk Assets (70-89): 5
Medium Risk Assets (40-69): 4
Low Risk Assets (0-39): 3

RISK SCENARIOS
----------------------------------------------------------------------
Total Risk Scenarios Identified: 8

Top Risk Scenarios:

1. Internet-Facing Asset Compromise: WEB-PROD-01
   Severity: Critical
   Business Risk Score: 95.0
   Affected Assets: 1

2. Multi-Stage Exploitation of DB-FINANCE-ALPHA
   Severity: Critical
   Business Risk Score: 88.5
   Affected Assets: 1
```

## 🚧 Future Enhancements

- [ ] Machine learning for anomaly detection
- [ ] Real-time streaming log processing
- [ ] Integration with SIEM platforms
- [ ] Automated remediation workflows
- [ ] Custom rule engine
- [ ] API endpoints for external integrations

## 📄 License

This project is provided as-is for cybersecurity risk assessment purposes.

## 🤝 Contributing

This is a demonstration platform. For production use, consider:
- Adding proper error handling
- Implementing log rotation
- Adding authentication/authorization
- Setting up monitoring and alerting
- Performance optimization for large log volumes

## 📞 Support

For questions or issues, please refer to the example usage scripts and inline documentation.
