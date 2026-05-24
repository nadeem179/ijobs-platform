export const currencies = [
  { code: "INR", label: "INR - Indian Rupee" },
  { code: "USD", label: "USD - US Dollar" },
  { code: "EUR", label: "EUR - Euro" },
  { code: "GBP", label: "GBP - British Pound" },
  { code: "AED", label: "AED - UAE Dirham" },
  { code: "SGD", label: "SGD - Singapore Dollar" },
  { code: "AUD", label: "AUD - Australian Dollar" },
  { code: "CAD", label: "CAD - Canadian Dollar" },
  { code: "JPY", label: "JPY - Japanese Yen" },
  { code: "CHF", label: "CHF - Swiss Franc" },
];

export const cities = [
  "Remote", "Bengaluru", "Hyderabad", "Pune", "Mumbai", "Delhi NCR", "Gurugram", "Noida", "Chennai", "Kolkata",
  "Ahmedabad", "Jaipur", "Indore", "Kochi", "Coimbatore", "Chandigarh", "Lucknow", "Nagpur", "Surat", "Vadodara",
  "Singapore", "Dubai", "London", "Berlin", "Amsterdam", "Toronto", "Vancouver", "New York", "San Francisco", "Austin",
  "Seattle", "Sydney", "Melbourne",
];

export const industries = [
  "Information Technology", "Software Product", "Internet", "E-commerce", "FinTech", "Banking", "Financial Services",
  "Insurance", "Healthcare", "Pharmaceuticals", "Biotechnology", "Education", "EdTech", "Retail", "Consumer Goods",
  "Manufacturing", "Automotive", "Telecom", "Media and Entertainment", "Advertising", "Consulting", "Professional Services",
  "Real Estate", "Construction", "Logistics", "Travel and Hospitality", "Energy", "CleanTech", "Aerospace", "Gaming",
  "Cybersecurity", "Artificial Intelligence", "Data Analytics", "SaaS", "Government", "Non-profit",
];

export const skillsList = [
  "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python", "Java", "Go", "C++", "C#", "SQL", "PostgreSQL",
  "MongoDB", "GraphQL", "REST APIs", "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Terraform", "CI/CD",
  "System Design", "Microservices", "Data Structures", "Machine Learning", "Data Analysis", "Product Management",
  "Product Design", "UX Research", "UI Design", "Figma", "Design Systems", "Agile", "Scrum", "Stakeholder Management",
  "Sales", "Digital Marketing", "SEO", "Content Strategy", "Customer Success", "Business Analysis",
];

export const toolsList = [
  "Git", "GitHub", "GitLab", "Bitbucket", "VS Code", "Figma", "Jira", "Confluence", "Notion", "Slack", "Linear",
  "Postman", "Swagger", "Tableau", "Power BI", "Excel", "Google Analytics", "Looker", "Datadog", "Sentry", "Docker",
  "Kubernetes", "Jenkins", "Vercel", "Netlify", "Supabase", "Firebase", "Salesforce", "HubSpot", "WordPress",
];

export const languageOptions = [
  "English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "Marathi", "Gujarati", "Bengali", "Punjabi",
  "Urdu", "French", "German", "Spanish", "Mandarin", "Japanese", "Korean", "Arabic",
];

export const fluencyOptions = [
  "Beginner",
  "Intermediate",
  "Professional working",
  "Full professional",
  "Native/Bilingual",
];

export const jobTypeOptions = ["Full-time", "Part-time", "Contract", "Freelance", "Internship", "Temporary"];
export const workModeOptions = ["Remote", "Hybrid", "On-site", "Flexible"];

