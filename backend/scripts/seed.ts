import { verifyConnection, runQuery, closeDriver } from '../src/db/neo4j';

const INDUSTRIES = [
  { id: 'ind_fintech', name: 'FinTech' },
  { id: 'ind_healthcare', name: 'Healthcare' },
  { id: 'ind_ecommerce', name: 'E-commerce' },
  { id: 'ind_saas', name: 'SaaS' },
  { id: 'ind_edtech', name: 'EdTech' },
  { id: 'ind_logistics', name: 'Logistics' },
  { id: 'ind_cloud', name: 'Cloud Services' },
  { id: 'ind_devtools', name: 'Developer Tools' },
];

const COMPANIES = [
  { id: 'comp_technova', name: 'TechNova', location: 'San Francisco, CA' },
  { id: 'comp_finedge', name: 'FinEdge', location: 'New York, NY' },
  { id: 'comp_cloudworks', name: 'CloudWorks', location: 'Seattle, WA' },
  { id: 'comp_datasphere', name: 'DataSphere', location: 'Austin, TX' },
  { id: 'comp_devlabs', name: 'DevLabs', location: 'Boston, MA' },
  { id: 'comp_healthstack', name: 'HealthStack', location: 'Chicago, IL' },
  { id: 'comp_shopsphere', name: 'ShopSphere', location: 'Los Angeles, CA' },
  { id: 'comp_edutech', name: 'EduTech Labs', location: 'Denver, CO' },
  { id: 'comp_logicore', name: 'LogiCore', location: 'Atlanta, GA' },
  { id: 'comp_scaleworks', name: 'ScaleWorks', location: 'Miami, FL' },
];

const SKILLS = [
  { id: 'skill_react', name: 'React', category: 'Frontend' },
  { id: 'skill_vue', name: 'Vue.js', category: 'Frontend' },
  { id: 'skill_javascript', name: 'JavaScript', category: 'Languages' },
  { id: 'skill_typescript', name: 'TypeScript', category: 'Languages' },
  { id: 'skill_nodejs', name: 'Node.js', category: 'Backend' },
  { id: 'skill_python', name: 'Python', category: 'Languages' },
  { id: 'skill_java', name: 'Java', category: 'Languages' },
  { id: 'skill_sql', name: 'SQL', category: 'Databases' },
  { id: 'skill_graphql', name: 'GraphQL', category: 'APIs' },
  { id: 'skill_docker', name: 'Docker', category: 'DevOps' },
  { id: 'skill_aws', name: 'AWS', category: 'Cloud' },
  { id: 'skill_nextjs', name: 'Next.js', category: 'Frontend' },
  { id: 'skill_css', name: 'CSS', category: 'Frontend' },
  { id: 'skill_html', name: 'HTML', category: 'Frontend' },
  { id: 'skill_postgresql', name: 'PostgreSQL', category: 'Databases' },
  { id: 'skill_mongodb', name: 'MongoDB', category: 'Databases' },
  { id: 'skill_kubernetes', name: 'Kubernetes', category: 'DevOps' },
  { id: 'skill_go', name: 'Go', category: 'Languages' },
  { id: 'skill_fastapi', name: 'FastAPI', category: 'Backend' },
  { id: 'skill_spring', name: 'Spring Boot', category: 'Backend' },
];

const TECHNOLOGIES = [
  { id: 'tech_react', name: 'React', category: 'Library' },
  { id: 'tech_nodejs', name: 'Node.js', category: 'Runtime' },
  { id: 'tech_aws', name: 'AWS', category: 'Cloud Platform' },
  { id: 'tech_docker', name: 'Docker', category: 'Containerization' },
  { id: 'tech_postgres', name: 'PostgreSQL', category: 'Database' },
  { id: 'tech_graphql', name: 'GraphQL', category: 'Query Language' },
  { id: 'tech_kubernetes', name: 'Kubernetes', category: 'Orchestration' },
  { id: 'tech_nextjs', name: 'Next.js', category: 'Framework' },
  { id: 'tech_vue', name: 'Vue.js', category: 'Framework' },
  { id: 'tech_redis', name: 'Redis', category: 'Cache' },
  { id: 'tech_python', name: 'Python', category: 'Language' },
  { id: 'tech_typescript', name: 'TypeScript', category: 'Language' },
  { id: 'tech_java', name: 'Java', category: 'Language' },
  { id: 'tech_spring', name: 'Spring Boot', category: 'Framework' },
  { id: 'tech_mongodb', name: 'MongoDB', category: 'Database' },
];

