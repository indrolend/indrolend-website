# external — Third-Party Pack Intake

This directory is the **only** approved intake location for third-party code,
libraries, and vendor archives before they are vetted and internalized.

---

## Why this folder exists

Dropping vendor archives (`.tgz`, `.zip`, `.tar.gz`) directly into `js/spa/` or
`legacy/` makes it impossible to track provenance, licenses, or update history.
`external/` provides a staging area where a pack can be inspected before it is
committed to the runtime.

---

## Intake workflow

1. **Create a folder** named after the pack: `external/<pack-name>/`

2. **Add `SOURCE.md`** — upstream provenance:
   ```markdown
   # Source: <pack-name>

   - Upstream URL: https://...
   - Version / commit / tag: vX.Y.Z or git sha
   - License: MIT / Apache-2.0 / etc.
   - Downloaded: YYYY-MM-DD
   ```

3. **Add `PACK.md`** — internalization plan:
   ```markdown
   # Pack: <pack-name>

   - Type: library / font / icon-set / audio / other
   - Status: intake | under-review | approved | rejected
   - Planned destination: assets/ | js/spa/ | (other)
   - MVP uses: brief description of how it will be used
   - Notes: any concerns (size, license compatibility, etc.)
   ```

4. **Place the raw archive or files** inside the folder alongside the two docs.

5. **Open a PR** for review. Reviewer checks license, size, and plan before approving.

6. **After approval**, copy/move the files to their planned destination (`assets/`
   for static files, `js/spa/` for runtime modules). Remove the raw archive.
   The `SOURCE.md` and `PACK.md` may remain as a record, or the whole folder
   may be deleted once the files are integrated.

---

## Rules

- **Do not** place vendor archives in `js/spa/`, `legacy/`, or the repo root.
- **Do not** commit `node_modules/` — use `package.json` and `npm install`.
- **Do not** unzip archives at runtime — pre-extract and commit only the needed files.
- One pack per subfolder. Do not mix multiple libraries in the same folder.
