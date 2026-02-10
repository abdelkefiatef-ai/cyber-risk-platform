"""
Generate Sample Data for Risk Platform
Creates realistic security logs and asset data for testing
"""
import json
import random
from datetime import datetime, timedelta


def generate_server_assets():
    """Generate 40 server assets (30 Windows, 10 Linux)"""
    assets = []

    # Windows Servers (30)
    windows_roles = [
        ("DC", "Domain Controller", "Mission Critical"),
        ("SQL", "Database Server", "Mission Critical"),
        ("EXCH", "Exchange Server", "Mission Critical"),
        ("WEB", "Web Server", "High"),
        ("APP", "Application Server", "High"),
        ("FILE", "File Server", "Medium"),
        ("PRINT", "Print Server", "Low"),
    ]

    exposed_count = 0
    for i in range(1, 31):
        role = windows_roles[i % len(windows_roles)]
        is_exposed = exposed_count < 2 and random.random() < 0.15
        if is_exposed:
            exposed_count += 1

        asset = {
            "id": f"win_server_{i:03d}",
            "name": f"WIN-{role[0]}-{i:02d}",
            "category": "Server",
            "ip_address": f"10.0.{(i-1)//254 + 1}.{(i-1)%254 + 1}",
            "os": "Windows Server",
            "os_version": random.choice(["2019", "2022", "2016"]),
            "criticality": role[2],
            "tags": ["Windows", role[1], "Production", "EDR-Enabled"],
            "owner": "IT Operations",
            "location": random.choice(["DC-1", "DC-2", "AWS us-east-1"]),
            "exposed_to_internet": is_exposed,
            "contains_sensitive_data": role[2] in ["Mission Critical", "High"],
            "patch_level": random.choice(["Current", "Current", "Outdated", "Outdated", "Critical"]),
            "antivirus_status": "Active",
            "firewall_enabled": True,
            "vulnerability_ids": []
        }
        assets.append(asset)

    # Linux Servers (10)
    linux_roles = [
        ("WEB", "Web Server", "High"),
        ("DB", "Database Server", "Mission Critical"),
        ("APP", "Application Server", "High"),
        ("LOG", "Log Server", "Medium"),
    ]

    for i in range(1, 11):
        role = linux_roles[i % len(linux_roles)]
        is_exposed = exposed_count < 3 and random.random() < 0.2
        if is_exposed:
            exposed_count += 1

        asset = {
            "id": f"linux_server_{i:03d}",
            "name": f"LNX-{role[0]}-{i:02d}",
            "category": "Server",
            "ip_address": f"10.0.10.{i}",
            "os": "Ubuntu",
            "os_version": random.choice(["22.04 LTS", "20.04 LTS"]),
            "criticality": role[2],
            "tags": ["Linux", role[1], "Production", "EDR-Enabled"],
            "owner": "IT Operations",
            "location": random.choice(["DC-1", "DC-2"]),
            "exposed_to_internet": is_exposed,
            "contains_sensitive_data": role[2] == "Mission Critical",
            "patch_level": random.choice(["Current", "Outdated"]),
            "antivirus_status": "Active",
            "firewall_enabled": True,
            "vulnerability_ids": []
        }
        assets.append(asset)

    return assets


