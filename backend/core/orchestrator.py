"""
Risk Platform Orchestrator
Main integration point for all log parsers and risk calculation
"""
import json
from typing import List, Dict, Optional
from datetime import datetime

from models.risk_models import Asset, Vulnerability, RiskScenario, AssetCategory, AssetCriticality
from parsers.syslog_parser import SyslogParser
from parsers.windows_event_parser import WindowsEventParser
from parsers.m365_defender_parser import M365DefenderParser
from engines.risk_engine import RiskCalculationEngine


class RiskPlatformOrchestrator:
    """
    Main orchestrator that coordinates log parsing, vulnerability detection,
    and risk calculation across all data sources
    """
    
    def __init__(self):
        # Initialize parsers
        self.syslog_parser = SyslogParser()
        self.windows_parser = WindowsEventParser()
        self.m365_parser = M365DefenderParser()
        
        # Initialize risk engine
        self.risk_engine = RiskCalculationEngine()
        
        # Storage
        self.all_vulnerabilities: Dict[str, Vulnerability] = {}
        self.all_assets: Dict[str, Asset] = {}
        
    def process_syslog_file(self, filepath: str) -> Dict:
        """Process a syslog file"""
        print(f"Processing syslog file: {filepath}")
        
        # Parse events
        events = self.syslog_parser.parse_file(filepath)
        print(f"Parsed {len(events)} syslog events")
        
        # Analyze for vulnerabilities
        vulns = self.syslog_parser.analyze_security_events(events)
        print(f"Detected {len(vulns)} vulnerabilities from syslog")
        
        # Add vulnerabilities to engine
        for vuln in vulns:
            self.all_vulnerabilities[vuln.id] = vuln
            self.risk_engine.add_vulnerability(vuln)
        
        # Update assets from events
        self._update_assets_from_events(events, vulns)
        
        return self.syslog_parser.get_statistics()
    
    def process_windows_events_json(self, filepath: str) -> Dict:
        """Process Windows events in JSON format"""
        print(f"Processing Windows events: {filepath}")
        
        events = []
        try:
            with open(filepath, 'r') as f:
                for line in f:
                    if line.strip():
                        event = self.windows_parser.parse_evtx_json(line)
                        if event:
                            events.append(event)
        except Exception as e:
            print(f"Error reading Windows events: {e}")
        
        print(f"Parsed {len(events)} Windows events")
        
        # Analyze for vulnerabilities
        vulns = self.windows_parser.analyze_security_events(events)
        print(f"Detected {len(vulns)} vulnerabilities from Windows events")
        
        # Add vulnerabilities to engine
        for vuln in vulns:
            self.all_vulnerabilities[vuln.id] = vuln
            self.risk_engine.add_vulnerability(vuln)
        
        # Update assets
        self._update_assets_from_events(events, vulns)
        
        return self.windows_parser.get_statistics()
    
    def process_m365_audit_logs(self, filepath: str) -> Dict:
        """Process M365 audit logs"""
        print(f"Processing M365 audit logs: {filepath}")
        
        events = []
        try:
            with open(filepath, 'r') as f:
                for line in f:
                    if line.strip():
                        event = self.m365_parser.parse_m365_audit_log(line)
                        if event:
                            events.append(event)
        except Exception as e:
            print(f"Error reading M365 logs: {e}")
        
        print(f"Parsed {len(events)} M365 events")
        
        # Analyze for vulnerabilities
        vulns = self.m365_parser.analyze_m365_security(events)
        print(f"Detected {len(vulns)} vulnerabilities from M365")
        
        # Add vulnerabilities to engine
        for vuln in vulns:
            self.all_vulnerabilities[vuln.id] = vuln
            self.risk_engine.add_vulnerability(vuln)
        
        return self.m365_parser.get_statistics()
    
    def process_defender_alerts(self, filepath: str) -> Dict:
        """Process Defender alerts"""
        print(f"Processing Defender alerts: {filepath}")
        
        events = []
        try:
            with open(filepath, 'r') as f:
                for line in f:
                    if line.strip():
                        event = self.m365_parser.parse_defender_alert(line)
                        if event:
                            events.append(event)
        except Exception as e:
            print(f"Error reading Defender alerts: {e}")
        
        print(f"Parsed {len(events)} Defender alerts")
        
        # Convert alerts to vulnerabilities
        vulns = self.m365_parser.analyze_defender_alerts(events)
        print(f"Detected {len(vulns)} vulnerabilities from Defender")
        
        # Add vulnerabilities to engine
        for vuln in vulns:
            self.all_vulnerabilities[vuln.id] = vuln
            self.risk_engine.add_vulnerability(vuln)
        
        return self.m365_parser.get_statistics()
    
    def add_manual_asset(self, asset_data: Dict) -> Asset:
        """Add an asset manually"""
        asset = Asset(
            id=asset_data.get("id"),
            name=asset_data.get("name"),
            category=AssetCategory[asset_data.get("category", "SERVER").upper().replace(" ", "_")],
            ip_address=asset_data.get("ip_address"),
            os=asset_data.get("os"),
            os_version=asset_data.get("os_version"),
            criticality=AssetCriticality[asset_data.get("criticality", "MEDIUM").upper().replace(" ", "_")],
            vulnerability_ids=asset_data.get("vulnerability_ids", []),
            tags=asset_data.get("tags", []),
            owner=asset_data.get("owner"),
            location=asset_data.get("location"),
            exposed_to_internet=asset_data.get("exposed_to_internet", False),
            contains_sensitive_data=asset_data.get("contains_sensitive_data", False),
            patch_level=asset_data.get("patch_level", "Unknown"),
            antivirus_status=asset_data.get("antivirus_status", "Unknown"),
            firewall_enabled=asset_data.get("firewall_enabled", True)
        )
        
        self.all_assets[asset.id] = asset
        self.risk_engine.add_asset(asset)
        return asset
    
    def _update_assets_from_events(self, events, vulnerabilities):
        """Update or create assets based on log events"""
        hostname_map = {}
        
        # Group events by hostname
        for event in events:
            if event.hostname not in hostname_map:
                hostname_map[event.hostname] = []
            hostname_map[event.hostname].append(event)
        
        # Create or update assets
        for hostname, host_events in hostname_map.items():
            asset_id = f"asset_{hostname}"
            
            # Get vulnerabilities for this host
            host_vuln_ids = [
                v.id for v in vulnerabilities 
                if hostname in v.affected_assets
            ]
            
            if asset_id not in self.all_assets:
                # Create new asset
                # Determine OS from events
                os = "Unknown"
                if any(e.source == "windows_event" for e in host_events):
                    os = "Windows"
                elif any(e.source == "syslog" for e in host_events):
                    os = "Linux"
                
                # Determine category
                category = AssetCategory.SERVER
                if "workstation" in hostname.lower() or "desktop" in hostname.lower():
                    category = AssetCategory.WORKSTATION
                elif "db" in hostname.lower() or "database" in hostname.lower():
                    category = AssetCategory.DATABASE
                
                asset = Asset(
                    id=asset_id,
                    name=hostname,
                    category=category,
                    ip_address=host_events[0].ip_address or "Unknown",
                    os=os,
                    vulnerability_ids=host_vuln_ids,
                    tags=["auto-discovered"]
                )
                
                self.all_assets[asset_id] = asset
                self.risk_engine.add_asset(asset)
            else:
                # Update existing asset
                asset = self.all_assets[asset_id]
                # Add new vulnerabilities
                asset.vulnerability_ids = list(set(asset.vulnerability_ids + host_vuln_ids))
                asset.last_scan_date = datetime.now()
    
    def calculate_all_risks(self) -> Dict:
        """Calculate risk for all assets and generate scenarios"""
        print("\n" + "="*60)
        print("CALCULATING RISK SCORES")
        print("="*60)
        
        # Calculate asset risks
        risk_results = self.risk_engine.calculate_all_assets()
        
        print(f"\nCalculated risk for {len(risk_results)} assets")
        
        # Generate risk scenarios
        scenarios = self.risk_engine.generate_risk_scenarios()
        print(f"Generated {len(scenarios)} risk scenarios")
        
        # Get summary
        summary = self.risk_engine.get_risk_summary()
        
        return {
            "summary": summary,
            "risk_results": risk_results,
            "scenarios": scenarios
        }
    
    def export_to_json(self, output_dir: str = "./output"):
        """Export all data to JSON files compatible with the frontend"""
        import os
        os.makedirs(output_dir, exist_ok=True)
        
        # Export assets
        assets_data = [asset.to_dict() for asset in self.all_assets.values()]
        with open(f"{output_dir}/assets.json", "w") as f:
            json.dump(assets_data, f, indent=2, default=str)
        
        # Export vulnerabilities
        vulns_data = [vuln.to_dict() for vuln in self.all_vulnerabilities.values()]
        with open(f"{output_dir}/vulnerabilities.json", "w") as f:
            json.dump(vulns_data, f, indent=2, default=str)
        
        # Export risk scenarios
        scenarios_data = [scenario.to_dict() for scenario in self.risk_engine.risk_scenarios]
        with open(f"{output_dir}/risk_scenarios.json", "w") as f:
            json.dump(scenarios_data, f, indent=2, default=str)
        
        # Export summary
        summary = self.risk_engine.get_risk_summary()
        with open(f"{output_dir}/risk_summary.json", "w") as f:
            json.dump(summary, f, indent=2)
        
        print(f"\nExported data to {output_dir}/")
        print(f"  - assets.json ({len(assets_data)} assets)")
        print(f"  - vulnerabilities.json ({len(vulns_data)} vulnerabilities)")
        print(f"  - risk_scenarios.json ({len(scenarios_data)} scenarios)")
        print(f"  - risk_summary.json")
    
    def generate_report(self) -> str:
        """Generate a text report"""
        summary = self.risk_engine.get_risk_summary()
        
        report = []
        report.append("="*70)
        report.append("CYBER RISK ASSESSMENT REPORT")
        report.append("="*70)
        report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")
        
        report.append("EXECUTIVE SUMMARY")
        report.append("-"*70)
        report.append(f"Total Assets: {summary['total_assets']}")
        report.append(f"Total Vulnerabilities: {summary['total_vulnerabilities']}")
        report.append(f"Average Risk Score: {summary['average_risk_score']:.1f}/100")
        report.append("")
        
        report.append("RISK DISTRIBUTION")
        report.append("-"*70)
        report.append(f"Critical Risk Assets (90-100): {summary['critical_assets']}")
        report.append(f"High Risk Assets (70-89): {summary['high_risk_assets']}")
        report.append(f"Medium Risk Assets (40-69): {summary['medium_risk_assets']}")
        report.append(f"Low Risk Assets (0-39): {summary['low_risk_assets']}")
        report.append("")
        
        report.append("RISK SCENARIOS")
        report.append("-"*70)
        report.append(f"Total Risk Scenarios Identified: {summary['risk_scenarios']}")
        
        if self.risk_engine.risk_scenarios:
            report.append("\nTop Risk Scenarios:")
            for i, scenario in enumerate(self.risk_engine.risk_scenarios[:5], 1):
                report.append(f"\n{i}. {scenario.title}")
                report.append(f"   Severity: {scenario.severity.value}")
                report.append(f"   Business Risk Score: {scenario.business_risk_score:.1f}")
                report.append(f"   Affected Assets: {len(scenario.affected_asset_ids)}")
        
        report.append("\n" + "="*70)
        
        return "\n".join(report)
