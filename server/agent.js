import 'dotenv/config';
import { LlmAgent, SequentialAgent, InMemoryRunner, Gemini } from '@google/adk';

const APP_NAME = 'resume_app';
const USER_ID = 'user';

// One shared model config for both agents
const model = new Gemini({
  model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
  apiKey: process.env.GEMINI_API_KEY
});

// Agent 1: analyzes the match
const analyzerAgent = new LlmAgent({
  name: 'analyzer_agent',
  model,
  instruction: `You will receive a resume and a job description in the user's message.
Compare them and reply in exactly this format:

Match Score: <number>/100

Matching Skills:
- <skill>

Missing Skills:
- <skill>

Improvement Tips:
1. <tip>
2. <tip>
3. <tip>

Only use information that is actually in the resume. Do not invent anything.`,
  outputKey: 'analysis',
});

// Agent 2: writes the cover letter using Agent 1's result
const writerAgent = new LlmAgent({
  name: 'writer_agent',
  model,
  instruction: `Write a concise, professional cover letter (about 250 words) for the job
in the user's message, based on the resume in the user's message and this analysis:

{analysis}

Highlight the strengths. Handle the missing skills honestly by showing willingness to learn.
Never invent experience, companies, or achievements that are not in the resume.
Return only the cover letter text.`,
  outputKey: 'cover_letter',
});

// Pipeline: analyzer first, then writer
const resumePipeline = new SequentialAgent({
  name: 'resume_pipeline',
  subAgents: [analyzerAgent, writerAgent],
});

// Exported function used by index.js
export async function runPipeline(resume, jobDescription) {
  const runner = new InMemoryRunner({ agent: resumePipeline, appName: APP_NAME });

  const session = await runner.sessionService.createSession({
    appName: APP_NAME,
    userId: USER_ID,
  });

  const message = {
    role: 'user',
    parts: [{ text: `RESUME:\n${resume}\n\nJOB DESCRIPTION:\n${jobDescription}` }],
  };

  // Fallback: also remember each agent's text from the events
  const byAuthor = {};

  for await (const event of runner.runAsync({
    userId: USER_ID,
    sessionId: session.id,
    newMessage: message,
  })) {
    const text = event.content?.parts?.map((p) => p.text || '').join('');
    if (text && event.author) {
      byAuthor[event.author] = text;
    }
  }

  // Main way: read the saved results from session state
  const finalSession = await runner.sessionService.getSession({
    appName: APP_NAME,
    userId: USER_ID,
    sessionId: session.id,
  });

  const analysis = finalSession?.state?.analysis || byAuthor['analyzer_agent'] || '';
  const coverLetter = finalSession?.state?.cover_letter || byAuthor['writer_agent'] || '';

  return { analysis, coverLetter };
}