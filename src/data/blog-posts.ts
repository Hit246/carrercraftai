export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  tags: string[];
  content: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "ats-resume-format-freshers-india",
    title: "ATS Resume Format for Freshers in India (2026 Guide)",
    description: "Learn how to format your resume to beat Applicant Tracking Systems used by top Indian companies like TCS, Infosys, and Wipro.",
    date: "March 1, 2026",
    readTime: "5 min",
    tags: ["ATS", "Freshers", "Resume Tips"],
    content: `
      <h2>The Reality of Modern Hiring in India</h2>
      <p>In 2026, landing a job at top Indian tech giants like TCS, Infosys, or Wipro requires more than just skills—it requires a resume that "speaks" the language of machines. Most large organizations use Applicant Tracking Systems (ATS) to filter through thousands of applications.</p>
      
      <h3>1. Keep the Layout Simple</h3>
      <p>ATS bots read from top to bottom, left to right. Avoid using complex graphics, tables, or non-standard fonts. Stick to a single-column layout if you are a fresher.</p>
      
      <h3>2. Use Standard Headings</h3>
      <p>Don't get creative with section titles. Use "Work Experience" instead of "Where I've Been" and "Skills" instead of "Superpowers." Bots look for specific keywords to categorize your data.</p>
      
      <h3>3. The Keyword Strategy</h3>
      <p>Carefully read the job description. If it asks for "Java Development" and "Spring Boot," make sure those exact phrases appear in your skills and projects sections. However, never "keyword stuff"—the resume still needs to be readable by humans once you pass the bot.</p>
      
      <p>CareerCraft AI's <strong>ATS Optimizer</strong> is designed specifically to help you identify these gaps before you hit the 'Apply' button.</p>
    `
  },
  {
    slug: "resume-tips-tcs-infosys",
    title: "How to Write a Resume for TCS and Infosys (2026)",
    description: "A targeted guide on what TCS and Infosys recruiters look for and how to tailor your resume for mass recruiters.",
    date: "March 5, 2026",
    readTime: "6 min",
    tags: ["TCS", "Infosys", "Resume"],
    content: `
      <h2>Cracking the Mass Recruiter Code</h2>
      <p>Service-based giants in India hire thousands of freshers annually. Their criteria are often focused on technical foundational strength and adaptability.</p>
      
      <h3>Highlight Foundation Skills</h3>
      <p>Ensure your resume clearly lists Data Structures, Algorithms, and at least one core language (Java, Python, or C++). These are the non-negotiables for mass recruiters.</p>
      
      <h3>Certification Matters</h3>
      <p>For TCS and Infosys, external certifications from platforms like Coursera or NPTEL hold weight. List them prominently under your education or a dedicated 'Certifications' section.</p>
      
      <h3>The Project Breakdown</h3>
      <p>Instead of just listing a project name, explain the 'Problem-Solution-Impact' flow. For example: "Built a weather app using React to help farmers track local climate, resulting in a 20% faster information access rate."</p>
    `
  },
  {
    slug: "cover-letter-format-india-2026",
    title: "Cover Letter Format for Indian Job Applications (2026)",
    description: "A complete guide to writing effective cover letters for Indian companies with ready-to-use templates.",
    date: "March 10, 2026",
    readTime: "4 min",
    tags: ["Cover Letter", "India", "Templates"],
    content: `
      <h2>Does anyone still read cover letters?</h2>
      <p>The answer is yes—especially when you are applying for competitive roles where multiple candidates have similar resumes. A cover letter is your chance to show <em>intent</em>.</p>
      
      <h3>The "Indian Professional" Tone</h3>
      <p>Maintain a balance between confidence and respect. Start with a formal address and clearly state the reference if you have one. In India, demonstrating knowledge about the company's recent achievements shows you've done your homework.</p>
      
      <h3>The Structure</h3>
      <ul>
        <li><strong>Opening:</strong> Why this company and this role?</li>
        <li><strong>Body:</strong> Connect one specific project from your resume to their current needs.</li>
        <li><strong>Closing:</strong> A clear call to action for an interview.</li>
      </ul>
      
      <p>Our <strong>AI Cover Letter Generator</strong> uses these exact principles to craft your letters in seconds.</p>
    `
  },
  {
    slug: "resume-tips-bca-mca-students",
    title: "Resume Tips for BCA and MCA Students in India",
    description: "Practical resume advice specifically for BCA/MCA students applying to their first IT job in India.",
    date: "March 12, 2026",
    readTime: "5 min",
    tags: ["BCA", "MCA", "Students", "IT Jobs"],
    content: `
      <h2>The BCA/MCA Edge</h2>
      <p>As a BCA or MCA student, your resume should lean heavily into your technical project portfolio. Unlike general graduates, you have spent years specifically focused on computer applications.</p>
      
      <h3>Emphasize Practical Coding</h3>
      <p>Recruiters look for GitHub links. If you haven't hosted your projects, do it now. A live URL is worth more than a thousand words on a PDF.</p>
      
      <h3>Bridge the Gap</h3>
      <p>If you are a BCA student competing with B.Tech graduates, focus on specialized skills. If you know specialized frameworks like Flutter or Advanced DevOps tools, you can often outshine candidates with 'broader' degrees.</p>
    `
  },
];
