const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { test } = require('node:test');
const { embedImages } = require('../scripts/embed-images');

test('embeds both images relative to a symlink target, with a project fallback', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'orbit-images-test-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const source = path.join(directory, 'source');
  fs.mkdirSync(source);
  const original = path.join(source, 'resume.json');
  const linked = path.join(directory, 'resume.json');
  fs.writeFileSync(original, '{}');
  fs.symlinkSync(original, linked);
  fs.writeFileSync(path.join(source, 'profile.png'), 'profile bytes');
  fs.writeFileSync(path.join(directory, 'logo.jpeg'), 'logo bytes');
  const result = embedImages({
    basics: { image: './profile.png' },
    company: { image: './logo.jpeg' },
  }, linked);
  assert.equal(result.basics.image, `data:image/png;base64,${Buffer.from('profile bytes').toString('base64')}`);
  assert.equal(result.company.image, `data:image/jpeg;base64,${Buffer.from('logo bytes').toString('base64')}`);
  const absolute = path.join(source, 'profile.png');
  for (const image of [absolute, pathToFileURL(absolute).href]) {
    assert.equal(embedImages({ basics: { image } }, linked).basics.image, result.basics.image);
  }
  assert.equal(fs.readFileSync(original, 'utf8'), '{}');
  fs.mkdirSync(path.join(directory, 'public'));
  fs.writeFileSync(path.join(directory, 'public', 'public-logo.png'), 'public logo');
  assert.equal(
    embedImages({ company: { image: './public-logo.png' } }, linked).company.image,
    `data:image/png;base64,${Buffer.from('public logo').toString('base64')}`
  );
});

test('preserves remote images and existing data URIs', () => {
  for (const image of ['https://example.com/image.png', 'data:image/png;base64,aGVsbG8=']) {
    const resume = { basics: { image } };
    assert.equal(embedImages(resume, __filename).basics.image, image);
  }
});

test('reports all missing images rather than silently omitting them', () => {
  assert.throws(() => embedImages({
    basics: { image: './missing-profile.png' },
    company: { image: './missing-logo.jpeg' },
  }, __filename), error => {
    assert.match(error.message, /basics.image.*missing-profile/);
    assert.match(error.message, /company.image.*missing-logo/);
    return true;
  });
});
