# Cyber Risk Platform - Complete Solution

A comprehensive cybersecurity risk assessment platform combining a powerful Python backend with a modern React frontend.

## 📋 Project Structure

```
cyber-risk-web/
├── src/                          # React frontend source
│   ├── pages/                    # Dashboard, Assets, Vulnerabilities, etc.
│   ├── components/               # UI components (shadcn/ui)
│   ├── api/                      # API integration
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utilities and helpers
│   └── index.css                 # Tailwind CSS styles
├── backend/                      # Python risk calculation engine
│   ├── models/                   # Data models (Asset, Vulnerability, RiskScenario)
│   ├── parsers/                  # Log parsers (Syslog, Windows, M365, Defender)
│   ├── engines/                  # Risk calculation engine
│   ├── core/                     # Orchestrator and main logic
│   ├── examples/                 # Usage examples
│   └── requirements.txt          # Python dependencies
├── vite.config.ts                # Vite configuration
├── package.json                  # Node.js dependencies
└── tsconfig.json                 # TypeScript configuration
```

## 🚀 Quick Start

### Frontend Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

### Backend Setup

```bash
# Create virtual environment
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies (optional - uses Python stdlib only)
pip install -r requirements.txt

# Run example
python examples/example_usage.py
```

## 🎯 Features

### Frontend
- **Dashboard**: Real-time risk metrics and correlations
- **Asset Inventory**: Complete asset discovery and management
- **Risk Scenarios**: Multi-stage attack chains and lateral movement paths
- **Vulnerabilities**: Detailed vulnerability tracking and analysis
- **Correlation Analysis**: Event correlation and threat detection
- **Executive Reports**: Comprehensive risk assessment reports

### Backend
- **Multi-Source Log Processing**
  - Syslog (RFC 3164/5424)
  - Windows Event Logs (EVTX/JSON)
  - Microsoft 365 Audit Logs
  - Microsoft Defender Alerts

- **Vulnerability Detection**
  - Brute force attacks
  - Malware infections
  - Suspicious process executions
  - Data exfiltration attempts
  - Privilege escalation
  - Lateral movement indicators

- **Dynamic Risk Scoring**
  - CVSS-weighted vulnerability scoring
  - Asset criticality assessment
  - Exploitability analysis
  - Threat intelligence integration
  - Environmental factor analysis

- **Risk Scenario Generation**
  - Multi-stage attack chains
  - Lateral movement paths
  - Data breach scenarios
  - MITRE ATT&CK mapping

## 🔧 Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **React Router** - Navigation
- **React Query** - Data fetching
- **Framer Motion** - Animations
- **Recharts** - Data visualization

### Backend
- **Python 3.8+** - Runtime
- **Dataclasses** - Type-safe models
- **Standard Library** - No external dependencies for core functionality

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

## 🔌 Integration

### API Integration

The frontend is configured to communicate with the backend through a REST API. Update the API endpoints in `src/api/demo.ts` to point to your backend server.

### Backend API Example

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
```

## 📈 Output Formats

### JSON Export
- `assets.json` - All discovered and configured assets
- `vulnerabilities.json` - All detected vulnerabilities
- `risk_scenarios.json` - Generated risk scenarios
- `risk_summary.json` - Executive summary

### Frontend Integration
The exported JSON files are compatible with the React frontend data structures for seamless integration.

## 🔐 Security Features

- **MITRE ATT&CK Mapping** - Maps detected activities to tactics and techniques
- **Attack Chain Detection** - Identifies multi-stage attack patterns
- **Lateral Movement Analysis** - Detects potential network traversal
- **Data Exfiltration Detection** - Flags unusual data access patterns
- **Privilege Escalation Tracking** - Monitors elevation attempts

## 📝 Development Workflow

1. **Frontend Development**
   ```bash
   pnpm dev
   ```

2. **Backend Development**
   ```bash
   cd backend
   python examples/example_usage.py
   ```

3. **Build for Production**
   ```bash
   pnpm build
   ```

## 🚧 Future Enhancements

- [ ] Machine learning for anomaly detection
- [ ] Real-time streaming log processing
- [ ] Integration with SIEM platforms
- [ ] Automated remediation workflows
- [ ] Custom rule engine
- [ ] API endpoints for external integrations
- [ ] WebSocket support for real-time updates
- [ ] Advanced visualization dashboards

## 📄 License

This project is provided as-is for cybersecurity risk assessment purposes.

## 🤝 Contributing

This is a demonstration platform. For production use, consider:
- Adding proper error handling and logging
- Implementing log rotation and archival
- Setting up authentication and authorization
- Configuring monitoring and alerting
- Performance optimization for large log volumes
- Database integration for data persistence

## 📞 Support

For questions or issues, please refer to the documentation in the `backend/` directory and the example usage scripts.
