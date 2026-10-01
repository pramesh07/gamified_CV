import { yearsSince } from './format'
import type { Certification, Education, Profile, Project, Role, SkillGroup } from './types'

const CAREER_START = '2017-05'
export const YEARS_OF_EXPERIENCE = yearsSince(CAREER_START)

export const profile: Profile = {
  name: 'Pramesh Karmacharya',
  initials: 'PK',
  title: 'Lead Engineer',
  tagline: 'Full Stack & GenAI Engineer',
  location: 'Bhaktapur, Nepal',
  email: 'prmshzk@gmail.com',
  links: {
    portfolio: 'https://www.prameshk.com.np',
    linkedin: 'https://www.linkedin.com/in/pramesh-karmacharya-349227110',
    github: 'https://github.com/pramesh07',
  },
  resumePdf: 'resume-pramesh.pdf',
  careerStart: CAREER_START,
  summary: [
    `I build AI-powered products and the scalable backend systems behind them. Full-stack engineer with a GenAI focus and ${YEARS_OF_EXPERIENCE}+ years of designing and delivering dynamic, scalable, high-performance web applications across Node.js, Go, Python, PHP and React.`,
    'Currently focused on RAG chatbots with conversational memory, MCP tooling and AI agents on AWS Bedrock. Beyond technical expertise, I bring strong collaboration, problem-solving, and communication skills that enhance team efficiency and project success.',
    'A commitment to continuous learning and innovation ensures I stay ahead of emerging technologies, making me a versatile and forward-thinking contributor to any project or team.',
  ],
}

export const skillGroups: SkillGroup[] = [
  {
    id: 'languages',
    label: 'Languages',
    color: '#ff8a4c',
    items: ['Go', 'TypeScript', 'JavaScript', 'Python', 'PHP', 'HTML5', 'CSS3'],
  },
  {
    id: 'frameworks',
    label: 'Frameworks & Libraries',
    color: '#5b8cff',
    items: [
      'Node.js',
      'Express',
      'NestJS',
      'Next.js',
      'React',
      'Zustand',
      'Tailwind',
      'Laravel',
      'FastAPI',
      'GoFiber',
      'Chi',
      'Gin',
      'HTMX',
      'Templ',
    ],
  },
  {
    id: 'genai',
    label: 'GenAI',
    color: '#2ec4b6',
    items: ['RAG', 'MCP', 'AWS Bedrock', 'AWS Strands', 'Qdrant', 'Mem0'],
  },
  {
    id: 'databases',
    label: 'Databases',
    color: '#39c38a',
    items: ['PostgreSQL', 'MongoDB', 'MariaDB', 'CockroachDB', 'DynamoDB', 'DocumentDB'],
  },
  {
    id: 'aws',
    label: 'AWS',
    color: '#f7b731',
    items: ['EC2', 'S3', 'RDS', 'Lambda', 'ECS', 'ECR', 'API Gateway', 'CloudWatch', 'X-Ray', 'OpenSearch'],
  },
  {
    id: 'tools',
    label: 'Tools & Practices',
    color: '#b57bff',
    items: ['Docker', 'Git', 'GitHub', 'GitLab', 'Jira', 'Slack', 'Scrum'],
  },
]