const CANDIDATES = [
  { id: 'cand_sarah', name: 'Sarah Jenkins', location: 'San Francisco, CA', experience: '5 years' },
  { id: 'cand_alex', name: 'Alex Rivera', location: 'New York, NY', experience: '3 years' },
  { id: 'cand_priya', name: 'Priya Sharma', location: 'Austin, TX', experience: '8 years' },
  { id: 'cand_marcus', name: 'Marcus Chen', location: 'Seattle, WA', experience: '6 years' },
  { id: 'cand_elena', name: 'Elena Rostova', location: 'Boston, MA', experience: '2 years' },
  { id: 'cand_david', name: 'David Kim', location: 'Chicago, IL', experience: '4 years' },
  { id: 'cand_chloe', name: 'Chloe Laurent', location: 'Los Angeles, CA', experience: '7 years' },
  { id: 'cand_tariq', name: 'Tariq Al-Mansoor', location: 'Denver, CO', experience: '10 years' },
  { id: 'cand_emily', name: 'Emily Watson', location: 'Atlanta, GA', experience: '1 year' },
  { id: 'cand_nikolai', name: 'Nikolai Petrov', location: 'Miami, FL', experience: '9 years' },
];

const JOBS = [
  // TechNova (comp_technova) - SF
  { id: 'job_tn_1', title: 'Senior Frontend Architect', location: 'San Francisco, CA', experienceLevel: 'Senior', description: 'Lead the frontend engineering efforts using React, TypeScript, and modern styling architectures.' },
  { id: 'job_tn_2', title: 'Full Stack Engineer', location: 'Remote', experienceLevel: 'Mid-Senior', description: 'Build and maintain APIs using Node.js and TypeScript, working with high performance React interfaces.' },
  { id: 'job_tn_3', title: 'DevOps Engineer', location: 'San Francisco, CA', experienceLevel: 'Mid', description: 'Manage Kubernetes and Docker containers on AWS. Automate CI/CD pipelines.' },

  // FinEdge (comp_finedge) - NY
  { id: 'job_fe_1', title: 'Backend Systems Developer', location: 'New York, NY', experienceLevel: 'Senior', description: 'Design transactional backend services using Go, PostgreSQL, and high efficiency caching.' },
  { id: 'job_fe_2', title: 'Quantitative Software Engineer', location: 'New York, NY', experienceLevel: 'Mid', description: 'Work closely with data teams to implement pricing models in Python and Java.' },
  { id: 'job_fe_3', title: 'Database Administrator', location: 'New York, NY', experienceLevel: 'Senior', description: 'Optimize high throughput PostgreSQL and SQL databases for financial reporting systems.' },

  // CloudWorks (comp_cloudworks) - Seattle
  { id: 'job_cw_1', title: 'Cloud Infrastructure Architect', location: 'Seattle, WA', experienceLevel: 'Lead', description: 'Architect multi-region AWS systems. Expert knowledge of Terraform, Kubernetes, and Docker required.' },
  { id: 'job_cw_2', title: 'NodeJS Backend Developer', location: 'Remote', experienceLevel: 'Mid', description: 'Create scalable microservices using Express, TypeScript, and GraphQL APIs.' },
  { id: 'job_cw_3', title: 'Support Engineer', location: 'Seattle, WA', experienceLevel: 'Junior-Mid', description: 'Triage customer server issues and write diagnostic scripts in Python.' },

  // DataSphere (comp_datasphere) - Austin
  { id: 'job_ds_1', title: 'Lead Data Engineer', location: 'Austin, TX', experienceLevel: 'Lead', description: 'Design pipelines for machine learning model ingestion. Python, SQL, and AWS expertise needed.' },
  { id: 'job_ds_2', title: 'Graph Database Engineer', location: 'Remote', experienceLevel: 'Senior', description: 'Optimize complex graph traversals and schemas for relationship mining engines.' },
  { id: 'job_ds_3', title: 'Analytics Developer', location: 'Austin, TX', experienceLevel: 'Junior', description: 'Write SQL queries and build dashboards for business intelligence.' },

  // DevLabs (comp_devlabs) - Boston
  { id: 'job_dl_1', title: 'Frontend Engineer (React)', location: 'Boston, MA', experienceLevel: 'Mid', description: 'Help build developer tools interfaces using React, Next.js, and CSS.' },
  { id: 'job_dl_2', title: 'Technical Writer', location: 'Remote', experienceLevel: 'Mid', description: 'Write code documentation for JavaScript, TypeScript, and Python SDKs.' },
  { id: 'job_dl_3', title: 'Developer Advocate', location: 'Boston, MA', experienceLevel: 'Senior', description: 'Engage with developer communities. Write blogs, build demos with React and Node.js.' },

  // HealthStack (comp_healthstack) - Chicago
  { id: 'job_hs_1', title: 'Healthcare API Specialist', location: 'Chicago, IL', experienceLevel: 'Mid-Senior', description: 'Maintain HL7 compliant APIs using Java, Spring Boot, and PostgreSQL.' },
  { id: 'job_hs_2', title: 'Security Engineer', location: 'Chicago, IL', experienceLevel: 'Senior', description: 'Secure medical data infrastructure on cloud platforms, compliance auditing.' },
  { id: 'job_hs_3', title: 'Junior Software Engineer', location: 'Chicago, IL', experienceLevel: 'Junior', description: 'Assist in front-end styling and HTML/CSS/JavaScript adjustments.' },

  // ShopSphere (comp_shopsphere) - LA
  { id: 'job_ss_1', title: 'E-commerce React Specialist', location: 'Los Angeles, CA', experienceLevel: 'Senior', description: 'Optimize checkout pages and front-end performance using Next.js and GraphQL.' },
  { id: 'job_ss_2', title: 'Inventory Systems Engineer', location: 'Los Angeles, CA', experienceLevel: 'Mid', description: 'Create backend systems for real-time tracking using Node.js and MongoDB.' },
  { id: 'job_ss_3', title: 'Mobile App Developer', location: 'Remote', experienceLevel: 'Senior', description: 'Implement mobile checkout flows using JavaScript and cross-platform libraries.' },

  // EduTech Labs (comp_edutech) - Denver
  { id: 'job_et_1', title: 'EdTech Full Stack Developer', location: 'Denver, CO', experienceLevel: 'Mid', description: 'Design interactive classroom modules using Vue.js, Node.js, and PostgreSQL.' },
  { id: 'job_et_2', title: 'Curriculum Software Engineer', location: 'Remote', experienceLevel: 'Junior-Mid', description: 'Create simple applications for student learning metrics using Python.' },
  { id: 'job_et_3', title: 'Product Manager', location: 'Denver, CO', experienceLevel: 'Mid-Senior', description: 'Oversee LMS software direction. Technical background in HTML/CSS helpful.' },

  // LogiCore (comp_logicore) - Atlanta
  { id: 'job_lc_1', title: 'Logistics Backend Engineer', location: 'Atlanta, GA', experienceLevel: 'Senior', description: 'Route optimization algorithms built in Go or Java. Experience with SQL and Docker.' },
  { id: 'job_lc_2', title: 'Infrastructure Engineer', location: 'Atlanta, GA', experienceLevel: 'Mid', description: 'Help manage cloud operations on AWS using Kubernetes.' },
  { id: 'job_lc_3', title: 'UX Developer', location: 'Remote', experienceLevel: 'Mid', description: 'Build interactive tracking maps using Vue.js, CSS, and HTML.' },

  // ScaleWorks (comp_scaleworks) - Miami
  { id: 'job_sw_1', title: 'Scale Solutions Architect', location: 'Miami, FL', experienceLevel: 'Lead', description: 'Help SaaS companies scale their setups on AWS using Docker, Kubernetes, and Node.js.' },
  { id: 'job_sw_2', title: 'API Engineer', location: 'Miami, FL', experienceLevel: 'Mid', description: 'Design high speed developer integrations with Express, TypeScript, and PostgreSQL.' },
  { id: 'job_sw_3', title: 'Junior Data Scientist', location: 'Remote', experienceLevel: 'Junior', description: 'Clean data and construct basic regression models using Python and SQL.' },
];

