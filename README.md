# Library Management System

Console library system for managing book and student records.

This repository contains the original files from a supplied collection, preserved without changing the source code.

## Contents

- `BOOK.DAT`
- `STUDENT.DAT`
- `library-management-project-output.doc`
- `library-management-system-project.CPP`

## Build notes

### Compiler compatibility
This code uses legacy **Turbo C++ / DOS-specific** headers (for example, `<iostream.h>` or `<conio.h>`) and does **not** pass a modern GCC C++17 syntax check without migration. It is preserved as archived source code.

## Notes

- The `.DAT` files (where present) are historical sample records included with the source, **not** Git LFS requirements. Review their contents before making this repo public.
- `.doc` files (where present) are archived output screenshots/examples, not modern documentation.
- Original author/contributor names and historical metadata may appear in the supplied files. No new ownership or open-source license is claimed. Check redistribution rights before public release.
- Code is provided as-is. No claims of production security or cross-platform compatibility.


## Run the original C++ program in your browser

[Open interactive WebAssembly console](https://sharanyapal.github.io/cpp-library-management-system/) — the C++ source runs inside your web browser, not as a JavaScript rewrite. Browser adapters are under `web/` and the original source files remain unchanged.

GitHub Actions builds and publishes the page after every push to main. Enable it under **Settings → Pages → Build and deployment → GitHub Actions**. Data files are temporary for each page session.
