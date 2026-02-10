"""
Cyber Risk Platform - Backend API Server
Provides REST endpoints for the React frontend to access risk analysis data.
"""

import json
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from core.orchestrator import RiskPlatformOrchestrator
from datetime import datetime


class CORSRequestHandler(BaseHTTPRequestHandler):
    """HTTP request handler with CORS support"""
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        try:
            if path == '/api/health':
                self.send_json_response({'status': 'ok', 'timestamp': datetime.now().isoformat()})
            
            elif path == '/api/assets':
                # Load assets from output
                assets_file = os.path.join(os.path.dirname(__file__), 'output', 'assets.json')
                if os.path.exists(assets_file):
                    with open(assets_file, 'r') as f:
                        data = json.load(f)
                    self.send_json_response(data)
                else:
                    self.send_json_response({'assets': []})
            
            elif path == '/api/vulnerabilities':
                # Load vulnerabilities from output
                vuln_file = os.path.join(os.path.dirname(__file__), 'output', 'vulnerabilities.json')
                if os.path.exists(vuln_file):
                    with open(vuln_file, 'r') as f:
                        data = json.load(f)
                    self.send_json_response(data)
                else:
                    self.send_json_response({'vulnerabilities': []})
            
            elif path == '/api/risk-scenarios':
                # Load risk scenarios from output
                scenarios_file = os.path.join(os.path.dirname(__file__), 'output', 'risk_scenarios.json')
                if os.path.exists(scenarios_file):
                    with open(scenarios_file, 'r') as f:
                        data = json.load(f)
                    self.send_json_response(data)
                else:
                    self.send_json_response({'scenarios': []})
            
            elif path == '/api/risk-summary':
                # Load risk summary from output
                summary_file = os.path.join(os.path.dirname(__file__), 'output', 'risk_summary.json')
                if os.path.exists(summary_file):
                    with open(summary_file, 'r') as f:
                        data = json.load(f)
                    self.send_json_response(data)
                else:
                    self.send_json_response({'summary': {}})
            
            else:
                self.send_error(404, 'Not Found')
        
        except Exception as e:
            self.send_error(500, str(e))
    
    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            
            if path == '/api/analyze':
                # Parse request body
                data = json.loads(body)
                
                # Initialize orchestrator
                orchestrator = RiskPlatformOrchestrator()
                
                # Process uploaded logs if provided
                if 'logs' in data:
                    for log_entry in data['logs']:
                        if log_entry['type'] == 'syslog':
                            # Process syslog
                            pass
                        elif log_entry['type'] == 'windows':
                            # Process Windows events
                            pass
                        elif log_entry['type'] == 'm365':
                            # Process M365 logs
                            pass
                        elif log_entry['type'] == 'defender':
                            # Process Defender alerts
                            pass
                
                # Calculate risks
                results = orchestrator.calculate_all_risks()
                
                # Export results
                output_dir = os.path.join(os.path.dirname(__file__), 'output')
                os.makedirs(output_dir, exist_ok=True)
                orchestrator.export_to_json(output_dir)
                
                self.send_json_response({
                    'status': 'success',
                    'message': 'Analysis completed',
                    'results': results
                })
            
            else:
                self.send_error(404, 'Not Found')
        
        except Exception as e:
            self.send_error(500, str(e))
    
    def send_json_response(self, data, status_code=200):
        """Send JSON response with CORS headers"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def log_message(self, format, *args):
        """Suppress default logging"""
        pass


def run_server(host='0.0.0.0', port=5000):
    """Start the API server"""
    server_address = (host, port)
    httpd = HTTPServer(server_address, CORSRequestHandler)
    print(f'Cyber Risk Platform API Server running on http://{host}:{port}')
    print('Available endpoints:')
    print('  GET  /api/health - Server health check')
    print('  GET  /api/assets - Get all assets')
    print('  GET  /api/vulnerabilities - Get all vulnerabilities')
    print('  GET  /api/risk-scenarios - Get risk scenarios')
    print('  GET  /api/risk-summary - Get risk summary')
    print('  POST /api/analyze - Run risk analysis')
    httpd.serve_forever()


if __name__ == '__main__':
    run_server()
