"""
M365 and Microsoft Defender Parser
Parses Microsoft 365 and Defender security logs
"""
import json
from datetime import datetime
from typing import List, Optional, Dict
from models.risk_models import LogEvent, Vulnerability, RiskLevel, VulnerabilitySource


class M365DefenderParser:
    """Parse and analyze M365 and Defender security logs"""
    
    # M365 Audit Operations
    CRITICAL_OPERATIONS = {
        # User and Admin Activity
        "UserLoggedIn": {"severity": "Informational", "category": "Authentication"},
        "UserLoginFailed": {"severity": "Warning", "category": "Authentication"},
        "MailboxLogin": {"severity": "Informational", "category": "Email"},
        "Add member to group": {"severity": "Notice", "category": "Group Management"},
        "Remove member from group": {"severity": "Notice", "category": "Group Management"},
        
        # File and Folder Activity
        "FileDownloaded": {"severity": "Informational", "category": "Data Access"},
        "FileUploaded": {"severity": "Informational", "category": "Data Access"},
        "FileDeleted": {"severity": "Warning", "category": "Data Access"},
        "FileSyncDownloadedFull": {"severity": "Warning", "category": "Data Exfiltration"},
        "FileAccessed": {"severity": "Informational", "category": "Data Access"},
        
        # Sharing and Permissions
        "SharingSet": {"severity": "Warning", "category": "Sharing"},
        "AnonymousLinkCreated": {"severity": "Alert", "category": "Sharing"},
        "AddedToSecureLink": {"severity": "Warning", "category": "Sharing"},
        "SharingInvitationCreated": {"severity": "Notice", "category": "Sharing"},
        
        # Admin Activity
        "Set-Mailbox": {"severity": "Warning", "category": "Admin"},
        "New-InboxRule": {"severity": "Alert", "category": "Email Rules"},
        "Set-InboxRule": {"severity": "Alert", "category": "Email Rules"},
        "UpdateApplication": {"severity": "Warning", "category": "Azure AD"},
        "Add app role assignment": {"severity": "Warning", "category": "Azure AD"},
        
        # Security Configuration
        "Set-AntiPhishPolicy": {"severity": "Alert", "category": "Security Policy"},
        "Set-MalwareFilterPolicy": {"severity": "Alert", "category": "Security Policy"},
        "Disable-AntispamUpdates": {"severity": "Critical", "category": "Security Policy"},
    }
    
    # Defender Alert Severities
    DEFENDER_SEVERITIES = {
        "Informational": RiskLevel.INFORMATIONAL,
        "Low": RiskLevel.LOW,
        "Medium": RiskLevel.MEDIUM,
        "High": RiskLevel.HIGH,
        "Critical": RiskLevel.CRITICAL
    }
    
    def __init__(self):
        self.parsed_events: List[LogEvent] = []
        self.vulnerabilities_found: List[Vulnerability] = []
    
    def parse_m365_audit_log(self, log_json: str) -> Optional[LogEvent]:
        """
        Parse M365 Unified Audit Log
        """
        try:
            log_dict = json.loads(log_json) if isinstance(log_json, str) else log_json
            
            # Extract fields
            operation = log_dict.get('Operation', 'Unknown')
            user_id = log_dict.get('UserId', log_dict.get('UserKey', 'Unknown'))
            timestamp_str = log_dict.get('CreationTime', log_dict.get('CreationDate'))
            client_ip = log_dict.get('ClientIP', log_dict.get('ActorIpAddress'))
            workload = log_dict.get('Workload', 'Unknown')
            
            # Parse timestamp
            try:
                timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
            except:
                timestamp = datetime.now()
            
            # Get operation info
            op_info = self.CRITICAL_OPERATIONS.get(operation, {"severity": "Informational", "category": "General"})
            
            # Additional context
            audit_data = log_dict.get('AuditData', {})
            if isinstance(audit_data, str):
                try:
                    audit_data = json.loads(audit_data)
                except:
                    audit_data = {}
            
            event = LogEvent(
                event_id=f"m365_{log_dict.get('Id', int(timestamp.timestamp()))}",
                timestamp=timestamp,
                source="m365",
                severity=op_info["severity"],
                hostname=workload,
                ip_address=client_ip,
                user=user_id,
                raw_log=json.dumps(log_dict),
                parsed_data={
                    "operation": operation,
                    "category": op_info["category"],
                    "workload": workload,
                    "audit_data": audit_data,
                    "result_status": log_dict.get('ResultStatus', 'Unknown')
                }
            )
            
            self.parsed_events.append(event)
            return event
            
        except Exception as e:
            print(f"Error parsing M365 log: {e}")
            return None
    
    def parse_defender_alert(self, alert_json: str) -> Optional[LogEvent]:
        """
        Parse Microsoft Defender alert
        """
        try:
            alert_dict = json.loads(alert_json) if isinstance(alert_json, str) else alert_json
            
            # Extract fields
            alert_id = alert_dict.get('id', alert_dict.get('alertId'))
            title = alert_dict.get('title', 'Unknown Alert')
            severity = alert_dict.get('severity', 'Medium')
            category = alert_dict.get('category', 'Unknown')
            timestamp_str = alert_dict.get('creationTime', alert_dict.get('firstEventTime'))
            machine_id = alert_dict.get('machineId', alert_dict.get('computerDnsName', 'Unknown'))
            
            # Parse timestamp
            try:
                timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
            except:
                timestamp = datetime.now()
            
            event = LogEvent(
                event_id=f"defender_{alert_id}",
                timestamp=timestamp,
                source="defender",
                severity=severity,
                hostname=machine_id,
                raw_log=json.dumps(alert_dict),
                parsed_data={
                    "title": title,
                    "category": category,
                    "severity": severity,
                    "status": alert_dict.get('status', 'New'),
                    "description": alert_dict.get('description', ''),
                    "recommended_action": alert_dict.get('recommendedAction', ''),
                    "evidence": alert_dict.get('evidence', []),
                    "mitre_techniques": alert_dict.get('mitreTechniques', [])
                }
            )
            
            self.parsed_events.append(event)
            return event
            
        except Exception as e:
            print(f"Error parsing Defender alert: {e}")
            return None
    
    def analyze_m365_security(self, events: List[LogEvent]) -> List[Vulnerability]:
        """Analyze M365 events for security issues"""
        vulnerabilities = []
        
        # Track patterns
        failed_logins = {}
        data_exfiltration = []
        suspicious_inbox_rules = []
        unusual_sharing = []
        admin_changes = []
        
        for event in events:
            operation = event.parsed_data.get("operation", "")
            audit_data = event.parsed_data.get("audit_data", {})
            
            # Failed logins
            if operation == "UserLoginFailed":
                user = event.user
                ip = event.ip_address or "Unknown"
                key = f"{ip}_{user}"
                failed_logins[key] = failed_logins.get(key, 0) + 1
            
            # Mass file downloads
            elif operation in ["FileDownloaded", "FileSyncDownloadedFull"]:
                data_exfiltration.append(event)
            
            # Suspicious inbox rules
            elif operation in ["New-InboxRule", "Set-InboxRule"]:
                rule_params = audit_data.get("Parameters", [])
                # Check for forwarding or deletion rules
                suspicious = any(
                    p.get("Name") in ["ForwardTo", "ForwardAsAttachmentTo", "DeleteMessage", "MoveToFolder"]
                    for p in rule_params if isinstance(rule_params, list)
                )
                if suspicious:
                    suspicious_inbox_rules.append(event)
            
            # Anonymous link sharing
            elif operation == "AnonymousLinkCreated":
                unusual_sharing.append(event)
            
            # Critical admin changes
            elif operation in ["Set-AntiPhishPolicy", "Set-MalwareFilterPolicy", "Disable-AntispamUpdates"]:
                admin_changes.append(event)
        
        # Analyze failed login patterns
        for key, count in failed_logins.items():
            if count >= 5:
                ip, user = key.split('_', 1)
                vuln = Vulnerability(
                    id=f"vuln_m365_bruteforce_{ip}_{user}",
                    cve_id=None,
                    title="M365 Brute Force Attack",
                    description=f"Multiple failed login attempts ({count}) for {user} from {ip}",
                    severity=RiskLevel.HIGH,
                    cvss_score=7.5,
                    source=VulnerabilitySource.M365_DEFENDER,
                    attack_vector="Network",
                    tags=["brute-force", "m365", "authentication"]
                )
                vulnerabilities.append(vuln)
        
        # Data exfiltration
        if len(data_exfiltration) >= 50:
            vuln = Vulnerability(
                id=f"vuln_data_exfil",
                cve_id=None,
                title="Potential Data Exfiltration",
                description=f"Unusual volume of file downloads detected ({len(data_exfiltration)} files)",
                severity=RiskLevel.HIGH,
                cvss_score=8.0,
                source=VulnerabilitySource.M365_DEFENDER,
                tags=["data-exfiltration", "insider-threat"]
            )
            vulnerabilities.append(vuln)
        
        # Suspicious inbox rules
        for event in suspicious_inbox_rules:
            vuln = Vulnerability(
                id=f"vuln_inbox_rule_{event.event_id}",
                cve_id=None,
                title="Suspicious Email Rule Created",
                description=f"Potentially malicious inbox rule created by {event.user}",
                severity=RiskLevel.HIGH,
                cvss_score=7.8,
                source=VulnerabilitySource.M365_DEFENDER,
                discovered_date=event.timestamp,
                tags=["email-forwarding", "persistence", "data-theft"]
            )
            vulnerabilities.append(vuln)
        
        # Anonymous sharing
        for event in unusual_sharing:
            vuln = Vulnerability(
                id=f"vuln_anon_share_{event.event_id}",
                cve_id=None,
                title="Anonymous Link Created",
                description=f"Anonymous sharing link created by {event.user}",
                severity=RiskLevel.MEDIUM,
                cvss_score=6.0,
                source=VulnerabilitySource.M365_DEFENDER,
                discovered_date=event.timestamp,
                tags=["data-sharing", "data-leak-risk"]
            )
            vulnerabilities.append(vuln)
        
        # Security policy changes
        for event in admin_changes:
            vuln = Vulnerability(
                id=f"vuln_policy_change_{event.event_id}",
                cve_id=None,
                title="Critical Security Policy Modified",
                description=f"Security policy changed: {event.parsed_data.get('operation')}",
                severity=RiskLevel.HIGH,
                cvss_score=8.5,
                source=VulnerabilitySource.M365_DEFENDER,
                discovered_date=event.timestamp,
                tags=["policy-change", "security-weakening"]
            )
            vulnerabilities.append(vuln)
        
        self.vulnerabilities_found.extend(vulnerabilities)
        return vulnerabilities
    
    def analyze_defender_alerts(self, events: List[LogEvent]) -> List[Vulnerability]:
        """Convert Defender alerts to vulnerabilities"""
        vulnerabilities = []
        
        for event in events:
            if event.source != "defender":
                continue
            
            severity_str = event.parsed_data.get("severity", "Medium")
            severity = self.DEFENDER_SEVERITIES.get(severity_str, RiskLevel.MEDIUM)
            
            # Map severity to CVSS score
            cvss_map = {
                RiskLevel.CRITICAL: 9.5,
                RiskLevel.HIGH: 8.0,
                RiskLevel.MEDIUM: 6.0,
                RiskLevel.LOW: 3.0,
                RiskLevel.INFORMATIONAL: 0.0
            }
            
            vuln = Vulnerability(
                id=f"vuln_defender_{event.event_id}",
                cve_id=None,
                title=event.parsed_data.get("title", "Defender Alert"),
                description=event.parsed_data.get("description", ""),
                severity=severity,
                cvss_score=cvss_map[severity],
                source=VulnerabilitySource.DEFENDER_SECURITY,
                discovered_date=event.timestamp,
                affected_assets=[event.hostname],
                tags=[event.parsed_data.get("category", "unknown")] + event.parsed_data.get("mitre_techniques", [])
            )
            vulnerabilities.append(vuln)
        
        self.vulnerabilities_found.extend(vulnerabilities)
        return vulnerabilities
    
    def get_statistics(self) -> Dict:
        """Get parsing statistics"""
        operation_counts = {}
        severity_counts = {}
        workload_counts = {}
        
        for event in self.parsed_events:
            operation = event.parsed_data.get("operation", "Unknown")
            workload = event.parsed_data.get("workload", "Unknown")
            
            operation_counts[operation] = operation_counts.get(operation, 0) + 1
            severity_counts[event.severity] = severity_counts.get(event.severity, 0) + 1
            workload_counts[workload] = workload_counts.get(workload, 0) + 1
        
        return {
            "total_events": len(self.parsed_events),
            "operation_distribution": operation_counts,
            "severity_distribution": severity_counts,
            "workload_distribution": workload_counts,
            "vulnerabilities_found": len(self.vulnerabilities_found)
        }