def generate_windows_events(assets):
    """Generate realistic Windows security events"""
    events = []
    base_time = datetime.now() - timedelta(days=7)

    windows_assets = [a for a in assets if "Windows" in a["os"]]

    # Generate various event types
    for day in range(7):
        current_time = base_time + timedelta(days=day)

        for asset in windows_assets:
            # Normal successful logins (4624)
            for _ in range(random.randint(5, 15)):
                events.append({
                    "EventID": 4624,
                    "TimeCreated": (current_time + timedelta(hours=random.randint(0, 23))).isoformat() + "Z",
                    "Computer": asset["name"],
                    "EventData": {
                        "TargetUserName": random.choice(["admin", "svcaccount", "user1", "administrator"]),
                        "LogonType": "3",
                        "IpAddress": asset["ip_address"]
                    }
                })

            # Some failed login attempts (4625) - simulate brute force
            if random.random() < 0.3:
                attacker_ip = f"203.0.113.{random.randint(1, 254)}"
                fail_count = random.randint(3, 15)
                for _ in range(fail_count):
                    events.append({
                        "EventID": 4625,
                        "TimeCreated": (current_time + timedelta(hours=random.randint(0, 23), minutes=random.randint(0, 59))).isoformat() + "Z",
                        "Computer": asset["name"],
                        "EventData": {
                            "TargetUserName": random.choice(["admin", "administrator", "root", "sa"]),
                            "IpAddress": attacker_ip,
                            "LogonType": "3",
                            "FailureReason": "Bad password"
                        }
                    })

            # Privileged logins (4672)
            if random.random() < 0.5:
                events.append({
                    "EventID": 4672,
                    "TimeCreated": (current_time + timedelta(hours=random.randint(8, 17))).isoformat() + "Z",
                    "Computer": asset["name"],
                    "EventData": {
                        "SubjectUserName": "administrator",
                        "PrivilegeList": "SeDebugPrivilege"
                    }
                })

            # Process creation (4688) - some suspicious
            processes = [
                {"name": "powershell.exe", "cmd": "powershell.exe Get-Process", "suspicious": False},
                {"name": "cmd.exe", "cmd": "cmd.exe /c dir", "suspicious": False},
                {"name": "powershell.exe", "cmd": "powershell.exe -enc BASE64ENCODEDCOMMAND", "suspicious": True},
                {"name": "cmd.exe", "cmd": "cmd.exe /c net user hacker Password123 /add", "suspicious": True},
                {"name": "wmic.exe", "cmd": "wmic process call create", "suspicious": True},
            ]

            for _ in range(random.randint(10, 30)):
                proc = random.choice(processes)
                if proc["suspicious"] and random.random() > 0.05:
                    continue

                events.append({
                    "EventID": 4688,
                    "TimeCreated": (current_time + timedelta(hours=random.randint(0, 23))).isoformat() + "Z",
                    "Computer": asset["name"],
                    "EventData": {
                        "NewProcessName": f"C:\\Windows\\System32\\{proc['name']}",
                        "CommandLine": proc["cmd"],
                        "SubjectUserName": random.choice(["user1", "admin", "svcaccount"])
                    }
                })

            # Audit log cleared (1102) - very suspicious
            if random.random() < 0.02:
                events.append({
                    "EventID": 1102,
                    "TimeCreated": (current_time + timedelta(hours=random.randint(0, 23))).isoformat() + "Z",
                    "Computer": asset["name"],
                    "EventData": {
                        "SubjectUserName": "administrator"
                    }
                })

            # Service installation (7045) - potentially malicious
            if random.random() < 0.05:
                events.append({
                    "EventID": 7045,
                    "TimeCreated": (current_time + timedelta(hours=random.randint(0, 23))).isoformat() + "Z",
                    "Computer": asset["name"],
                    "EventData": {
                        "ServiceName": random.choice(["WindowsUpdate", "TempService", "BackupSvc", "$UpdateSvc"]),
                        "ServiceFileName": "C:\\Windows\\Temp\\service.exe"
                    }
                })

            # Account changes (4720, 4738)
            if random.random() < 0.1:
                events.append({
                    "EventID": random.choice([4720, 4738]),
                    "TimeCreated": (current_time + timedelta(hours=random.randint(0, 23))).isoformat() + "Z",
                    "Computer": asset["name"],
                    "EventData": {
                        "TargetUserName": f"user{random.randint(1, 10)}",
                        "SubjectUserName": "administrator"
                    }
                })

    return events


def generate_syslog_events(assets):
    """Generate realistic syslog events"""
    logs = []
    base_time = datetime.now() - timedelta(days=7)

    linux_assets = [a for a in assets if "Ubuntu" in a["os"] or "Linux" in a["os"]]

    for day in range(7):
        current_time = base_time + timedelta(days=day)

        for asset in linux_assets:
            # Normal SSH logins
            for _ in range(random.randint(5, 15)):
                timestamp = (current_time + timedelta(hours=random.randint(0, 23))).strftime("%b %d %H:%M:%S")
                logs.append(
                    f"<38>{timestamp} {asset['name']} sshd[{random.randint(1000, 9999)}]: "
                    f"Accepted publickey for {random.choice(['admin', 'user1', 'ops'])} from {asset['ip_address']}\n"
                )

            # Failed SSH attempts (brute force)
            if random.random() < 0.3:
                attacker_ip = f"198.51.100.{random.randint(1, 254)}"
                fail_count = random.randint(5, 20)
                for i in range(fail_count):
                    timestamp = (current_time + timedelta(hours=random.randint(0, 23), minutes=i)).strftime("%b %d %H:%M:%S")
                    logs.append(
                        f"<38>{timestamp} {asset['name']} sshd[{random.randint(1000, 9999)}]: "
                        f"Failed password for {random.choice(['root', 'admin', 'administrator'])} from {attacker_ip} port {55000 + i} ssh2\n"
                    )

            # Sudo commands
            for _ in range(random.randint(3, 10)):
                timestamp = (current_time + timedelta(hours=random.randint(0, 23))).strftime("%b %d %H:%M:%S")
                commands = [
                    "systemctl restart nginx",
                    "apt-get update",
                    "vim /etc/hosts",
                    "rm -rf /tmp/*",
                    "chmod 777 /var/www"
                ]
                cmd = random.choice(commands)
                logs.append(
                    f"<35>{timestamp} {asset['name']} sudo: user1 : TTY=pts/0 ; PWD=/home/user1 ; USER=root ; COMMAND={cmd}\n"
                )

            # Firewall blocks
            if random.random() < 0.4:
                for _ in range(random.randint(5, 50)):
                    timestamp = (current_time + timedelta(hours=random.randint(0, 23))).strftime("%b %d %H:%M:%S")
                    src_ip = f"192.0.2.{random.randint(1, 254)}"
                    logs.append(
                        f"<34>{timestamp} {asset['name']} kernel: firewall: DROP IN=eth0 OUT= "
                        f"SRC={src_ip} DST={asset['ip_address']} PROTO=TCP DPT={random.randint(1, 65535)}\n"
                    )

            # Malware detection (rare)
            if random.random() < 0.03:
                timestamp = (current_time + timedelta(hours=random.randint(0, 23))).strftime("%b %d %H:%M:%S")
                logs.append(
                    f"<35>{timestamp} {asset['name']} clamav: virus detected: Trojan.Generic\n"
                )

            # Port scan detection
            if random.random() < 0.1:
                timestamp = (current_time + timedelta(hours=random.randint(0, 23))).strftime("%b %d %H:%M:%S")
                scanner_ip = f"203.0.113.{random.randint(1, 254)}"
                logs.append(
                    f"<34>{timestamp} {asset['name']} portsentry: portscan detected from {scanner_ip}\n"
                )

    return logs


