// File: js/core/api.js
// Job data source: hardcoded Metro Cebu listings merged with employer-submitted
// custom jobs from localStorage. All seeded listings are verified and geo-tagged.

const DEFAULT_JOBS = [
  {
    id: "job-001",
    title: "Software Developer",
    company: "CloudCore Solutions",
    lat: 10.3308,
    lng: 123.9063,
    verified: true,
    salaryMin: 45000,
    salaryMax: 70000,
    minAge: 18,
    setup: "onsite",
    type: "full-time",
    postedAt: "2026-11-16",
    description: "Build and maintain backend services for a logistics SaaS used across Visayas.",
    requirements: ["3+ yrs Node.js/Express", "SQL (PostgreSQL)", "REST API design"],
    perks: ["Remote Fridays", "Health insurance", "Annual leave"],
    applyEmail: "careers@cloudcore.example",
    applyUrl: "https://cloudcore.example/careers"
  },
  {
    id: "job-002",
    title: "Customer Support Agent",
    company: "Islands Telecom",
    lat: 10.3089,
    lng: 124.0016,
    verified: true,
    salaryMin: 18000,
    salaryMax: 24000,
    minAge: 18,
    setup: "onsite",
    type: "full-time",
    postedAt: "2026-11-14",
    description: "Help subscribers troubleshoot billing and connectivity issues.",
    requirements: ["English proficiency", "Customer service experience", "Basic computer use"],
    perks: ["Night differential", "Performance bonus", "Free shuttle"],
    applyEmail: "hr@islandstelecom.example",
    applyUrl: "https://islandstelecom.example/careers"
  },
  {
    id: "job-003",
    title: "Warehouse Associate",
    company: "Mandaue Logistics Hub",
    lat: 10.3333,
    lng: 123.9333,
    verified: true,
    salaryMin: 15000,
    salaryMax: 20000,
    minAge: 18,
    setup: "onsite",
    type: "full-time",
    postedAt: "2026-11-12",
    description: "Receive, inspect, and dispatch e-commerce parcels from our Mandaue hub.",
    requirements: ["Physical stamina", "Inventory handling", "Forklift preferred"],
    perks: ["Meal allowance", "Savings plan", "Shift differential"],
    applyEmail: "hiring@mandauehub.example",
    applyUrl: "https://mandauehub.example/jobs"
  },
  {
    id: "job-004",
    title: "Sales Executive",
    company: "Ayala Land Leasing",
    lat: 10.3181,
    lng: 123.9056,
    verified: true,
    salaryMin: 20000,
    salaryMax: 35000,
    minAge: 21,
    setup: "onsite",
    type: "full-time",
    postedAt: "2026-11-10",
    description: "Lease commercial spaces to SMEs and BPO tenants across Cebu.",
    requirements: ["2+ yrs B2B sales", "Negotiation skills", "CRM usage"],
    perks: ["Commission structure", "Car allowance", "Team events"],
    applyEmail: "leasing@ayalaland.example",
    applyUrl: "https://ayalaland.example/careers"
  },
  {
    id: "job-005",
    title: "Production Operator",
    company: "Mactan Electronics Assembly",
    lat: 10.3236,
    lng: 123.9794,
    verified: true,
    salaryMin: 16000,
    salaryMax: 22000,
    minAge: 18,
    setup: "onsite",
    type: "full-time",
    postedAt: "2026-11-09",
    description: "Assemble circuit boards under strict quality standards on the production line.",
    requirements: ["SMT experience preferred", "Willingness to work shifts", "Attention to detail"],
    perks: ["Housing allowance", "Meal subsidy", "Free uniform"],
    applyEmail: "ops@actmactan.example",
    applyUrl: "https://actmactan.example/careers"
  },
  {
    id: "job-006",
    title: "Frontend Developer",
    company: "Cebu Digital Labs",
    lat: 10.3308,
    lng: 123.9063,
    verified: true,
    salaryMin: 35000,
    salaryMax: 55000,
    minAge: 18,
    setup: "hybrid",
    type: "full-time",
    postedAt: "2026-11-15",
    description: "Design and ship responsive web features for a fintech product used by local SMEs.",
    requirements: ["React or Vue experience", "CSS/JavaScript", "Git workflow"],
    perks: ["Flexible hours", "Learning budget", "Snacks on site"],
    applyEmail: "talent@cebudigitallabs.example",
    applyUrl: "https://cebudigitallabs.example/careers"
  },
  {
    id: "job-007",
    title: "Call Center Agent",
    company: "BPO Reach Inc.",
    lat: 10.3089,
    lng: 124.0016,
    verified: true,
    salaryMin: 20000,
    salaryMax: 28000,
    minAge: 18,
    setup: "onsite",
    type: "full-time",
    postedAt: "2026-11-13",
    description: "Take inbound customer calls for a US-based e-commerce brand.",
    requirements: ["English communication", "Customer service", "Basic computer use"],
    perks: ["Night differential", "Incentive pay", "Free shuttle"],
    applyEmail: "recruiting@bmoreach.example",
    applyUrl: "https://bmoreach.example/jobs"
  },
  {
    id: "job-008",
    title: "Forklift Operator",
    company: "Cebu Cold Storage",
    lat: 10.3333,
    lng: 123.9333,
    verified: true,
    salaryMin: 17000,
    salaryMax: 23000,
    minAge: 18,
    setup: "onsite",
    type: "full-time",
    postedAt: "2026-11-11",
    description: "Move refrigerated goods safely across the cold-storage yard.",
    requirements: ["Forklift license", "Cold-storage tolerance", "Safety awareness"],
    perks: ["Hazard pay", "Meal allowance", "Uniform provided"],
    applyEmail: "ops@cebucoldstorage.example",
    applyUrl: "https://cebucoldstorage.example/careers"
  },
  {
    id: "job-009",
    title: "Account Manager",
    company: "Cebu Media Partners",
    lat: 10.3181,
    lng: 123.9056,
    verified: true,
    salaryMin: 25000,
    salaryMax: 45000,
    minAge: 21,
    setup: "onsite",
    type: "full-time",
    postedAt: "2026-11-08",
    description: "Grow advertising accounts and coordinate campaigns for local brands.",
    requirements: ["2+ yrs account management", "Client-facing", "Negotiation skills"],
    perks: ["Commission", "Laptop", "Team outings"],
    applyEmail: "accounts@cebumediapartners.example",
    applyUrl: "https://cebumediapartners.example/careers"
  },
  {
    id: "job-010",
    title: "QC Inspector",
    company: "Mactan Food Processing",
    lat: 10.3236,
    lng: 123.9794,
    verified: true,
    salaryMin: 18000,
    salaryMax: 25000,
    minAge: 18,
    setup: "onsite",
    type: "full-time",
    postedAt: "2026-11-07",
    description: "Inspect packaged food products against quality standards before shipment.",
    requirements: ["Food safety knowledge", "Attention to detail", "Lab equipment use"],
    perks: ["Free meals", "Health checkup", "Uniform"],
    applyEmail: "qc@mactanfood.example",
    applyUrl: "https://mactanfood.example/careers"
  }
];

const JobAPI = {
  /**
   * Return all jobs: verified Metro Cebu listings merged with custom jobs
   * posted through the employer portal.
   * @returns {Object[]} array of job objects
   */
  fetchJobs() {
    const custom = (window.SavedStorage && SavedStorage.loadCustomJobs()) || [];
    return [...DEFAULT_JOBS, ...custom];
  },

  /** Find a single job by id, or null. */
  findById(id) {
    return this.fetchJobs().find((j) => j.id === id) || null;
  }
};

// Expose globally.
window.JobAPI = JobAPI;