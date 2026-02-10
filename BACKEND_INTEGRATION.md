# Backend Integration Guide

This document describes how to integrate the Python backend with the React frontend.

## Architecture

```
┌─────────────────────┐
│   React Frontend    │
│  (Port 3000/5173)   │
└──────────┬──────────┘
           │ HTTP/REST
           ▼
┌─────────────────────┐
│  Python API Server  │
│  (Port 5000)        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Risk Analysis Engine│
│ (Python Backend)    │
└─────────────────────┘
```

## Setup Instructions

### 1. Start the Backend API Server

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install optional dependencies (if needed)
pip install -r requirements.txt

# Start the API server
python api_server.py
```

The API server will start on `http://localhost:5000`

### 2. Configure Frontend API URL

The frontend is configured to connect to the backend at `http://localhost:5000/api`.

To change this, update the `API_BASE_URL` in `src/api/riskAnalysis.ts`:

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
```

Or set the environment variable:

```bash
export REACT_APP_API_URL=http://your-backend-url:5000/api
```

### 3. Start the Frontend

```bash
pnpm install
pnpm dev
```

The frontend will start on `http://localhost:3000` (or the next available port)

## Available API Endpoints

### Health Check
- **GET** `/api/health` - Check if the backend is running
  ```json
  {
    "status": "ok",
    "timestamp": "2026-02-10T08:44:00.000Z"
  }
  ```

### Assets
- **GET** `/api/assets` - Get all discovered assets
  ```json
  {
    "assets": [
      {
        "id": "web_server_01",
        "name": "WEB-PROD-01",
        "category": "Server",
        "ip_address": "10.0.1.45",
        "os": "Ubuntu 22.04",
        "criticality": "Mission Critical",
        "exposed_to_internet": true,
        "contains_sensitive_data": true,
        "patch_level": "Outdated",
        "risk_score": 85.5
      }
    ]
  }
  ```

### Vulnerabilities
- **GET** `/api/vulnerabilities` - Get all detected vulnerabilities
  ```json
  {
    "vulnerabilities": [
      {
        "id": "vuln_001",
        "name": "Unpatched SSH Service",
        "severity": "High",
        "cvss_score": 7.5,
        "affected_assets": ["web_server_01"],
        "description": "SSH service is running outdated version",
        "remediation": "Update SSH to latest version"
      }
    ]
  }
  ```

### Risk Scenarios
- **GET** `/api/risk-scenarios` - Get generated risk scenarios
  ```json
  {
    "scenarios": [
      {
        "id": "scenario_001",
        "name": "Internet-Facing Asset Compromise",
        "severity": "Critical",
        "business_risk_score": 95.0,
        "affected_assets": ["web_server_01"],
        "attack_chain": ["Initial Access", "Privilege Escalation", "Data Exfiltration"],
        "mitre_techniques": ["T1190", "T1548", "T1020"]
      }
    ]
  }
  ```

### Risk Summary
- **GET** `/api/risk-summary` - Get overall risk assessment summary
  ```json
  {
    "total_assets": 15,
    "total_vulnerabilities": 23,
    "average_risk_score": 67.3,
    "critical_risks": 3,
    "high_risks": 5,
    "medium_risks": 4,
    "low_risks": 3,
    "last_scan_date": "2026-02-10T08:40:00.000Z"
  }
  ```

### Run Analysis
- **POST** `/api/analyze` - Run risk analysis on uploaded logs
  ```bash
  curl -X POST http://localhost:5000/api/analyze \
    -H "Content-Type: application/json" \
    -d '{
      "logs": [
        {
          "type": "syslog",
          "content": "<38>Feb 10 14:23:15 web-server sshd[1234]: Failed password for admin from 192.168.1.100"
        }
      ]
    }'
  ```

## Frontend Integration

The frontend uses the `src/api/riskAnalysis.ts` module to communicate with the backend.

### Example Usage in Components

```typescript
import { useEffect, useState } from 'react';
import { getAssets, getRiskSummary, Vulnerability } from '@/api/riskAnalysis';

export function Dashboard() {
  const [assets, setAssets] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    // Fetch data from backend
    Promise.all([
      getAssets(),
      getRiskSummary()
    ]).then(([assetsData, summaryData]) => {
      setAssets(assetsData);
      setSummary(summaryData);
    });
  }, []);

  return (
    <div>
      <h1>Risk Summary</h1>
      {summary && (
        <div>
          <p>Total Assets: {summary.total_assets}</p>
          <p>Critical Risks: {summary.critical_risks}</p>
        </div>
      )}
    </div>
  );
}
```

## Data Flow

1. **Frontend** requests data from **Backend API**
2. **Backend API** loads data from `backend/output/` JSON files
3. **Backend API** returns data to **Frontend**
4. **Frontend** displays data in UI components

## Running Analysis

To run a new risk analysis:

1. Prepare log files in the supported formats (Syslog, Windows Events, M365, Defender)
2. Call the backend analysis endpoint with the log data
3. The backend processes the logs and generates risk assessment
4. Results are saved to `backend/output/` directory
5. Frontend fetches and displays the results

## Production Deployment

### Backend Deployment

```bash
# Build for production
cd backend
python api_server.py  # Or use a production WSGI server like Gunicorn

# With Gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 api_server:app
```

### Frontend Deployment

```bash
# Build for production
pnpm build

# The built files are in the dist/ directory
# Deploy to your hosting platform
```

### Environment Variables

Set these environment variables in your production environment:

```bash
REACT_APP_API_URL=https://your-backend-domain.com/api
BACKEND_HOST=0.0.0.0
BACKEND_PORT=5000
```

## Troubleshooting

### Backend not responding
- Check if the API server is running: `curl http://localhost:5000/api/health`
- Verify the port is not blocked by firewall
- Check backend logs for errors

### CORS errors
- The backend API server includes CORS headers for all responses
- If you still get CORS errors, check browser console for specific error messages

### Data not loading
- Verify the backend has processed logs and generated output files
- Check `backend/output/` directory for JSON files
- Ensure the API endpoint URLs are correct

## Support

For more information about the backend, see:
- `backend/README.md` - Backend documentation
- `backend/ARCHITECTURE.md` - Architecture overview
- `backend/INTEGRATION_GUIDE.md` - Integration guide
- `backend/examples/example_usage.py` - Usage examples