export const designations = [
  "Product Designer", "UX Designer", "UI Designer", "Interaction Designer", "Visual Designer", "Design Systems Designer",
  "UX Researcher", "Service Designer", "Graphic Designer", "Motion Designer", "Brand Designer", "Creative Director",
  "Frontend Developer", "Backend Developer", "Full Stack Developer", "Software Engineer", "Senior Software Engineer",
  "Staff Software Engineer", "Principal Engineer", "Engineering Manager", "DevOps Engineer", "Site Reliability Engineer",
  "QA Engineer", "Automation Test Engineer", "Mobile App Developer", "iOS Developer", "Android Developer", "Cloud Engineer",
  "Security Engineer", "Solutions Architect", "Technical Architect", "Product Manager", "Associate Product Manager",
  "Senior Product Manager", "Product Owner", "Program Manager", "Project Manager", "Scrum Master", "Business Analyst",
  "Marketing Executive", "Digital Marketing Specialist", "SEO Specialist", "Content Marketer", "Growth Marketer",
  "Performance Marketing Manager", "Brand Manager", "Social Media Manager", "Marketing Manager", "Sales Executive",
  "Business Development Executive", "Account Executive", "Sales Manager", "Key Account Manager", "Customer Success Manager",
  "HR Executive", "Recruiter", "Talent Acquisition Specialist", "HR Business Partner", "Learning and Development Manager",
  "Finance Analyst", "Accountant", "Chartered Accountant", "Financial Controller", "Investment Analyst", "Operations Executive",
  "Operations Manager", "Supply Chain Manager", "Procurement Manager", "Customer Support Executive", "Technical Support Engineer",
  "Support Manager", "Data Analyst", "Business Intelligence Analyst", "Data Engineer", "Data Scientist", "Machine Learning Engineer",
  "AI Engineer", "MLOps Engineer", "Analytics Manager", "Doctor", "Nurse", "Pharmacist", "Medical Representative",
  "Healthcare Administrator", "Teacher", "Professor", "Instructional Designer", "Academic Counselor", "Legal Associate",
  "Lawyer", "Compliance Officer", "Company Secretary", "Office Administrator", "Executive Assistant", "Administrative Assistant",
  "Production Engineer", "Manufacturing Engineer", "Quality Engineer", "Plant Manager", "Logistics Coordinator",
  "Warehouse Manager", "Retail Store Manager", "Merchandiser", "Hotel Manager", "Chef", "Front Office Executive",
  "Management Trainee", "Graduate Engineer Trainee", "Software Developer Intern", "Marketing Intern", "HR Intern",
  "Data Analyst Intern", "Junior Developer", "Junior Designer", "Associate Consultant", "Trainee Analyst", "CEO", "CTO",
  "CFO", "COO", "VP Engineering", "VP Product", "Head of Design", "Head of Marketing", "Head of Sales", "Director of Operations",
];

export const designationRecommendations: Record<string, { skills: string[]; tools: string[] }> = {
  "Product Designer": {
    skills: ["Figma", "User Research", "Prototyping", "Design Systems", "Wireframing", "UI Design", "UX Research"],
    tools: ["Figma", "Notion", "Jira", "Miro", "Google Analytics"],
  },
  "Frontend Developer": {
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "HTML", "CSS", "JavaScript"],
    tools: ["VS Code", "GitHub", "Vercel", "Postman", "Chrome DevTools"],
  },
  "Data Analyst": {
    skills: ["SQL", "Excel", "Power BI", "Tableau", "Python", "Data Analysis"],
    tools: ["Excel", "Power BI", "Tableau", "Looker", "Google Analytics"],
  },
  "Product Manager": {
    skills: ["Product Management", "Stakeholder Management", "Agile", "Business Analysis", "Data Analysis"],
    tools: ["Jira", "Notion", "Figma", "Amplitude", "Google Analytics"],
  },
  "Backend Developer": {
    skills: ["Node.js", "Python", "Java", "Go", "PostgreSQL", "REST APIs", "Microservices"],
    tools: ["GitHub", "Docker", "Postman", "AWS", "Datadog"],
  },
  "Digital Marketing Specialist": {
    skills: ["Digital Marketing", "SEO", "Content Strategy", "Performance Marketing", "Google Ads"],
    tools: ["Google Analytics", "HubSpot", "WordPress", "Excel", "Canva"],
  },
  "HR Executive": {
    skills: ["Recruiting", "Employee Engagement", "HR Operations", "Onboarding", "Stakeholder Management"],
    tools: ["Excel", "LinkedIn Recruiter", "Slack", "Notion", "Google Workspace"],
  },
  "Customer Support Executive": {
    skills: ["Customer Support", "Communication", "Troubleshooting", "Customer Success", "CRM"],
    tools: ["Zendesk", "Salesforce", "HubSpot", "Slack", "Intercom"],
  },
  "Machine Learning Engineer": {
    skills: ["Python", "Machine Learning", "Data Structures", "MLOps", "System Design"],
    tools: ["Jupyter", "Docker", "Kubernetes", "AWS", "GitHub"],
  },
};

export function getDesignationRecommendations(designation: string) {
  if (designationRecommendations[designation]) return designationRecommendations[designation];
  const normalized = designation.toLowerCase();
  if (normalized.includes("designer")) return designationRecommendations["Product Designer"];
  if (normalized.includes("frontend")) return designationRecommendations["Frontend Developer"];
  if (normalized.includes("backend")) return designationRecommendations["Backend Developer"];
  if (normalized.includes("data")) return designationRecommendations["Data Analyst"];
  if (normalized.includes("product")) return designationRecommendations["Product Manager"];
  if (normalized.includes("marketing")) return designationRecommendations["Digital Marketing Specialist"];
  if (normalized.includes("hr") || normalized.includes("recruiter")) return designationRecommendations["HR Executive"];
  if (normalized.includes("support")) return designationRecommendations["Customer Support Executive"];
  if (normalized.includes("machine learning") || normalized.includes("ai")) return designationRecommendations["Machine Learning Engineer"];
  return { skills: skillsList.slice(0, 10), tools: toolsList.slice(0, 10) };
}
