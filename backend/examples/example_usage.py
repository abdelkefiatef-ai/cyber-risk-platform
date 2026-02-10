"""
Example Usage of Risk Platform
Demonstrates how to use all components together
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.orchestrator import RiskPlatformOrchestrator


def main():
    """Main example"""
    print("="*70)
    print("CYBER RISK PLATFORM - COMPREHENSIVE EXAMPLE")
    print("="*70)
    print()
    
    # Initialize orchestrator
    orchestrator = RiskPlatformOrchestrator()
    
    # Example 1: Add manual assets
    print("Step 1: Adding manual assets...")
    print("-"*70)
    
    assets_to_add = [
        {
            "id": "asset_web_prod_01",
            "name": "WEB-PROD-01",
            "category": "Server",
            "ip_address": "10.0.1.45",
            "os": "Ubuntu",
            "os_version": "22.04 LTS",
            "criticality": "Mission Critical",
            "tags": ["Production", "DMZ", "Web Server"],
            "owner": "DevOps Team",
            "location": "AWS us-east-1",
            "exposed_to_internet": True,
            "contains_sensitive_data": True,
            "patch_level": "Outdated",
            "antivirus_status": "Active",
            "firewall_enabled": True,
            "vulnerability_ids": []
        },
        {
            "id": "asset_db_finance",
            "name": "DB-FINANCE-ALPHA",
            "category": "Database",
            "ip_address": "10.0.5.12",
            "os": "Windows Server",
            "os_version": "2022",
            "criticality": "Mission Critical",
            "tags": ["Database", "Finance", "PCI-DSS"],
            "owner": "DBA Team",
            "location": "On-Premise DC-1",
            "exposed_to_internet": False,
            "contains_sensitive_data": True,
            "patch_level": "Current",
            "antivirus_status": "Active",
            "firewall_enabled": True,
            "vulnerability_ids": []
        },
        {
            "id": "asset_workstation_exec",
            "name": "CEO-LAPTOP-M4",
            "category": "Workstation",
            "ip_address": "172.16.10.55",
            "os": "macOS",
            "os_version": "14.2",
            "criticality": "High",
            "tags": ["Endpoint", "VIP", "Executive"],
            "owner": "Executive Office",
            "location": "Remote",
            "exposed_to_internet": True,
            "contains_sensitive_data": True,
            "patch_level": "Current",
            "antivirus_status": "Active",
            "firewall_enabled": True,
            "vulnerability_ids": []
        }
    ]
    
    for asset_data in assets_to_add:
        asset = orchestrator.add_manual_asset(asset_data)
        print(f"Added asset: {asset.name} ({asset.ip_address})")
    
    print(f"\nTotal assets: {len(orchestrator.all_assets)}")
    
    # Example 2: Process different log types
    print("\n\nStep 2: Processing security logs...")
    print("-"*70)
    
    # Note: In real usage, these files would exist
    # For this example, we'll create sample log data
    
    print("\nProcessing syslog data...")
    sample_syslog_data = create_sample_syslog()
    with open("/tmp/sample_syslog.log", "w") as f:
        f.write(sample_syslog_data)
    orchestrator.process_syslog_file("/tmp/sample_syslog.log")
    
    print("\nProcessing Windows events...")
    sample_windows_data = create_sample_windows_events()
    with open("/tmp/sample_windows.json", "w") as f:
        f.write(sample_windows_data)
    orchestrator.process_windows_events_json("/tmp/sample_windows.json")
    
    print("\nProcessing M365 audit logs...")
    sample_m365_data = create_sample_m365_logs()
    with open("/tmp/sample_m365.json", "w") as f:
        f.write(sample_m365_data)
    orchestrator.process_m365_audit_logs("/tmp/sample_m365.json")
    
    print("\nProcessing Defender alerts...")
    sample_defender_data = create_sample_defender_alerts()
    with open("/tmp/sample_defender.json", "w") as f:
        f.write(sample_defender_data)
    orchestrator.process_defender_alerts("/tmp/sample_defender.json")
    
    # Example 3: Calculate risks
    print("\n\nStep 3: Calculating risk scores and generating scenarios...")
    print("-"*70)
    
    results = orchestrator.calculate_all_risks()
    
    # Example 4: Display results
    print("\n\nStep 4: Results Summary")
    print("-"*70)
    
    summary = results["summary"]
    print(f"\nTotal Assets: {summary['total_assets']}")
    print(f"Total Vulnerabilities: {summary['total_vulnerabilities']}")
    print(f"Average Risk Score: {summary['average_risk_score']:.1f}/100")
    print(f"\nRisk Distribution:")
    print(f"  Critical: {summary['critical_assets']}")
    print(f"  High: {summary['high_risk_assets']}")
    print(f"  Medium: {summary['medium_risk_assets']}")
    print(f"  Low: {summary['low_risk_assets']}")
    print(f"\nRisk Scenarios Generated: {summary['risk_scenarios']}")
    
    # Show top risk assets
    print("\n\nTop 5 Highest Risk Assets:")
    print("-"*70)
    for i, result in enumerate(results["risk_results"][:5], 1):
        asset = orchestrator.all_assets[result.asset_id]
        print(f"\n{i}. {asset.name}")
        print(f"   Risk Score: {result.total_risk_score:.1f}/100")
        print(f"   Vulnerabilities: {len(result.contributing_vulnerabilities)}")
        print(f"   Top Recommendation: {result.recommendations[0] if result.recommendations else 'None'}")
    
    # Example 5: Export data
    print("\n\nStep 5: Exporting data...")
    print("-"*70)
    orchestrator.export_to_json("./output")
    
    # Example 6: Predict risk directly from raw logs (asset-independent)
    print("\n\nStep 6: Predicting risk directly from raw logs...")
    print("-"*70)
    sample_log = "Defender alert: suspected ransomware behavior with lateral movement attempts"
    log_prediction = orchestrator.predict_log_risk(sample_log, source="defender")
    print(f"Predicted log risk: {log_prediction['prediction']['risk_level']} (confidence {log_prediction['prediction']['confidence']})")

    # Example 7: Generate report
    print("\n\nStep 7: Generating report...")
    print("-"*70)
    report = orchestrator.generate_report()
    with open("./output/risk_report.txt", "w") as f:
        f.write(report)
    print("Report saved to ./output/risk_report.txt")
    
    print("\n" + "="*70)
    print("EXAMPLE COMPLETED SUCCESSFULLY")
    print("="*70)


def create_sample_syslog():
    """Create sample syslog data"""
    return """<38>Feb 10 14:23:15 WEB-PROD-01 sshd[1234]: Failed password for admin from 192.168.1.100 port 55432 ssh2
