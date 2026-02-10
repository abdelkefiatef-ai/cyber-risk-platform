# Integration Guide: Risk Calculation Engine → React Frontend

This guide explains how to integrate the Python risk calculation engine with your existing React/TypeScript frontend.

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│         Log Sources (Input)                 │
│  - Syslog files                            │
│  - Windows Event Logs (JSON)               │
│  - M365 Audit Logs                         │
│  - Defender Alerts                         │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│    Python Risk Calculation Engine           │
│  - Parse logs                              │
│  - Detect vulnerabilities                  │
│  - Calculate risk scores                   │
│  - Generate scenarios                      │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│       JSON Output Files                     │
│  - assets.json                             │
│  - vulnerabilities.json                    │
│  - risk_scenarios.json                     │
│  - risk_summary.json                       │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│    React/TypeScript Frontend                │
│  - Load JSON files                         │
│  - Display risk data                       │
│  - Interactive visualizations              │
└─────────────────────────────────────────────┘
```

## Step 1: Run the Risk Engine

### Manual Execution

```bash
cd enhanced_risk_platform
python examples/example_usage.py
```

This generates JSON files in `./output/`:
- `assets.json`
- `vulnerabilities.json`
- `risk_scenarios.json`
- `risk_summary.json`

### Custom Script

```python
from core.orchestrator import RiskPlatformOrchestrator

orchestrator = RiskPlatformOrchestrator()

# Process your actual log files
orchestrator.process_syslog_file("/var/log/syslog")
orchestrator.process_windows_events_json("/logs/windows_security.json")
orchestrator.process_m365_audit_logs("/logs/m365_audit.json")
orchestrator.process_defender_alerts("/logs/defender_alerts.json")

# Calculate risks
orchestrator.calculate_all_risks()

# Export to your frontend's data directory
orchestrator.export_to_json("../src/data/generated")
```

## Step 2: Update Frontend Data Layer

### Option A: Direct Import (Static Build)

Update `src/data/index.ts`:

```typescript
// Import generated data
import generatedAssets from './generated/assets.json';
import generatedVulnerabilities from './generated/vulnerabilities.json';
import generatedScenarios from './generated/risk_scenarios.json';

// Use generated data instead of mocks
export const mockAssets: Asset[] = generatedAssets;
export const mockVulnerabilities: Vulnerability[] = generatedVulnerabilities;
export const mockRiskScenarios: RiskScenario[] = generatedScenarios;
```

### Option B: API Endpoint (Dynamic)

Create an API endpoint to serve the data:

```typescript
// src/api/riskData.ts
export async function fetchRiskData() {
  const [assets, vulnerabilities, scenarios] = await Promise.all([
    fetch('/api/assets').then(r => r.json()),
    fetch('/api/vulnerabilities').then(r => r.json()),
    fetch('/api/risk-scenarios').then(r => r.json()),
  ]);
  
  return { assets, vulnerabilities, scenarios };
}

// Update useRiskData hook
export function useRiskData() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchRiskData()
      .then(setData)
      .finally(() => setIsLoading(false));
  }, []);
  
  return { ...data, isLoading };
}
```

## Step 3: Type Compatibility

The Python engine generates data that matches your existing TypeScript interfaces:

### Asset Type Mapping

Python → TypeScript:
```python
# Python (risk_models.py)
@dataclass
class Asset:
    id: str
    name: str
    category: AssetCategory
    ip_address: str
    # ... etc
```

```typescript
// TypeScript (lib/index.ts)
interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  ipAddress: string;  // Note: camelCase in JSON output
  // ... etc
}
```

The `to_dict()` methods in Python automatically convert to camelCase for JSON compatibility.

## Step 4: Scheduled Updates

### Cron Job (Linux/Mac)

```bash
# Edit crontab
crontab -e

# Add line to run every hour
0 * * * * cd /path/to/enhanced_risk_platform && python3 examples/example_usage.py >> /var/log/risk_calc.log 2>&1
```

### Windows Task Scheduler

1. Create task to run `python examples/example_usage.py`
2. Set schedule (e.g., every hour)
3. Configure output directory

### Docker Container

```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY enhanced_risk_platform/ /app/

# Run on container start
CMD ["python", "examples/example_usage.py"]
```

```yaml
# docker-compose.yml
version: '3'
services:
  risk-engine:
    build: .
    volumes:
      - ./logs:/logs
      - ./output:/app/output
    environment:
      - SYSLOG_PATH=/logs/syslog
      - WINDOWS_EVENTS_PATH=/logs/windows.json
```

## Step 5: Real-time Integration

### WebSocket Updates (Advanced)

```python
# backend/websocket_server.py
import asyncio
import websockets
import json
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class OutputFileHandler(FileSystemEventHandler):
    def __init__(self, websocket):
        self.websocket = websocket
    
    def on_modified(self, event):
        if event.src_path.endswith('.json'):
            # Send updated data to frontend
            with open(event.src_path) as f:
                data = json.load(f)
            asyncio.run(self.websocket.send(json.dumps(data)))

