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

## Layout

```
app/          layout, global styles, favicon
components/   one file per section, plus small client hooks
content/      site.ts, the single source of content
legacy/       previous Vite site, kept for reference
```