const SEED_RELATIONSHIPS = {
  // Candidate -> HAS_SKILL -> Skill
  hasSkill: [
    { from: 'cand_sarah', to: 'skill_react' },
    { from: 'cand_sarah', to: 'skill_typescript' },
    { from: 'cand_sarah', to: 'skill_javascript' },
    { from: 'cand_sarah', to: 'skill_nodejs' },
    { from: 'cand_sarah', to: 'skill_css' },
    { from: 'cand_sarah', to: 'skill_html' },

    { from: 'cand_alex', to: 'skill_react' },
    { from: 'cand_alex', to: 'skill_javascript' },
    { from: 'cand_alex', to: 'skill_css' },
    { from: 'cand_alex', to: 'skill_html' },
    { from: 'cand_alex', to: 'skill_nextjs' },

    { from: 'cand_priya', to: 'skill_python' },
    { from: 'cand_priya', to: 'skill_sql' },
    { from: 'cand_priya', to: 'skill_postgresql' },
    { from: 'cand_priya', to: 'skill_aws' },
    { from: 'cand_priya', to: 'skill_docker' },
    { from: 'cand_priya', to: 'skill_graphql' },

    { from: 'cand_marcus', to: 'skill_nodejs' },
    { from: 'cand_marcus', to: 'skill_typescript' },
    { from: 'cand_marcus', to: 'skill_javascript' },
    { from: 'cand_marcus', to: 'skill_docker' },
    { from: 'cand_marcus', to: 'skill_kubernetes' },
    { from: 'cand_marcus', to: 'skill_aws' },

    { from: 'cand_elena', to: 'skill_react' },
    { from: 'cand_elena', to: 'skill_javascript' },
    { from: 'cand_elena', to: 'skill_css' },
    { from: 'cand_elena', to: 'skill_html' },

    { from: 'cand_david', to: 'skill_java' },
    { from: 'cand_david', to: 'skill_spring' },
    { from: 'cand_david', to: 'skill_sql' },
    { from: 'cand_david', to: 'skill_postgresql' },

    { from: 'cand_chloe', to: 'skill_vue' },
    { from: 'cand_chloe', to: 'skill_javascript' },
    { from: 'cand_chloe', to: 'skill_nodejs' },
    { from: 'cand_chloe', to: 'skill_mongodb' },
    { from: 'cand_chloe', to: 'skill_graphql' },

    { from: 'cand_tariq', to: 'skill_aws' },
    { from: 'cand_tariq', to: 'skill_docker' },
    { from: 'cand_tariq', to: 'skill_kubernetes' },
    { from: 'cand_tariq', to: 'skill_go' },
    { from: 'cand_tariq', to: 'skill_python' },

    { from: 'cand_emily', to: 'skill_javascript' },
    { from: 'cand_emily', to: 'skill_html' },
    { from: 'cand_emily', to: 'skill_css' },

    { from: 'cand_nikolai', to: 'skill_nodejs' },
    { from: 'cand_nikolai', to: 'skill_typescript' },
    { from: 'cand_nikolai', to: 'skill_react' },
    { from: 'cand_nikolai', to: 'skill_postgresql' },
    { from: 'cand_nikolai', to: 'skill_docker' },
    { from: 'cand_nikolai', to: 'skill_aws' },
  ],

  // Candidate -> INTERESTED_IN -> Industry
  interestedIn: [
    { from: 'cand_sarah', to: 'ind_saas' },
    { from: 'cand_sarah', to: 'ind_devtools' },
    { from: 'cand_alex', to: 'ind_ecommerce' },
    { from: 'cand_alex', to: 'ind_saas' },
    { from: 'cand_priya', to: 'ind_cloud' },
    { from: 'cand_priya', to: 'ind_fintech' },
    { from: 'cand_marcus', to: 'ind_cloud' },
    { from: 'cand_marcus', to: 'ind_saas' },
    { from: 'cand_elena', to: 'ind_edtech' },
    { from: 'cand_david', to: 'ind_healthcare' },
    { from: 'cand_david', to: 'ind_fintech' },
    { from: 'cand_chloe', to: 'ind_ecommerce' },
    { from: 'cand_chloe', to: 'ind_saas' },
    { from: 'cand_tariq', to: 'ind_cloud' },
    { from: 'cand_tariq', to: 'ind_logistics' },
    { from: 'cand_emily', to: 'ind_edtech' },
    { from: 'cand_nikolai', to: 'ind_fintech' },
    { from: 'cand_nikolai', to: 'ind_devtools' },
  ],

  // Skill -> RELATED_TO -> Technology
  skillRelatedTo: [
    { from: 'skill_react', to: 'tech_react' },
    { from: 'skill_vue', to: 'tech_vue' },
    { from: 'skill_javascript', to: 'tech_nodejs' },
    { from: 'skill_typescript', to: 'tech_typescript' },
    { from: 'skill_nodejs', to: 'tech_nodejs' },
    { from: 'skill_python', to: 'tech_python' },
    { from: 'skill_java', to: 'tech_java' },
    { from: 'skill_sql', to: 'tech_postgres' },
    { from: 'skill_graphql', to: 'tech_graphql' },
    { from: 'skill_docker', to: 'tech_docker' },
    { from: 'skill_aws', to: 'tech_aws' },
    { from: 'skill_nextjs', to: 'tech_nextjs' },
    { from: 'skill_postgresql', to: 'tech_postgres' },
    { from: 'skill_mongodb', to: 'tech_mongodb' },
    { from: 'skill_kubernetes', to: 'tech_kubernetes' },
    { from: 'skill_spring', to: 'tech_spring' },
  ],

  // Company -> OPERATES_IN -> Industry
  companyOperatesIn: [
    { from: 'comp_technova', to: 'ind_saas' },
    { from: 'comp_technova', to: 'ind_devtools' },
    { from: 'comp_finedge', to: 'ind_fintech' },
    { from: 'comp_cloudworks', to: 'ind_cloud' },
    { from: 'comp_datasphere', to: 'ind_cloud' },
    { from: 'comp_datasphere', to: 'ind_saas' },
    { from: 'comp_devlabs', to: 'ind_devtools' },
    { from: 'comp_healthstack', to: 'ind_healthcare' },
    { from: 'comp_shopsphere', to: 'ind_ecommerce' },
    { from: 'comp_edutech', to: 'ind_edtech' },
    { from: 'comp_logicore', to: 'ind_logistics' },
    { from: 'comp_scaleworks', to: 'ind_saas' },
  ],

  // Job -> POSTED_BY -> Company
  jobPostedBy: [
    { from: 'job_tn_1', to: 'comp_technova' },
    { from: 'job_tn_2', to: 'comp_technova' },
    { from: 'job_tn_3', to: 'comp_technova' },
    { from: 'job_fe_1', to: 'comp_finedge' },
    { from: 'job_fe_2', to: 'comp_finedge' },
    { from: 'job_fe_3', to: 'comp_finedge' },
    { from: 'job_cw_1', to: 'comp_cloudworks' },
    { from: 'job_cw_2', to: 'comp_cloudworks' },
    { from: 'job_cw_3', to: 'comp_cloudworks' },
    { from: 'job_ds_1', to: 'comp_datasphere' },
    { from: 'job_ds_2', to: 'comp_datasphere' },
    { from: 'job_ds_3', to: 'comp_datasphere' },
    { from: 'job_dl_1', to: 'comp_devlabs' },
    { from: 'job_dl_2', to: 'comp_devlabs' },
    { from: 'job_dl_3', to: 'comp_devlabs' },
    { from: 'job_hs_1', to: 'comp_healthstack' },
    { from: 'job_hs_2', to: 'comp_healthstack' },
    { from: 'job_hs_3', to: 'comp_healthstack' },
    { from: 'job_ss_1', to: 'comp_shopsphere' },
    { from: 'job_ss_2', to: 'comp_shopsphere' },
    { from: 'job_ss_3', to: 'comp_shopsphere' },
    { from: 'job_et_1', to: 'comp_edutech' },
    { from: 'job_et_2', to: 'comp_edutech' },
    { from: 'job_et_3', to: 'comp_edutech' },
    { from: 'job_lc_1', to: 'comp_logicore' },
    { from: 'job_lc_2', to: 'comp_logicore' },
    { from: 'job_lc_3', to: 'comp_logicore' },
    { from: 'job_sw_1', to: 'comp_scaleworks' },
    { from: 'job_sw_2', to: 'comp_scaleworks' },
    { from: 'job_sw_3', to: 'comp_scaleworks' },
  ],

  // Job -> REQUIRES -> Skill
  jobRequires: [
    // TechNova
    { from: 'job_tn_1', to: 'skill_react' },
    { from: 'job_tn_1', to: 'skill_typescript' },
    { from: 'job_tn_1', to: 'skill_javascript' },
    { from: 'job_tn_1', to: 'skill_css' },
    { from: 'job_tn_2', to: 'skill_react' },
    { from: 'job_tn_2', to: 'skill_nodejs' },
    { from: 'job_tn_2', to: 'skill_typescript' },
    { from: 'job_tn_3', to: 'skill_docker' },
    { from: 'job_tn_3', to: 'skill_kubernetes' },
    { from: 'job_tn_3', to: 'skill_aws' },

    // FinEdge
    { from: 'job_fe_1', to: 'skill_go' },
    { from: 'job_fe_1', to: 'skill_postgresql' },
    { from: 'job_fe_1', to: 'skill_sql' },
    { from: 'job_fe_2', to: 'skill_python' },
    { from: 'job_fe_2', to: 'skill_java' },
    { from: 'job_fe_3', to: 'skill_sql' },
    { from: 'job_fe_3', to: 'skill_postgresql' },

    // CloudWorks
    { from: 'job_cw_1', to: 'skill_aws' },
    { from: 'job_cw_1', to: 'skill_docker' },
    { from: 'job_cw_1', to: 'skill_kubernetes' },
    { from: 'job_cw_2', to: 'skill_nodejs' },
    { from: 'job_cw_2', to: 'skill_typescript' },
    { from: 'job_cw_2', to: 'skill_graphql' },
    { from: 'job_cw_3', to: 'skill_python' },

    // DataSphere
    { from: 'job_ds_1', to: 'skill_python' },
    { from: 'job_ds_1', to: 'skill_sql' },
    { from: 'job_ds_1', to: 'skill_aws' },
    { from: 'job_ds_2', to: 'skill_nodejs' }, // graph models use standard backends
    { from: 'job_ds_2', to: 'skill_typescript' },
    { from: 'job_ds_2', to: 'skill_postgresql' },
    { from: 'job_ds_3', to: 'skill_sql' },

    // DevLabs
    { from: 'job_dl_1', to: 'skill_react' },
    { from: 'job_dl_1', to: 'skill_nextjs' },
    { from: 'job_dl_1', to: 'skill_css' },
    { from: 'job_dl_1', to: 'skill_html' },
    { from: 'job_dl_2', to: 'skill_javascript' },
    { from: 'job_dl_2', to: 'skill_typescript' },
    { from: 'job_dl_2', to: 'skill_python' },
    { from: 'job_dl_3', to: 'skill_react' },
    { from: 'job_dl_3', to: 'skill_nodejs' },
    { from: 'job_dl_3', to: 'skill_javascript' },

    // HealthStack
    { from: 'job_hs_1', to: 'skill_java' },
    { from: 'job_hs_1', to: 'skill_spring' },
    { from: 'job_hs_1', to: 'skill_postgresql' },
    { from: 'job_hs_2', to: 'skill_aws' },
    { from: 'job_hs_2', to: 'skill_docker' },
    { from: 'job_hs_3', to: 'skill_javascript' },
    { from: 'job_hs_3', to: 'skill_html' },
    { from: 'job_hs_3', to: 'skill_css' },

    // ShopSphere
    { from: 'job_ss_1', to: 'skill_react' },
    { from: 'job_ss_1', to: 'skill_nextjs' },
    { from: 'job_ss_1', to: 'skill_graphql' },
    { from: 'job_ss_2', to: 'skill_nodejs' },
    { from: 'job_ss_2', to: 'skill_mongodb' },
    { from: 'job_ss_3', to: 'skill_javascript' },
    { from: 'job_ss_3', to: 'skill_react' },

    // EduTech
    { from: 'job_et_1', to: 'skill_vue' },
    { from: 'job_et_1', to: 'skill_nodejs' },
    { from: 'job_et_1', to: 'skill_postgresql' },
    { from: 'job_et_2', to: 'skill_python' },
    { from: 'job_et_3', to: 'skill_html' },
    { from: 'job_et_3', to: 'skill_css' },

    // LogiCore
    { from: 'job_lc_1', to: 'skill_go' },
    { from: 'job_lc_1', to: 'skill_java' },
    { from: 'job_lc_1', to: 'skill_docker' },
    { from: 'job_lc_1', to: 'skill_sql' },
    { from: 'job_lc_2', to: 'skill_aws' },
    { from: 'job_lc_2', to: 'skill_kubernetes' },
    { from: 'job_lc_3', to: 'skill_vue' },
    { from: 'job_lc_3', to: 'skill_html' },
    { from: 'job_lc_3', to: 'skill_css' },

    // ScaleWorks
    { from: 'job_sw_1', to: 'skill_aws' },
    { from: 'job_sw_1', to: 'skill_docker' },
    { from: 'job_sw_1', to: 'skill_kubernetes' },
    { from: 'job_sw_1', to: 'skill_nodejs' },
    { from: 'job_sw_2', to: 'skill_nodejs' },
    { from: 'job_sw_2', to: 'skill_typescript' },
    { from: 'job_sw_2', to: 'skill_postgresql' },
    { from: 'job_sw_3', to: 'skill_python' },
    { from: 'job_sw_3', to: 'skill_sql' },
  ],

  // Job -> USES -> Technology
  jobUses: [
    { from: 'job_tn_1', to: 'tech_react' },
    { from: 'job_tn_1', to: 'tech_typescript' },
    { from: 'job_tn_2', to: 'tech_react' },
    { from: 'job_tn_2', to: 'tech_nodejs' },
    { from: 'job_tn_3', to: 'tech_docker' },
    { from: 'job_tn_3', to: 'tech_kubernetes' },
    { from: 'job_tn_3', to: 'tech_aws' },

    { from: 'job_fe_1', to: 'tech_postgres' },
    { from: 'job_fe_2', to: 'tech_python' },
    { from: 'job_fe_2', to: 'tech_java' },
    { from: 'job_fe_3', to: 'tech_postgres' },

    { from: 'job_cw_1', to: 'tech_aws' },
    { from: 'job_cw_1', to: 'tech_docker' },
    { from: 'job_cw_1', to: 'tech_kubernetes' },
    { from: 'job_cw_2', to: 'tech_nodejs' },
    { from: 'job_cw_2', to: 'tech_graphql' },
    { from: 'job_cw_3', to: 'tech_python' },

    { from: 'job_ds_1', to: 'tech_python' },
    { from: 'job_ds_1', to: 'tech_aws' },
    { from: 'job_ds_2', to: 'tech_nodejs' },
    { from: 'job_ds_2', to: 'tech_postgres' },

    { from: 'job_dl_1', to: 'tech_react' },
    { from: 'job_dl_1', to: 'tech_nextjs' },
    { from: 'job_dl_2', to: 'tech_typescript' },
    { from: 'job_dl_2', to: 'tech_python' },
    { from: 'job_dl_3', to: 'tech_react' },
    { from: 'job_dl_3', to: 'tech_nodejs' },

    { from: 'job_hs_1', to: 'tech_java' },
    { from: 'job_hs_1', to: 'tech_spring' },
    { from: 'job_hs_1', to: 'tech_postgres' },
    { from: 'job_hs_2', to: 'tech_aws' },
    { from: 'job_hs_2', to: 'tech_docker' },

    { from: 'job_ss_1', to: 'tech_react' },
    { from: 'job_ss_1', to: 'tech_nextjs' },
    { from: 'job_ss_1', to: 'tech_graphql' },
    { from: 'job_ss_2', to: 'tech_nodejs' },
    { from: 'job_ss_2', to: 'tech_mongodb' },
    { from: 'job_ss_3', to: 'tech_react' },

    { from: 'job_et_1', to: 'tech_vue' },
    { from: 'job_et_1', to: 'tech_nodejs' },
    { from: 'job_et_1', to: 'tech_postgres' },
    { from: 'job_et_2', to: 'tech_python' },

    { from: 'job_lc_1', to: 'tech_java' },
    { from: 'job_lc_1', to: 'tech_docker' },
    { from: 'job_lc_2', to: 'tech_aws' },
    { from: 'job_lc_2', to: 'tech_kubernetes' },
    { from: 'job_lc_3', to: 'tech_vue' },

    { from: 'job_sw_1', to: 'tech_aws' },
    { from: 'job_sw_1', to: 'tech_docker' },
    { from: 'job_sw_1', to: 'tech_kubernetes' },
    { from: 'job_sw_1', to: 'tech_nodejs' },
    { from: 'job_sw_2', to: 'tech_nodejs' },
    { from: 'job_sw_2', to: 'tech_postgres' },
    { from: 'job_sw_3', to: 'tech_python' },
  ],
};

