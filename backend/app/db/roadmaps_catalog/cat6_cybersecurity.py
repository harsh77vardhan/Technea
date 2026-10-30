"""Domain 6: Cybersecurity Roadmaps (12 Roadmaps)"""

CYBERSECURITY_ROADMAPS = [
    {
        "title": "Ethical Hacking & Penetration Testing",
        "slug": "ethical-hacking-penetration-testing",
        "category": "Cybersecurity",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "12 Weeks",
        "description": "Master offensive security methodologies and penetration testing workflows. Learn reconnaissance, network scanning with Nmap, vulnerability assessment, exploitation frameworks (Metasploit), privilege escalation (Linux & Windows), Active Directory attacks, and executive reporting.",
        "skills_covered": ["Offensive Security Methodologies", "Reconnaissance & OSINT", "Network Scanning & Port Enumeration", "Metasploit Framework Exploitation", "Linux & Windows Privilege Escalation", "Active Directory Attacks (Kerberoasting)", "Professional Pentest Reporting"],
        "prerequisites": ["Solid understanding of TCP/IP networking, subnets, and ports", "Comfortable with the Linux command line (Kali Linux / Debian)"],
        "career_outcomes": ["Penetration Tester", "Ethical Hacker", "Offensive Security Consultant", "Red Team Analyst"],
        "tech_stack": ["Kali Linux", "Nmap", "Metasploit", "Burp Suite", "Wireshark", "Hashcat", "BloodHound"],
        "tags": ["ethical-hacking", "penetration-testing", "offensive-security", "metasploit", "nmap", "oscp", "cybersecurity"],
        "capstone_projects": [
            {
                "title": "Full-Scope Black-Box Corporate Network Penetration Test",
                "description": "Conduct an authorized black-box penetration test against a simulated corporate environment: perform OSINT, gain initial access via vulnerable services, escalate privileges to root, compromise Active Directory, and draft an executive remediation report.",
                "difficulty": "Advanced"
            },
            {
                "title": "Automated Vulnerability Scanner & Exploit Demonstrator",
                "description": "Develop a modular Python-based reconnaissance tool that scans CIDR ranges, identifies service banners, checks against CVE databases, and reports risk scores.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "The Web Application Hacker's Handbook by Dafydd Stuttard", "url": "https://portswigger.net/web-security", "type": "Classic Book & Lab"},
            {"title": "TryHackMe & Hack The Box Penetration Testing Tracks", "url": "https://www.hackthebox.com/", "type": "Interactive Labs"},
            {"title": "Penetration Testing: A Hands-On Introduction to Hacking by Georgia Weidman", "url": "https://nostarch.com/pentesting", "type": "Book"}
        ],
        "is_featured": True,
        "popularity_rank": 24,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Penetration Testing Frameworks & Legal Boundaries",
                "description": "Understand offensive security ethics, Rules of Engagement (RoE), Scope definition, PTES, and the MITRE ATT&CK framework.",
                "topics_covered": ["Ethical Hacking Legal Boundaries (CFAA, Computer Misuse Act)", "Rules of Engagement (RoE) & Scope Agreements", "Penetration Testing Execution Standard (PTES) Phases", "MITRE ATT&CK Enterprise Matrix Tactics", "Setting up a Safe Virtualized Lab Environment"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Information Gathering & Passive/Active Reconnaissance",
                "description": "Gather intelligence using OSINT, DNS interrogation, WHOIS lookups, Google dorking, Shodan, and active Nmap port scanning.",
                "topics_covered": ["Passive OSINT with theHarvester, Maltego & Shodan", "DNS Reconnaissance: Zone Transfers, Subdomain Brute-Forcing", "Nmap TCP SYN (-sS), UDP (-sU), and Aggressive (-A) Scans", "Nmap Scripting Engine (NSE) for Vulnerability Detection", "Service Fingerprinting & Banner Grabbing"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Vulnerability Assessment & Metasploit Exploitation",
                "description": "Identify known CVEs and leverage the Metasploit Framework to execute payloads, manage multi-handlers, and establish reverse shells.",
                "topics_covered": ["Searching CVE Databases & Exploit-DB", "Metasploit Architecture: Exploits, Payloads, Auxiliaries, Encoders", "Staged vs Inline Payloads (meterpreter/reverse_tcp)", "Setting Up Multi-Handlers & Listener Ports", "Evading Basic Antivirus with Msfvenom Payload Customization"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "Linux & Windows Privilege Escalation",
                "description": "Elevate unprivileged access to Root/SYSTEM: SUID binaries, sudo misconfigurations, cron jobs, token impersonation, and unquoted paths.",
                "topics_covered": ["Linux Privilege Escalation: SUID/SGID Bit Exploitation", "Exploiting Writable /etc/passwd or Sudo Misconfigurations", "Automated Enumeration Scripts (LinPEAS, WinPEAS)", "Windows Privilege Escalation: Unquoted Service Paths & Weak Permissions", "Token Impersonation & Potato Attacks (PrintSpoofer, RottenPotato)"],
                "duration": "3 Weeks"
            },
            {
                "step_number": 5,
                "title": "Active Directory Attacks & Lateral Movement",
                "description": "Compromise enterprise Active Directory networks: LLMNR poisoning, Kerberoasting, AS-REP roasting, BloodHound path analysis, and pass-the-hash.",
                "topics_covered": ["Active Directory Domain Services (AD DS) Architecture", "LLMNR & NBT-NS Poisoning with Responder", "Kerberos Protocol Mechanics: AS-REQ, TGT, TGS-REP", "Kerberoasting & Offline Ticket Cracking with Hashcat", "Mapping Attack Paths to Domain Admin with BloodHound"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "Post-Exploitation, Pivoting & Professional Reporting",
                "description": "Establish persistent access, pivot through internal firewalls using SSH dynamic port forwarding/Chisel, and deliver C-suite reports.",
                "topics_covered": ["Internal Network Pivoting with SSH SOCKS Proxies & Chisel", "Pivoting via Metasploit AutoRoute & Portfwd", "Maintaining Access with Scheduled Tasks & Registry Run Keys", "Writing Executive Summaries vs Technical Findings", "Risk Rating with CVSS v3.1 & Practical Remediation Guidance"],
                "duration": "2 Weeks"
            }
        ]
    },
    {
        "title": "Cyber Security Analyst & SOC Operations",
        "slug": "cyber-security-analyst-soc-operations",
        "category": "Cybersecurity",
        "level": "Beginner",
        "difficulty": "Beginner",
        "duration": "10 Weeks",
        "description": "Train for the frontlines of defensive security in a Security Operations Center (SOC). Master SIEM monitoring with Splunk / Elastic Security, log analysis (Windows Event Logs, Sysmon, Zeek), alert triage, malware containment, and incident handling workflows.",
        "skills_covered": ["SOC Tier 1 & Tier 2 Triage Workflows", "SIEM Architecture & Splunk SPL Querying", "Log Analysis (Sysmon, Windows Events, Linux)", "Network Traffic Analysis with Wireshark", "Threat Intelligence Platforms (MISP, VirusTotal)", "MITRE ATT&CK Mapping", "Incident Containment Protocols"],
        "prerequisites": ["Basic understanding of computer systems and networking", "Curiosity about defensive security and threat analysis"],
        "career_outcomes": ["SOC Analyst (Tier 1/Tier 2)", "Cyber Defense Analyst", "Information Security Specialist", "Threat Intelligence Associate"],
        "tech_stack": ["Splunk", "Elastic Security", "Wireshark", "Sysmon", "VirusTotal", "MISP", "Any.Run"],
        "tags": ["soc", "cybersecurity", "splunk", "siem", "wireshark", "log-analysis", "blue-team"],
        "capstone_projects": [
            {
                "title": "Enterprise Ransomware Intrusion SOC Investigation & Report",
                "description": "Investigate a simulated corporate ransomware outbreak using Splunk: trace patient zero through phishing email logs, track lateral movement via Sysmon, and author an incident response timeline.",
                "difficulty": "Intermediate"
            },
            {
                "title": "Automated Threat Hunting & Detection Rule Suite with Sigma",
                "description": "Write and test custom Sigma detection rules for detecting credential dumping (Mimikatz) and persistence mechanisms, converting them to Splunk and Elastic queries.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "Splunk Fundamentals Free Training & Docs", "url": "https://www.splunk.com/en_us/training/free-courses/splunk-fundamentals-1.html", "type": "Interactive Courses"},
            {"title": "Blue Team Handbook: Incident Response Edition by Don Murdoch", "url": "https://www.amazon.com/Blue-Team-Handbook-condensed-Field/dp/1500734776", "type": "Book"},
            {"title": "CyberDefenders Free Hands-on Blue Team Labs", "url": "https://cyberdefenders.org/", "type": "Hands-on Labs"}
        ],
        "is_featured": False,
        "popularity_rank": 30,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "SOC Foundations, Threat Landscape & Security Frameworks",
                "description": "Understand modern SOC roles, the Cyber Kill Chain, MITRE ATT&CK framework, NIST Cybersecurity Framework, and defense-in-depth.",
                "topics_covered": ["Role of a SOC Analyst (Tier 1 Triage vs Tier 2 Escalation)", "Lockheed Martin Cyber Kill Chain Stages", "MITRE ATT&CK Enterprise Navigator", "NIST Cybersecurity Framework (Identify, Protect, Detect, Respond, Recover)", "Security Incident Severity Classifications (Low to Critical)"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Endpoint Log Analysis: Windows Events & Sysmon",
                "description": "Inspect Windows Event Logs and Sysmon for signs of compromise: process creation (Event ID 1), network connections, and registry changes.",
                "topics_covered": ["Windows Security Event IDs (4624 Logon, 4672 Admin, 4688 Process)", "Microsoft Sysinternals Sysmon Installation & Configuration", "Sysmon Event ID 1 (Process Create) & Command-Line Arguments", "Sysmon Event ID 3 (Network Connect) & Beaconing Detection", "Linux Syslog, /var/log/auth.log, and auditd Basics"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Network Traffic Analysis with Wireshark & Zeek",
                "description": "Dissect PCAP network captures to identify malware beacons, DNS exfiltration, cleartext credentials, and port scans with Wireshark.",
                "topics_covered": ["Packet Sniffing Basics & Promiscuous Mode", "Wireshark Display Filters for Protocol Analysis", "Analyzing TCP Handshakes, Resets, and SYN Floods", "Investigating Malicious HTTP/DNS Traffic & Fast Flux", "Zeek (Bro) Network Security Monitoring Log Formats"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "SIEM Mastery with Splunk & Search Processing Language",
                "description": "Search and correlate millions of log events using Splunk Search Processing Language (SPL): search, stats, eval, timechart, and lookups.",
                "topics_covered": ["SIEM Architecture: Forwarders, Indexers, Search Heads", "Splunk SPL Syntax & Filtering Commands", "Aggregation with stats, chart, and timechart", "Creating Dynamic Lookup Tables & Correlating Assets", "Building Real-Time SOC Operational Dashboards"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 5,
                "title": "Threat Intelligence & Triage Investigation",
                "description": "Enrich alerts with actionable threat intelligence using VirusTotal, MISP, AlienVault OTX, and dynamic malware sandboxes.",
                "topics_covered": ["Indicators of Compromise (IoCs): Hashes, IPs, Domains, Mutexes", "David Bianco's Pyramid of Pain", "Using VirusTotal & Hybrid Analysis Sandboxes", "Threat Intelligence Platforms (MISP & OpenCTI)", "Distinguishing True Positives from False Positives"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "Incident Handling, Containment & Remediation",
                "description": "Execute incident response playbooks: host network isolation, revoking active sessions, credential resets, and post-incident documentation.",
                "topics_covered": ["NIST SP 800-61 Incident Handling Lifecycle", "Standard Operating Procedures (SOPs) & Playbooks", "Host Isolation & Forensic Evidence Preservation", "Remediation: Terminating Processes, Blocking Hashes/IPs", "Writing Professional Incident Summary Reports"],
                "duration": "2 Weeks"
            }
        ]
    },
    {
        "title": "Web Application Security & OWASP Top 10",
        "slug": "web-application-security-owasp",
        "category": "Cybersecurity",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "8 Weeks",
        "description": "Master web application security auditing and defenses. Deep dive into the OWASP Top 10 vulnerabilities: SQL Injection, Cross-Site Scripting (XSS), Cross-Site Request Forgery (CSRF), Server-Side Request Forgery (SSRF), Insecure Direct Object References (IDOR), and Burp Suite Pro.",
        "skills_covered": ["OWASP Top 10 Vulnerabilities", "Burp Suite Interception & Repeater", "SQL Injection (SQLi) & Bypass Techniques", "Cross-Site Scripting (Stored, Reflected, DOM)", "Server-Side Request Forgery (SSRF)", "Broken Access Control & IDOR", "Secure Coding & Remediation"],
        "prerequisites": ["Solid understanding of modern web development (HTML, JS, HTTP protocol)", "Basic experience with databases and web backend APIs"],
        "career_outcomes": ["Web Application Penetration Tester", "Application Security (AppSec) Engineer", "Bug Bounty Hunter", "Security Code Auditor"],
        "tech_stack": ["Burp Suite", "OWASP ZAP", "Python", "SQLmap", "Postman", "Docker"],
        "tags": ["web-security", "appsec", "owasp", "burp-suite", "xss", "sqli", "penetration-testing"],
        "capstone_projects": [
            {
                "title": "Full-Scope Commercial Web Application Security Audit",
                "description": "Perform an authorized, comprehensive web application security assessment against an enterprise web application, uncovering high-severity IDORs and blind SQL injections, authored with remediation guidance.",
                "difficulty": "Advanced"
            },
            {
                "title": "Automated Web Security Scanning Extension for CI/CD",
                "description": "Develop a lightweight security integration tool using OWASP ZAP API that tests staging API endpoints for broken authentication and security header headers during pull requests.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "PortSwigger Web Security Academy (Free Comprehensive Labs)", "url": "https://portswigger.net/web-security", "type": "Interactive Labs"},
            {"title": "OWASP Top 10 Official Documentation", "url": "https://owasp.org/www-project-top-ten/", "type": "Official Standard"},
            {"title": "Bug Bounty Bootcamp by Vickie Li", "url": "https://nostarch.com/bug-bounty-bootcamp", "type": "Book"}
        ],
        "is_featured": False,
        "popularity_rank": 33,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "HTTP Protocol Internals & Burp Suite Setup",
                "description": "Inspect and manipulate live browser-to-server traffic using Burp Suite Proxy, Repeater, Intruder, and custom certificates.",
                "topics_covered": ["HTTP Request/Response Headers, Status Codes & Cookies", "Setting up Burp Suite as an Intercepting Proxy", "Installing Burp CA Root Certificate in Browsers", "Using Burp Repeater for Manual Request Crafting", "Using Burp Intruder for Parameter Fuzzing"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "SQL Injection (SQLi) Exploitation & Defense",
                "description": "Detect and exploit Union-based, Error-based, Blind, and Time-based SQL injections, and understand parameterized defense.",
                "topics_covered": ["SQLi Fundamentals & String Concatenation Flaws", "Union-Based SQL Injection for Data Extraction", "Error-Based & Boolean-Based Blind SQLi", "Time-Based Blind Injections with sleep()", "Remediation: Parameterized Queries & Prepared Statements"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Cross-Site Scripting (XSS) & Content Security Policy (CSP)",
                "description": "Execute malicious client-side JavaScript via Reflected, Stored, and DOM-based XSS, and defend with strict Content Security Policies.",
                "topics_covered": ["Reflected vs Stored vs DOM-Based XSS Mechanisms", "Context-Aware Output Encoding (HTML, Attribute, JavaScript)", "Stealing Cookies & Session Hijacking Payloads", "Bypassing Client-Side Sanitization Filters", "Implementing Strict Content Security Policy (CSP) Headers"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Broken Access Control & Insecure Direct Object References (IDOR)",
                "description": "Bypass authorization checks to access horizontal and vertical unauthorized data via manipulated IDs and broken JWT claims.",
                "topics_covered": ["Horizontal vs Vertical Privilege Escalation", "Insecure Direct Object References (IDOR) Discovery", "Missing Function-Level Access Controls", "Manipulating JWT Tokens (None Algorithm, Secret Cracking)", "Remediation: Server-Side Ownership Checks"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Server-Side Request Forgery (SSRF) & XXE",
                "description": "Trick backends into querying internal resources via SSRF, access cloud metadata endpoints, and exploit XML External Entities.",
                "topics_covered": ["SSRF Mechanics & Querying Localhost (127.0.0.1)", "Stealing Cloud Credentials via Metadata Endpoints (169.254.169.254)", "Bypassing SSRF Blacklists (DNS Rebinding, Decimal IP)", "XML External Entity (XXE) Injection for File Read", "Blind SSRF Detection with Burp Collaborator"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "CSRF, CORS Misconfigurations & Secure Headers",
                "description": "Exploit cross-origin trust with CSRF and overly permissive CORS origins, and harden applications with security headers.",
                "topics_covered": ["Cross-Site Request Forgery (CSRF) & SameSite Cookie Attribute", "CORS Misconfigurations (Access-Control-Allow-Origin: * with Credentials)", "Clickjacking Attacks & X-Frame-Options", "Security Headers: Strict-Transport-Security (HSTS), X-Content-Type-Options", "Writing Actionable Penetration Test Reports"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Cloud Security Architecture (AWS & Multi-Cloud)",
        "slug": "cloud-security-architecture-multicloud",
        "category": "Cybersecurity",
        "level": "Advanced",
        "difficulty": "Advanced",
        "duration": "10 Weeks",
        "description": "Protect complex cloud ecosystems across AWS and multi-cloud environments. Master the Cloud Shared Responsibility Model, cloud IAM privilege escalation, GuardDuty threat detection, CloudTrail auditing, S3 bucket security, KMS encryption, and multi-cloud posture management (CSPM).",
        "skills_covered": ["Cloud Shared Responsibility Model", "Cloud IAM Privilege Escalation Techniques", "AWS KMS Cryptography & Key Policies", "CloudTrail & GuardDuty Threat Detection", "Cloud Security Posture Management (CSPM)", "Container & Kubernetes Security in Cloud", "Incident Response in AWS"],
        "prerequisites": ["Solid understanding of AWS or general cloud services (VPC, EC2, S3, IAM)", "Basic knowledge of cybersecurity and Linux"],
        "career_outcomes": ["Cloud Security Architect", "Cloud Security Engineer", "DevSecOps Architect", "Cloud Compliance Specialist"],
        "tech_stack": ["AWS (GuardDuty, Security Hub, KMS, IAM, WAF)", "Prowler", "ScoutSuite", "Terraform", "CloudTrail"],
        "tags": ["cloud-security", "aws-security", "cspm", "kms", "iam-security", "guardduty", "devsecops"],
        "capstone_projects": [
            {
                "title": "Automated Multi-Account Cloud Security Posture & Remediation Engine",
                "description": "Build an automated CSPM engine with Prowler and AWS EventBridge that continuously audits multi-account AWS environments, flags unencrypted S3 buckets or open SSH ports, and triggers Lambda auto-remediation.",
                "difficulty": "Advanced"
            },
            {
                "title": "Cloud Threat Hunting & Incident Response Simulation",
                "description": "Investigate a simulated compromise of an AWS account: track leaked IAM access keys through CloudTrail logs, analyze compromised EC2 memory images, and isolate resources.",
                "difficulty": "Advanced"
            }
        ],
        "curated_resources": [
            {"title": "AWS Security Best Practices Whitepapers", "url": "https://aws.amazon.com/security/security-resources/", "type": "Official Architecture Papers"},
            {"title": "Hacking the Cloud (Open-Source Cloud Security Encyclopedia)", "url": "https://hackingthe.cloud/", "type": "Interactive Encyclopedia"},
            {"title": "Cloud Security Handbook by Arno Brok & Andy Dooley", "url": "https://www.packtpub.com/en-us/product/cloud-security-handbook-9781800569195", "type": "Book"}
        ],
        "is_featured": False,
        "popularity_rank": 38,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "The Cloud Security Paradigm & Shared Responsibility",
                "description": "Understand IaaS vs PaaS vs SaaS responsibility divisions, the AWS Well-Architected Security Pillar, and cloud compliance frameworks.",
                "topics_covered": ["Shared Responsibility Model Boundaries", "The 6 Pillars of AWS Well-Architected (Focus on Security)", "CIS Benchmarks for Cloud Accounts", "Multi-Account Security Architecture with AWS Control Tower", "Service Control Policies (SCPs) for Centralized Guardrails"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Cloud IAM Security, Privilege Escalation & Least Privilege",
                "description": "Audit IAM policies, identify dangerous permission combinations, exploit cloud privilege escalation vectors, and enforce least privilege.",
                "topics_covered": ["IAM Policy Evaluation Logic (Explicit Deny, SCPs, Permissions Boundaries)", "Common IAM Privilege Escalation Methods (CreatePolicyVersion, PassRole)", "Auditing IAM with Access Analyzer & Parliament", "Temporary Credentials via STS & Short-Lived Tokens", "Enforcing Least Privilege using CloudTrail Activity History"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Data Protection, Encryption & AWS KMS",
                "description": "Encrypt data at rest and in transit using AWS Key Management Service (KMS), customer-managed keys (CMK), and key rotation.",
                "topics_covered": ["Symmetric vs Asymmetric KMS Keys", "Envelope Encryption Architecture with Data Keys", "KMS Key Policies vs IAM Policies", "S3 Bucket Policies, Object Encryption (SSE-S3, SSE-KMS)", "Enforcing TLS 1.3 in Transit with AWS Certificate Manager"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "Network Security: VPC Peering, Transit Gateway & WAF",
                "description": "Protect cloud perimeters using Security Groups, Network ACLs, AWS Network Firewall, and AWS Web Application Firewall (WAF).",
                "topics_covered": ["Deep Defense with Stateful Security Groups vs Stateless NACLs", "AWS Network Firewall Centralized Inspection Architecture", "Deploying AWS WAF Rules for OWASP Protection", "VPC Flow Logs Analysis using Amazon Athena", "Private Connectivity with AWS PrivateLink & VPC Endpoints"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 5,
                "title": "Continuous Threat Detection with GuardDuty & Security Hub",
                "description": "Detect active intrusions and cryptocurrency mining using machine learning threat detection with Amazon GuardDuty and Security Hub.",
                "topics_covered": ["Amazon GuardDuty Behavioral Anomaly Detection", "Analyzing DNS, VPC Flow, and S3 Logs Automatically", "Centralized Finding Aggregation with AWS Security Hub", "Correlating Alerts Across Multi-Region / Multi-Account Environments", "Automating Real-Time Alert Notifications via EventBridge & SNS"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "Cloud Incident Response & Automated Remediation",
                "description": "Isolate compromised virtual machines, preserve ephemeral evidence, rotate compromised credentials, and trigger auto-remediations.",
                "topics_covered": ["Cloud Incident Response Playbooks", "Automated Remediation using EventBridge & Lambda", "EC2 Memory & Disk Snapshot Forensic Acquisition", "Revoking Active IAM Sessions & Rotating Compromised Access Keys", "Conducting Cloud Postmortems & Strengthening Controls"],
                "duration": "2 Weeks"
            }
        ]
    },
    {
        "title": "Network Security & Intrusion Detection",
        "slug": "network-security-intrusion-detection",
        "category": "Cybersecurity",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "8 Weeks",
        "description": "Master enterprise network defense, protocol security, and intrusion detection. Learn TCP/IP packet analysis with Wireshark, Snort/Suricata IDS/IPS signature authoring, firewall architectures, VPN encryption, DNS security (DNSSEC), and network baseline anomaly detection.",
        "skills_covered": ["TCP/IP Protocol Security", "Wireshark Packet Analysis", "Snort / Suricata IDS/IPS Rules", "Next-Generation Firewalls (NGFW)", "VPN Technologies (IPsec & WireGuard)", "DNS Security & DNSSEC", "Network Behavioral Anomaly Detection"],
        "prerequisites": ["Familiarity with networking concepts (IP, ports, OSI 7-layer model)", "Basic command line literacy in Linux"],
        "career_outcomes": ["Network Security Engineer", "Intrusion Detection Specialist", "Security Infrastructure Engineer", "SOC Tier 2 Analyst"],
        "tech_stack": ["Suricata", "Snort", "Wireshark", "Zeek", "pfSense", "WireGuard", "Linux"],
        "tags": ["network-security", "suricata", "snort", "wireshark", "ids", "ips", "firewalls"],
        "capstone_projects": [
            {
                "title": "Enterprise Intrusion Detection System (IDS) with Suricata & ELK",
                "description": "Deploy Suricata on a network mirror tap, write custom rule sets detecting C2 traffic and brute-force attacks, and stream alerts into an Elasticsearch/Kibana dashboard.",
                "difficulty": "Advanced"
            },
            {
                "title": "Secure Site-to-Site WireGuard VPN Gateway with Automated Failover",
                "description": "Architect a dual-node encrypted VPN gateway between two simulated enterprise datacenters featuring dynamic routing, cryptographic keys, and automated failover.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "Practical Packet Analysis by Chris Sanders", "url": "https://nostarch.com/packetanalysis3", "type": "Book"},
            {"title": "Suricata Official User Guide & Rule Writing", "url": "https://docs.suricata.io/en/latest/", "type": "Documentation"},
            {"title": "Applied Network Security Monitoring by Chris Sanders & Jason Smith", "url": "https://www.elsevier.com/books/applied-network-security-monitoring/sanders/978-0-12-417208-1", "type": "Book"}
        ],
        "is_featured": False,
        "popularity_rank": 43,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "TCP/IP Protocol Suite & Vulnerability Vectors",
                "description": "Dissect protocols at the byte level: Ethernet frames, IP headers, TCP flags (SYN, ACK, FIN, RST), UDP, and ICMP vulnerability vectors.",
                "topics_covered": ["OSI vs TCP/IP Models Deep Dive", "TCP 3-Way Handshake, Window Sizing & Flag Misuse", "IP Header Fragmentation Attacks & Smurf Attacks", "ARP Poisoning & Man-in-the-Middle (MitM) Attacks", "DHCP Starvation & Rogue DHCP Server Attacks"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Deep Packet Inspection with Wireshark & Tshark",
                "description": "Analyze network captures for malicious traffic patterns, follow TCP streams, extract carved files, and automate with Tshark.",
                "topics_covered": ["Capture Filters (BPF) vs Display Filters in Wireshark", "Following TCP/UDP/HTTP Streams to Reconstruct Conversations", "Carving Files & Payloads Directly from PCAP Streams", "Identifying Port Scans, Null Scans & Xmas Scans", "Automating Packet Extraction using Tshark in Bash"],
                "duration": "1 Week"
            },
            {
                "step_number": 3,
                "title": "Intrusion Detection Systems: Suricata & Snort",
                "description": "Understand signature-based and anomaly-based intrusion detection, deploy Suricata, and write custom detection rules.",
                "topics_covered": ["Signature-Based vs Anomaly-Based vs Stateful Protocol Inspection", "Deploying Suricata on Linux (Inline IPS vs Passive IDS Mode)", "Suricata Rule Syntax (action, header, options, msg, content, sid)", "Writing Rules for C2 Beaconing & Directory Traversal", "Tuning Rules to Eliminate False Positives"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "Firewall Architectures & Next-Gen Firewalls (NGFW)",
                "description": "Design secure network boundaries using stateful packet filters, DMZs, Application-Aware Next-Gen Firewalls, and pfSense.",
                "topics_covered": ["Packet Filtering vs Stateful Inspection vs Application Layer Proxies", "Demilitarized Zone (DMZ) Architecture & Dual-Homed Firewalls", "Next-Gen Firewall (NGFW) Capabilities (Deep Packet Inspection, SSL Decryption)", "Configuring Open-Source pfSense Firewalls", "Implementing Egress Filtering to Block Exfiltration"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 5,
                "title": "Encrypted Tunnels: IPsec & WireGuard VPNs",
                "description": "Secure cross-site and remote communications with modern cryptographic tunnels: IPsec (IKEv2) and high-speed WireGuard.",
                "topics_covered": ["Virtual Private Network (VPN) Concepts: Remote Access vs Site-to-Site", "IPsec Architecture: AH vs ESP, Tunnel Mode vs Transport Mode", "Internet Key Exchange (IKEv1 vs IKEv2) Handshakes", "WireGuard Cryptography & Peer Configuration", "Benchmarking VPN Encryption Overhead & MTU Tuning"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "DNS Security, Tunneling & Network Baseline Auditing",
                "description": "Defend against DNS tunneling and cache poisoning using DNSSEC, DNS-over-HTTPS (DoH), and baseline network anomaly monitoring.",
                "topics_covered": ["DNS Cache Poisoning & Kaminsky Attacks", "DNSSEC Cryptographic Resource Records (RRSIG, DNSKEY, DS)", "Detecting DNS Exfiltration & Tunneling Attacks", "DNS-over-HTTPS (DoH) & DNS-over-TLS (DoT) Privacy Trade-offs", "Establishing Network Baselines with NetFlow / IPFIX"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "DevSecOps & Secure Software Supply Chain",
        "slug": "devsecops-secure-software-supply-chain",
        "category": "Cybersecurity",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "8 Weeks",
        "description": "Integrate automated security testing across the entire modern software development lifecycle. Master Static Application Security Testing (SAST), Software Composition Analysis (SCA), Dynamic Application Security Testing (DAST), container scanning, secret detection, and Software Bill of Materials (SBOM).",
        "skills_covered": ["Shift-Left Security Philosophy", "Static Application Security Testing (SAST)", "Software Composition Analysis (SCA) & CVEs", "Secret Scanning & Git Hooks", "Dynamic Application Security Testing (DAST)", "Software Bill of Materials (SBOM) Generation", "Signing Artifacts with Cosign / Sigstore"],
        "prerequisites": ["Experience with CI/CD pipelines (GitHub Actions, GitLab CI, or Jenkins)", "Basic software engineering knowledge"],
        "career_outcomes": ["DevSecOps Engineer", "Application Security Specialist", "Software Supply Chain Security Engineer", "Security Automation Architect"],
        "tech_stack": ["GitHub Actions", "Semgrep", "Trivy", "OWASP Dependency-Check", "Gitleaks", "Cosign", "Syft"],
        "tags": ["devsecops", "supply-chain", "sast", "sca", "sbom", "cosign", "semgrep", "security"],
        "capstone_projects": [
            {
                "title": "Production Zero-Trust DevSecOps CI/CD Pipeline",
                "description": "Build an automated GitHub Actions pipeline that blocks commits with Gitleaks, scans code with Semgrep SAST, analyzes dependencies with Trivy SCA, generates a CycloneDX SBOM, and cryptographically signs images with Cosign.",
                "difficulty": "Advanced"
            },
            {
                "title": "Automated Open-Source Dependency Vulnerability Triage Bot",
                "description": "Develop an automated bot that ingests vulnerability feeds, maps CVE severity against internal application call graphs, and creates prioritized pull requests.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "OWASP DevSecOps Guideline", "url": "https://owasp.org/www-project-devsecops-guideline/", "type": "Official Guideline"},
            {"title": "Software Supply Chain Security by Cassie Crossley", "url": "https://www.oreilly.com/library/view/software-supply-chain/9781098133740/", "type": "Book"},
            {"title": "Sigstore Documentation (Signing Artifacts)", "url": "https://docs.sigstore.dev/", "type": "Documentation"}
        ],
        "is_featured": False,
        "popularity_rank": 50,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "The DevSecOps Mindset & Shift-Left Principles",
                "description": "Understand how security integrates into rapid agile delivery without becoming a development bottleneck.",
                "topics_covered": ["DevOps vs DevSecOps Cultural Transformation", "The Cost of Remediation Across SDLC Stages (Shift-Left)", "Automated Security Quality Gates vs Friction", "Threat Modeling in Sprint Planning (STRIDE)", "Establishing Security Champions in Engineering Teams"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Pre-Commit Hooks & Secret Leakage Prevention",
                "description": "Prevent API keys, private certificates, and database credentials from leaking into Git history using pre-commit hooks and Gitleaks.",
                "topics_covered": ["The Epidemic of Leaked Secrets in Public/Private Repos", "Pre-Commit Framework & Git Hook Mechanics", "Scanning Codebases with Gitleaks & TruffleHog", "Entropy Analysis & Custom Regex Secret Rules", "Automating Secret Revocation & Remediation Playbooks"],
                "duration": "1 Week"
            },
            {
                "step_number": 3,
                "title": "Static Application Security Testing (SAST) with Semgrep",
                "description": "Detect source code vulnerabilities at compile-time using AST-based pattern matching with Semgrep and SonarQube.",
                "topics_covered": ["Regex-Based Linting vs Abstract Syntax Tree (AST) Analysis", "Running Semgrep in GitHub Actions Pipelines", "Writing Custom Semgrep Rules for Organizational Anti-Patterns", "Triage & Tuning Rules to Eliminate False Positives", "Integrating Security Feedback into Developer Pull Requests"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "Software Composition Analysis (SCA) & Dependency Management",
                "description": "Audit open-source third-party dependencies for known CVE vulnerabilities and license risks with Trivy and Snyk.",
                "topics_covered": ["Third-Party Dependency Risks & Log4j Case Study", "Software Composition Analysis (SCA) Mechanics", "Scanning Lockfiles (package-lock, poetry.lock, Cargo.lock)", "Open-Source License Compliance (GPL, Apache, MIT)", "Automated Dependency Upgrades with Dependabot / Renovate"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Software Bill of Materials (SBOM) & Image Signing (Cosign)",
                "description": "Generate machine-readable ingredient lists with Syft/CycloneDX and sign container images using keyless Sigstore/Cosign.",
                "topics_covered": ["Executive Order 14028 & Software Bill of Materials (SBOM)", "Generating SPDX & CycloneDX SBOMs with Syft", "Vulnerability Matching on SBOMs with Grype", "Cryptographic Container Image Signing with Cosign", "Keyless Signing with OIDC & Fulcio Certificate Authority"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "Dynamic Application Testing (DAST) & Admission Controllers",
                "description": "Test running applications using automated DAST (OWASP ZAP) and enforce image signatures at Kubernetes runtime with Kyverno.",
                "topics_covered": ["Dynamic Application Security Testing (DAST) in Staging", "Running Automated OWASP ZAP Baseline Scans", "Kubernetes Admission Controllers (ValidatingWebhooks)", "Enforcing Signed Images Only with Kyverno / OPA Gatekeeper", "Continuous DevSecOps Compliance Reporting & Metrics"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Digital Forensics & Incident Response (DFIR)",
        "slug": "digital-forensics-incident-response",
        "category": "Cybersecurity",
        "level": "Advanced",
        "difficulty": "Advanced",
        "duration": "10 Weeks",
        "description": "Master deep forensic investigation and incident response. Learn live memory acquisition and volatile artifact analysis with Volatility 3, disk imaging with FTK Imager/Autopsy, Windows artifact forensics ($MFT, Shimcache, Amcache, Prefetch), timeline analysis, and chain of custody.",
        "skills_covered": ["Chain of Custody & Evidence Preservation", "Volatile Memory Forensics with Volatility 3", "Windows Artifacts ($MFT, Prefetch, Shimcache)", "Master File Table ($MFT) Parsing", "Timeline Reconstruction (Plaso / log2timeline)", "Malware Anti-Forensics Detection", "Expert Forensic Reporting"],
        "prerequisites": ["Solid understanding of Windows and Linux operating systems internals", "Familiarity with file systems (NTFS, EXT4) and memory management"],
        "career_outcomes": ["DFIR Analyst", "Digital Forensics Examiner", "Incident Response Consultant", "Threat Hunter"],
        "tech_stack": ["Volatility 3", "Autopsy", "FTK Imager", "Plaso / log2timeline", "EZ Tools", "KAPE", "Linux"],
        "tags": ["dfir", "digital-forensics", "incident-response", "volatility", "memory-analysis", "ntfs", "timeline"],
        "capstone_projects": [
            {
                "title": "Comprehensive Advanced Persistent Threat (APT) Forensic Case Investigation",
                "description": "Perform full digital forensic examination on a raw forensic disk image and volatile RAM dump: extract injected DLLs, parse NTFS MFT records, construct an interactive timeline, and produce an expert legal report.",
                "difficulty": "Advanced"
            },
            {
                "title": "Automated Rapid Artifact Triage Collector with KAPE",
                "description": "Build custom KAPE targets and modules that rapidly extract critical forensic artifacts from live target endpoints over the network within 5 minutes.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "The Art of Memory Forensics by Michael Hale Ligh et al.", "url": "https://www.wiley.com/en-us/The+Art+of+Memory+Forensics-p-9781118825099", "type": "Classic Textbook"},
            {"title": "Windows Forensic Analysis Toolkit by Harlan Carvey", "url": "https://www.elsevier.com/books/windows-forensic-analysis-toolkit/carvey/978-0-12-417157-2", "type": "Book"},
            {"title": "SANS DFIR Posters and Cheat Sheets", "url": "https://www.sans.org/posters/?focus-area=digital-forensics", "type": "Reference Guides"}
        ],
        "is_featured": False,
        "popularity_rank": 59,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Evidence Handling, Order of Volatility & Legal Protocols",
                "description": "Understand legal standards: RFC 3227 Order of Volatility, cryptographic hashing (SHA-256), and maintaining an unbroken chain of custody.",
                "topics_covered": ["RFC 3227 Order of Volatility (Registers -> RAM -> Disk)", "Cryptographic Hashes for Evidence Integrity Verification", "Chain of Custody Documentation Standards", "Hardware Write Blockers vs Software Write Blocking", "Acquiring Raw Disk Images with FTK Imager & dd/dc3dd"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Live Volatile Memory Forensics with Volatility 3",
                "description": "Acquire RAM using LiME / DumpIt and analyze process trees, injected code, and hidden network sockets with Volatility 3.",
                "topics_covered": ["Memory Acquisition Tools (DumpIt, WinPmem, LiME)", "Volatility 3 Symbol Tables & Architecture", "Reconstructing Process Trees with windows.pslist & windows.pstree", "Detecting Code Injection with windows.malfind", "Extracting In-Memory Network Sockets with windows.netscan"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "NTFS File System Forensics: MFT, USN & VSS",
                "description": "Deconstruct NTFS file system structures: Master File Table ($MFT), attribute headers, USN change journals, and Volume Shadow Copies.",
                "topics_covered": ["NTFS Architecture: Master File Table ($MFT) Record Structure", "Resident vs Non-Resident File Attributes ($DATA)", "$STANDARD_INFORMATION vs $FILE_NAME Timestamps (Timestomping)", "USN Journal & $LogFile for Deleted File Discovery", "Extracting Historic States from Volume Shadow Copies (VSS)"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "Windows Execution Artifacts (Prefetch, Shimcache, Amcache)",
                "description": "Prove that specific malware programs were executed on a system using Prefetch files, Shimcache, Amcache, and UserAssist.",
                "topics_covered": ["Windows Prefetch (.pf) Files: Execution Counts & Timestamps", "Application Compatibility Cache (Shimcache / AppCompatCache)", "Amcache.hve Parsing for Program Hashes and Paths", "UserAssist Registry Keys & ROT13 Decoding", "SRUM (System Resource Usage Monitor) Execution Telemetry"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 5,
                "title": "Super-Timeline Generation & Analysis with Plaso",
                "description": "Collate millions of disparate timestamped artifacts into a unified super-timeline using log2timeline (Plaso) and Timeline Explorer.",
                "topics_covered": ["The Necessity of Unified Temporal Timelines", "Running log2timeline (Plaso) across Disk Images", "Parsing Web Browser Histories, Event Logs & File Activity", "Filtering Multi-Million Row Timelines using Eric Zimmerman's Tools", "Detecting Lateral Movement and Attacker Pivots chronologically"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "Anti-Forensics Techniques & Expert Witness Reporting",
                "description": "Identify attacker evasion attempts: secure wiping, timestomping, log clearing, and author expert forensic court-ready reports.",
                "topics_covered": ["Detecting Timestomping via MFT Attribute Inconsistencies", "Analyzing Event Log Clearing Activity (Event ID 1102)", "Identifying Steganography and Packed Executables", "Structuring Professional Digital Forensic Reports", "Presenting Findings as an Expert Technical Witness"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Zero Trust Architecture & Identity Governance",
        "slug": "zero-trust-architecture-identity-governance",
        "category": "Cybersecurity",
        "level": "Advanced",
        "difficulty": "Advanced",
        "duration": "8 Weeks",
        "description": "Master modern enterprise perimeterless security according to NIST SP 800-207. Learn the core tenet 'Never Trust, Always Verify', identity-first security with modern IAM, OAuth 2.0/OIDC, Conditional Access, micro-segmentation, and continuous device posture verification.",
        "skills_covered": ["NIST SP 800-207 Zero Trust Architecture", "Identity as the New Security Perimeter", "OAuth 2.0 & OpenID Connect (OIDC)", "Continuous Device Posture Assessment", "Software-Defined Perimeters (SDP)", "Micro-Segmentation Policies", "Privileged Access Management (PAM)"],
        "prerequisites": ["Understanding of enterprise networking, active directory, and cloud computing", "Familiarity with TLS certificates and authentication protocols"],
        "career_outcomes": ["Zero Trust Architect", "Identity & Access Management (IAM) Engineer", "Enterprise Security Architect", "Chief Information Security Officer (CISO) Advisor"],
        "tech_stack": ["Microsoft Entra ID", "Okta", "HashiCorp Boundary", "Zscaler / Cloudflare Zero Trust", "Terraform"],
        "tags": ["zero-trust", "identity-governance", "iam", "oauth2", "oidc", "nist-800-207", "cybersecurity"],
        "capstone_projects": [
            {
                "title": "Enterprise Zero-Trust Access Gateway with Device Posture Verification",
                "description": "Implement an identity-aware proxy using Cloudflare Zero Trust / HashiCorp Boundary that verifies device compliance, enforces MFA, and grants micro-segmented access without a VPN.",
                "difficulty": "Advanced"
            },
            {
                "title": "Automated Just-In-Time (JIT) Privileged Access Broker",
                "description": "Build a secure Privileged Access Management service that provides ephemeral, time-bounded, auto-expiring cloud credentials with audited approval workflows.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "NIST SP 800-207: Zero Trust Architecture Standard", "url": "https://csrc.nist.gov/publications/detail/sp/800-207/final", "type": "Official Standard"},
            {"title": "Zero Trust Networks: Building Secure Systems by Gilman & Barth", "url": "https://www.oreilly.com/library/view/zero-trust-networks/9781491962183/", "type": "Book"},
            {"title": "Cloudflare Zero Trust Learning Center", "url": "https://www.cloudflare.com/learning/security/glossary/what-is-zero-trust/", "type": "Interactive Guides"}
        ],
        "is_featured": False,
        "popularity_rank": 63,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "The Demise of Castle-and-Moat & NIST 800-207",
                "description": "Examine the obsolescence of perimeter-based VPN defenses, remote work challenges, and NIST SP 800-207 core tenets.",
                "topics_covered": ["The Failures of Traditional Perimeter 'Castle-and-Moat' VPNs", "The 7 Tenets of NIST SP 800-207 Zero Trust Architecture", "Policy Decision Points (PDP) vs Policy Enforcement Points (PEP)", "Implicit Trust Removal across Networks", "Continuous Evaluation vs One-Time Authentication"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Modern Identity Protocols: OAuth 2.0 & OIDC",
                "description": "Master identity federation protocols: OAuth 2.0 grant types (Authorization Code + PKCE), OpenID Connect tokens, and SAML 2.0.",
                "topics_covered": ["OAuth 2.0 Roles: Resource Owner, Client, Authorization Server, Resource Server", "Authorization Code Flow with Proof Key for Code Exchange (PKCE)", "OpenID Connect (OIDC) ID Tokens vs Access Tokens", "JSON Web Tokens (JWT) Claims, Signatures & Key Rotation (JWKS)", "SAML 2.0 Enterprise Federation & Single Sign-On (SSO)"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Continuous Conditional Access & Risk Scoring",
                "description": "Enforce dynamic, real-time access policies based on user risk, impossible travel, IP reputation, and behavioral anomalies.",
                "topics_covered": ["Conditional Access Policy Architecture", "Signals Evaluation: User, Device, Location, Application, Real-Time Risk", "Impossible Travel & Tor Exit Node Detection", "Enforcing Phishing-Resistant MFA (FIDO2 / WebAuthn Passkeys)", "Session Lifetime Controls & Continuous Access Evaluation (CAE)"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Device Trust & Endpoint Posture Assessment",
                "description": "Validate the security health of connecting endpoints prior to granting application access using MDM and device certificates.",
                "topics_covered": ["Device Health Verification (Disk Encryption, EDR Agent, OS Patch Level)", "Mutual TLS with Client Certificates Issued by Corporate PKI", "Integrating MDM (Microsoft Intune / Jamf) into Identity Policies", "Zero Trust Network Access (ZTNA) vs Traditional Remote VPNs", "Managing Unmanaged Bring-Your-Own-Device (BYOD) Access"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Network Micro-Segmentation & Software-Defined Perimeters",
                "description": "Prevent lateral movement by enforcing fine-grained micro-segmentation at the application layer using identity-aware proxies.",
                "topics_covered": ["Micro-Segmentation Concepts & Restricting Lateral Movement", "Software-Defined Perimeters (SDP) Architecture", "Identity-Aware Proxies (Google BeyondCorp Model)", "Replacing Bastion Hosts with Modern Access Gateways (Boundary / Teleport)", "Application-Level Cloaking & Dark Cloud Infrastructure"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "Privileged Access Management (PAM) & Governance",
                "description": "Eliminate static administrator passwords using Just-In-Time (JIT) elevation, session recording, and credential vaulting.",
                "topics_covered": ["Privileged Access Management (PAM) Architecture", "Just-In-Time (JIT) Ephemeral Privilege Elevation", "Session Monitoring, Keystroke Logging & Dual-Control Approvals", "Automated Service Account Credential Rotation", "Identity Governance & Administration (IGA) Access Reviews"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Cryptography & Applied Data Protection",
        "slug": "cryptography-applied-data-protection",
        "category": "Cybersecurity",
        "level": "Intermediate",
        "difficulty": "Intermediate",
        "duration": "8 Weeks",
        "description": "Master applied mathematical cryptography and data protection. Learn modern symmetric ciphers (AES-GCM, ChaCha20), asymmetric public-key systems (RSA, ECC), cryptographic hashing (SHA-256, Argon2), digital signatures, Public Key Infrastructure (PKI), and Post-Quantum Cryptography (PQC).",
        "skills_covered": ["Symmetric Encryption (AES-GCM, ChaCha20-Poly1305)", "Asymmetric Cryptography (RSA & Elliptic Curves)", "Cryptographic Hashing & Password Hashing (Argon2)", "Digital Signatures & HMAC Authentication", "Public Key Infrastructure (PKI) & X.509", "Transport Layer Security (TLS 1.3)", "Post-Quantum Cryptography Standards"],
        "prerequisites": ["Basic understanding of programming (Python, C, or Go)", "High school mathematics (modular arithmetic basics)"],
        "career_outcomes": ["Applied Cryptographer", "Security Software Engineer", "PKI Infrastructure Specialist", "Cryptographic Security Consultant"],
        "tech_stack": ["OpenSSL", "Python Cryptography", "Go Crypto", "Hashcat", "CFSSL"],
        "tags": ["cryptography", "encryption", "aes", "rsa", "elliptic-curve", "pki", "tls", "cybersecurity"],
        "capstone_projects": [
            {
                "title": "End-to-End Encrypted Secure Messaging Protocol",
                "description": "Implement an end-to-end encrypted messaging protocol in Python/Go featuring X25519 Diffie-Hellman key exchange, Double Ratchet forward secrecy, and AES-256-GCM authenticated encryption.",
                "difficulty": "Advanced"
            },
            {
                "title": "Complete Corporate Public Key Infrastructure (PKI) Authority",
                "description": "Architect a production multi-tier PKI with an offline Root CA, online Intermediate CAs, automated X.509 certificate issuance, and OCSP revocation.",
                "difficulty": "Intermediate"
            }
        ],
        "curated_resources": [
            {"title": "Serious Cryptography by Jean-Philippe Aumasson", "url": "https://nostarch.com/seriouscrypto", "type": "Classic Textbook"},
            {"title": "Cryptohack - Fun Free Interactive Cryptography Challenges", "url": "https://cryptohack.org/", "type": "Interactive Challenges"},
            {"title": "Real-World Cryptography by David Wong", "url": "https://www.manning.com/books/real-world-cryptography", "type": "Book"}
        ],
        "is_featured": False,
        "popularity_rank": 67,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Symmetric Encryption & Block Cipher Modes",
                "description": "Understand symmetric keys, block ciphers (AES), and stream ciphers: ECB dangers, CBC mechanics, and authenticated AES-GCM.",
                "topics_covered": ["One-Time Pad & Information-Theoretic Security", "Advanced Encryption Standard (AES) Substitution-Permutation Network", "Electronic Codebook (ECB) Mode & The ECB Penguin Flaw", "Cipher Block Chaining (CBC) & Padding Oracle Attacks", "Authenticated Encryption with Associated Data (AEAD: AES-GCM, ChaCha20-Poly1305)"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 2,
                "title": "Cryptographic Hash Functions & Message Authentication Codes",
                "description": "Deconstruct collision resistance, SHA-2/SHA-3, length extension attacks, and message authentication with HMAC.",
                "topics_covered": ["Properties of Secure Hash Functions (Pre-Image, Second Pre-Image, Collision Resistance)", "Merkle-Damgård Construction & Length Extension Attacks", "SHA-256 vs Modern Keccak (SHA-3)", "Hash-Based Message Authentication Code (HMAC) Architecture", "Memory-Hard Password Hashing (Argon2id, Scrypt, BCrypt)"],
                "duration": "1 Week"
            },
            {
                "step_number": 3,
                "title": "Asymmetric Cryptography: RSA & Modular Arithmetic",
                "description": "Master public-key cryptography with RSA: Euler's totient function, prime generation, OAEP padding, and factoring complexity.",
                "topics_covered": ["Modular Arithmetic & Extended Euclidean Algorithm", "Euler's Totient Function & Euler's Theorem", "RSA Key Generation, Encryption & Decryption Mathematics", "The Necessity of Padding: PKCS#1 v1.5 vs Optimal Asymmetric Encryption Padding (OAEP)", "Factoring Attacks & Minimum Safe Key Sizes (2048 vs 4096-bit)"],
                "duration": "1 Week"
            },
            {
                "step_number": 4,
                "title": "Elliptic Curve Cryptography (ECC) & Diffie-Hellman",
                "description": "Achieve high-speed security with shorter keys using Weierstrass curves, Curve25519, ECDH key agreement, and ECDSA/Ed25519 signatures.",
                "topics_covered": ["Elliptic Curves over Finite Fields & Point Addition Group Law", "The Elliptic Curve Discrete Logarithm Problem (ECDLP)", "Diffie-Hellman Key Exchange & Ephemeral Forward Secrecy (ECDHE)", "NIST Curves (P-256) vs Bernstein Curves (Curve25519 / Ed25519)", "Digital Signatures: ECDSA vs EdDSA (Ed25519)"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 5,
                "title": "Public Key Infrastructure (PKI) & TLS 1.3 Handshake",
                "description": "Establish trust networks using X.509 certificates, Certificate Authorities, revocation (CRL/OCSP), and the TLS 1.3 protocol.",
                "topics_covered": ["X.509 Certificate Anatomy & Subject Alternative Names (SAN)", "Root CAs, Intermediate CAs & Chain of Trust Verification", "Certificate Revocation: CRLs vs Online Certificate Status Protocol (OCSP)", "Certificate Transparency Logs (CT Logs)", "TLS 1.3 1-RTT & 0-RTT Cryptographic Handshake Mechanics"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "Post-Quantum Cryptography (PQC) & Hardware Security",
                "description": "Prepare for quantum computing decryption threats: Shor's algorithm, NIST PQC standards (ML-KEM, ML-DSA), and Hardware Security Modules (HSMs).",
                "topics_covered": ["How Shor's Algorithm Breaks RSA and Elliptic Curves", "Grover's Algorithm Impact on Symmetric Key Lengths", "NIST Post-Quantum Cryptography Standards (ML-KEM/Kyber, ML-DSA/Dilithium)", "Hybrid Classical/Post-Quantum TLS Handshakes", "Hardware Security Modules (HSM) & TPM Secure Enclaves"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Red Team Operations & Adversary Emulation",
        "slug": "red-team-operations-adversary-emulation",
        "category": "Cybersecurity",
        "level": "Advanced",
        "difficulty": "Advanced",
        "duration": "12 Weeks",
        "description": "Emulate sophisticated Advanced Persistent Threat (APT) actors to test enterprise defenses. Learn command and control (C2) infrastructure design, initial access payloads (macros, HTML smuggling), defensive evasion (AMSI/ETW bypasses), process injection, and Active Directory forest dominance.",
        "skills_covered": ["Adversary Emulation Methodologies", "Command & Control (C2) Architecture (Sliver, Mythic)", "Antimalware Scan Interface (AMSI) Bypasses", "Process Injection & Syscall Stubs", "Defense Evasion & EDR Blinding", "Active Directory Kerberos Attacks", "Red Team Operation Planning"],
        "prerequisites": ["Extensive experience with penetration testing and ethical hacking", "Deep familiarity with Windows internals, C/C++, and PowerShell"],
        "career_outcomes": ["Red Team Operator", "Adversary Emulation Specialist", "Senior Offensive Security Researcher", "Threat Simulation Lead"],
        "tech_stack": ["Sliver C2", "Mythic", "Cobalt Strike concepts", "C / C++", "PowerShell", "BloodHound", "Kali Linux"],
        "tags": ["red-team", "adversary-emulation", "c2", "amsi-bypass", "process-injection", "active-directory", "offensive"],
        "capstone_projects": [
            {
                "title": "Full-Spectrum Covert Adversary Emulation Campaign",
                "description": "Plan and execute an authorized end-to-end red team campaign against an enterprise environment: set up redirector C2 infrastructure, bypass modern EDR sensors, achieve domain persistence, and demonstrate data exfiltration objectives.",
                "difficulty": "Advanced"
            },
            {
                "title": "Custom EDR-Bypassing C2 Loader with Direct Syscalls",
                "description": "Develop a custom Windows loader in C that unhooks ntdll.dll, executes indirect syscalls to evade EDR API hooks, and runs encrypted shellcode in memory.",
                "difficulty": "Advanced"
            }
        ],
        "curated_resources": [
            {"title": "Red Team Development and Operations by Joe Vest & James Tubberville", "url": "https://redteam.guide/", "type": "Book & Guide"},
            {"title": "Sektor7 Malware Development Essentials", "url": "https://institute.sektor7.net/", "type": "Offensive Courses"},
            {"title": "MITRE ATT&CK Adversary Emulation Plans", "url": "https://attack.mitre.org/resources/adversary-emulation-plans/", "type": "Framework Plans"}
        ],
        "is_featured": False,
        "popularity_rank": 61,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Red Teaming vs Pentesting & Threat-Informed Operations",
                "description": "Understand the objectives of Red Teaming: testing people, processes, and technology, threat emulation plans, and deconfliction protocols.",
                "topics_covered": ["Penetration Testing (Flaw Discovery) vs Red Teaming (Objective Testing)", "Adversary Emulation Plans using MITRE ATT&CK and Threat Intel", "White Cell, Blue Team, and Red Team Rules of Engagement", "Deconfliction Protocols & Emergency Halting Procedures", "Operational Security (OPSEC) for Red Teamers"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Resilient Command & Control (C2) Infrastructure Setup",
                "description": "Architect distributed C2 infrastructure using open-source frameworks (Sliver, Mythic), domain fronting, redirectors, and malleable profiles.",
                "topics_covered": ["Modern C2 Architecture: Listeners, Implants, Teamservs", "Tiered Infrastructure: Short-Term vs Long-Term Callbacks", "Apache / NGINX Reverse Proxy Redirectors & Header Filtering", "DNS, HTTPS & WebSockets C2 Channels", "Malleable C2 Profiles to Camouflage Traffic as Legitimate SaaS"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Initial Access Vectors & Payload Delivery",
                "description": "Gain footholds using spear-phishing simulation payloads, HTML smuggling, container files (ISO/VHD), and application whitelisting bypasses.",
                "topics_covered": ["HTML Smuggling & JavaScript Blob Download Drops", "Bypassing Mark-of-the-Web (MOTW) using ISO & VHD Containers", "Living off the Land Binaries and Scripts (LOLBAS)", "MSHTA, Regsvr32, and Rundll32 Application Whitelist Bypasses", "Compile-Time String & API Obfuscation"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "EDR Evasion: AMSI, ETW & Direct Syscalls",
                "description": "Evade modern Endpoint Detection and Response (EDR) sensors: patching AMSI, blinding Event Tracing for Windows (ETW), and using direct/indirect syscalls.",
                "topics_covered": ["How EDRs Hook Userland APIs in ntdll.dll", "In-Memory Patching of Antimalware Scan Interface (AmsiScanBuffer)", "Blinding Event Tracing for Windows (EtwEventWrite)", "Direct Syscalls (Syswhispers) to Bypass Userland Hooks", "Indirect Syscalls to Maintain Legitimate Call Stacks"],
                "duration": "3 Weeks"
            },
            {
                "step_number": 5,
                "title": "Advanced In-Memory Process Injection Techniques",
                "description": "Execute shellcode without writing to disk: Process Hollowing, Thread Hijacking, Early Bird APC injection, and module overloading.",
                "topics_covered": ["Classic VirtualAllocEx + WriteProcessMemory + CreateRemoteThread Detection", "Process Hollowing (CreateProcess with CREATE_SUSPENDED)", "Thread Execution Hijacking", "Early Bird APC Queue Injection", "Module Stomping / Overloading on Legitimate Signed DLLs"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "Active Directory Dominance, Golden Tickets & Exfiltration",
                "description": "Achieve total domain dominance: Golden Tickets, Silver Tickets, DCSync attacks, Shadow Copies, and covert data exfiltration.",
                "topics_covered": ["DCSync Attack (Replicating KRBTGT Hash via Directory Replication Service)", "Forging Kerberos Golden & Silver Tickets with Mimikatz", "Active Directory Certificate Services (AD CS) ESC1-ESC8 Abuse", "Dumping NTDS.dit via Volume Shadow Copies", "Covert Data Exfiltration over Encrypted DNS / Cloud Storage"],
                "duration": "2 Weeks"
            }
        ]
    },
    {
        "title": "Smart Contract Security & Blockchain Auditing",
        "slug": "smart-contract-security-blockchain-auditing",
        "category": "Cybersecurity",
        "level": "Advanced",
        "difficulty": "Advanced",
        "duration": "8 Weeks",
        "description": "Master decentralized application and smart contract security auditing on the Ethereum Virtual Machine (EVM). Learn Solidity security pitfalls (Reentrancy, Integer Overflows, Front-Running), automated auditing tools (Slither, Echidna, Mythril), formal verification, and secure DeFi protocol design.",
        "skills_covered": ["EVM Architecture & Memory Layout", "Solidity Security Vulnerabilities", "Reentrancy Attacks & Prevention", "Automated Static Analysis with Slither", "Fuzzing & Property-Based Testing with Echidna", "Flash Loan Attack Vectors", "Auditing Methodologies & Writing Reports"],
        "prerequisites": ["Proficiency in Solidity and Ethereum smart contract development", "Familiarity with DeFi primitives (AMM, Lending Pools, ERC-20)"],
        "career_outcomes": ["Smart Contract Auditor", "Web3 Security Engineer", "Blockchain Security Consultant", "DeFi Protocol Security Lead"],
        "tech_stack": ["Solidity", "Foundry", "Slither", "Echidna", "Hardhat", "Python"],
        "tags": ["smart-contract-security", "web3-security", "solidity", "blockchain", "audit", "reentrancy", "defi"],
        "capstone_projects": [
            {
                "title": "Full Commercial Security Audit of a Lending Protocol",
                "description": "Conduct an in-depth security audit of a decentralized lending protocol codebase, discovering critical price oracle manipulation flaws and reentrancy vectors, delivered with formal PoC exploits.",
                "difficulty": "Advanced"
            },
            {
                "title": "Foundry Invariant Fuzzing Suite for Automated Vulnerability Detection",
                "description": "Author an advanced property-based invariant fuzzing test suite in Foundry that breaks mathematical invariants across a complex token staking contract.",
                "difficulty": "Advanced"
            }
        ],
        "curated_resources": [
            {"title": "OpenZeppelin Secure Contracts & Best Practices", "url": "https://docs.openzeppelin.com/contracts/5.x/", "type": "Industry Standard Library"},
            {"title": "Damn Vulnerable DeFi (Interactive Web3 Security Challenges)", "url": "https://www.damnvulnerabledefi.xyz/", "type": "Interactive Challenges"},
            {"title": "Smart Contract Security Field Guide", "url": "https://scsfg.io/", "type": "Security Guide"}
        ],
        "is_featured": False,
        "popularity_rank": 77,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "EVM Architecture, Storage Slots & Gas Mechanics",
                "description": "Understand the Ethereum Virtual Machine: 256-bit word size, storage slot mapping (32-byte slots), memory vs storage, and gas metering.",
                "topics_covered": ["EVM Stack, Memory, Calldata, and Storage Execution Model", "Storage Slot Packing & Mapping Key Calculation (keccak256)", "Gas Costs & Out-of-Gas Vulnerability Vectors", "EVM Bytecode & Opcodes (SSTORE, SLOAD, DELEGATECALL)", "Upgradable Proxy Contracts & Storage Collision Dangers"],
                "duration": "1 Week"
            },
            {
                "step_number": 2,
                "title": "Classic Vulnerabilities: Reentrancy & Access Controls",
                "description": "Deconstruct the historic DAO hack: single-function reentrancy, cross-function reentrancy, read-only reentrancy, and missing access modifiers.",
                "topics_covered": ["Single-Function Reentrancy & The Checks-Effects-Interactions Pattern", "Cross-Function & Cross-Contract Reentrancy Vectors", "Read-Only Reentrancy Impact on Third-Party Price Oracles", "ReentrancyGuard OpenZeppelin Implementation", "Broken Access Controls (tx.origin vs msg.sender Misconceptions)"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "DeFi Attack Vectors: Flash Loans & Price Oracle Manipulation",
                "description": "Analyze multi-million dollar DeFi exploits: spot price manipulation, uncollateralized Flash Loans, and using TWAP / Chainlink oracles.",
                "topics_covered": ["Flash Loans Mechanics (Aave, Uniswap Flash Swaps)", "Manipulating AMM Spot Reserves within a Single Block", "Vulnerabilities of getReserves() as a Valuation Mechanism", "Mitigating Manipulation with Chainlink Decentralized Oracles & TWAPs", "Slippage Protections & Sandwich Front-Running Attacks (MEV)"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "Automated Static Analysis with Slither & Mythril",
                "description": "Integrate automated security scanners to detect common vulnerability patterns and code smells in Solidity repositories.",
                "topics_covered": ["Static Analysis AST Representation in Slither", "Running Slither Detectors (Uninitialized State, Locked Ether)", "Custom Slither Scripting in Python", "Symbolic Execution with Mythril & Exploring State Spaces", "Automating Slither Audits in GitHub Actions CI"],
                "duration": "1 Week"
            },
            {
                "step_number": 5,
                "title": "Property-Based Fuzzing with Foundry & Echidna",
                "description": "Define mathematical invariants and execute millions of randomly generated transactions to break state assertions.",
                "topics_covered": ["Unit Testing vs Property-Based Fuzz Testing", "Writing Stateless vs Stateful Fuzz Tests in Foundry", "Defining System Invariants (e.g. Total Supply == Sum of Balances)", "Echidna Mutation-Based Fuzzing Configuration", "Interpreting Shrink Paths to Identify Minimal Reproducible Bugs"],
                "duration": "1 Week"
            },
            {
                "step_number": 6,
                "title": "Auditing Methodology & Writing Professional Audit Reports",
                "description": "Follow a structured commercial audit workflow: scoping, automated triage, manual code review, writing PoC exploits, and client reporting.",
                "topics_covered": ["The End-to-End Smart Contract Audit Workflow", "Writing Working Proof-of-Concept (PoC) Tests in Foundry", "Severity Classification Standards (Critical, High, Medium, Low, Informational)", "Structuring the Final Audit Deliverable Report", "Participating in Competitive Audits (Code4rena, Sherlock)"],
                "duration": "1 Week"
            }
        ]
    },
    {
        "title": "Malware Analysis & Reverse Engineering",
        "slug": "malware-analysis-reverse-engineering",
        "category": "Cybersecurity",
        "level": "Advanced",
        "difficulty": "Advanced",
        "duration": "12 Weeks",
        "description": "Dissect real-world malicious binaries to understand attacker tradecraft. Master x86/x64 assembly language, static analysis with Ghidra and IDA Pro, dynamic debugging with x64dbg, unpacking obfuscated payloads, anti-debugging evasion bypasses, and YARA signature writing.",
        "skills_covered": ["x86 / x64 Assembly Language", "Static Disassembly & Decompilation (Ghidra)", "Dynamic Debugging (x64dbg)", "PE File Format Structure", "Unpacking Packed & Encrypted Binaries", "Anti-Analysis & Anti-Debugging Bypasses", "YARA Rule Authoring"],
        "prerequisites": ["Solid understanding of C/C++ programming and operating system fundamentals", "Knowledge of Windows architecture (PE headers, memory)"],
        "career_outcomes": ["Malware Analyst", "Reverse Engineer", "Threat Intelligence Researcher", "Incident Response Malware Specialist"],
        "tech_stack": ["Ghidra", "x64dbg", "IDA Free", "PEview", "YARA", "Process Hacker", "Flare-VM"],
        "tags": ["malware-analysis", "reverse-engineering", "ghidra", "assembly", "debugging", "yara", "cybersecurity"],
        "capstone_projects": [
            {
                "title": "Complete Reverse Engineering & Technical Report of a Real Ransomware Sample",
                "description": "Dissect an active ransomware binary in an isolated lab: analyze its cryptographic encryption routines, unpack its payload, extract hardcoded C2 addresses, and write an authoritative threat report.",
                "difficulty": "Advanced"
            },
            {
                "title": "Automated Malware Unpacker & YARA Generation Tool",
                "description": "Build an automated Python script that monitors injected memory buffers in dynamic debuggers, dumps unpacked PE executables, and generates automated YARA rules.",
                "difficulty": "Advanced"
            }
        ],
        "curated_resources": [
            {"title": "Practical Malware Analysis by Michael Sikorski & Andrew Honig", "url": "https://nostarch.com/malware", "type": "Classic Textbook"},
            {"title": "Ghidra Official Documentation & NSA Tutorials", "url": "https://ghidra-sre.org/", "type": "Documentation"},
            {"title": "OpenSecurityTraining2: Architecture & Reverse Engineering", "url": "https://p.ost2.fyi/", "type": "Free Comprehensive Courses"}
        ],
        "is_featured": False,
        "popularity_rank": 79,
        "roadmap_steps": [
            {
                "step_number": 1,
                "title": "Safe Lab Architecture & The Portable Executable (PE) Format",
                "description": "Build an air-gapped Flare-VM lab and deconstruct Windows Portable Executable headers: DOS header, PE header, sections, and import tables.",
                "topics_covered": ["Isolated Virtualized Malware Lab Setup & Host-Only Networking", "PE Format Architecture: IMAGE_DOS_HEADER & IMAGE_NT_HEADERS", "Section Headers (.text, .data, .rsrc, .reloc)", "Import Address Table (IAT) & Export Address Table (EAT)", "Inspecting Binaries with PEview and CFF Explorer"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 2,
                "title": "x86/x64 Assembly Language for Reverse Engineers",
                "description": "Read low-level machine code: CPU registers (RAX, RBX, RCX, RDX, RSP, RBP), stack frames, calling conventions, and control flow.",
                "topics_covered": ["General Purpose Registers, Instruction Pointer (EIP/RIP) & Flags", "The Call Stack, PUSH, POP, Stack Frames & Base Pointer (EBP)", "Arithmetic, Bitwise, and Logic Instructions (MOV, LEA, XOR, TEST, CMP)", "Conditional Branching (JZ, JNZ, JMP, CALL, RET)", "Calling Conventions: cdecl, stdcall, fastcall, x64 calling convention"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 3,
                "title": "Static Analysis & Decompilation with Ghidra",
                "description": "Analyze disassembled machine code and decompiled C representations using NSA's open-source Ghidra suite.",
                "topics_covered": ["Ghidra Project Setup & Auto-Analysis Options", "Navigating Disassembly vs Decompiled C Windows", "Renaming Variables, Custom Struct Creation & Type Propagation", "Cross-References (XREFs) to Strings and API Functions", "Recognizing Common C Algorithms in Disassembly (Loops, Switches)"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 4,
                "title": "Dynamic Debugging with x64dbg & Behavioral Monitoring",
                "description": "Execute binaries step-by-step in x64dbg, setting breakpoints on key Windows API functions and monitoring system mutations.",
                "topics_covered": ["Setting Software vs Hardware Breakpoints", "Stepping Into (F7) vs Stepping Over (F8) Assembly Instructions", "Setting Breakpoints on Suspicious APIs (VirtualAlloc, CreateProcess, RegSetValue)", "Monitoring File & Registry Mutations with Process Monitor (ProcMon)", "Simulating Network Responses with FakeNet-NG / INetSim"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 5,
                "title": "Unpacking Packed Payloads & Anti-Analysis Bypasses",
                "description": "Detect and defeat packing techniques (UPX, custom packers), find the Original Entry Point (OEP), and bypass anti-debugging checks.",
                "topics_covered": ["The Purpose of Packers & Detecting Packers with Detect It Easy (DIE)", "Locating the Original Entry Point (OEP) using Tail Jumps", "Dumping Unpacked Memory to Disk & Rebuilding the IAT with Scylla", "Anti-Debugging Checks (IsDebuggerPresent, PEB BeingDebugged Flag)", "Timing Checks (RDTSC) & Anti-VM Fingerprinting Evasion"],
                "duration": "2 Weeks"
            },
            {
                "step_number": 6,
                "title": "YARA Rule Authoring & Threat Intelligence Reports",
                "description": "Codify binary signatures with YARA and author comprehensive technical malware analysis reports for incident responders.",
                "topics_covered": ["YARA Rule Syntax: Meta, Strings (Hex, Regex, Text), Condition", "Writing Resilient Byte-Pattern Signatures with Wildcards", "Testing YARA Rules against Large Malware Repositories", "Documenting Capabilities: Persistence, C2 Communication, Encryption", "Publishing Actionable Indicators of Compromise (IoCs) in STIX/TAXII"],
                "duration": "2 Weeks"
            }
        ]
    }
]
