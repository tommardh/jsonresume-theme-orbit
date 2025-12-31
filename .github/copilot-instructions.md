# Copilot Instructions for jsonresume-theme-orbit

## Project Overview
This is a JSON Resume theme generator based on the Orbit design. It takes JSON resume data conforming to the [JSON Resume schema](https://jsonresume.org/schema/) and generates HTML resumes with 6 color scheme variants.

**Core Architecture:**
- `index.js` - Main render function that compiles Handlebars templates with resume data
- `resume.hbs` - Main HTML template wrapper
- `partials/` - Handlebars partials for each resume section (basics, work, education, etc.)
- `assets/less/` - LESS source files with theme variants (theme-2 through theme-6)
- `assets/css/` - Compiled CSS files (styles-1.css through styles-6.css)

## Key Development Patterns

### Template Rendering Flow
1. `render()` function in [index.js](index.js) reads themeVariant (1-6) from `resume.meta.themeVariant`
2. Loads corresponding CSS file (`/assets/css/styles-{variant}.css`)
3. Inlines CSS and JS directly into HTML via triple-brace `{{{css}}}` and `{{{js}}}`
4. Registers all `.hbs` files from `partials/` directory as Handlebars partials
5. Compiles [resume.hbs](resume.hbs) with resume data, inlined assets, and package metadata

### Resume Data Normalization (Critical)
The `fixResume()` function in [index.js](index.js#L73-L96) handles backward compatibility:
- Migrates deprecated `website` property to `url` (affects basics, work, volunteer, publications, projects)
- Converts `work.company` to `work.name` (v1.0.0 schema change)
- **Always call `fixResume(resume)` before rendering to ensure schema consistency**

### Custom Handlebars Helpers
Defined in [index.js](index.js#L6-L68):
- `markdown` - Renders markdown strings, strips single `<p>` wrapper to avoid extra blocks
- `displayUrl` - Strips protocol prefix (https://) for display
- `year` - Extracts year from date string, returns "Present" for null/undefined
- `award` - Pluralizes "bachelor"/"master" degrees
- `skillLevel` - Converts text levels (beginner/intermediate/advanced/master) to percentages (25%/50%/75%/100%)

## Development Workflow

### Local Development
```bash
npm run serve            # Serves example-resume.json with local theme
resume serve --theme .   # Uses resume.json from current directory or jsonresume.org default
```

### Building Styles
Each theme variant has separate LESS entry point:
```bash
npm run build:styles:1  # Compiles assets/less/default/styles.less → assets/css/styles-1.css
npm run build:styles:3  # Compiles assets/less/theme-3/styles.less → assets/css/styles-3.css
npm run build:styles    # Builds all 6 variants (runs all build:styles:X scripts)
```
**Pattern:** Theme variants share [base.less](assets/less/default/base.less) and [responsive.less](assets/less/default/responsive.less) but override colors in `theme-default.less`

### Testing
```bash
npm test               # Validates package.json structure (no unit tests currently)
```
Visual regression testing via Percy.io (see [tests/percy.js](tests/percy.js)):
- Snapshots generated for each theme variant
- Requires PERCY_TOKEN environment variable
- Run manually via percy script (not in automated CI)

### Customizing Layout
- **Sidebar width:** Edit `@sidebar-width` in [assets/less/default/base.less](assets/less/default/base.less#L1), then rebuild styles
- **Color scheme:** Each theme-X folder has its own `theme-default.less` with color variable overrides

## Template Structure Conventions

### Partial Organization
- [sidebar.hbs](partials/sidebar.hbs) - Includes basics, education, languages, interests
- [main-section.hbs](partials/main-section.hbs) - Includes summary, work, projects, skills, etc.
- Each section partial (e.g., [work.hbs](partials/work.hbs)) checks if data exists before rendering with `{{#if resume.work}}`

### HTML/CSS Patterns
- Uses Bootstrap 5 grid system (`.container`, `.row`, `.col-*`)
- Icon usage: Font Awesome 4.7.0 via `<i class="fas fa-*"></i>`
- Responsive breakpoints defined in [responsive.less](assets/less/default/responsive.less)
- Print-specific styles: `@media print` hides sidebar social icons

### Resume JSON Meta Configuration
```json
{
  "meta": {
    "theme": "jsonresume-theme-orbit",
    "themeVariant": 3,         // Valid values: 1-6, defaults to 1
    "sectionFocus": "project",  // Valid values: "project" or "work", defaults to "work"
    "workFocus": "company",     // Valid values: "company" or "role", defaults to "role"
    "projectFocus": "role",     // Valid values: "role" or "company", defaults to "company"
    "language": "swe"           // Valid values: "swe" or "eng", defaults to "eng"
  }
}
```
- Invalid themeVariant throws error: `"Invalid themeVariant. Allowed values are 1 to 6"`
- `sectionFocus`: Controls section order in main content:
  - `"project"` - Projects section appears before Work Experience
  - `"work"` (default) - Work Experience appears before Projects
- `workFocus`: Controls display order in work experience entries:
  - `"company"` - Company name appears in top row, job title in second row
  - `"role"` (default) - Job title appears in top row, company in second row
- `projectFocus`: Controls display order in project entries:
  - `"role"` - Position/role appears in top row, project name in second row
  - `"company"` (default) - Project name appears in top row, position in second row
- `language`: Controls language of section headings:
  - `"swe"` - Swedish headings (Arbetserfarenhet, Projekt, Utbildning, etc.)
  - `"eng"` (default) - English headings (Work Experience, Projects, Education, etc.)

## File Structure
```
jsonresume-theme-orbit/
├── index.js              # Main render logic and Handlebars helpers
├── resume.hbs            # Root template with <head>, CSS/JS injection
├── partials/             # Resume section templates
│   ├── sidebar.hbs
│   ├── main-section.hbs
│   ├── work.hbs, education.hbs, skills.hbs, etc.
├── assets/
│   ├── css/              # Compiled CSS (Git-tracked)
│   │   └── styles-{1-6}.css
│   ├── less/             # Source LESS files
│   │   ├── default/      # Theme 1 (base styles)
│   │   └── theme-{2-6}/  # Color variants
│   └── js/
│       └── main.js       # Minimal JS for smooth scrolling
├── tests/
│   └── percy.js          # Visual regression test snapshots
└── example-resume.json   # Sample resume for local development
```

## Integration Points
- **resume-cli:** Expects `render()` and `pdfRenderOptions` exports in [index.js](index.js#L158-L165)
- **PDF generation:** Uses `mediaType: 'print'` with 30px top/bottom margins
- **External dependencies:** Bootstrap 5.0.2, Font Awesome 4.7.0, Google Fonts (Roboto) - all via CDN in [resume.hbs](resume.hbs#L12-L14)
- **Node.js compatibility:** Requires Node.js 14+ (uses modern JS syntax)

## Code Style & Conventions
- **Indentation:** 2 spaces for JS, 4 spaces for Handlebars templates
- **Handlebars syntax:**
  - Use `{{#if}}` for optional sections
  - Use `{{{triple-braces}}}` for unescaped HTML (CSS/JS injection, markdown content)
  - Helper usage: `{{year startDate}}` not `{{year(startDate)}}`
- **LESS variables:** Prefix theme-specific colors with `@` (e.g., `@theme-color`, `@text-color`)
- **Error handling:** Throw descriptive errors for invalid configuration (see themeVariant validation)

## Common Pitfalls
- Don't forget to rebuild CSS after LESS changes (`npm run build:styles:X`)
- Resume data must go through `fixResume()` before rendering or deprecated properties will appear
- Partials must be in `partials/` directory and end with `.hbs` to be auto-registered
- Theme variant is 1-indexed (1-6), not 0-indexed
- CSS files are Git-tracked (unlike many projects) - commit compiled CSS after LESS changes
- Markdown helper strips `<p>` tags only for single-paragraph content; multi-paragraph keeps wrappers

## Adding New Features

### Adding a New Resume Section
1. Create partial in `partials/new-section.hbs`
2. Add conditional render: `{{#if resume.newSection}} ... {{/if}}`
3. Include in [sidebar.hbs](partials/sidebar.hbs) or [main-section.hbs](partials/main-section.hbs)
4. Test with example-resume.json containing sample data

### Adding a New Handlebars Helper
1. Define in [index.js](index.js#L6) before `render()` function
2. Follow existing pattern: `Handlebars.registerHelper('helperName', (input) => { ... })`
3. Document expected input/output in code comments
4. Use in templates via `{{helperName value}}`

### Creating a New Color Variant (Theme 7)
1. Create `assets/less/theme-7/` directory
2. Copy `styles.less` from theme-2, update import path
3. Create `theme-default.less` with color overrides
4. Add npm script: `"build:styles:7": "lessc assets/less/theme-7/styles.less assets/css/styles-7.css"`
5. Update themeVariant validation in [index.js](index.js#L110-L113) to allow 1-7

## External Resources
- [JSON Resume Schema Documentation](https://jsonresume.org/schema/)
- [Handlebars Guide](https://handlebarsjs.com/guide/)
- [LESS Documentation](https://lesscss.org/)
- [Original Orbit Theme Design](https://github.com/xriley/Orbit-Theme)