export const roles: Role[] = [
  {
    company: 'Crystal Infosys',
    title: 'Software Engineer',
    start: '2017-05',
    end: '2019-01',
    location: 'Tikathali, Lalitpur',
    color: '#39c38a',
    highlights: [
      'Wrote clean, efficient, and maintainable PHP code according to project requirements and coding standards; identified and fixed bugs in the existing codebase with senior developers.',
      'Wrote and maintained server-side code using Node.js and JavaScript.',
      'Continuously enhanced my skills by learning new technologies, tools, and best practices in the PHP and Node.js ecosystems.',
      'Used Git to manage the codebase and track changes effectively.',
      'Worked closely with designers and project managers to deliver projects on time and within budget.',
      'Contributed to code reviews to ensure quality and maintainability.',
      'Provided technical support to end users and addressed issues in development and production.',
    ],
  },
  {
    company: 'Ekbana Solutions',
    title: 'Senior Software Engineer',
    start: '2019-03',
    end: '2025-04',
    location: 'Jwagal, Lalitpur',
    color: '#5b8cff',
    highlights: [
      'Led the technical direction of projects, providing guidance and mentorship to junior developers.',
      'Designed application architecture, selecting technologies and frameworks for scalability and performance.',
      'Implemented backend logic using Node.js and PHP, including APIs and integrations with PostgreSQL and MongoDB.',
      'Worked across Next.js, NestJS, Go, and GoFiber for backend and frontend applications.',
      'Ensured code quality through clean, maintainable code and regular code reviews.',
      'Collaborated with designers, front-end developers, and project managers to deliver successful outcomes.',
      'Optimized application performance by profiling code and implementing optimizations.',
      'Implemented security best practices against common threats like SQL injection and XSS.',
      'Kept up with the latest technologies and shared knowledge with the team.',
    ],
  },
  {
    company: 'Leapfrog Technology',
    title: 'Lead Engineer',
    start: '2025-05',
    end: null,
    location: 'Charkhal, Kathmandu',
    color: '#ff8a4c',
    highlights: [
      'Promoted to Lead Engineer in Jul 2026, after joining as Senior Software Engineer (May 2025 – Jun 2026).',
      'Drive the AI SDLC framework for company-wide adoption.',
      'Delivered a 3x productivity boost on projects, measured by story point throughput.',
      'Directed project architecture and technical strategy, mentoring junior developers and enforcing best practices in scalability, performance, and maintainability.',
      'Designed and implemented backend systems using Python, Node.js, and Go, and frontends with Next.js; delivered high-quality APIs integrated with DynamoDB and DocumentDB.',
      'Led the development of RAG-based chatbots with conversational memory and spearheaded a Presales AI Agent leveraging AWS Strands.',
      'Implemented AWS serverless architecture for the MCP RAG Starter Kit, enabling scalable, cost-efficient AI-powered applications.',
      'Oversaw deployments on AWS ECR, ECS, EC2, and Lambda, ensuring smooth and reliable production releases.',
      'Partnered with the People Management Team on hiring and ran company-wide AI development tool training for developers and QA engineers.',
      'Ensured code quality and security through code reviews, performance profiling, and protection against SQL injection, XSS, and other vulnerabilities.',
      'Collaborated with designers, QA engineers, and project managers to align technical solutions with business objectives.',
      'Explored emerging technologies, optimized workflows, and fostered a culture of knowledge sharing across teams.',
    ],
  },
]

export const education: Education[] = [
  {
    institution: 'Tribhuvan University',
    degree: 'B.Sc. Computer Science & Information Technology (BSc CSIT)',
    college: 'Orchid International College',
    date: 'May 2019',
    status: 'completed',
    location: 'Bijaychowk, Kathmandu',
  },
  {
    institution: 'Lincoln University',
    degree: 'Master of Business Administration (MBA)',
    college: 'IIMS College',
    date: 'Expected Mar 2027',
    status: 'in-progress',
    location: 'Gairidhara, Kathmandu',
  },
]

export const certifications: Certification[] = [
  {
    name: 'AWS Certified Solutions Architect – Associate',
    issuer: 'Amazon Web Services',
    issued: 'Jan 2026',
    validUntil: 'Jan 2029',
    url: 'https://www.credly.com/badges/540b581b-f43b-4962-935e-d612005c8099',
    sign: ['AWS Certified', 'Solutions Architect – Associate'],
  },
]