async function seed() {
  console.log('Connecting to CognoDB...');
  try {
    await verifyConnection();
  } catch (err: any) {
    console.error('DATABASE_CONNECTION_FAILED: Unable to verify connection to CognoDB. Check your env configurations.');
    console.error('Error message:', err.message);
    process.exit(1);
  }

  console.log('Creating constraints/indexes...');
  const constraints = [
    { label: 'Candidate', prop: 'id' },
    { label: 'Skill', prop: 'id' },
    { label: 'Job', prop: 'id' },
    { label: 'Company', prop: 'id' },
    { label: 'Technology', prop: 'id' },
    { label: 'Industry', prop: 'id' },
  ];

  for (const item of constraints) {
    try {
      // Trying Neo4j 4.4+ syntax
      await runQuery(`CREATE CONSTRAINT FOR (n:${item.label}) REQUIRE n.${item.prop} IS UNIQUE`);
      console.log(`Constraint created: ${item.label}.${item.prop} IS UNIQUE`);
    } catch (e: any) {
      try {
        // Trying older Neo4j syntax
        await runQuery(`CREATE CONSTRAINT ON (n:${item.label}) ASSERT n.${item.prop} IS UNIQUE`);
        console.log(`Constraint created (legacy syntax): ${item.label}.${item.prop} IS UNIQUE`);
      } catch (err: any) {
        console.warn(`Constraint creation skipped or failed for ${item.label}.${item.prop}:`, err.message);
      }
    }
  }

  // Idempotent seeding using MERGE
  console.log('Creating industries...');
  for (const ind of INDUSTRIES) {
    await runQuery(
      `MERGE (i:Industry {id: $id}) ON CREATE SET i.name = $name ON MATCH SET i.name = $name`,
      ind
    );
  }

  console.log('Creating companies...');
  for (const comp of COMPANIES) {
    await runQuery(
      `MERGE (c:Company {id: $id})
       ON CREATE SET c.name = $name, c.location = $location
       ON MATCH SET c.name = $name, c.location = $location`,
      comp
    );
  }

  console.log('Creating skills...');
  for (const skill of SKILLS) {
    await runQuery(
      `MERGE (s:Skill {id: $id})
       ON CREATE SET s.name = $name, s.category = $category
       ON MATCH SET s.name = $name, s.category = $category`,
      skill
    );
  }

  console.log('Creating technologies...');
  for (const tech of TECHNOLOGIES) {
    await runQuery(
      `MERGE (t:Technology {id: $id})
       ON CREATE SET t.name = $name, t.category = $category
       ON MATCH SET t.name = $name, t.category = $category`,
      tech
    );
  }

  console.log('Creating candidates...');
  for (const cand of CANDIDATES) {
    await runQuery(
      `MERGE (c:Candidate {id: $id})
       ON CREATE SET c.name = $name, c.location = $location, c.experience = $experience
       ON MATCH SET c.name = $name, c.location = $location, c.experience = $experience`,
      cand
    );
  }

  console.log('Creating jobs...');
  for (const job of JOBS) {
    await runQuery(
      `MERGE (j:Job {id: $id})
       ON CREATE SET j.title = $title, j.location = $location, j.experienceLevel = $experienceLevel, j.description = $description
       ON MATCH SET j.title = $title, j.location = $location, j.experienceLevel = $experienceLevel, j.description = $description`,
      job
    );
  }

  console.log('Creating relationships...');

  console.log('- Creating Candidate HAS_SKILL relationships...');
  for (const rel of SEED_RELATIONSHIPS.hasSkill) {
    await runQuery(
      `MATCH (c:Candidate {id: $from}), (s:Skill {id: $to})
       MERGE (c)-[:HAS_SKILL]->(s)`,
      rel
    );
  }

  console.log('- Creating Candidate INTERESTED_IN relationships...');
  for (const rel of SEED_RELATIONSHIPS.interestedIn) {
    await runQuery(
      `MATCH (c:Candidate {id: $from}), (i:Industry {id: $to})
       MERGE (c)-[:INTERESTED_IN]->(i)`,
      rel
    );
  }

  console.log('- Creating Skill RELATED_TO relationships...');
  for (const rel of SEED_RELATIONSHIPS.skillRelatedTo) {
    await runQuery(
      `MATCH (s:Skill {id: $from}), (t:Technology {id: $to})
       MERGE (s)-[:RELATED_TO]->(t)`,
      rel
    );
  }

  console.log('- Creating Company OPERATES_IN relationships...');
  for (const rel of SEED_RELATIONSHIPS.companyOperatesIn) {
    await runQuery(
      `MATCH (c:Company {id: $from}), (i:Industry {id: $to})
       MERGE (c)-[:OPERATES_IN]->(i)`,
      rel
    );
  }

  console.log('- Creating Job POSTED_BY relationships...');
  for (const rel of SEED_RELATIONSHIPS.jobPostedBy) {
    await runQuery(
      `MATCH (j:Job {id: $from}), (c:Company {id: $to})
       MERGE (j)-[:POSTED_BY]->(c)`,
      rel
    );
  }

  console.log('- Creating Job REQUIRES relationships...');
  for (const rel of SEED_RELATIONSHIPS.jobRequires) {
    await runQuery(
      `MATCH (j:Job {id: $from}), (s:Skill {id: $to})
       MERGE (j)-[:REQUIRES]->(s)`,
      rel
    );
  }

  console.log('- Creating Job USES relationships...');
  for (const rel of SEED_RELATIONSHIPS.jobUses) {
    await runQuery(
      `MATCH (j:Job {id: $from}), (t:Technology {id: $to})
       MERGE (j)-[:USES]->(t)`,
      rel
    );
  }

  console.log('Seed completed successfully.');
}

// Run the script
seed()
  .catch(err => {
    console.error('Seeding process failed with error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await closeDriver();
  });
