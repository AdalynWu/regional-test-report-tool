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

The CSV is exported from the source Google Sheet, so it is **not** a plain
one-row-per-case file. Read this section before editing
`public/data/test-cases.csv`.

### File basics

- Encoding **UTF-8**, comma-separated.
- A cell that contains a comma, a double quote, or a line break **must be wrapped
  in double quotes** `"…"`. To put a literal `"` inside a quoted cell, double it
  (`""`). Multi-line cells (e.g. numbered steps) rely on this — see "Line breaks".
- Anything above the header row is ignored, so the preamble blocks (版本下载 /
  基础资讯 / 环境检测 …) can stay in the sheet without affecting parsing.

### The header row (required)

The parser scans for the **header row whose first cell is exactly `类别`**
(trimmed). If no such row exists the page shows an error and no cases load.
**Column order matters** — the first four columns are read by position:

| Column | Position | Meaning | Required |
|--------|----------|---------|----------|
| 类别 | 1 | category (group title) | yes (this anchors the header) |
| 项目 | 2 | item (article title) | yes |
| 测试规范与要求 (Requirement) | 3 | requirement | yes |
| 测试步骤与预期 (Test Steps & Expection) | 4 | test step + expected | yes |
| NOTE | last | per-case note | optional |

Notes:
- Columns 1–4 are taken by **position** (1st–4th column). The Requirement / Steps
  header text may vary slightly (e.g. with or without parentheses) — keep them in
  this order regardless.
- `NOTE` is matched by its header name; if absent, note is simply empty.
- Any extra columns between Steps and NOTE (e.g. `Android 测试结果 01`,
  `iOS 等待时间 01` …) are **ignored** by the tool — testers fill results inside
  the app, not in the CSV.

### How rows become cases

Each data row (below the header) becomes one test case = one **Step**, with these
rules:

1. **类别 carry-forward** — blank 类别 inherits the previous row's 类别.
2. **项目 carry-forward** — blank 项目 inherits the previous row's 项目.
3. **Requirement carry-forward** — a merged Requirement cell in the sheet exports
   as blank on the following rows. A blank Requirement is inherited **only when the
   row is a continuation of the same article** (same 类别 **and** same 项目 as the
   previous row). When 项目 changes (a new item) with a blank Requirement, it does
   **not** inherit — that new item simply has no requirement.
4. Empty 类别 falls back to `未分类`; empty 项目 falls back to `未命名项目`.

### Article grouping (one card, multiple Steps)

Consecutive rows that share the **same 类别 + 项目 + Requirement** are grouped into
one card ("article"). The shared 项目 (title) and Requirement are shown once, and
each row appears as `Step 1`, `Step 2`, … each with its own result form. A
single-row article shows no "Step" tag.

This is how you author a multi-step case: put 类别 / 项目 / Requirement on the
first row, then leave 类别 / 项目 / Requirement **blank** on the following rows and
only fill the Steps column:

```
直播间,加载效能,"事后回看影片计时，记录四个时间点",从「点击进入直播间」开始计算…
,,,从「讯号连结中」开始计算…
,,,从「player loading」开始计算…
```

### Skipped rows

A row is ignored (not turned into a case) when:
- it is completely blank, or
- it contains any of these instruction phrases: `测试前，请先确认`,
  `提供测试录影`, `提供本次测试的 .har`, or
- it has no content of its own (its **own** Requirement cell, Steps cell, and NOTE
  are all empty — inherited Requirement does not count).

### Line breaks inside a cell

To show multiple lines (e.g. numbered steps) wrap the whole cell in double quotes
and press Enter for each line:

```
,加载效能,"事后回看影片计时，记录四个时间点","1. 点击「直播」图标进入直播分页
2. 点击随机一个免付费直播间
3. 确认是否准确进入对应点击的主播直播间"
```

Line breaks are preserved (rendered with `white-space: pre-wrap`) in both the app
and the downloaded report.

To break an existing single-line cell, just wrap that one cell in quotes and add
the line breaks — the other cells are unchanged. **Any trailing columns (e.g. the
`Android 测试结果 01` / `iOS 等待时间 01` result columns) must come after the
closing quote.** For example, turning one Steps cell into two lines:

```
Landing Page, Process ID,"{red}开始全程录影直至结束{/red}","打开App，截图本次测试 Process ID 后，
直接点击 Frontend Domain Input 弹窗的 Confirm 按钮进入主画面",,-,,-,,-,
```

A half-quoted cell is the most common mistake: if you open `"` but forget the
closing `"`, the parser keeps reading into later rows and the whole block breaks.

### Simplified Chinese only

Author content in **Simplified Chinese** (简体中文), not Traditional — keep it
consistent with the rest of the sheet (e.g. 测试 not 測試, 关闭 not 關閉, 录影 not
錄影, 档案 not 檔案).

### Highlighting words red

Inside a test-case cell (项目 / 测试规范与要求 / 测试步骤与预期), wrap text in
`{red}…{/red}` to show it red in both the app and the downloaded HTML report —
e.g. `请务必{red}先下载 .har{/red}再关闭 App`. Markers can span multiple lines;
unmatched markers (no closing tag) are shown literally as typed.

### Screenshot hint

A case is flagged with「此项目可能需要上传截图」when its Requirement / Steps / NOTE
mention `截图`, `截圖`, or `screenshot`.

### Error states

- Missing `类别` header row → the page shows a clear error.
- File loads but yields zero cases → the page shows
  `未解析到任何测试案例，请确认 CSV 格式是否正确`.

### Minimal example

A complete, valid file. The first line is preamble (ignored because its first
cell is not `类别`); `登录验证` is a single-step case; `加载效能` is one article
with two Steps (row 2 leaves 类别/项目/Requirement blank to continue it); the last
row is a new item that triggers the screenshot hint.

```csv
本表说明（会被忽略）,,,,
类别,项目,测试规范与要求 (Requirement),测试步骤与预期 (Test Steps & Expection),NOTE
登录,登录验证,输入帐号密码并通过验证,成功登录后进入主页,
直播间,加载效能,"事后回看影片计时，记录以下时间点
{red}请将耗时填入等待时间栏位{/red}",从「点击进入直播间」开始计算，到出现「讯号连结中」,
,,,从「讯号连结中」开始计算，到出现「player loading」,
直播间,回报问题,需上传 screenshot 证明,于直播间点击回报问题并截图,留意弹窗
```

Renders as: a 登录 group with one card; a 直播间 group containing the 加载效能
card (Requirement shown once, with a red line, plus Step 1 / Step 2) and the
回报问题 card (single step, with the「此项目可能需要上传截图」hint).

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
