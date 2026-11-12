import { runPipeline } from './agent.js';

const resume = `
John Doe
Frontend Developer, 2 years of experience
Skills: React, JavaScript, HTML, CSS, REST APIs, Git
Projects: Built a task manager app with React and Node.js
`;

const jobDescription = `
Frontend Developer wanted.
Requirements: React, TypeScript, REST APIs, AWS, 2+ years of experience.
`;

const result = await runPipeline(resume, jobDescription);
console.log('--- ANALYSIS ---\n', result.analysis);
console.log('\n--- COVER LETTER ---\n', result.coverLetter);