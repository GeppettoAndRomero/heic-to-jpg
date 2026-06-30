# Third-party notices

The source code in this repository is licensed under the [MIT License](./LICENSE).
It depends on the following third-party component, which is distributed under a
different (weak-copyleft) license. That component keeps its own license; only its
attribution and the rights it grants you are recorded here.

## libheif-js — LGPL-3.0

- **Package:** [`libheif-js`](https://www.npmjs.com/package/libheif-js) **1.19.8**
- **License:** **LGPL-3.0** (the rest of this application is MIT)
- **Upstream:** [libheif](https://github.com/strukturag/libheif) — the reference C/C++
  library for reading HEIF/HEIC, compiled to WebAssembly and published as `libheif-js`.
- **What it does here:** decodes HEIC/HEIF images to raw pixels, inside a Web Worker.
- **Modifications:** none. The library is used **unmodified**, as an npm dependency.

### Your rights under the LGPL

You may use a **modified version of libheif** in place of the one shipped here, and the
LGPL guarantees you can do so. Because this entire application is open source and the
`libheif-js` version is pinned in `package.json`, you can exercise that right by:

1. forking this repository,
2. replacing or modifying the `libheif-js` dependency (or rebuilding libheif from its
   [upstream source](https://github.com/strukturag/libheif)),
3. running `npm install && npm run build`.

The resulting build links your modified library. Providing the application in this
recombinable, open-source form is how this project satisfies **LGPL-3.0 §4** (Combined
Works).

The full text of the GNU **LGPL-3.0** and **GPL-3.0** is available at
<https://www.gnu.org/licenses/lgpl-3.0.html> and <https://www.gnu.org/licenses/gpl-3.0.html>,
and is included within the `libheif-js` package.

> Note on packaging: this build currently inlines the libheif WebAssembly module
> (base64) into the JavaScript bundle rather than shipping it as a separate `.wasm`
> file. LGPL compliance is met through the open-source recombination route above; a
> future change may switch to an external `.wasm` asset (see `handbook/LICENSE-AUDIT.md`).
