# JSON Resume Orbit Theme

Turn a JSON resume into a responsive, two-column CV that you can preview in a browser or export to HTML and PDF. This theme is based on the [Orbit design](https://github.com/xriley/Orbit-Theme) by [Xiaoying Riley](https://github.com/xriley).

This version adds configurable section order, grouped work history, English and Swedish headings, content filters, and a consultant profile. See [Theme extensions](#theme-extensions) for the fields that control these features.

[![Example resume](docs/resume.jpg)](https://xuluwarrior.github.io/jsonresume-theme-orbit/resume.html)

## Quick start

Run the following commands from your local checkout of this repository. Using `--theme .` selects the code in this checkout, including its extensions.

### 1. Install dependencies

You need Node.js and npm. Use a supported Node.js LTS release: although this package declares Node.js `>=16`, its Markdown dependency, `marked` 15, requires Node.js `>=18`.

```sh
npm install
npm install -g resume-cli
```

`resume-cli` provides the `resume` command. It is installed separately because it is not included in this project's dependencies.

### 2. Preview the included example

```sh
npm run serve-example
```

Open the preview address printed in the terminal (normally `http://localhost:4000`). Press **Ctrl+C** to stop the server.

### 3. Create and preview your own resume

Copy [example-resume.json](example-resume.json) to a new file, for example `my-resume.json`, and replace the sample information:

```sh
cp example-resume.json my-resume.json
npm run serve -- --resume=my-resume.json
```

The `--` forwards additional arguments from npm to `resume-cli`. You can also use an absolute path; quote paths containing spaces:

```sh
npm run serve -- --resume="/path/to/my resume.json"
```

If your file is named `resume.json` in the project root, simply run `npm run serve`. That filename is ignored by Git; other filenames, including `my-resume.json`, are not automatically ignored.

### 4. Export your resume

Run these commands from the project root:

```sh
resume export resume.html --theme . --resume=my-resume.json
resume export resume.pdf --theme . --resume=my-resume.json
```

Add `--force` to overwrite an existing output file. For PDF, you can also open the HTML preview and use your browser's **Print → Save as PDF**.

The exported HTML embeds the theme's CSS and JavaScript, but still loads fonts, framework assets, and any remote images from the internet.

## Package scripts

Run scripts with `npm run <script-name>` from the project root. `npm run` lists all available scripts.

| Command | What it does |
| --- | --- |
| `npm run serve` | Starts the local preview using this checkout as the theme. Uses `resume.json` by default; pass `-- --resume=path/to/file.json` to choose another file. |
| `npm run serve-example` | Starts the preview with the bundled `example-resume.json`, regardless of your own resume file. |
| `npm run build:example` | Exports `example-resume.json` to `example-resume.html` in the project root. Includes `--force`, so it overwrites that output if it already exists. |
| `npm run build:styles:1` | Compiles `assets/less/default/styles.less` to `assets/css/styles-1.css` (default blue). |
| `npm run build:styles:2` | Compiles `assets/less/theme-2/styles.less` to `assets/css/styles-2.css` (teal). |
| `npm run build:styles:3` | Compiles `assets/less/theme-3/styles.less` to `assets/css/styles-3.css` (green). |
| `npm run build:styles:4` | Compiles `assets/less/theme-4/styles.less` to `assets/css/styles-4.css` (purple). |
| `npm run build:styles:5` | Compiles `assets/less/theme-5/styles.less` to `assets/css/styles-5.css` (orange). |
| `npm run build:styles:6` | Compiles `assets/less/theme-6/styles.less` to `assets/css/styles-6.css` (slate). |
| `npm run release:prepare` | Maintainer operation: checks out `master`, runs `git pull`, then increments the patch version with `npm version patch -m "Release: %s"`. Under npm's default Git behavior this creates a version commit and tag. It does not push or publish the package. |

Compiled styles are already included. You only need the style scripts after editing LESS files. There is no `build:styles` script; use a numbered variant. There is no `test` script in `package.json`.

## Resume JSON format

The input is a UTF-8 JSON file containing one top-level object. Use double-quoted property names and strings, with no comments or trailing commas. Start with the bundled example and omit sections you do not need.

The base format follows [JSON Resume](https://jsonresume.org/). The [upstream schema](https://github.com/jsonresume/resume-schema/blob/master/schema.json) defines standard fields; the tables below describe what **this theme renders** and how its extensions behave.

### Basic example

This is a complete input file:

```json
{
  "basics": {
    "name": "Alex Example",
    "label": "Software Developer",
    "email": "alex@example.com",
    "url": "https://example.com",
    "summary": "I build **accessible web applications**.",
    "profiles": [
      {
        "network": "GitHub",
        "username": "alex-example",
        "url": "https://github.com/alex-example"
      }
    ]
  },
  "work": [
    {
      "name": "Example AB",
      "position": "Software Developer",
      "location": "Stockholm",
      "startDate": "2022-01-01",
      "summary": "Build and maintain customer-facing services.",
      "highlights": ["Reduced page load time by 30%."]
    }
  ],
  "skills": [
    {
      "name": "Web Development",
      "level": "Advanced",
      "keywords": ["JavaScript", "Accessibility"]
    }
  ],
  "meta": {
    "themeVariant": 1,
    "workHighlights": true,
    "skillKeywords": true
  }
}
```

### Sections and fields

Always include a `basics` object: the renderer accesses it directly. Other sections are optional arrays of objects. Missing or empty arrays normally hide their sections.

| Section | Fields displayed by this theme |
| --- | --- |
| `basics` | `name`, `label` (professional title), `image` (profile image URL), `email`, `phone`, `url`, `summary`, and `profiles` entries with `network`, `username`, `url`. Contact details appear in the sidebar; the summary appears in the main column. |
| `work` | `name` (employer), `position`, `location`, `url`, `startDate`, `endDate`, `summary` or `description`, and optional `highlights` (array of strings). |
| `projects` | `name`, `url`, `startDate`, `endDate`, `description`, and optional `highlights` and `keywords` (arrays of strings). Custom `position`, `location`, and `summary` fields are described below. |
| `volunteer` | `organization`, `position`, `url`, `startDate`, `endDate`, `summary`. |
| `education` | `institution`, `area`, `studyType`, `startDate`, `endDate`. Appears in the sidebar. Supply `studyType` as a string, such as `MSc`. |
| `awards` | `title`, `date`, `awarder`, `summary`, and the custom `url` field. |
| `certificates` | `name`, `issuer`, `date`, with optional filtering using the custom `level` field. Appears in the sidebar. |
| `publications` | `name`, `publisher`, `releaseDate`, `url`, `summary`. |
| `skills` | `name`, `level` (string), and optional `keywords` (array of strings). Appears as proficiency bars in the main column. |
| `languages` | `language`, `fluency`. Appears in the sidebar. |
| `interests` | `name`. Appears in the sidebar. |
| `meta` | Theme settings; see the complete options table below. |
| `company` | Custom consultant-company details; see the extended example below. |

Some standard fields are not displayed: `basics.location`, `education.score` and `courses`, `volunteer.highlights`, `certificates.url`, `projects.roles`, `interests.keywords`, and the entire `references` section. Work/project highlights and skill/project keywords are hidden unless enabled in `meta`.

### Dates, text, and ordering

- Use date strings such as `"2024-06-01"`. The theme displays years only. Omit `endDate` for ongoing work, projects, or education; it displays `Present`. The date helper uses `Present` for any missing date, so supply start dates and award/certificate/publication dates to avoid misleading labels.
- Put entries in the order you want them displayed, usually newest first. The theme does not sort by date. Company grouping preserves first-seen company order and each company's original position order.
- Summary/description text rendered in the main column supports Markdown, including links and emphasis. Highlights and keywords render as plain text.
- Supply `network` for each social profile and a string `level` for each skill, because the helpers call string methods on these values.
- Skill levels map `Beginner` → 25%, `Intermediate` → 50%, `Advanced` → 75%, and `Master` → 100% (case-insensitive). Percentage strings such as `"85%"` or numeric strings such as `"85"` also work; keep them within 0–100.
- Legacy `website` fields are accepted for `basics`, `work`, `volunteer`, `publications`, and `projects`; legacy `work.company` is accepted as the employer name. Prefer `url` and `work.name` in new files.

## Theme extensions

**The settings and custom fields below are specific to this version of Orbit.** Other JSON Resume themes may ignore them. Standard fields such as `work.highlights`, `projects.keywords`, and `skills.keywords` remain standard; their visibility switches are extensions.

### Display settings in `meta`

Add `meta` alongside `basics`, `work`, and the other top-level sections. All settings are optional. Use JSON booleans (`true`/`false`) and numbers where indicated, not quoted strings.

| Setting | Default | Supported values and behavior |
| --- | --- | --- |
| `themeVariant` | `1` | Integer `1`–`6`, selecting the corresponding compiled color scheme. Out-of-range or nonnumeric values cause a render error. |
| `sectionFocus` | `"work"` | `"work"` puts work before projects; `"project"` puts projects before work. |
| `workFocus` | `"role"` | `"role"` shows each position separately with the role as its heading. `"company"` groups positions with the same `work.name` under an employer heading. |
| `projectFocus` | `"company"` | `"company"` shows the project's `name` as its heading and `position` below it. `"role"` swaps them. This changes headings, not project grouping. |
| `language` | `"eng"` | `"eng"` for English headings; `"swe"` for Swedish headings and the project keyword label. Resume content is not translated, and date labels such as `Present` remain English. |
| `summaryLevel` | `"summary"` | `"summary"` displays `basics.summary`; `"description"` displays custom `basics.description`. There is no `"none"` mode for this setting. |
| `workLevel` | `"summary"` | `"summary"` displays `work.summary`; `"description"` displays `work.description`; `"none"` hides the body text. |
| `projectLevel` | `"description"` | `"description"` displays `projects.description`; `"summary"` displays custom `projects.summary`; `"none"` hides the body text. |
| `workHighlights` | `false` | Set `true` to show each work entry's `highlights` as bullets. Independent of `workLevel`. |
| `projectHighlights` | `false` | Set `true` to show each project's `highlights` as bullets. Independent of `projectLevel`. |
| `skillKeywords` | `false` | Set `true` to show each skill's `keywords` below its proficiency bar. |
| `projectKeywords` | `false` | Set `true` to show each project's `keywords`. |
| `startDate` | `null` | Date cutoff, e.g. `"2020-01-01"`. Includes work/projects whose **end date** is on or after the cutoff, plus entries without an end date. Includes certificates whose `date` is on or after the cutoff, plus undated certificates. Other sections are unaffected. |
| `certificateRank` | `0` | Numeric minimum for `certificates[].level`. `0` disables rank filtering. With a positive threshold, certificates need a level greater than or equal to it. The date filter still applies. |
| `consultantProfile` | `false` | Set `true` to show the top-level `company` object above the personal summary. Requires `company` data. |

The personal summary section requires a nonempty `basics.summary` even when `summaryLevel` is `"description"`. Selecting a description or summary field does not fall back to the other field if it is missing. Supply the text you select.

Date/rank filtering removes entries after section headings are created, so an empty section heading can remain. With company grouping, an employer heading can also remain after all its positions are filtered out.

The CLI's `--theme .` selects this local theme. Setting `meta.theme` is not necessary for these commands; this renderer does not read it.

### Custom content fields

| Field | Type | Purpose |
| --- | --- | --- |
| `basics.description` | String | Alternative personal-summary text selected by `meta.summaryLevel: "description"`. |
| `projects[].summary` | String | Alternative project text selected by `meta.projectLevel: "summary"`. |
| `projects[].position` | String | Your role on the project. Used by `projectFocus`; the standard `roles` array is not rendered. |
| `projects[].location` | String | Location displayed beside the project's dates. |
| `certificates[].level` | Number | User-defined rank used by `meta.certificateRank`. There is no fixed ranking scale; choose a consistent one. |
| `awards[].url` | String | URL linked from the awarder's name. |
| `company` | Object | Consultant-company details: `name`, `email`, `phone`, `url`, `location` (plain string), and `image` (logo URL), all optional strings. Displayed when `meta.consultantProfile` is `true`. |

`work.description` is a standard field, but this theme gives it an additional presentation role: you can use it as a longer alternative to `work.summary` and select it with `workLevel`.

### Extended example

This complete example shows a consultant profile, Swedish headings, project-first ordering, longer personal text, and certificate filtering:

```json
{
  "basics": {
    "name": "Alex Example",
    "label": "Systemutvecklare",
    "summary": "Utvecklare med fokus på tillgänglighet.",
    "description": "Jag bygger **tillgängliga webbtjänster** och hjälper team att förbättra kvaliteten."
  },
  "company": {
    "name": "Example Consulting AB",
    "email": "contact@example.com",
    "phone": "+46 70 123 45 67",
    "url": "https://example.com",
    "location": "Stockholm, Sverige"
  },
  "projects": [
    {
      "name": "Kundportal",
      "position": "Teknisk ledare",
      "location": "Stockholm",
      "startDate": "2023-01-01",
      "summary": "Ledde utvecklingen av en ny kundportal.",
      "description": "Planerade arkitekturen och byggde en tillgänglig kundportal tillsammans med teamet.",
      "highlights": ["Kortare laddningstider."],
      "keywords": ["TypeScript", "Tillgänglighet"]
    }
  ],
  "certificates": [
    {
      "name": "Example Certification",
      "issuer": "Example Academy",
      "date": "2024-06-01",
      "level": 2
    }
  ],
  "meta": {
    "themeVariant": 3,
    "language": "swe",
    "sectionFocus": "project",
    "workFocus": "company",
    "projectFocus": "role",
    "summaryLevel": "description",
    "workLevel": "summary",
    "projectLevel": "summary",
    "projectHighlights": true,
    "projectKeywords": true,
    "consultantProfile": true,
    "startDate": "2020-01-01",
    "certificateRank": 2
  }
}
```

## Customize the template and styles

- [resume.hbs](resume.hbs) defines the page shell and external assets.
- [partials/](partials/) contains individual sections. `main-section.hbs` controls the main column, and `sidebar.hbs` controls the sidebar.
- [index.js](index.js) contains rendering helpers and the default theme settings.
- [assets/less/](assets/less/) contains style sources; [assets/css/](assets/css/) contains the compiled styles used by the renderer.

To change colors, set `meta.themeVariant` to `1`–`6`. Switching between the included schemes requires no rebuild. To return to the default color scheme, set it to `1` or remove that setting.

To change a scheme's colors, edit its `theme-default.less` file and run the matching `build:styles:N` script. Variant 1 uses `assets/less/default/`; variants 2–6 use `assets/less/theme-N/`.

To widen the sidebar, edit `@sidebar-width` in `assets/less/default/base.less`:

```less
@sidebar-width: 300px;
```

All six schemes share that file. Rebuild every scheme you use, for example:

```sh
npm run build:styles:1
npm run build:styles:3
```

Preview or export again to check the result.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| `resume: command not found` | Install `resume-cli` and ensure npm's global executable directory is on your `PATH`. |
| `lessc: command not found` | Run `npm install` with development dependencies included, then use `npm run build:styles:N`. |
| The preview shows the wrong resume | Pass an explicit path with `npm run serve -- --resume=my-resume.json`. `serve-example` always uses the bundled example. |
| Highlights or keywords are missing | Enable the corresponding `meta` switch; they are hidden by default. |
| Selected summary/description is blank | Check that the selected field exists. For the personal summary, keep `basics.summary` nonempty as well. |
| Work, projects, or certificates are missing | Check `meta.startDate`, certificate levels, and `meta.certificateRank`. |
| Style edits have no effect | Rebuild the numbered scheme selected by `meta.themeVariant`, then preview/export again. |

## Credits and license

The template design is available under the [Creative Commons Attribution 3.0 License](https://creativecommons.org/licenses/by/3.0/), attributed to [Xiaoying Riley](https://github.com/xriley). Keep the design attribution when using the template.

The source code for generating resumes is available under the [MIT license](https://opensource.org/license/mit/).

For a theme that implements the original Orbit design, see [jsonresume-theme-orbit-original](https://github.com/XuluWarrior/jsonresume-theme-orbit-original).
