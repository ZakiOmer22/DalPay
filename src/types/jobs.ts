// web/src/data/jobs.ts
export interface Job {
  slug: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  niceToHave: string[];
}

export const jobs: Job[] = [
  {
    slug: 'senior-backend-engineer',
    title: 'Senior Backend Engineer',
    department: 'Engineering',
    location: 'Hargeisa, Somaliland',
    type: 'Full‑time',
    description:
      'Design, build, and maintain the core API that processes tax payments and assessments for millions of citizens. You will work on encryption, double‑entry accounting, fraud detection, and USSD integration.',
    responsibilities: [
      'Develop and optimise Node.js/TypeScript services',
      'Design PostgreSQL schemas, RLS policies, and migrations',
      'Implement secure token management, rate limiting, and audit trails',
      'Mentor junior engineers and review code',
    ],
    qualifications: [
      '4+ years of backend development experience',
      'Strong TypeScript and PostgreSQL skills',
      'Familiarity with security best practices (OWASP, encryption, OAuth2)',
      'Experience with message queues (BullMQ) is a plus',
    ],
    niceToHave: [
      'Previous fintech or government project experience',
      'Knowledge of Redis and background job processing',
      'Experience with Stripe APIs',
    ],
  },
  {
    slug: 'ui-ux-designer',
    title: 'UI/UX Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Contract',
    description:
      'Shape the look and feel of DalPay’s web and USSD interfaces. You will create accessible, mobile‑first designs for taxpayers, administrators, and auditors.',
    responsibilities: [
      'Design responsive web pages and USSD flows',
      'Create interactive prototypes in Figma',
      'Conduct user research with citizens and government officers',
      'Collaborate with engineers on component implementation',
    ],
    qualifications: [
      '3+ years of product design experience',
      'Proficiency in Figma and design systems',
      'Understanding of accessibility standards (WCAG)',
      'Experience with Tailwind CSS is a bonus',
    ],
    niceToHave: [
      'Experience designing for low‑bandwidth or feature‑phone users',
      'Knowledge of Arabic or Somali language',
    ],
  },
  {
    slug: 'tax-operations-specialist',
    title: 'Tax Operations Specialist',
    department: 'Operations',
    location: 'Hargeisa, Somaliland',
    type: 'Full‑time',
    description:
      'Ensure the accuracy of tax assessments, handle disputes, and support the rollout of DalPay across all regions of Somaliland.',
    responsibilities: [
      'Verify taxpayer data and assessment calculations',
      'Process tax disputes and communicate with citizens',
      'Train new users and government staff on the platform',
      'Monitor fraud alerts and coordinate with security team',
    ],
    qualifications: [
      'Degree in Accounting, Finance, or related field',
      '2+ years working in tax administration or financial operations',
      'Detail‑oriented and comfortable with spreadsheets',
      'Excellent communication skills in Somali and English',
    ],
    niceToHave: [
      'Experience with ERP or tax software',
      'Knowledge of Somaliland tax regulations',
    ],
  },
  {
    slug: 'security-analyst',
    title: 'Security Analyst',
    department: 'Security',
    location: 'Hargeisa, Somaliland',
    type: 'Full‑time',
    description:
      'Protect DalPay’s infrastructure and user data. You will monitor logs, respond to incidents, and help harden our systems against real‑world threats.',
    responsibilities: [
      'Monitor SIEM alerts and investigate anomalies',
      'Perform vulnerability assessments and penetration testing',
      'Review code for security flaws (IDOR, XSS, SQLi)',
      'Manage incident response and post‑mortem analysis',
    ],
    qualifications: [
      '3+ years in cybersecurity or a related field',
      'Hands‑on experience with OWASP Top 10 and secure coding',
      'Familiarity with cloud security (AWS or Render)',
      'Certifications like CEH, Security+, or CISSP are a plus',
    ],
    niceToHave: [
      'Experience with government or financial sector security',
      'Knowledge of blockchain or digital identity',
    ],
  },
  {
    slug: 'mobile-money-integration-developer',
    title: 'Mobile Money Integration Developer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full‑time',
    description:
      'Build and maintain connectors to mobile money providers (Zaad, eDahab, Nomad). You will handle asynchronous callbacks, idempotency, and simulated sandbox environments.',
    responsibilities: [
      'Develop adapters for different mobile money APIs',
      'Implement HMAC signature verification for callbacks',
      'Write integration tests and simulate provider behaviour',
      'Monitor payment success rates and troubleshoot failures',
    ],
    qualifications: [
      '2+ years of backend integration experience',
      'Proficiency in Node.js and REST APIs',
      'Understanding of idempotency and eventual consistency',
      'Experience with webhooks and HTTP signatures',
    ],
    niceToHave: [
      'Experience with African mobile money platforms',
      'Familiarity with USSD gateway protocols',
    ],
  },
];