import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { runPipeline } from './agent.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  })
);
app.use(express.json());

app.post('/api/analyze', async (req, res) => {
  const { resume, jobDescription } = req.body;

  // 400 if any input is missing
  if (!resume?.trim() || !jobDescription?.trim()) {
    return res
      .status(400)
      .json({ error: 'Resume and job description are required' });
  }

  try {
    const { analysis, coverLetter } = await runPipeline(resume, jobDescription);
    res.status(200).json({ analysis, coverLetter });
  } catch (err) {
    console.error('Pipeline error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});