export const projects: Project[] = [
  {
    id: 'travel-ai',
    name: 'Travel AI Assistant',
    tagline: 'GenAI itinerary planner',
    description:
      'A GenAI-powered application that helps users plan personalized travel itineraries. RAG-based chatbots and tools such as internet search generate detailed plans tailored to user preferences, then email the finalized itinerary.',
    stack: ['FastAPI', 'React', 'Qdrant', 'Tavily MCP', 'AWS Bedrock', 'Amazon Nova Pro', 'Claude Sonnet'],
    roles: [
      'Led the development of APIs using FastAPI and built responsive UI components with React.',
      'Implemented the RAG chatbot using Qdrant VectorDB for accurate, context-aware itinerary responses.',
      'Integrated internet search via the Tavily MCP server to enrich recommendations with real-time information.',
      'Built AI workflows combining LLM-generated insights with RAG outputs for user-specific itineraries.',
      'Automated itinerary generation across AI insights, vector retrieval, and real-time search data.',
      'Used Amazon Nova Pro and Claude Sonnet through AWS Bedrock for generation and conversation.',
      'Implemented validation, error handling, and logging for reliability and user trust.',
    ],
    color: '#2ec4b6',
  },
  {
    id: 'presa',
    name: 'Presa Presales Agent',
    tagline: 'AI agent for presales teams',
    description:
      'An AI-powered application that helps Account Managers, Project Managers, and Tech Leads streamline presales: requirement analysis, competitive research, architecture discovery, user story mapping, and timeline estimation.',
    stack: ['AWS Strands', 'Claude Sonnet 4', 'Tavily', 'Mem0'],
    roles: [
      'Led end-to-end development, including backend APIs and frontend components.',
      'Designed and implemented the memory module using Mem0 to retain context across presales interactions.',
      'Developed authentication for secure, role-based access to sensitive presales data.',
      'Integrated AWS Strands, Tavily, and Claude Sonnet 4 for recommendations, architecture suggestions, and estimations.',
      'Worked with stakeholders to align AI-driven workflows with business needs.',
    ],
    color: '#ff6b9a',
  },
  {
    id: 'nea',
    name: 'Nepal Electricity Authority',
    tagline: 'Bill payments at national scale',
    description:
      'A platform to check and pay monthly electricity bills in-app, with daily, weekly, and monthly consumption views for end users.',
    stack: ['Express', 'Go', 'BullMQ', 'Firebase'],
    roles: [
      'Created the API services and CMS using Express.',
      'Delivered new-bill notifications through Firebase using BullMQ.',
      'Built a Go service for offline bill processing with concurrency across ~50 million records.',
      'Worked on OTP delivery and verification.',
    ],
    color: '#f7b731',
  },
  {
    id: 'picklezone',
    name: 'PickleZone',
    tagline: 'Pickleball scores & teams',
    description:
      'A platform for pickleball players to track game scores in real time and organize singles and doubles teams, with best-of-three and best-of-five series.',
    stack: ['NestJS', 'React', 'CQRS', 'RabbitMQ', 'PostgreSQL', 'Jest', 'S3', 'Docker', 'EC2'],
    roles: [
      'Designed the API service architecture using the CQRS pattern.',
      'Designed and developed the CMS portal using React.',
      'Used a NestJS monorepo architecture for multiple services.',
      'Wrote Jest unit tests for core business logic and E2E tests for CMS services.',
      'Used RabbitMQ for Firebase push notifications, activity logging, and analytics.',
      'Used PostgreSQL geofencing functions to track players within the court radius.',
      'Stored images and videos on S3, Dockerized the app, and deployed on AWS EC2.',
    ],
    color: '#9be15d',
  },
  {
    id: 'salvi',
    name: 'Salvi Task Management',
    tagline: 'IoT street-lamp operations',
    description:
      'Tracks issues in IoT street lamps. Lamps publish faults over MQTT; operators see them on a real-time dashboard and assign tasks to technicians, who accept and complete them from a mobile app.',
    stack: ['Lerna', 'Keycloak', 'OpenID Connect', 'MQTT', 'Firebase', 'React', 'PM2'],
    roles: [
      'Designed the system architecture as a Lerna monorepo for code reuse and maintainability.',
      'Implemented SSO with OpenID Connect through the Keycloak identity provider.',
      'Implemented MQTT to interact with devices and services in real time.',
      'Built Firebase push notifications for mobile devices.',
      'Worked on the React frontend and deployed services with PM2.',
    ],
    color: '#5b8cff',
  },
  {
    id: 'goth',
    name: 'Goth Starter',
    tagline: 'Go + HTMX + Templ CMS',
    description: 'A CMS platform built entirely on the Go ecosystem for managing application content.',
    stack: ['Go', 'Chi', 'Gorm', 'HTMX', 'Templ', 'Tailwind', 'DaisyUI'],
    roles: [
      'Designed the overall codebase and system architecture.',
      'Used the Go standard library and Chi for routing, and Gorm for database access.',
      'Rendered templates with HTMX and Templ.',
      'Implemented authentication and a role-based permission system in Go.',
      'Implemented localization with Go i18n.',
      'Wrote unit tests for services and modules; themed with Tailwind and DaisyUI.',
    ],
    color: '#00add8',
  },
  {
    id: 'myplace',
    name: 'MyPlace',
    tagline: 'Real-estate portfolio manager',
    description: 'Simplifies managing real-estate holdings: properties, leases, tenants, and payments in one place.',
    stack: ['Vue', 'PostgreSQL', 'Google Drive API', 'Rakumo'],
    roles: [
      'Built the EUC module in Vue to manage property data and generate reports into folders.',
      'Worked on PostgreSQL views and materialized views for data management.',
      'Integrated the Google Drive API to organize documents per property.',
      'Integrated third-party APIs such as Rakumo.',
    ],
    color: '#b57bff',
  },
  {
    id: 'yeti',
    name: 'Yeti Airlines',
    tagline: 'Flight booking & travel app',
    description:
      'Book flights, manage reservations, and access schedules and check-in details, with real-time flight tracking and in-flight entertainment options.',
    stack: ['Laravel', 'SOAP', 'Avantik API', 'OAuth', 'Google Analytics'],
    roles: [
      'Worked on the API service and CMS.',
      'Integrated the core flight management SOAP API (Avantik).',
      'Implemented social login with Google, Facebook, and Apple.',
      'Integrated the Laravel Google Analytics SDK.',
    ],
    color: '#ff8a4c',
  },
  {
    id: 'ifa',
    name: 'IFA',
    tagline: 'Portfolios for financial advisors',
    description: 'Helps financial advisors create and manage investment portfolios for their end customers.',
    stack: ['OneLogin SSO', 'Azure AD', 'Redis', 'Charts'],
    roles: [
      'Implemented SSO with OneLogin to authenticate against the existing core application.',
      'Used Azure Active Directory for user management and authorization.',
      'Cached APIs with Redis.',
      'Built portfolio data visualizations with charts and graphs.',
    ],
    color: '#2ec4b6',
  },
]
