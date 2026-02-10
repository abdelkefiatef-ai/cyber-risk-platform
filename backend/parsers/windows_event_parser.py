"""
Windows Event Log Parser
Parses Windows Event Logs (EVTX format) and extracts security information
"""
import json
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import List, Optional, Dict
from models.risk_models import LogEvent, Vulnerability, RiskLevel, VulnerabilitySource


class WindowsEventParser:
    """Parse and analyze Windows Event Logs"""
    
    # Critical Windows Event IDs
    SECURITY_EVENT_IDS = {
        # Authentication Events
        4624: {"name": "Successful Logon", "severity": "Informational"},
        4625: {"name": "Failed Logon", "severity": "Warning"},
        4634: {"name": "Logoff", "severity": "Informational"},
        4648: {"name": "Logon using explicit credentials", "severity": "Warning"},
        4672: {"name": "Special privileges assigned to new logon", "severity": "Warning"},
        
        # Account Management
        4720: {"name": "User account created", "severity": "Notice"},
        4722: {"name": "User account enabled", "severity": "Notice"},
        4724: {"name": "Password reset attempt", "severity": "Warning"},
        4728: {"name": "Member added to security-enabled global group", "severity": "Warning"},
        4732: {"name": "Member added to security-enabled local group", "severity": "Warning"},
        4735: {"name": "Security-enabled local group changed", "severity": "Warning"},
        4738: {"name": "User account changed", "severity": "Notice"},
        4740: {"name": "User account locked out", "severity": "Warning"},
        4756: {"name": "Member added to security-enabled universal group", "severity": "Warning"},
        
        # Process Events
        4688: {"name": "New process created", "severity": "Informational"},
        4689: {"name": "Process exited", "severity": "Informational"},
        
        # Policy Changes
        4719: {"name": "System audit policy changed", "severity": "Alert"},
        4739: {"name": "Domain policy changed", "severity": "Alert"},
        4765: {"name": "SID History added to account", "severity": "Alert"},
        4766: {"name": "SID History add failed", "severity": "Error"},
        
        # Service Events
        7045: {"name": "Service installed", "severity": "Notice"},
        7040: {"name": "Service start type changed", "severity": "Notice"},
        
        # Security System Events
        1102: {"name": "Audit log cleared", "severity": "Critical"},
        4657: {"name": "Registry value modified", "severity": "Warning"},
        4663: {"name": "Access attempt on object", "severity": "Informational"},
        4670: {"name": "Permissions on object changed", "severity": "Warning"},
        
        # Kerberos Events
        4768: {"name": "Kerberos TGT requested", "severity": "Informational"},
        4769: {"name": "Kerberos service ticket requested", "severity": "Informational"},
        4771: {"name": "Kerberos pre-authentication failed", "severity": "Warning"},
        4776: {"name": "Domain controller attempted to validate credentials", "severity": "Informational"},
    }
    
    # Suspicious logon types
    SUSPICIOUS_LOGON_TYPES = {
        3: "Network",  # Can indicate lateral movement
        10: "RemoteInteractive",  # RDP
        11: "CachedInteractive"  # Offline credentials
    }
    
    def __init__(self):
        self.parsed_events: List[LogEvent] = []
        self.vulnerabilities_found: List[Vulnerability] = []
    
    def parse_evtx_json(self, json_data: str) -> Optional[LogEvent]:
        """
        Parse Windows Event Log in JSON format (converted from EVTX)
        """
        try:
            event_dict = json.loads(json_data) if isinstance(json_data, str) else json_data
            
            # Extract common fields
            event_id = event_dict.get('EventID', event_dict.get('Event', {}).get('System', {}).get('EventID', 0))
            timestamp_str = event_dict.get('TimeCreated', event_dict.get('Event', {}).get('System', {}).get('TimeCreated', {}).get('@SystemTime'))
            computer = event_dict.get('Computer', event_dict.get('Event', {}).get('System', {}).get('Computer', 'Unknown'))
            
            # Parse timestamp
            try:
                timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
            except:
                timestamp = datetime.now()
            
            # Get event info
            event_info = self.SECURITY_EVENT_IDS.get(int(event_id), {"name": "Unknown Event", "severity": "Informational"})
            
            # Extract event data
            event_data = event_dict.get('EventData', {})
            
            # Extract user and IP
            user = event_data.get('TargetUserName', event_data.get('SubjectUserName'))
            ip_address = event_data.get('IpAddress', event_data.get('WorkstationName'))
            
            event = LogEvent(
                event_id=f"winevent_{event_id}_{int(timestamp.timestamp())}",
                timestamp=timestamp,
                source="windows_event",
                severity=event_info["severity"],
                hostname=computer,
                ip_address=ip_address,
                user=user,
                raw_log=json.dumps(event_dict),
                parsed_data={
                    "event_id": event_id,
                    "event_name": event_info["name"],
                    "event_data": event_data,
                    "level": event_dict.get('Level', 'Information')
                }
            )
            
            self.parsed_events.append(event)
            return event
            
        except Exception as e:
            print(f"Error parsing Windows event: {e}")
            return None
    
    def analyze_security_events(self, events: List[LogEvent]) -> List[Vulnerability]:
        """Analyze Windows events for security issues"""
        vulnerabilities = []
        
        # Track patterns
        failed_logins = {}
        privileged_logins = []
        account_changes = []
        process_creations = []
        audit_log_clears = []
        suspicious_services = []
        
        for event in events:
            event_id = event.parsed_data.get("event_id")
            event_data = event.parsed_data.get("event_data", {})
            
            # Failed logon attempts (4625)
            if event_id == 4625:
                user = event.user or "Unknown"
                ip = event.ip_address or "Unknown"
                key = f"{ip}_{user}"
                failed_logins[key] = failed_logins.get(key, 0) + 1
            
            # Privileged logon (4672)
            elif event_id == 4672:
                privileged_logins.append(event)
            
            # Account creation or modification
            elif event_id in [4720, 4722, 4738]:
                account_changes.append(event)
            
            # Suspicious process creation (4688)
            elif event_id == 4688:
                process_name = event_data.get('NewProcessName', '').lower()
                command_line = event_data.get('CommandLine', '').lower()
                
                # Check for suspicious processes
                suspicious_patterns = [
                    'powershell.exe -enc',
                    'cmd.exe /c',
                    'wmic.exe',
                    'psexec',
                    'mimikatz',
                    'procdump',
                    'net user',
                    'net group',
                    'reg.exe add'
                ]
                
                if any(pattern in command_line or pattern in process_name for pattern in suspicious_patterns):
                    process_creations.append(event)
            
            # Audit log cleared (1102)
            elif event_id == 1102:
                audit_log_clears.append(event)
                vuln = Vulnerability(
                    id=f"vuln_logclear_{event.event_id}",
                    cve_id=None,
                    title="Audit Log Cleared - Potential Anti-Forensics",
                    description=f"Security audit log was cleared on {event.hostname}",
                    severity=RiskLevel.CRITICAL,
                    cvss_score=8.5,
                    source=VulnerabilitySource.WINDOWS_EVENT,
                    discovered_date=event.timestamp,
                    affected_assets=[event.hostname],
                    tags=["anti-forensics", "log-tampering", "covering-tracks"]
                )
                vulnerabilities.append(vuln)
            
            # Service installation (7045)
            elif event_id == 7045:
                service_name = event_data.get('ServiceName', '').lower()
                # Check for suspicious service names
                if any(susp in service_name for susp in ['temp', 'test', 'update', '$']):
                    suspicious_services.append(event)
        
        # Analyze failed login patterns
        for key, count in failed_logins.items():
            if count >= 5:
                ip, user = key.split('_', 1)
                vuln = Vulnerability(
                    id=f"vuln_winbruteforce_{ip}_{user}",
                    cve_id=None,
                    title="Windows Brute Force Attack Detected",
                    description=f"Multiple failed Windows login attempts ({count}) for user {user} from {ip}",
                    severity=RiskLevel.HIGH,
                    cvss_score=7.8,
                    source=VulnerabilitySource.WINDOWS_EVENT,
                    attack_vector="Network",
                    attack_complexity="Low",
                    tags=["brute-force", "windows-authentication"]
                )
                vulnerabilities.append(vuln)
        
        # Suspicious process executions
        if len(process_creations) >= 3:
            vuln = Vulnerability(
                id=f"vuln_suspicious_processes",
                cve_id=None,
                title="Suspicious Process Execution Pattern",
                description=f"Multiple suspicious processes detected ({len(process_creations)} instances)",
                severity=RiskLevel.HIGH,
                cvss_score=8.0,
                source=VulnerabilitySource.WINDOWS_EVENT,
                tags=["suspicious-process", "potential-malware", "living-off-the-land"]
            )
            vulnerabilities.append(vuln)
        
        # Suspicious services
        for event in suspicious_services:
            vuln = Vulnerability(
                id=f"vuln_suspicious_service_{event.event_id}",
                cve_id=None,
                title="Suspicious Service Installation",
                description=f"Potentially malicious service installed on {event.hostname}",
                severity=RiskLevel.HIGH,
                cvss_score=7.5,
                source=VulnerabilitySource.WINDOWS_EVENT,
                discovered_date=event.timestamp,
                affected_assets=[event.hostname],
                tags=["persistence", "malicious-service"]
            )
            vulnerabilities.append(vuln)
        
        # Unusual account changes
        if len(account_changes) >= 5:
            vuln = Vulnerability(
                id=f"vuln_account_manipulation",
                cve_id=None,
                title="Unusual Account Activity",
                description=f"Multiple account modifications detected ({len(account_changes)} changes)",
                severity=RiskLevel.MEDIUM,
                cvss_score=6.5,
                source=VulnerabilitySource.WINDOWS_EVENT,
                tags=["account-manipulation", "privilege-escalation"]
            )
            vulnerabilities.append(vuln)
        
        self.vulnerabilities_found.extend(vulnerabilities)
        return vulnerabilities
    
    def get_statistics(self) -> Dict:
        """Get parsing statistics"""
        event_id_counts = {}
        severity_counts = {}
        
        for event in self.parsed_events:
            event_id = event.parsed_data.get("event_id", "Unknown")
            event_id_counts[event_id] = event_id_counts.get(event_id, 0) + 1
            severity_counts[event.severity] = severity_counts.get(event.severity, 0) + 1
        
        return {
            "total_events": len(self.parsed_events),
            "event_id_distribution": event_id_counts,
            "severity_distribution": severity_counts,
            "vulnerabilities_found": len(self.vulnerabilities_found),
            "unique_hosts": len(set(e.hostname for e in self.parsed_events))
        }