<38>Feb 10 14:23:16 WEB-PROD-01 sshd[1234]: Failed password for admin from 192.168.1.100 port 55433 ssh2
<38>Feb 10 14:23:17 WEB-PROD-01 sshd[1234]: Failed password for admin from 192.168.1.100 port 55434 ssh2
<38>Feb 10 14:23:18 WEB-PROD-01 sshd[1234]: Failed password for admin from 192.168.1.100 port 55435 ssh2
<38>Feb 10 14:23:19 WEB-PROD-01 sshd[1234]: Failed password for admin from 192.168.1.100 port 55436 ssh2
<38>Feb 10 14:23:20 WEB-PROD-01 sshd[1234]: Failed password for admin from 192.168.1.100 port 55437 ssh2
<34>Feb 10 14:30:00 DB-FINANCE-ALPHA kernel: firewall: DROP IN=eth0 OUT= SRC=10.0.0.50 DST=10.0.5.12 PROTO=TCP
<35>Feb 10 14:35:12 WEB-PROD-01 sudo: user1 : TTY=pts/0 ; PWD=/home/user1 ; USER=root ; COMMAND=/bin/rm -rf /tmp/*
"""


def create_sample_windows_events():
    """Create sample Windows events in JSON"""
    import json
    events = [
        {
            "EventID": 4625,
            "TimeCreated": "2024-02-10T14:25:00Z",
            "Computer": "DB-FINANCE-ALPHA",
            "EventData": {
                "TargetUserName": "administrator",
                "IpAddress": "192.168.1.100",
                "LogonType": "3"
            }
        },
        {
            "EventID": 4625,
            "TimeCreated": "2024-02-10T14:25:05Z",
            "Computer": "DB-FINANCE-ALPHA",
            "EventData": {
                "TargetUserName": "administrator",
                "IpAddress": "192.168.1.100",
                "LogonType": "3"
            }
        },
        {
            "EventID": 4688,
            "TimeCreated": "2024-02-10T14:30:00Z",
            "Computer": "DB-FINANCE-ALPHA",
            "EventData": {
                "NewProcessName": "C:\\Windows\\System32\\cmd.exe",
                "CommandLine": "cmd.exe /c powershell.exe -enc Base64EncodedCommand",
                "SubjectUserName": "user1"
            }
        },
        {
            "EventID": 1102,
            "TimeCreated": "2024-02-10T14:35:00Z",
            "Computer": "CEO-LAPTOP-M4",
            "EventData": {
                "SubjectUserName": "user2"
            }
        }
    ]
    return "\n".join([json.dumps(e) for e in events])


def create_sample_m365_logs():
    """Create sample M365 audit logs"""
    import json
    logs = [
        {
            "Id": "m365-001",
            "Operation": "UserLoginFailed",
            "UserId": "user@company.com",
            "CreationTime": "2024-02-10T14:20:00Z",
            "ClientIP": "203.0.113.50",
            "Workload": "AzureActiveDirectory",
            "ResultStatus": "Failed"
        },
        {
            "Id": "m365-002",
            "Operation": "New-InboxRule",
            "UserId": "compromised@company.com",
            "CreationTime": "2024-02-10T14:25:00Z",
            "ClientIP": "203.0.113.100",
            "Workload": "Exchange",
            "AuditData": json.dumps({
                "Parameters": [
                    {"Name": "ForwardTo", "Value": "attacker@evil.com"}
                ]
            })
        },
        {
            "Id": "m365-003",
            "Operation": "FileDownloaded",
            "UserId": "user@company.com",
            "CreationTime": "2024-02-10T14:30:00Z",
            "ClientIP": "203.0.113.50",
            "Workload": "SharePoint"
        }
    ]
    return "\n".join([json.dumps(log) for log in logs])


def create_sample_defender_alerts():
    """Create sample Defender alerts"""
    import json
    alerts = [
        {
            "id": "defender-001",
            "title": "Suspicious PowerShell execution",
            "severity": "High",
            "category": "Execution",
            "creationTime": "2024-02-10T14:30:00Z",
            "machineId": "DB-FINANCE-ALPHA",
            "status": "New",
            "description": "PowerShell was used to execute encoded commands",
            "recommendedAction": "Investigate the PowerShell command and determine if it's malicious",
            "mitreTechniques": ["T1059.001"]
        },
        {
            "id": "defender-002",
            "title": "Malware detected",
            "severity": "Critical",
            "category": "Malware",
            "creationTime": "2024-02-10T14:35:00Z",
            "machineId": "WEB-PROD-01",
            "status": "InProgress",
            "description": "Potentially unwanted application detected",
            "recommendedAction": "Quarantine the file and run full system scan",
            "mitreTechniques": ["T1204"]
        }
    ]
    return "\n".join([json.dumps(alert) for alert in alerts])


if __name__ == "__main__":
    main()
