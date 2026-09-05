const fs = require('fs');
const path = require('path');
const { fileURLToPath } = require('url');

const mimeTypes = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
};

function embedImages(resume, resumeFile) {
  const directories = [...new Set([
    path.dirname(fs.realpathSync(resumeFile)),
    path.dirname(path.resolve(resumeFile)),
    path.join(path.dirname(path.resolve(resumeFile)), 'public'),
  ])];
  const errors = [];

  for (const section of ['basics', 'company']) {
    const source = resume[section]?.image;
    if (!source || /^(https?:|data:|\/\/)/i.test(source)) continue;

    const candidates = source.startsWith('file:')
      ? [fileURLToPath(source)]
      : directories.map(directory => path.resolve(directory, source));
    const file = candidates.find(candidate => fs.existsSync(candidate));
    if (!file) {
      errors.push(`${section}.image: "${source}" was not found. Checked: ${candidates.join(', ')}`);
      continue;
    }
    const mime = mimeTypes[path.extname(file).toLowerCase()];
    if (!mime) {
      errors.push(`${section}.image: unsupported image extension in "${source}".`);
      continue;
    }
    resume[section].image = `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
  }

  if (errors.length) throw new Error(errors.join('\n'));
  return resume;
}

module.exports = { embedImages };
