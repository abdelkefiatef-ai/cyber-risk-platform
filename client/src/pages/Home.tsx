/* Design Philosophy: Brutalisme Cybernétique
 * - Dark brutalist aesthetic with asymmetric layout
 * - Neon cyan/green accents for interactive elements
 * - Monospace typography with aggressive hierarchy
 * - Angular shapes and diagonal cuts
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, AlertTriangle, Activity, Database, Network, Lock } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b-2 border-border">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-mono font-bold text-primary">CYBER_RISK</h1>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard">
              <a className="text-sm font-mono text-muted-foreground hover:text-primary transition-colors">
                DASHBOARD
              </a>
            </Link>
            <Link href="/threats">
              <a className="text-sm font-mono text-muted-foreground hover:text-primary transition-colors">
                THREATS
              </a>
            </Link>
            <Link href="/assets">
              <a className="text-sm font-mono text-muted-foreground hover:text-primary transition-colors">
                ASSETS
              </a>
            </Link>
            <Button className="cyber-corner bg-primary text-primary-foreground hover:bg-primary/90">
              GET STARTED
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url('https://private-us-east-1.manuscdn.com/sessionFile/3vw0ENxLahMG6JypsF3V0l/sandbox/DjfRVOdQHEbo3IzVdXprxR-img-1_1770730126000_na1fn_aGVyby1jeWJlci1ncmlk.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvM3Z3MEVOeExhaE1HNkp5cHNGM1YwbC9zYW5kYm94L0RqZlJWT2RRSEVibzNJelZkWHByeFItaW1nLTFfMTc3MDczMDEyNjAwMF9uYTFmbl9hR1Z5YnkxamVXSmxjaTFuY21saw.png~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODA&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=eDJP2ajUiWwuWO8wStrM-OnDibeHRTJAbeQQfRJVLYHZtNDvPwKCVQOjGqNFg7T0h-y4DBcCcSGxAuB47M6qsgyib3mQNYn6XwGbbc~Cpgs9DMwzYya9Yit7MBYaGHk3ta6KvziBBEmts6WdN7yb5YOctTkR0wV8DMY5fSXOPxHdeC0zWTPG8FDwFuGQ3pxGZQHoLHIB3AvcstxDIdWglzsksPrRblKgcrcnOhm37eRhQr-4nSCWygY~CN07N6WpUIoei3V19Q5BfsUndTVcil00p4Jdui3l3NNFZsf3Ge9eqZvSUYJz2bF8c565tip7NG7QazT2-6vBKL56D2VFnQ__')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="container relative py-32">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-2 mb-6 cyber-border bg-card/50 backdrop-blur-sm">
              <p className="text-sm font-mono text-primary">THREAT_INTELLIGENCE_v2.1</p>
            </div>
            <h2 className="text-6xl md:text-7xl font-mono font-bold mb-6 text-foreground leading-tight">
              COMPREHENSIVE<br />
              <span className="text-primary">CYBER RISK</span><br />
              ASSESSMENT
            </h2>
            <p className="text-xl font-mono text-muted-foreground mb-8 max-w-2xl">
              Transform security logs into actionable intelligence. Process multiple sources, 
              detect vulnerabilities, calculate dynamic risk scores.
            </p>
            <div className="flex gap-4">
              <Button size="lg" className="cyber-corner bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                ANALYZE THREATS
              </Button>
              <Button size="lg" variant="outline" className="cyber-corner border-2 border-primary text-primary hover:bg-primary/10">
                VIEW DOCUMENTATION
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y-2 border-border bg-card/30 backdrop-blur-sm">
        <div className="container py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { label: "LOG SOURCES", value: "4+", icon: Database },
              { label: "THREAT TYPES", value: "15+", icon: AlertTriangle },
              { label: "RISK FACTORS", value: "5", icon: Activity },
              { label: "MITRE ATT&CK", value: "100%", icon: Network },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-4xl font-mono font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm font-mono text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container py-24">
        <div className="mb-16">
          <div className="inline-block px-4 py-2 mb-4 cyber-border bg-card">
            <p className="text-sm font-mono text-primary">CORE_CAPABILITIES</p>
          </div>
          <h3 className="text-4xl font-mono font-bold text-foreground mb-4">
            MULTI-SOURCE ANALYSIS
          </h3>
          <p className="text-lg font-mono text-muted-foreground max-w-2xl">
            Unified platform for processing Syslog, Windows Events, M365 Audit Logs, and Microsoft Defender alerts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "LOG PARSING",
              description: "Process multiple log formats including Syslog RFC 3164/5424, Windows EVTX, M365 Audit, and Defender Alerts.",
              icon: Database,
              bg: "https://private-us-east-1.manuscdn.com/sessionFile/3vw0ENxLahMG6JypsF3V0l/sandbox/DjfRVOdQHEbo3IzVdXprxR-img-3_1770730125000_na1fn_c2VjdXJpdHktcGF0dGVybg.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvM3Z3MEVOeExhaE1HNkp5cHNGM1YwbC9zYW5kYm94L0RqZlJWT2RRSEVibzNJelZkWHByeFItaW1nLTNfMTc3MDczMDEyNTAwMF9uYTFmbl9jMlZqZFhKcGRIa3RjR0YwZEdWeWJnLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=czuHpxJ-Lqwmefa58R11KmJMQPAw8sC1ln5iwOVQkKlRf4tVCcceSAEUKxB8FAxmT-i1PB9D2QLJ~-qWrdszSKk74o3q2dj2Wxng9IaiKrFASQHGRPiyrFrSNMchWZEv-vc42nxmtNoiYh3lVTHmc8Nvv7WuioXFhcQze3dM2ksEFpBHdR5UdKlOmq1FXh4VJzPsnVHJrdW4co3wZz1GC0fBjy7aCoetwkhCXtlyA82-d78zFb1OfrbJVptyeMvWW2vkbkPldIKhOfzvFTDGHOcnwgduAl7WYTKZqw5P9P7XPzqXbpZAYUgYwr34gcVrtnieU9KGNQq0a1xUM3Lk0w__"
            },
            {
              title: "VULNERABILITY DETECTION",
              description: "Identify brute force attacks, malware, suspicious processes, data exfiltration, privilege escalation, and lateral movement.",
              icon: AlertTriangle,
              bg: "https://private-us-east-1.manuscdn.com/sessionFile/3vw0ENxLahMG6JypsF3V0l/sandbox/DjfRVOdQHEbo3IzVdXprxR-img-5_1770730120000_na1fn_dnVsbmVyYWJpbGl0eS1pY29uLWJn.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvM3Z3MEVOeExhaE1HNkp5cHNGM1YwbC9zYW5kYm94L0RqZlJWT2RRSEVibzNJelZkWHByeFItaW1nLTVfMTc3MDczMDEyMDAwMF9uYTFmbl9kblZzYm1WeVlXSnBiR2wwZVMxcFkyOXVMV0puLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=XQ1~B1B9z6~9RU-ak4fNBHA9KgTAWNNkr1H2ZmeFukMGV2nWffwa6FwuQ7D9SlPRQQDihaSv3Yj-cXONye73Q9op4kKRLQhV3u06A4tKkzgBTVhkJqETcuGNmdXZfWjXsp3Nnc8~yJqYl1PFV~ZtrvMpGQyvhaAYViPBirSkg39hevV19h5nNFeBnvsaXHCFir-c8edWEKp6G7u7~FI5Bs3uG60LncGVtb82WnWEuRhVlgtrO8vjRLhOrTPHTZXjLXuCx74IRkUuFSKeBqUZ7JGe7opupxgZoF9Zmo~k189YFXajUa-y9uMlj-I~PoNPuzUJlUlnn3JAhYh4abSDig__"
            },
            {
              title: "RISK CALCULATION",
              description: "Dynamic scoring based on CVSS, exploitability, asset criticality, exposure factors, and threat intelligence.",
              icon: Activity,
              bg: "https://private-us-east-1.manuscdn.com/sessionFile/3vw0ENxLahMG6JypsF3V0l/sandbox/DjfRVOdQHEbo3IzVdXprxR-img-2_1770730131000_na1fn_cmlzay1kYXNoYm9hcmQtYWJzdHJhY3Q.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvM3Z3MEVOeExhaE1HNkp5cHNGM1YwbC9zYW5kYm94L0RqZlJWT2RRSEVibzNJelZkWHByeFItaW1nLTJfMTc3MDczMDEzMTAwMF9uYTFmbl9jbWx6YXkxa1lYTm9ZbTloY21RdFlXSnpkSEpoWTNRLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=EMV3oqsQ8Jl2b0Uj~J8VKdY5UBspDS6-dPztsP-63Lb80MaRYQQN4hb~AJGVHf~OKMVon9s1v25fWw1jQ-ZrHNSjP0KuVBBf-rAMMGPm94ku~Y4vKx1EQSiwYSeB~tTAoNQKsFKc-7C4jcO0klK7r-gYqm96fLf2kZaeV2eNgWxExCaCUP3hE6mGiunMRBQZ0CYuXsjbbVvtngM0XJU4yEIJ3-~v0U46lowBmL0NkSa3LCcFvRsxMZDyyJrhcvmMo3ObjvG-ttcHBA4JVQVff3IBShMxmmqQ2o1GLeT-voYtgDQZN8XoRiv3C0QJAVgvNxUwdPAxg~HfE0~oBU9jXA__"
            },
            {
              title: "SCENARIO GENERATION",
              description: "Multi-stage attack chains, lateral movement paths, data breach scenarios with MITRE ATT&CK mapping.",
              icon: Network,
              bg: "https://private-us-east-1.manuscdn.com/sessionFile/3vw0ENxLahMG6JypsF3V0l/sandbox/DjfRVOdQHEbo3IzVdXprxR-img-4_1770730130000_na1fn_dGhyZWF0LWludGVsbGlnZW5jZS1iZw.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvM3Z3MEVOeExhaE1HNkp5cHNGM1YwbC9zYW5kYm94L0RqZlJWT2RRSEVibzNJelZkWHByeFItaW1nLTRfMTc3MDczMDEzMDAwMF9uYTFmbl9kR2h5WldGMExXbHVkR1ZzYkdsblpXNWpaUzFpWncucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=Zkemub3-j9oAEQ8~itsw0QM4KrDOfSVCAlXEnVbLMmKq9iwNckgDsy0nhVzX~RxYCetRXRCVJfVCW4X3HNnia956rYK1bZcfxO~5vUq6PqvkrWITcHt~Naz9hYgPcjGIV4ysUIEp2T0YudU0ApdOxwyKDKS51hl-9mSSjNXchBZNE7RVbOyG8xZcbHecbs1EyGUHoeOmsyz04k3rHNYF6GKxJeHYX-CegbqYgU4F92MR0F7XXWSzDYwwDpz-cm73QwPRbOOGT3jnUItT~W3SkTTQfse799m5If9zlt0W01STu5ZyF7oxsN2CwsjhuCQjSEolL3Ykz8MLTqGnIZr21A__"
            },
            {
              title: "ASSET MANAGEMENT",
              description: "Automatic asset discovery from logs with criticality assessment and exposure analysis.",
              icon: Database,
              bg: "https://private-us-east-1.manuscdn.com/sessionFile/3vw0ENxLahMG6JypsF3V0l/sandbox/DjfRVOdQHEbo3IzVdXprxR-img-3_1770730125000_na1fn_c2VjdXJpdHktcGF0dGVybg.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvM3Z3MEVOeExhaE1HNkp5cHNGM1YwbC9zYW5kYm94L0RqZlJWT2RRSEVibzNJelZkWHByeFItaW1nLTNfMTc3MDczMDEyNTAwMF9uYTFmbl9jMlZqZFhKcGRIa3RjR0YwZEdWeWJnLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=czuHpxJ-Lqwmefa58R11KmJMQPAw8sC1ln5iwOVQkKlRf4tVCcceSAEUKxB8FAxmT-i1PB9D2QLJ~-qWrdszSKk74o3q2dj2Wxng9IaiKrFASQHGRPiyrFrSNMchWZEv-vc42nxmtNoiYh3lVTHmc8Nvv7WuioXFhcQze3dM2ksEFpBHdR5UdKlOmq1FXh4VJzPsnVHJrdW4co3wZz1GC0fBjy7aCoetwkhCXtlyA82-d78zFb1OfrbJVptyeMvWW2vkbkPldIKhOfzvFTDGHOcnwgduAl7WYTKZqw5P9P7XPzqXbpZAYUgYwr34gcVrtnieU9KGNQq0a1xUM3Lk0w__"
            },
            {
              title: "THREAT INTELLIGENCE",
              description: "Integration with CVE databases, active exploitation tracking, and APT association analysis.",
              icon: Lock,
              bg: "https://private-us-east-1.manuscdn.com/sessionFile/3vw0ENxLahMG6JypsF3V0l/sandbox/DjfRVOdQHEbo3IzVdXprxR-img-5_1770730120000_na1fn_dnVsbmVyYWJpbGl0eS1pY29uLWJn.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvM3Z3MEVOeExhaE1HNkp5cHNGM1YwbC9zYW5kYm94L0RqZlJWT2RRSEVibzNJelZkWHByeFItaW1nLTVfMTc3MDczMDEyMDAwMF9uYTFmbl9kblZzYm1WeVlXSnBiR2wwZVMxcFkyOXVMV0puLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=XQ1~B1B9z6~9RU-ak4fNBHA9KgTAWNNkr1H2ZmeFukMGV2nWffwa6FwuQ7D9SlPRQQDihaSv3Yj-cXONye73Q9op4kKRLQhV3u06A4tKkzgBTVhkJqETcuGNmdXZfWjXsp3Nnc8~yJqYl1PFV~ZtrvMpGQyvhaAYViPBirSkg39hevV19h5nNFeBnvsaXHCFir-c8edWEKp6G7u7~FI5Bs3uG60LncGVtb82WnWEuRhVlgtrO8vjRLhOrTPHTZXjLXuCx74IRkUuFSKeBqUZ7JGe7opupxgZoF9Zmo~k189YFXajUa-y9uMlj-I~PoNPuzUJlUlnn3JAhYh4abSDig__"
            },
          ].map((feature, i) => (
            <Card key={i} className="relative overflow-hidden cyber-corner border-2 border-border bg-card hover:border-primary transition-all group">
              <div 
                className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
                style={{
                  backgroundImage: `url('${feature.bg}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="relative p-6">
                <feature.icon className="w-10 h-10 text-primary mb-4" />
                <h4 className="text-xl font-mono font-bold text-foreground mb-3">
                  {feature.title}
                </h4>
                <p className="text-sm font-mono text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-y-2 border-border bg-card/50 backdrop-blur-sm">
        <div className="container py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block px-4 py-2 mb-6 cyber-border bg-background">
              <p className="text-sm font-mono text-primary">READY_TO_DEPLOY</p>
            </div>
            <h3 className="text-5xl font-mono font-bold text-foreground mb-6">
              START ANALYZING YOUR SECURITY POSTURE
            </h3>
            <p className="text-lg font-mono text-muted-foreground mb-8">
              No external dependencies. Python 3.8+ standard library only. Production-ready architecture.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="cyber-corner bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                GET STARTED NOW
              </Button>
              <Button size="lg" variant="outline" className="cyber-corner border-2 border-primary text-primary hover:bg-primary/10">
                VIEW ON GITHUB
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-border bg-background">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-primary" />
                <span className="text-lg font-mono font-bold text-primary">CYBER_RISK</span>
              </div>
              <p className="text-sm font-mono text-muted-foreground">
                Comprehensive cybersecurity risk assessment platform.
              </p>
            </div>
            <div>
              <h5 className="text-sm font-mono font-bold text-foreground mb-4">PLATFORM</h5>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm font-mono text-muted-foreground hover:text-primary">Features</a></li>
                <li><a href="#" className="text-sm font-mono text-muted-foreground hover:text-primary">Documentation</a></li>
                <li><a href="#" className="text-sm font-mono text-muted-foreground hover:text-primary">API Reference</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-mono font-bold text-foreground mb-4">RESOURCES</h5>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm font-mono text-muted-foreground hover:text-primary">GitHub</a></li>
                <li><a href="#" className="text-sm font-mono text-muted-foreground hover:text-primary">Examples</a></li>
                <li><a href="#" className="text-sm font-mono text-muted-foreground hover:text-primary">Integration Guide</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-mono font-bold text-foreground mb-4">LEGAL</h5>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm font-mono text-muted-foreground hover:text-primary">Privacy Policy</a></li>
                <li><a href="#" className="text-sm font-mono text-muted-foreground hover:text-primary">Terms of Service</a></li>
                <li><a href="#" className="text-sm font-mono text-muted-foreground hover:text-primary">License</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-sm font-mono text-muted-foreground">
              © 2026 CYBER_RISK PLATFORM. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
