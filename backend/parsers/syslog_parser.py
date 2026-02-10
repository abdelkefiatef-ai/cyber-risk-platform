"""
Syslog Parser
Parses syslog events and extracts security-relevant information
"""
import re
from datetime import datetime
from typing import List, Optional, Dict
from models.risk_models import LogEvent, Vulnerability, RiskLevel, VulnerabilitySource


class SyslogParser:
    """Parse and analyze syslog events"""
    
    # Syslog severity levels (RFC 5424)
    SEVERITY_MAP = {
        0: "Emergency",
        1: "Alert",
        2: "Critical",
        3: "Error",
        4: "Warning",
        5: "Notice",
        6: "Informational",
        7: "Debug"
    }
    
    # Security event patterns
    SECURITY_PATTERNS = {
        'failed_login': r'Failed password for (?:invalid user )?(\w+) from ([\d.]+)',
        'sudo_command': r'sudo:\s+(\w+) : TTY=(\S+) ; PWD=(\S+) ; USER=(\w+) ; COMMAND=(.+)',
        'ssh_accept': r'Accepted (?:password|publickey) for (\w+) from ([\d.]+)',
        'firewall_block': r'(?:BLOCK|DROP|DENY).*SRC=([\d.]+).*DST=([\d.]+).*PROTO=(\w+)',
        'kernel_error': r'kernel:.*error.*',
        'service_failure': r'(\w+)\[\d+\]: Failed to start',
        'unauthorized_access': r'(?:Unauthorized|Access denied|Permission denied)',
        'port_scan': r'(?:portscan|Port scan).*from ([\d.]+)',
        'malware_detected': r'(?:malware|virus|trojan).*detected',
    }
    
    def __init__(self):
        self.parsed_events: List[LogEvent] = []
        self.vulnerabilities_found: List[Vulnerability] = []
    
    def parse_syslog_line(self, log_line: str) -> Optional[LogEvent]:
        """
        Parse a single syslog line
        Format: <priority>timestamp hostname process[pid]: message
        """
        # RFC 3164 format pattern
        pattern = r'<(\d+)>(\w{3}\s+\d+\s+\d+:\d+:\d+)\s+(\S+)\s+(\S+?)(?:\[(\d+)\])?:\s+(.+)'
        match = re.match(pattern, log_line)
        
        if not match:
            # Try simpler format without priority
            simple_pattern = r'(\w{3}\s+\d+\s+\d+:\d+:\d+)\s+(\S+)\s+(\S+?):\s+(.+)'
            match = re.match(simple_pattern, log_line)
            if match:
                timestamp_str, hostname, process, message = match.groups()
                priority = 6  # Default to informational
            else:
                return None
        else:
            priority, timestamp_str, hostname, process, pid, message = match.groups()
            priority = int(priority)
        
        # Parse timestamp
        try:
            timestamp = datetime.strptime(timestamp_str, '%b %d %H:%M:%S')
            # Set current year
            timestamp = timestamp.replace(year=datetime.now().year)
        except:
            timestamp = datetime.now()
        
        # Determine severity
        severity_level = priority & 0x07  # Lower 3 bits
        severity = self.SEVERITY_MAP.get(severity_level, "Unknown")
        
        # Extract IP address if present
        ip_match = re.search(r'\b(?:\d{1,3}\.){3}\d{1,3}\b', message)
        ip_address = ip_match.group(0) if ip_match else None
        
        # Extract username if present
        user_match = re.search(r'(?:user|for)\s+(\w+)', message)
        user = user_match.group(1) if user_match else None
        
        event = LogEvent(
            event_id=f"syslog_{timestamp.timestamp()}_{hostname}",
            timestamp=timestamp,
            source="syslog",
            severity=severity,
            hostname=hostname,
            ip_address=ip_address,
            user=user,
            raw_log=log_line,
            parsed_data={
                "process": process,
                "message": message,
                "priority": priority
            }
        )
        
        self.parsed_events.append(event)
        return event
    
    def analyze_security_events(self, events: List[LogEvent]) -> List[Vulnerability]:
        """Analyze syslog events for security issues"""
        vulnerabilities = []
        
        # Track patterns
        failed_logins = {}
        blocked_ips = {}
        suspicious_commands = []
        
        for event in events:
            message = event.parsed_data.get("message", "")
            
            # Failed login attempts
            if match := re.search(self.SECURITY_PATTERNS['failed_login'], message):
                user, ip = match.groups()
                key = f"{ip}_{user}"
                failed_logins[key] = failed_logins.get(key, 0) + 1
            
            # Firewall blocks
            if match := re.search(self.SECURITY_PATTERNS['firewall_block'], message):
                src_ip = match.group(1)
                blocked_ips[src_ip] = blocked_ips.get(src_ip, 0) + 1
            
            # Sudo commands
            if re.search(self.SECURITY_PATTERNS['sudo_command'], message):
                if 'rm -rf' in message or 'chmod 777' in message or '/etc/passwd' in message:
                    suspicious_commands.append(event)
            
            # Port scanning
            if re.search(self.SECURITY_PATTERNS['port_scan'], message):
                vuln = Vulnerability(
                    id=f"vuln_portscan_{event.event_id}",
                    cve_id=None,
                    title="Port Scanning Activity Detected",
                    description=f"Port scanning activity detected from {event.ip_address}",
                    severity=RiskLevel.MEDIUM,
                    cvss_score=5.0,
                    source=VulnerabilitySource.SYSLOG,
                    discovered_date=event.timestamp,
                    affected_assets=[event.hostname],
                    tags=["port-scan", "reconnaissance"]
                )
                vulnerabilities.append(vuln)
            
            # Malware detection
            if re.search(self.SECURITY_PATTERNS['malware_detected'], message):
                vuln = Vulnerability(
                    id=f"vuln_malware_{event.event_id}",
                    cve_id=None,
                    title="Malware Detected",
                    description=f"Malware activity detected on {event.hostname}",
                    severity=RiskLevel.CRITICAL,
                    cvss_score=9.5,
                    source=VulnerabilitySource.SYSLOG,
                    discovered_date=event.timestamp,
                    affected_assets=[event.hostname],
                    tags=["malware", "infection"]
                )
                vulnerabilities.append(vuln)
        
        # Analyze failed login patterns (potential brute force)
        for key, count in failed_logins.items():
            if count >= 5:
                ip, user = key.split('_')
                vuln = Vulnerability(
                    id=f"vuln_bruteforce_{ip}_{user}",
                    cve_id=None,
                    title="Brute Force Attack Detected",
                    description=f"Multiple failed login attempts ({count}) for user {user} from {ip}",
                    severity=RiskLevel.HIGH,
                    cvss_score=7.5,
                    source=VulnerabilitySource.SYSLOG,
                    attack_vector="Network",
                    attack_complexity="Low",
                    tags=["brute-force", "authentication"]
                )
                vulnerabilities.append(vuln)
        
        # Analyze firewall blocks (potential DDoS or scanning)
        for ip, count in blocked_ips.items():
            if count >= 100:
                vuln = Vulnerability(
                    id=f"vuln_ddos_{ip}",
                    cve_id=None,
                    title="Potential DDoS Attack",
                    description=f"High volume of blocked traffic ({count} attempts) from {ip}",
                    severity=RiskLevel.HIGH,
                    cvss_score=7.0,
                    source=VulnerabilitySource.SYSLOG,
                    attack_vector="Network",
                    tags=["ddos", "denial-of-service"]
                )
                vulnerabilities.append(vuln)
        
        # Suspicious commands
        for event in suspicious_commands:
            vuln = Vulnerability(
                id=f"vuln_suspicious_{event.event_id}",
                cve_id=None,
                title="Suspicious Command Execution",
                description=f"Potentially malicious command detected on {event.hostname}",
                severity=RiskLevel.HIGH,
                cvss_score=7.8,
                source=VulnerabilitySource.SYSLOG,
                discovered_date=event.timestamp,
                affected_assets=[event.hostname],
                tags=["suspicious-activity", "privilege-escalation"]
            )
            vulnerabilities.append(vuln)
        
        self.vulnerabilities_found.extend(vulnerabilities)
        return vulnerabilities
    
    def parse_file(self, filepath: str) -> List[LogEvent]:
        """Parse a syslog file"""
        events = []
        try:
            with open(filepath, 'r') as f:
                for line in f:
                    if event := self.parse_syslog_line(line.strip()):
                        events.append(event)
        except Exception as e:
            print(f"Error parsing syslog file: {e}")
        
        return events
    
    def get_statistics(self) -> Dict:
        """Get parsing statistics"""
        severity_counts = {}
        for event in self.parsed_events:
            severity_counts[event.severity] = severity_counts.get(event.severity, 0) + 1
        
        return {
            "total_events": len(self.parsed_events),
            "severity_distribution": severity_counts,
            "vulnerabilities_found": len(self.vulnerabilities_found),
            "unique_hosts": len(set(e.hostname for e in self.parsed_events))
        }
