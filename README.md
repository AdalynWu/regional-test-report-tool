# regional-test-report-tool

A browser-based tool for external / regional testers to fill in test cases and
export a self-contained HTML test report. Built with React + Vite + TypeScript.
No backend, no login, no Google Drive integration.

## Project Purpose

Testers in different regions open this tool (hosted on GitHub Pages), read the
test cases loaded from a CSV, record results (status, actual result, waiting
time, notes, screenshots), and download a single offline HTML report. The
report embeds all screenshots as base64 and carries its own CSS, so it can be
opened anywhere without this app. The tool does **not** upload anything — testers
save and share the report file themselves.

## Local Development

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check + production build into dist/
npm run lint     # ESLint
npm run preview  # preview the production build locally
```

The Vite `base` does not affect `npm run dev` — local dev always serves from `/`.

## CSV File Location

Place the test-case CSV at:

```
public/data/test-cases.csv
```

It is fetched at runtime from `${import.meta.env.BASE_URL}data/test-cases.csv`,
so it resolves correctly in both local dev (`/data/...`) and on GitHub Pages
(`/regional-test-report-tool/data/...`). The file is **not** bundled — replace it
any time without rebuilding the app (just refresh the page).

## CSV Format Requirements

The CSV is expected to be exported from the source Google Sheet. It is not a
plain one-row-per-case file:

- The parser scans for the **header row** whose first column is exactly `类别`.
  Everything before that row is ignored.
- Recognized header columns (matched after trimming):
  `类别`, `项目`, `测试规范与要求 Requirement`,
  `测试步骤与预期 Test Steps & Expection`, `NOTE`.
- Rows after the header become test cases. Empty `类别` / `项目` cells inherit
  the previous non-empty value (carry-forward). If still empty, they fall back to
  `未分类` / `未命名项目`.
- Fully blank rows and instructional rows (containing `测试前，请先确认`,
  `提供测试录影`, or `提供本次测试的 .har`) are skipped.
- A case is flagged as needing a screenshot when its requirement / steps / note
  mention `截图`, `截圖`, or `screenshot`.

If the `类别` header row is missing, the page shows a clear error. If the file
loads but yields zero cases, the page shows
`未解析到任何测试案例，请确认 CSV 格式是否正确`.

## Test Version Links

The "本次测试版本下载" section shows the Android APK / iOS download links for the
build under test. These are maintained by QA in:

```
src/config/testVersionLinks.ts
```

```ts
export const TEST_VERSION_LINKS: TestVersionLinks = {
  apk: "",   // Android APK download URL (http/https)
  ios: "",   // iOS download URL (http/https)
};
```

Notes:

- After changing these links, you must **rebuild and redeploy** (the values are
  baked into the build, not fetched at runtime). On GitHub Pages this happens
  automatically on the next push to `main`.
- Only `http://` / `https://` values render as clickable links. Empty values show
  "尚未設定 … 下载连结"; any other string is shown as plain text.
- Testers must **clear / uninstall the previous version** before downloading the
  new build, so stale caches don't affect test results.
- This tool does **not** download or install the App automatically — it only
  surfaces the version download links for testers to use.

## GitHub Pages Deployment

Deployment is automated via GitHub Actions (`.github/workflows/deploy.yml`):
on every push to `main`, it runs `npm ci && npm run build` and publishes `dist`
to GitHub Pages. No `gh-pages` package is used.

To enable it once:

> Repository **Settings → Pages → Source → GitHub Actions**

## Important: Vite base must match the repository name

`vite.config.ts` sets:

```ts
base: "/regional-test-report-tool/"
```

This **must** match the GitHub Pages repository path. The current repo is
`regional-test-report-tool`, so the base is `/regional-test-report-tool/`.

⚠️ **If this repository is renamed or moved (e.g. into a company QA repo), you
must update `base` in `vite.config.ts` to match the new name**, for example:

```ts
base: "/qa-test-report-tool/"
```

If `base` does not match the deployed path, assets (JS, CSS) and the
`data/test-cases.csv` fetch will return 404 on GitHub Pages.

## Tester Workflow

1. Confirm the correct App version is installed.
2. Open the tool page and read the usage instructions at the top.
3. Fill in Basic Info (tester, date, device, OS, location, app version, network).
4. Go through the test cases and record each result (status, actual result,
   waiting time, notes). Upload screenshots where needed — they are embedded into
   the final report.
5. Use **储存草稿** to save progress to the browser (localStorage); **载入草稿**
   restores it after a refresh.
6. When done, click **下载 HTML 报告**. If required basic info is missing or some
   cases are unfilled, you'll be asked to confirm — you can still download.
7. **Upload the downloaded HTML report to the designated Google Drive yourself.**
   The tool does not upload anything automatically.

## QA Review Workflow

1. Collect the HTML reports testers uploaded to the designated Drive.
2. Open each report in a browser (works offline).
3. Review the **完成度摘要** (source / load time / total / filled / unfilled /
   completion rate) and the per-case results.
4. Status badges are color-coded: Pass = green, Fail = red, Blocked = orange,
   Need Confirm = blue, Not Tested = gray.
5. Embedded screenshots and the network/DNS/Process-ID environment screenshots
   are visible inline; attachment links (recording / .har) are clickable when
   they are http(s) URLs.

## Known Limitations

- **No backend / no auto-upload.** Drafts live only in the current browser's
  localStorage; reports must be downloaded and shared manually.
- **No login / no access control.** Anyone with the page URL can use it.
- Draft data is per-browser and per-device; clearing site data removes it.
- Screenshots are stored as base64, so very large/numerous images make the draft
  and the downloaded HTML large.
- The CSV must follow the format above; arbitrary spreadsheets won't parse.
- `vite.config.ts` `base` is tied to the repo name and must be updated on rename.
