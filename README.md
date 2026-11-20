# shreyash.world

Personal site of Shreyash Chandra. Next.js 16 (App Router), React 19, TypeScript, plain CSS.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Editing content

All copy lives in [`content/site.ts`](content/site.ts): profile, experience, projects, numbers, stack and the "off the clock" cards. Edit, commit, deploy.

- Résumé link points to `/Shreyash_Chandra_CV.pdf`. Put the file in `public/`.
- Portrait is `public/img/portrait.png`.
- GitHub stats and the contribution graph load live in the browser (GitHub API + the `github-contrib-proxy` Cloudflare Worker).

## Admin panel (`/admin`)

Hidden, owner-only editor for experience, projects and the résumé PDF. Not linked anywhere and marked `noindex`.

- Experience and projects are stored in [`content/data.json`](content/data.json). Everything else is still edited in `content/site.ts`.
- **Production:** saves are committed to this repo through the GitHub API, and Vercel redeploys (about a minute).
- **Local dev:** with no `GITHUB_TOKEN`, saves write straight to the files on disk.

Environment variables (see [`.env.example`](.env.example)):

| Variable | What it is |
| --- | --- |
| `ADMIN_PASSWORD` | Login password, 12+ characters |
| `ADMIN_SESSION_SECRET` | Cookie-signing secret, 32+ characters (`openssl rand -base64 48`) |
| `GITHUB_TOKEN` | Fine-grained token, this repo only, **Contents: Read and write** |
| `GITHUB_REPO` | `shreyashchandra/portfolio-website-shreyash` |
| `GITHUB_BRANCH` | `main` |

Without `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`, `/admin` stays disabled.

## Layout

```
app/          layout, global styles, favicon
components/   one file per section, plus small client hooks
content/      site.ts, the single source of content
legacy/       previous Vite site, kept for reference
```
