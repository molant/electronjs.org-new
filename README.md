# electronjs.org-new

This repository contains the code for the new electronsjs.org website. It is built using
[Docusaurus 2](https://v2.docusaurus.io/), a modern static website generator.

## Installation

```console
yarn install
```

## Local Development

If you want to use the contents from [`electron/electron`](https://github.com/electron/electron)
run the following:

```console
yarn prebuid
yarn start
```

If you want the website to pick your local documentation, run:

```console
yarn prebuild ../relative/path/to/local/electron/repo
yarn start
```

For example, if you have the following structure:

```
└── projects
     ├─ electron
     ├─ electronjs.org-new
     ├─ ...
```

and assuming your prompt is in `/projects/electronjs.org-new/` you will have to run:

```console
yarn prebuild ../electron
yarn start
```

`yarn start` starts a local development server and open up a browser window. Most changes are reflected live without having to restart the server.

# Repository content organization

This repository contains the code for 3 related things:

- The code to generate the contents of https://beta.electronjs.org
- [`create-electron-documentation`][ced] package
- The webhook that receives updates from `electron/electron` and
  sends a `repository_dispatch` to trigger GitHub actions.

The content of this repository is organized as follows:

```
└─ root
    |
    ├─ .github/workflows → The definitions for the GitHub actions
    |
    ├─ webhook → The webhook server responsible of triggering
    |        GitHub actions
    |
    ├─ create-electron-documentation → Code for the npm package
    |        of the same name. Read the readme in the folder
    |        for more information.
    |
    ├─ scripts → The code for the package.json tasks and GitHub
    |        actions
    |
    ├─ spec → Tests for the scripts
    |
    ├─ src → Docusaurus code
    |
    ├─ static → Docusaurus static assets
```

[ced]: https://npmjs.com/package/create-electron-documentation
