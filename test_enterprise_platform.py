"""
Enterprise Platform Integration Test
Validates the fusion of GitHub infrastructure and Ultra-Precise AI engine
"""
import os
import sys

# Add current dir to path to allow imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

from core.orchestrator import RiskPlatformOrchestrator
from models.risk_models import AssetCategory, AssetCriticality

def run_test():
    print("🚀 Initializing Enterprise Cyber Risk Platform...")
    orchestrator = RiskPlatformOrchestrator()
    
    # 1. Add some manual assets
    print("\n📦 Adding assets...")
    orchestrator.add_manual_asset({
        "id": "srv-prod-db-01",
        "name": "Production Database",
        "category": "DATABASE",
        "ip_address": "10.0.1.50",
        "os": "Ubuntu 22.04",
        "criticality": "MISSION_CRITICAL",
        "contains_sensitive_data": True,
        "exposed_to_internet": False
    })
    
    orchestrator.add_manual_asset({
        "id": "wkst-exec-01",
        "name": "Executive Workstation",
        "category": "WORKSTATION",
        "ip_address": "10.0.5.12",
        "os": "Windows 11",
        "criticality": "HIGH",
        "exposed_to_internet": True
    })
    
    # 2. Process some sample log data (using existing example files if possible, or skip)
    # For this test, we'll manually inject some vulnerabilities
    from models.risk_models import Vulnerability, RiskLevel, VulnerabilitySource
    from datetime import datetime
    
    print("\n🔍 Injecting vulnerabilities...")
    v1 = Vulnerability(
        id="VULN-001",
        cve_id="CVE-2024-1234",
        title="Remote Code Execution in Web Server",
        description="A critical RCE vulnerability in the production web server.",
        severity=RiskLevel.CRITICAL,
        cvss_score=9.8,
        source=VulnerabilitySource.MANUAL,
        affected_assets=["srv-prod-db-01"],
        exploit_available=True,
        patch_available=False
    )
    
    v2 = Vulnerability(
        id="VULN-002",
        cve_id="CVE-2024-5678",
        title="Local Privilege Escalation",
        description="A medium severity LPE vulnerability.",
        severity=RiskLevel.MEDIUM,
        cvss_score=6.5,
        source=VulnerabilitySource.MANUAL,
        affected_assets=["wkst-exec-01"],
        exploit_available=False,
        patch_available=True
    )
    
    orchestrator.all_vulnerabilities[v1.id] = v1
    orchestrator.risk_engine.add_vulnerability(v1)
    orchestrator.all_vulnerabilities[v2.id] = v2
    orchestrator.risk_engine.add_vulnerability(v2)
    
    # Update asset vuln links
    orchestrator.all_assets["srv-prod-db-01"].vulnerability_ids.append(v1.id)
    orchestrator.all_assets["wkst-exec-01"].vulnerability_ids.append(v2.id)
    
    # 3. Calculate risks using the Ultra-Precise engine
    print("\n🧮 Running Ultra-Precise Risk Calculation...")
    results = orchestrator.calculate_all_risks()
    
    # 4. Verify results
    print("\n✅ Verification:")
    for asset_id, score_obj in results["ultra_results"].items():
        print(f"  Asset: {asset_id}")
        print(f"  Score: {score_obj.score:.2f}")
        print(f"  Confidence: {score_obj.confidence*100:.1f}%")
        print(f"  Precision Level: {score_obj.precision_level}")
        print(f"  Uncertainty: {score_obj.uncertainty:.4f}")
        print("-" * 30)
    
    # 5. Generate Report
    print("\n📝 Generating Enterprise Report...")
    report = orchestrator.generate_report()
    print("\n--- REPORT PREVIEW ---")
    print("\n".join(report.split("\n")[:15]))
    
    print("\n✨ Test completed successfully!")

if __name__ == "__main__":
    try:
        run_test()
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
