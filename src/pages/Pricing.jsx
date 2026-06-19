/* ==========================================================================
   GymSync — Pricing Page
   3-tier pricing cards + AWS cost breakdown table
   ========================================================================== */
import { useToast } from '../components/Toast';

const plans = [
  {
    name: 'Starter',
    price: 0,
    subtitle: 'Perfect for getting started',
    badge: 'CURRENT PLAN',
    badgeColor: 'var(--accent-green)',
    featured: false,
    features: [
      { text: '1 Branch', included: true },
      { text: 'Up to 100 Members', included: true },
      { text: 'Basic Dashboard', included: true },
      { text: 'Manual Backups', included: true },
      { text: 'Community Support', included: true },
      { text: 'Real-time Monitoring', included: false },
      { text: 'Multi-branch Analytics', included: false },
      { text: 'Priority Support', included: false },
      { text: 'Custom Domain', included: false },
      { text: 'API Access', included: false },
    ],
    cta: 'Current Plan',
    ctaDisabled: true,
  },
  {
    name: 'Growth',
    price: 47,
    subtitle: 'Most popular for growing chains',
    featured: true,
    features: [
      { text: 'Up to 5 Branches', included: true },
      { text: 'Up to 2,500 Members', included: true },
      { text: 'Full Analytics Dashboard', included: true },
      { text: 'Automated Daily Backups', included: true },
      { text: 'Real-time Monitoring', included: true },
      { text: 'Multi-branch Analytics', included: true },
      { text: 'Email Support (24h response)', included: true },
      { text: 'Custom Domain + SSL', included: true },
      { text: 'Dedicated Account Manager', included: false },
      { text: 'Multi-region Deployment', included: false },
    ],
    cta: 'Upgrade to Growth',
    ctaDisabled: false,
  },
  {
    name: 'Enterprise',
    price: 180,
    subtitle: 'For large-scale operations',
    featured: false,
    features: [
      { text: 'Unlimited Branches', included: true },
      { text: 'Unlimited Members', included: true },
      { text: 'Advanced Analytics + AI Insights', included: true },
      { text: 'Real-time Backups (RPO: 1hr)', included: true },
      { text: 'Full Observability Stack', included: true },
      { text: 'Multi-region Deployment', included: true },
      { text: 'Priority Support (1h response)', included: true },
      { text: 'Custom Domain + API Access', included: true },
      { text: 'Dedicated Account Manager', included: true },
      { text: 'SLA: 99.9% Uptime Guarantee', included: true },
    ],
    cta: 'Contact Sales',
    ctaDisabled: false,
  },
];

const costBreakdown = [
  ['EC2 Instance', '750 hrs/mo', 't2.micro (free)', 't3.small ($15)', 't3.medium ($30)'],
  ['EBS Storage', '30GB free', '20GB (free)', '50GB ($5)', '100GB ($10)'],
  ['RDS MySQL', '750 hrs/mo', 'db.t3.micro (free)', 'db.t3.small ($12)', 'db.t3.medium ($24)'],
  ['RDS Storage', '20GB free', '20GB (free)', '50GB ($5)', '100GB ($10)'],
  ['S3 Backups', '5GB free', '5GB (free)', '50GB ($2)', '200GB ($5)'],
  ['CloudWatch', '10 metrics', 'Basic (free)', 'Enhanced ($3)', 'Full ($8)'],
  ['Data Transfer', '1GB free', 'Minimal (free)', '50GB ($5)', '200GB ($18)'],
  ['Route 53', '—', '—', '1 domain ($0.50)', '3 domains ($1.50)'],
  ['Elastic IP', 'Free (attached)', '1 (free)', '2 ($3.60)', '5 ($14.40)'],
  ['WAF', '—', '—', '—', 'Basic ($5)'],
];

export default function Pricing() {
  const showToast = useToast();

  const handleUpgrade = (plan) => {
    if (plan === 'Growth') {
      showToast('Upgrade feature coming soon! Contact support for early access.', 'info');
    } else {
      showToast('Our sales team will reach out within 24 hours.', 'success');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Choose Your Plan
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Scale your fitness empire with the right infrastructure
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="page-grid page-grid-3 section-gap" style={{ maxWidth: 1100, margin: '0 auto 2rem' }}>
        {plans.map((plan, i) => (
          <div key={plan.name} className={`pricing-card ${plan.featured ? 'pricing-card--featured' : ''} animate-fadeInUp stagger-${i + 1}`}>
            {plan.badge && (
              <div style={{
                position: 'absolute', top: plan.featured ? -1 : 12, right: plan.featured ? undefined : 12,
                left: plan.featured ? '50%' : undefined,
                transform: plan.featured ? undefined : undefined,
                background: plan.featured ? undefined : `${plan.badgeColor}15`,
                color: plan.badgeColor || 'var(--accent-blue)',
                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em',
                padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)',
              }}>
                {plan.badge}
              </div>
            )}

            <div className="pricing-name" style={{ marginTop: plan.badge && !plan.featured ? '1rem' : 0 }}>{plan.name}</div>
            <div className="pricing-price">
              ${plan.price}<span>/month</span>
            </div>
            <div className="pricing-subtitle">{plan.subtitle}</div>

            <ul className="pricing-features">
              {plan.features.map((f, fi) => (
                <li key={fi} style={{ opacity: f.included ? 1 : 0.4 }}>
                  <span className={f.included ? 'check' : 'cross'}>{f.included ? '✓' : '✗'}</span>
                  {f.text}
                </li>
              ))}
            </ul>

            <button
              className={`btn ${plan.featured ? 'btn--primary' : 'btn--secondary'} w-full`}
              style={{
                width: '100%', justifyContent: 'center', padding: '0.75rem',
                opacity: plan.ctaDisabled ? 0.5 : 1,
                cursor: plan.ctaDisabled ? 'default' : 'pointer',
              }}
              onClick={() => !plan.ctaDisabled && handleUpgrade(plan.name)}
              disabled={plan.ctaDisabled}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* AWS Cost Breakdown */}
      <div className="card animate-fadeInUp stagger-4">
        <div className="card-header">
          <h3>Detailed AWS Cost Breakdown</h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Mumbai region (ap-south-1)</span>
        </div>
        <div className="card-body" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Free Tier Limit</th>
                <th style={{ color: 'var(--text-secondary)' }}>Starter ($0)</th>
                <th style={{ color: 'var(--accent-blue)' }}>Growth ($47)</th>
                <th style={{ color: 'var(--accent-purple)' }}>Enterprise ($180)</th>
              </tr>
            </thead>
            <tbody>
              {costBreakdown.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{row[0]}</td>
                  <td style={{ fontSize: '0.8rem' }}>{row[1]}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{row[2]}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{row[3]}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{row[4]}</td>
                </tr>
              ))}
              {/* Total Row */}
              <tr style={{ background: 'rgba(59,130,246,0.05)' }}>
                <td style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Total</td>
                <td>—</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-green)', fontSize: '0.95rem' }}>$0/mo</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-blue)', fontSize: '0.95rem' }}>$47/mo</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-purple)', fontSize: '0.95rem' }}>$180/mo</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
