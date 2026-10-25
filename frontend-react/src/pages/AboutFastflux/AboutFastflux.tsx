import "./AboutFastflux.css";

function AboutFastflux() {
  return (
    <div className="about-fastflux">
      <div className="about-fastflux-container">
        <div className="page-header">
          <h1 className="about-fastflux-title">⚡ Fast Flux Techniques Explained</h1>
          <p className="subtitle">Understanding the Dark Arts of DNS Evasion</p>
        </div>
        
        <section className="about-fastflux-intro">
          <div className="intro-icon">🔍</div>
          <p>
            Fast flux is a DNS-based evasion and resilience technique used primarily by botnets and advanced malware infrastructures to maintain the availability of malicious services while resisting detection, blocking, takedown, and blacklisting. In cybersecurity and network defense contexts, fast-flux techniques are commonly categorized into <strong>single-flux</strong>, <strong>double-flux</strong>, and <strong>name flux</strong>, each representing different methods of rapidly changing DNS-related information such as IP addresses, name servers, or domain names to obscure malicious infrastructure and evade defensive controls. This overview provides a structured, end-to-end explanation suitable for academic, operational, and security-engineering contexts.
          </p>
        </section>

        {/* Three Flux Types Side by Side */}
        <div className="flux-types-grid">
          {/* Single-Flux Section */}
          <section className="flux-type-card single-flux">
            <div className="card-header">
              <div className="card-icon">🎯</div>
              <h2>Single-Flux</h2>
              <span className="threat-level threat-medium">Threat Level: Medium</span>
            </div>
            
            <h3>💡 Definition</h3>
            <p>
              Single-flux is a technique where a <strong>single domain name</strong> rapidly changes its <strong>IP address mappings</strong> (A records) in DNS.
            </p>

            <h3>⚙️ How it works</h3>
            <ul>
              <li>The attacker controls a domain (e.g., <code>malicious-site.com</code>).</li>
              <li>The domain resolves to <strong>many different IP addresses</strong> over time.</li>
              <li>These IPs usually belong to compromised machines (bots).</li>
              <li>DNS TTL values are set very low (seconds or minutes).</li>
            </ul>

            <h3>🎯 Purpose</h3>
            <ul>
              <li>Evade IP-based blocking and takedown</li>
              <li>Increase resilience against blacklisting</li>
              <li>Make infrastructure appear unstable or transient</li>
            </ul>

            <h3>📊 Characteristics</h3>
            <ul>
              <li>One domain</li>
              <li>Many rotating IP addresses</li>
              <li>Fast DNS changes</li>
              <li>IPs often geographically distributed</li>
            </ul>

            <h3>📝 Example</h3>
            <div className="code-block">
              <div className="code-label">DNS Resolution Pattern:</div>
              <code>
                malicious-site.com → 192.168.1.10<br/>
                malicious-site.com → 203.0.113.45<br/>
                malicious-site.com → 45.76.22.91
              </code>
            </div>
          </section>

          {/* Name Flux Section */}
          <section className="flux-type-card name-flux">
            <div className="card-header">
              <div className="card-icon">🔄</div>
              <h2>Name Flux</h2>
              <span className="threat-level threat-high">Threat Level: High</span>
            </div>
            
            <h3>💡 Definition</h3>
            <p>
              Name flux focuses on <strong>rapidly changing domain names</strong> rather than IP addresses.
            </p>

            <h3>⚙️ How it works</h3>
            <ul>
              <li>Malware uses a <strong>Domain Generation Algorithm (DGA)</strong>.</li>
              <li>Hundreds or thousands of domain names are generated daily.</li>
              <li>The attacker registers only a small subset.</li>
              <li>Bots attempt to resolve many domains until one works.</li>
            </ul>

            <h3>🎯 Purpose</h3>
            <ul>
              <li>Evade domain-based blocking</li>
              <li>Make blacklist maintenance impractical</li>
              <li>Maintain command-and-control (C2) availability</li>
            </ul>

            <h3>📊 Characteristics</h3>
            <ul>
              <li>Many domain names</li>
              <li>Often random-looking strings</li>
              <li>Short domain lifetimes</li>
              <li>Common in modern malware families</li>
            </ul>

            <h3>📝 Example</h3>
            <div className="code-block">
              <div className="code-label">DGA-Generated Domains:</div>
              <code>
                xj29akd.com<br/>
                qwe91zxc.net<br/>
                a8f92kdl.org
              </code>
            </div>
          </section>

          {/* Double-Flux Section */}
          <section className="flux-type-card double-flux">
            <div className="card-header">
              <div className="card-icon">⚠️</div>
              <h2>Double-Flux</h2>
              <span className="threat-level threat-critical">Threat Level: Critical</span>
            </div>
            
            <h3>💡 Definition</h3>
            <p>
              Double-flux extends single-flux by rotating <strong>both</strong>:
            </p>
            <ul>
              <li>The <strong>IP addresses of the domain</strong>, and</li>
              <li>The <strong>IP addresses of the authoritative name servers</strong>.</li>
            </ul>

            <h3>⚙️ How it works</h3>
            <ul>
              <li>The domain's A records change frequently (like single-flux).</li>
              <li>The NS records also point to different compromised machines.</li>
              <li>Both layers are unstable and short-lived.</li>
            </ul>

            <h3>🎯 Purpose</h3>
            <ul>
              <li>Make domain takedown significantly harder</li>
              <li>Avoid seizure of name servers</li>
              <li>Increase botnet survivability</li>
            </ul>

            <h3>📊 Characteristics</h3>
            <ul>
              <li>Domain IPs rotate rapidly</li>
              <li>Name server IPs also rotate</li>
              <li>Extremely low TTLs</li>
              <li>Highly resilient malicious infrastructure</li>
            </ul>

            <h3>📝 Example</h3>
            <div className="code-block">
              <div className="code-label">Dual-Layer Rotation:</div>
              <code>
                Domain: evil.com<br/>
                NS: ns1.evil.com → rotating bot IPs<br/>
                A: evil.com → rotating bot IPs
              </code>
            </div>
          </section>
        </div>

        {/* Comparison Table */}
        <section className="about-fastflux-section comparison-section">
          <h2>📊 Comparison Summary</h2>
          <div className="comparison-table">
            <table>
              <thead>
                <tr>
                  <th>Technique</th>
                  <th>What Changes Rapidly</th>
                  <th>Main Evasion Target</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Single-Flux</td>
                  <td>IP addresses</td>
                  <td>IP blacklists</td>
                </tr>
                <tr>
                  <td>Name Flux</td>
                  <td>Domain names</td>
                  <td>Domain blacklists</td>
                </tr>
                <tr>
                  <td>Double-Flux</td>
                  <td>IPs + Name servers</td>
                  <td>DNS & IP defenses</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Detection & Defense Section */}
        <section className="about-fastflux-section defense-section">
          <h2>🛡️ Detection & Defense Strategies</h2>
          <ul>
            <li><strong>DNS anomaly detection</strong> (low TTLs, high churn)</li>
            <li><strong>DGA detection</strong> using lexical and ML-based analysis</li>
            <li><strong>Reputation scoring</strong> of IPs and domains</li>
            <li><strong>Sinkholing</strong> malicious domains</li>
            <li><strong>Registrar and DNS provider coordination</strong></li>
          </ul>
        </section>

        {/* How SentinelFlux Helps */}
        <section className="about-fastflux-section highlight-section">
          <div className="shield-icon">🛡️</div>
          <h2>⚡ How SentinelFlux Empowers Your Defense</h2>
          <p>
            Our platform provides advanced tools to detect, track, and visualize 
            all three types of Fast Flux networks, empowering security professionals to:
          </p>
          <ul>
            <li>Identify single-flux, double-flux, and name flux patterns</li>
            <li>Analyze DNS anomalies and low TTL behavior</li>
            <li>Visualize threat infrastructure in real-time</li>
            <li>Monitor historical data for emerging threats</li>
            <li>Stay ahead of sophisticated cyber threats</li>
          </ul>
        </section>

        {/* Fast Flux Resources */}
        <section className="about-fastflux-section publications-section">
          <div className="publications-icon">📚</div>
          <h2>📖 Fast Flux Resources</h2>
          <p>
            Explore our curated collection of research papers, educational videos and blog posts about Fast Flux networks:
          </p>
          
          <div className="resources-grid">
            {/* Papers Category */}
            <div className="resource-category">
              <h3>📄 Research Papers</h3>
              <ul className="publications-list">
                <li>
                  <a href="https://www.researchgate.net/publication/265490396_Behavioral_Analysis_and_Visualization_of_Fast-Flux_DNS" target="_blank" rel="noopener noreferrer">
                    Behavioral Analysis and Visualization of Fast-Flux DNS
                  </a>
                </li>
                <li>
                  <a href="https://www.researchgate.net/publication/390673471_Fast_Flux_in_Cybersecurity_Mechanisms_Evolution_National_Security_Implications_and_Mitigation_Strategies_in_2025" target="_blank" rel="noopener noreferrer">
                    Fast Flux in Cybersecurity: Mechanisms, Evolution, National Security Implications, and Mitigation Strategies in 2025
                  </a>
                </li>
                <li>
                  <a href="https://www.cisa.gov/news-events/cybersecurity-advisories/aa25-093a" target="_blank" rel="noopener noreferrer">
                    CISA Cybersecurity Advisory - Fast Flux Networks
                  </a>
                </li>
              </ul>
            </div>

            {/* Videos Category */}
            <div className="resource-category">
              <h3>🎥 Educational Videos</h3>
              <ul className="publications-list">
                <li>
                  <a href="https://youtu.be/CQ3nnlZ8nbw?si=MfH5fDaFhtEHhuPJ" target="_blank" rel="noopener noreferrer">
                    NSA Says Fast Flux Is A National Security Threat, But What Is It?
                  </a>
                </li>
                <li>
                  <a href="https://youtu.be/zSbyZIopeEE?si=VewoSn8E5-LUICwo" target="_blank" rel="noopener noreferrer">
                    Fast Flux: The Weapon Hackers Use to Stay Hidden
                  </a>
                </li>
                <li>
                  <a href="https://youtu.be/9cz8n36P9pQ?si=v0xnSUe607eK7H5L" target="_blank" rel="noopener noreferrer">
                    Fast Flux Uncovered: The DNS Trick Cybercriminals Don't Want You to See
                  </a>
                </li>
              </ul>
            </div>

            {/* Blog Category */}
            <div className="resource-category">
              <h3>📝 Blog Posts</h3>
              <ul className="publications-list">
                <li>
                  <a href="https://blogs.infoblox.com/threat-intelligence/disrupting-fast-flux-and-much-more-with-protective-dns/" target="_blank" rel="noopener noreferrer">
                    Disrupting Fast Flux and Much More with Protective DNS
                  </a>
                </li>
                <li>
                  <a href="https://blogs.npav.net/blogs/post/fast-flux-the-evasive-cyber-technique-powering-malware-phishing-and-c2-networks" target="_blank" rel="noopener noreferrer">
                    Fast Flux: The Evasive Cyber Technique Powering Malware, Phishing, and C2 Networks
                  </a>
                </li>
                <li>
                  <a href="https://cybersecurity.opentext.com/blog/fast-flux-the-evasive-dns-tactic-now-considered-a-national-security-threat/" target="_blank" rel="noopener noreferrer">
                    Fast Flux: The Evasive DNS Tactic Now Considered a National Security Threat
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AboutFastflux;