def generate_m365_logs(assets):
    """Generate M365 audit logs"""
    logs = []
    base_time = datetime.now() - timedelta(days=7)

    users = ["john.doe@company.com", "jane.smith@company.com", "admin@company.com", "it.ops@company.com"]

    for day in range(7):
        current_time = base_time + timedelta(days=day)

        # Normal logins
        for _ in range(random.randint(20, 50)):
            logs.append({
                "Id": f"m365-{random.randint(10000, 99999)}",
                "Operation": "UserLoggedIn",
                "UserId": random.choice(users),
                "CreationTime": (current_time + timedelta(hours=random.randint(0, 23))).isoformat() + "Z",
                "ClientIP": f"10.0.{random.randint(1, 10)}.{random.randint(1, 254)}",
                "Workload": "AzureActiveDirectory",
                "ResultStatus": "Success"
            })

        # Failed logins
        if random.random() < 0.3:
            attacker_ip = f"203.0.113.{random.randint(1, 254)}"
            for _ in range(random.randint(5, 15)):
                logs.append({
                    "Id": f"m365-{random.randint(10000, 99999)}",
                    "Operation": "UserLoginFailed",
                    "UserId": random.choice(users),
                    "CreationTime": (current_time + timedelta(hours=random.randint(0, 23))).isoformat() + "Z",
                    "ClientIP": attacker_ip,
                    "Workload": "AzureActiveDirectory",
                    "ResultStatus": "Failed"
                })

        # File downloads
        for _ in range(random.randint(10, 30)):
            logs.append({
                "Id": f"m365-{random.randint(10000, 99999)}",
                "Operation": "FileDownloaded",
                "UserId": random.choice(users),
                "CreationTime": (current_time + timedelta(hours=random.randint(0, 23))).isoformat() + "Z",
                "ClientIP": f"10.0.{random.randint(1, 10)}.{random.randint(1, 254)}",
                "Workload": "SharePoint"
            })

        # Suspicious inbox rule
        if random.random() < 0.05:
            logs.append({
                "Id": f"m365-{random.randint(10000, 99999)}",
                "Operation": "New-InboxRule",
                "UserId": random.choice(users),
                "CreationTime": (current_time + timedelta(hours=random.randint(0, 23))).isoformat() + "Z",
                "ClientIP": f"203.0.113.{random.randint(1, 254)}",
                "Workload": "Exchange",
                "AuditData": json.dumps({
                    "Parameters": [
                        {"Name": "ForwardTo", "Value": f"attacker{random.randint(1, 100)}@evil.com"}
                    ]
                })
            })

        # Anonymous link creation
        if random.random() < 0.1:
            logs.append({
                "Id": f"m365-{random.randint(10000, 99999)}",
                "Operation": "AnonymousLinkCreated",
                "UserId": random.choice(users),
                "CreationTime": (current_time + timedelta(hours=random.randint(0, 23))).isoformat() + "Z",
                "ClientIP": f"10.0.{random.randint(1, 10)}.{random.randint(1, 254)}",
                "Workload": "SharePoint"
            })

    return logs


