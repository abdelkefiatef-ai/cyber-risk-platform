"""
Run Risk Platform with Generated Sample Data
Complete end-to-end demonstration with 40 servers
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.orchestrator import RiskPlatformOrchestrator
from generate_sample_data import main as generate_data
import json


def main():
    """Run complete risk assessment with sample data"""
    print("\n" + "="*70)
    print("CYBER RISK PLATFORM - COMPLETE DEMONSTRATION")
    print("="*70)
    print()

    # Step 1: Generate sample data
    print("STEP 1: GENERATING SAMPLE DATA")
    print("-"*70)
    data_summary = generate_data()
    print()

    # Step 2: Initialize orchestrator
    print("\nSTEP 2: INITIALIZING RISK PLATFORM")
    print("-"*70)
    orchestrator = RiskPlatformOrchestrator()
    print("Risk platform orchestrator initialized")
    print()

    # Step 3: Load assets
    print("\nSTEP 3: LOADING ASSETS")
    print("-"*70)
    with open("/tmp/sample_assets.json", "r") as f:
        assets = json.load(f)

    print(f"Loading {len(assets)} assets...")
    for asset in assets:
        orchestrator.add_manual_asset(asset)
    print(f"Loaded {len(assets)} assets into the platform")

    # Asset summary
    windows_count = sum(1 for a in assets if "Windows" in a["os"])
    linux_count = sum(1 for a in assets if "Linux" in a["os"] or "Ubuntu" in a["os"])
    exposed_count = sum(1 for a in assets if a["exposed_to_internet"])
    mission_critical = sum(1 for a in assets if a["criticality"] == "Mission Critical")

    print(f"\nAsset Summary:")
    print(f"  - Total Assets: {len(assets)}")
    print(f"  - Windows Servers: {windows_count}")
    print(f"  - Linux Servers: {linux_count}")
    print(f"  - Internet Exposed: {exposed_count}")
    print(f"  - Mission Critical: {mission_critical}")
    print()

    # Step 4: Process logs
    print("\nSTEP 4: PROCESSING SECURITY LOGS")
    print("-"*70)

    # Process Windows events
    print("\n[1/4] Processing Windows security events...")
    win_stats = orchestrator.process_windows_events_json("/tmp/sample_windows_events.json")
    print(f"  ✓ Processed {win_stats['total_events']} Windows events")
    print(f"  ✓ Detected {win_stats['vulnerabilities_found']} vulnerabilities")

    # Process syslog
    print("\n[2/4] Processing syslog events...")
    syslog_stats = orchestrator.process_syslog_file("/tmp/sample_syslog.log")
    print(f"  ✓ Processed {syslog_stats['total_events']} syslog events")
    print(f"  ✓ Detected {syslog_stats['vulnerabilities_found']} vulnerabilities")

    # Process M365 logs
    print("\n[3/4] Processing M365 audit logs...")
    m365_stats = orchestrator.process_m365_audit_logs("/tmp/sample_m365_logs.json")
    print(f"  ✓ Processed {m365_stats['total_events']} M365 events")
    print(f"  ✓ Detected {m365_stats['vulnerabilities_found']} vulnerabilities")

    # Process Defender alerts
    print("\n[4/4] Processing Microsoft Defender alerts...")
    defender_stats = orchestrator.process_defender_alerts("/tmp/sample_defender_alerts.json")
    print(f"  ✓ Processed {defender_stats['total_events']} Defender alerts")
    print(f"  ✓ Detected {defender_stats['vulnerabilities_found']} vulnerabilities")

    print(f"\nTotal Vulnerabilities Detected: {len(orchestrator.all_vulnerabilities)}")
    print()

    # Step 5: Calculate risks
    print("\nSTEP 5: CALCULATING RISK SCORES")
    print("-"*70)
    results = orchestrator.calculate_all_risks()

    summary = results["summary"]
    print(f"\nRisk Calculation Complete!")
    print(f"  - Assets Analyzed: {summary['total_assets']}")
    print(f"  - Vulnerabilities: {summary['total_vulnerabilities']}")
    print(f"  - Average Risk Score: {summary['average_risk_score']:.1f}/100")
    print(f"  - Risk Scenarios Generated: {summary['risk_scenarios']}")
    print()

    # Risk distribution
    print("Risk Distribution:")
    print(f"  - Critical (90-100): {summary['critical_assets']} assets")
    print(f"  - High (70-89):      {summary['high_risk_assets']} assets")
    print(f"  - Medium (40-69):    {summary['medium_risk_assets']} assets")
    print(f"  - Low (0-39):        {summary['low_risk_assets']} assets")
    print()

    # Step 6: Display top risks
    print("\nSTEP 6: TOP 10 HIGHEST RISK ASSETS")
    print("-"*70)
    for i, result in enumerate(results["risk_results"][:10], 1):
        asset = orchestrator.all_assets[result.asset_id]
        criticality_indicator = "🔴" if asset.criticality.value == "Mission Critical" else "🟠" if asset.criticality.value == "High" else "🟡"
        internet_indicator = "🌐" if asset.exposed_to_internet else "  "

        print(f"\n{i:2d}. {asset.name:20s}  Risk: {result.total_risk_score:5.1f}/100")
        print(f"    IP: {asset.ip_address:15s}  OS: {asset.os:20s}")
        print(f"    Criticality: {asset.criticality.value:20s}  Internet: {'Yes' if asset.exposed_to_internet else 'No'}")
        print(f"    Vulnerabilities: {len(result.contributing_vulnerabilities):2d}  "
              f"Patch Level: {asset.patch_level}")
        if result.recommendations:
            print(f"    → {result.recommendations[0]}")

    # Step 7: Display risk scenarios
    if results["scenarios"]:
        print("\n\nSTEP 7: CRITICAL RISK SCENARIOS")
        print("-"*70)
        for i, scenario in enumerate(results["scenarios"][:5], 1):
            print(f"\n{i}. {scenario.title}")
            print(f"   Severity: {scenario.severity.value:15s}  Business Risk: {scenario.business_risk_score:.1f}/100")
            print(f"   Likelihood: {scenario.likelihood:15s}  Impact: {scenario.impact}")
            print(f"   Affected Assets: {len(scenario.affected_asset_ids)}")
            print(f"   MITRE Tactics: {', '.join(scenario.mitre_tactics[:3])}")
            print(f"   Remediation: {scenario.remediation_plan[:100]}...")

    # Step 8: Export results
    print("\n\nSTEP 8: EXPORTING RESULTS")
    print("-"*70)
    output_dir = "./output"
    orchestrator.export_to_json(output_dir)

    # Generate text report
    report = orchestrator.generate_report()
    with open(f"{output_dir}/risk_report.txt", "w") as f:
        f.write(report)
    print(f"  ✓ Text report saved to {output_dir}/risk_report.txt")
    print()

    # Step 9: Summary statistics
    print("\nSTEP 9: DETAILED STATISTICS")
    print("-"*70)

    # Vulnerability breakdown by severity
    vuln_severity = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
    for vuln in orchestrator.all_vulnerabilities.values():
        vuln_severity[vuln.severity.value] = vuln_severity.get(vuln.severity.value, 0) + 1

    print("\nVulnerability Severity Distribution:")
    for severity, count in vuln_severity.items():
        print(f"  {severity:10s}: {count:3d}")

    # Vulnerability by source
    vuln_source = {}
    for vuln in orchestrator.all_vulnerabilities.values():
        source = vuln.source.value
        vuln_source[source] = vuln_source.get(source, 0) + 1

    print("\nVulnerability Detection Source:")
    for source, count in vuln_source.items():
        print(f"  {source:25s}: {count:3d}")

    # Assets by criticality
    criticality_dist = {}
    for asset in orchestrator.all_assets.values():
        crit = asset.criticality.value
        criticality_dist[crit] = criticality_dist.get(crit, 0) + 1

    print("\nAssets by Criticality:")
    for crit, count in criticality_dist.items():
        print(f"  {crit:20s}: {count:3d}")

    # Internet exposure analysis
    exposed_assets = [a for a in orchestrator.all_assets.values() if a.exposed_to_internet]
    if exposed_assets:
        avg_exposed_risk = sum(a.risk_score for a in exposed_assets) / len(exposed_assets)
        print(f"\nInternet-Exposed Assets:")
        print(f"  Count: {len(exposed_assets)}")
        print(f"  Average Risk Score: {avg_exposed_risk:.1f}/100")

    print("\n" + "="*70)
    print("RISK ASSESSMENT COMPLETE")
    print("="*70)
    print(f"\nResults exported to: {output_dir}/")
    print("  - assets.json")
    print("  - vulnerabilities.json")
    print("  - risk_scenarios.json")
    print("  - risk_summary.json")
    print("  - risk_report.txt")
    print()


if __name__ == "__main__":
    main()
