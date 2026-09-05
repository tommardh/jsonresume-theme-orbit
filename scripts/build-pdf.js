const { accessSync, constants, readFileSync, writeFileSync, mkdtempSync, rmSync } = require('fs');
const { homedir, tmpdir } = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { embedImages } = require('./embed-images');

const env = { ...process.env };

// Prefer installed Chrome on macOS when Puppeteer's cached browser cannot run.
// Preserve explicit browser configuration and Puppeteer's defaults elsewhere.
if (process.platform === 'darwin' && !env.PUPPETEER_EXECUTABLE_PATH) {
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    path.join(homedir(), 'Applications/Google Chrome.app/Contents/MacOS/Google Chrome'),
  ];
  for (const candidate of candidates) {
    try {
      accessSync(candidate, constants.X_OK);
      env.PUPPETEER_EXECUTABLE_PATH = candidate;
      break;
    } catch {
      // Let Puppeteer use its bundled browser if Chrome is not installed.
    }
  }
}

if (env.PUPPETEER_EXECUTABLE_PATH) {
  console.log(`PDF browser: ${env.PUPPETEER_EXECUTABLE_PATH}`);
}

let temporaryDirectory;
try {
  const projectDirectory = path.resolve(__dirname, '..');
  const resumeFile = path.join(projectDirectory, 'resume.json');
  const resume = embedImages(JSON.parse(readFileSync(resumeFile, 'utf8')), resumeFile);
  temporaryDirectory = mkdtempSync(path.join(tmpdir(), 'orbit-pdf-'));
  const preparedResume = path.join(temporaryDirectory, 'resume.json');
  writeFileSync(preparedResume, JSON.stringify(resume), { mode: 0o600 });

  const result = spawnSync(
    process.platform === 'win32' ? 'resume.cmd' : 'resume',
    ['export', 'resume.pdf', '--theme', '.', `--resume=${preparedResume}`, '--force'],
    {
      cwd: path.resolve(__dirname, '..'),
      env,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    }
  );

  if (result.error) {
    console.error(result.error.code === 'ENOENT'
      ? 'The resume command was not found. Install it with: npm install -g resume-cli'
      : result.error.message);
  }
  process.exitCode = result.status ?? 1;
} catch (error) {
  console.error(`PDF export failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  if (temporaryDirectory) rmSync(temporaryDirectory, { recursive: true, force: true });
}