def generate_defender_alerts(assets):
    """Generate Microsoft Defender alerts"""
    alerts = []
    base_time = datetime.now() - timedelta(days=7)

    windows_assets = [a for a in assets if "Windows" in a["os"]]

    alert_templates = [
        {
            "title": "Suspicious PowerShell execution",
            "severity": "High",
            "category": "Execution",
            "description": "PowerShell was used to execute encoded commands",
            "mitreTechniques": ["T1059.001"]
        },
        {
            "title": "Malware detected",
            "severity": "Critical",
            "category": "Malware",
            "description": "Potentially unwanted application detected",
            "mitreTechniques": ["T1204"]
        },
        {
            "title": "Credential dumping attempt",
            "severity": "Critical",
            "category": "Credential Access",
            "description": "Suspicious process attempted to access LSASS memory",
            "mitreTechniques": ["T1003.001"]
        },
        {
            "title": "Suspicious network connection",
            "severity": "Medium",
            "category": "Command and Control",
            "description": "Connection to known malicious IP address",
            "mitreTechniques": ["T1071"]
        },
        {
            "title": "Ransomware behavior detected",
            "severity": "Critical",
            "category": "Impact",
            "description": "Mass file encryption activity detected",
            "mitreTechniques": ["T1486"]
        }
    ]

    for day in range(7):
        current_time = base_time + timedelta(days=day)

        # Generate some alerts
        for _ in range(random.randint(2, 8)):
            if random.random() < 0.7:
                asset = random.choice(windows_assets)
                template = random.choice(alert_templates)

                alerts.append({
                    "id": f"defender-{random.randint(100000, 999999)}",
                    "title": template["title"],
                    "severity": template["severity"],
                    "category": template["category"],
                    "creationTime": (current_time + timedelta(hours=random.randint(0, 23))).isoformat() + "Z",
                    "machineId": asset["name"],
                    "status": random.choice(["New", "InProgress", "Resolved"]),
                    "description": template["description"],
                    "recommendedAction": "Investigate the activity and isolate the machine if necessary",
                    "mitreTechniques": template["mitreTechniques"]
                })

    return alerts


def main():
    """Generate all sample data"""
    print("="*70)
    print("GENERATING SAMPLE DATA")
    print("="*70)

    # Generate assets
    print("\nGenerating 40 server assets...")
    assets = generate_server_assets()
    print(f"  - 30 Windows servers")
    print(f"  - 10 Linux servers")
    print(f"  - {sum(1 for a in assets if a['exposed_to_internet'])} exposed to internet")
    print(f"  - All with EDR enabled")

    # Save assets
    with open("/tmp/sample_assets.json", "w") as f:
        json.dump(assets, f, indent=2)
    print(f"\nSaved to: /tmp/sample_assets.json")

    # Generate Windows events
    print("\nGenerating Windows security events...")
    windows_events = generate_windows_events(assets)
    print(f"  - Generated {len(windows_events)} Windows events")

    with open("/tmp/sample_windows_events.json", "w") as f:
        for event in windows_events:
            f.write(json.dumps(event) + "\n")
    print(f"Saved to: /tmp/sample_windows_events.json")

    # Generate syslog
    print("\nGenerating syslog events...")
    syslog_events = generate_syslog_events(assets)
    print(f"  - Generated {len(syslog_events)} syslog entries")

    with open("/tmp/sample_syslog.log", "w") as f:
        f.writelines(syslog_events)
    print(f"Saved to: /tmp/sample_syslog.log")

    # Generate M365 logs
    print("\nGenerating M365 audit logs...")
    m365_logs = generate_m365_logs(assets)
    print(f"  - Generated {len(m365_logs)} M365 events")

    with open("/tmp/sample_m365_logs.json", "w") as f:
        for log in m365_logs:
            f.write(json.dumps(log) + "\n")
    print(f"Saved to: /tmp/sample_m365_logs.json")

    # Generate Defender alerts
    print("\nGenerating Microsoft Defender alerts...")
    defender_alerts = generate_defender_alerts(assets)
    print(f"  - Generated {len(defender_alerts)} Defender alerts")

    with open("/tmp/sample_defender_alerts.json", "w") as f:
        for alert in defender_alerts:
            f.write(json.dumps(alert) + "\n")
    print(f"Saved to: /tmp/sample_defender_alerts.json")

    print("\n" + "="*70)
    print("SAMPLE DATA GENERATION COMPLETE")
    print("="*70)

    return {
        "assets": assets,
        "windows_events_count": len(windows_events),
        "syslog_count": len(syslog_events),
        "m365_count": len(m365_logs),
        "defender_count": len(defender_alerts)
    }


if __name__ == "__main__":
    main()
