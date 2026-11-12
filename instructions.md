# AI Agents second project

---

## Step 1) Install Git:

- Go to <https://git-scm.com/install/> and select your operating system and click on **'Click here to download'** button and install the downloaded .exe file, once the Git is installed, you'll be able to see Git Bash app in your system
- Open Git Bash app and run `git -v` to confirm the installed Git version
- Now, you have to configure your GitHub username and email by using these commands: (i) `git config --global user.name "Your Name"` (ii) `git config --global user.email "your.email@example.com"`
- Run command `git config --list` to check if the credentials configured correctly

---

## Step 2) Install Node.js:

- Go to <https://nodejs.org/en> and select the relevant operating system and click on download button and double click on the installer to install node
- Open Git Bash app and run command `node -v` to check the installed node version and run `npm -v` to check the installed node package manager version

---

## Step 3) Generate Gemini API Key:

- Navigate to aistudio.google.com and sign in with your Google account credentials.
- Click **Get API key** located in the bottom-left navigation sidebar.
- Click **Create API key**, select or create your Google Cloud project, assign a key label, and click **Create Key**.
- Copy the generated API key string (e.g., `AIzaSy...`) and store it securely for environment configuration.

---

## Step 4) Initializing React application:

- Create a new folder on the Desktop and open it with VSCode.
- Open terminal and run command `npm create vite@latest .` (We have used ' .' here because we wanted to build the app directly inside our current folder instead of creating a nested subfolder)

> **Note:** Vite is a modern frontend build tool and development server. During development, it serves your code natively using ES Modules (ESM) to deliver near-instant startup times and lightning-fast Hot Module Replacement (HMR) as you save changes. When you are ready for deployment, Vite acts as a bundler, packaging and optimizing your HTML, CSS, JavaScript, and assets into production-ready static files.

- Select `React` framework in the next step
- Select the preferred variant in the next step, for e.g., `JavaScript + React Compiler`
- Select Linter in the next step, for e.g., `ESLint`
- Click Yes to install with npm and start the application and your application will start running on the port 5173 by default, i.e., <http://localhost:5173/>
- Whenever the frontend stops running, you can restart by running the command `npm run dev` in the terminal.

---

## Step 5) Setup Backend Server (Node.js & Express)

- Create a folder named 'server' in the root directory of your project
- Navigate to 'server' folder in VSCode terminal
- Run command `npm init -y` in the terminal
- Install all the required tools/packages using 'npm install ...' command, for e.g., `npm install @google/adk express cors dotenv`. @google/adk is the agent framework. You can check all the installed dependencies in the '.server/package.json' file.
- If you want the server to auto-restart when you edit files, add this as a dev dependency: `npm install -D nodemon`
- Open server/package.json and add `"type": "module"` so the import syntax works.
- Create a file named ‘agent.js’ inside the ‘server’ directory

### Agent logic (agent.js)

- Now, open ‘agent.js’ file and write the agent logic. It has only 3 small parts:
  - **Agent 1 (analyzer_agent):** reads the resume and job description and gives a match score out of 100, matching skills, missing skills and tips. Set `outputKey: 'analysis'`.
  - **Agent 2 (writer_agent):** writes a cover letter using the analysis from Agent 1. Put `{analysis}` in its instruction and set `outputKey: 'cover_letter'`.
  - **Pipeline:** put both agents in a SequentialAgent in this order: analyzer, then writer.

- Then add one exported function, for example `runPipeline(resume, jobDescription)`, that does 4 things:
  - creates a runner and a session
  - sends the resume and job description as one message
  - runs the pipeline and loops over the events
  - returns `{ analysis, coverLetter }`

- The idea in one line: Agent 1 analyzes, Agent 2 writes, and the function returns both results.
- The only fiddly part is the last bullet, collecting each agent’s output from the events. You can simplify it: after the run finishes, read analysis and cover_letter from the session state, since the outputKey values save them there. That avoids matching author names.
- Finally, we send the response as key-value pairs (e.g., `{"analysis": "Some analysis...", "coverLetter": "final cover letter..."}`)

### Endpoint (index.js)

- Now, create a file named 'index.js' in the 'server' directory and write an endpoint which takes input from the frontend and calls the agent in the 'agent.js' file and sends back the 200 status code, analysis & coverLetter as the endpoint response.
- Initiate the express server using express package which we have installed using npm before. You can use 3000 port to listen to the API calls.
- Now, we need to setup the CORS compatibility. Without this, the browser blocks the request with a CORS error. For that, we need to add the cors import and middleware in the 'index.js' file

```js
import cors from 'cors';
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
```

### Environment variables (.env)

- Create a '.env' file in the 'server' directory and add FRONTEND_URL with localhost url, GEMINI_MODEL & GEMINI_API_KEY which we generated before and import and use this key in 'agent.js' file.
- Create a '.env' file in the root directory and add VITE_API_URL with backend localhost URL
- Now, run the backend using `npx nodemon index.js` command

---

## Step 6) Build user interface:

- Clear the predefined code in App.jsx file and just keep the boilerplate.
- Create '.env' file in the root directory and add backend URL
- Now, start building frontend for your application. For my app I just need a input field for user query, send button which makes an API call to endpoint which is defined in my backend and the use of paragraph tag to show the cover letter to user.
- Now, run `npm run dev` to see your complete application
- Add styles in the 'App.css' if required and import it in the 'App.jsx' file using syntax `import "./App.css"`

---

## Deployment

Finally, create a .gitignore file and push this project to GitHub and deploy it using Render & Vercel as before.

---
