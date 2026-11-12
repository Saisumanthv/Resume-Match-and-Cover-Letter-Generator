import { useState } from 'react';

const VITE_API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError('Please paste your resume and the job description first.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setCopied(false);

    try {
      const response = await fetch(VITE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: text,
          jobDescription: 'The job description is included in the text above.',
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Request failed');

      setResult(data); // { analysis, coverLetter }
    } catch (err) {
      setError(err.message || 'Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={styles.page}>
      <h1>Resume Match & Cover Letter Generator</h1>

      <textarea
        style={styles.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`Paste your resume and the job description here, like this:\n\nRESUME:\n...your resume...\n\nJOB DESCRIPTION:\n...the job posting...`}
      />

      <button style={styles.button} onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>

      {error && <p style={styles.error}>{error}</p>}

      {result && (
        <div style={styles.results}>
          <div style={styles.panel}>
            <h2>Analysis</h2>
            <pre style={styles.pre}>{result.analysis}</pre>
          </div>

          <div style={styles.panel}>
            <h2>Cover Letter</h2>
            <pre style={styles.pre}>{result.coverLetter}</pre>
            <button style={styles.button} onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 800, margin: '0 auto', padding: 24, textAlign: 'left' },
  textarea: {
    width: '100%',
    height: 350,
    padding: 12,
    fontSize: 15,
    boxSizing: 'border-box',
    resize: 'vertical',
  },
  button: { marginTop: 12, padding: '10px 24px', fontSize: 16, cursor: 'pointer' },
  error: { color: 'crimson' },
  results: { marginTop: 24 },
  panel: { border: '1px solid #8884', borderRadius: 8, padding: 16, marginBottom: 16 },
  pre: { whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 },
};