async def serve(websocket, path):
    # Watch output directory
    observer = Observer()
    observer.schedule(OutputFileHandler(websocket), './output')
    observer.start()
    
    # Keep connection alive
    await websocket.wait_closed()
```

```typescript
// frontend/src/hooks/useRealtimeRisk.ts
export function useRealtimeRisk() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000');
    
    ws.onmessage = (event) => {
      const updated = JSON.parse(event.data);
      setData(updated);
    };
    
    return () => ws.close();
  }, []);
  
  return data;
}
```

## Step 6: Backend API (Node.js/Express)

```javascript
// server.js
const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');

const app = express();

// Trigger risk calculation
app.post('/api/calculate-risk', async (req, res) => {
  const python = spawn('python3', ['examples/example_usage.py']);
  
  python.on('close', (code) => {
    if (code === 0) {
      // Read generated files
      const assets = JSON.parse(fs.readFileSync('./output/assets.json'));
      const vulnerabilities = JSON.parse(fs.readFileSync('./output/vulnerabilities.json'));
      const scenarios = JSON.parse(fs.readFileSync('./output/risk_scenarios.json'));
      
      res.json({ assets, vulnerabilities, scenarios });
    } else {
      res.status(500).json({ error: 'Risk calculation failed' });
    }
  });
});

// Serve static data
app.get('/api/assets', (req, res) => {
  res.sendFile(__dirname + '/output/assets.json');
});

app.listen(3001);
```

## Step 7: Supabase Integration

If you're using Supabase (as indicated by the `supabase/` directory):

```typescript
// src/api/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function uploadRiskData() {
  // Read generated files
  const assets = await fetch('/output/assets.json').then(r => r.json());
  const vulnerabilities = await fetch('/output/vulnerabilities.json').then(r => r.json());
  
  // Upload to Supabase
  await supabase.from('assets').upsert(assets);
  await supabase.from('vulnerabilities').upsert(vulnerabilities);
}

export async function fetchRiskDataFromSupabase() {
  const { data: assets } = await supabase.from('assets').select('*');
  const { data: vulnerabilities } = await supabase.from('vulnerabilities').select('*');
  
  return { assets, vulnerabilities };
}
```

## Step 8: Testing Integration

```typescript
// src/__tests__/integration.test.ts
import { describe, it, expect } from 'vitest';
import assets from '../data/generated/assets.json';
import { Asset } from '../lib/index';

describe('Risk Data Integration', () => {
  it('should load assets with correct structure', () => {
    expect(assets).toBeInstanceOf(Array);
    expect(assets[0]).toHaveProperty('id');
    expect(assets[0]).toHaveProperty('riskScore');
  });
  
  it('should have valid risk scores', () => {
    assets.forEach((asset: Asset) => {
      expect(asset.riskScore).toBeGreaterThanOrEqual(0);
      expect(asset.riskScore).toBeLessThanOrEqual(100);
    });
  });
});
```

## Common Integration Patterns

### Pattern 1: Batch Processing (Recommended for MVP)
```
Logs → Python Script (scheduled) → JSON Files → Frontend Import
```

### Pattern 2: API-Driven
```
Logs → Python Script → Database → REST API → Frontend
```

### Pattern 3: Event-Driven
```
Logs → Python Script → WebSocket → Frontend (real-time)
```

### Pattern 4: Serverless
```
Logs → S3/Blob → Lambda/Function → Database → Frontend
```

## Troubleshooting

### Issue: JSON data not updating
**Solution**: Check file paths and permissions. Ensure Python script has write access to output directory.

### Issue: Type mismatches
**Solution**: Verify the `to_dict()` methods use camelCase. Check TypeScript interfaces match JSON structure.

### Issue: Large file sizes
**Solution**: Implement pagination or filtering in the risk engine. Only export top N assets/vulnerabilities.

### Issue: Performance
**Solution**: Use incremental updates. Cache results. Implement database storage instead of flat files.

## Production Checklist

- [ ] Set up automated log collection
- [ ] Configure scheduled risk calculations
- [ ] Implement error handling and logging
- [ ] Set up monitoring for the Python process
- [ ] Configure backup for output files
- [ ] Implement authentication for API endpoints
- [ ] Set up CORS if using separate domains
- [ ] Add rate limiting
- [ ] Configure log rotation
- [ ] Set up alerting for high-risk scenarios

## Next Steps

1. Choose an integration pattern (start with batch processing)
2. Configure log collection from your sources
3. Set up scheduled execution
4. Update frontend to consume generated data
5. Test with real log data
6. Monitor and optimize

## Support

For questions about integration:
1. Check the example scripts in `examples/`
2. Review the data models in `models/risk_models.py`
3. Examine the JSON output structure
4. Refer to the main README for architecture details
