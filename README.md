# Sirsoft Basic Menu Reverse

An independent Gnuboard7 user template based on Sirsoft Basic, featuring customized board-menu placement and ordering.

## Overview

`sirsoft-basic_menu_reverse` is a Gnuboard7 user template derived from the structure and presentation of `sirsoft-basic`.

The template places board menu items immediately after **Home**, followed by **Popular** and **Shop**.

The resulting navigation structure is:

```text
Home → Board Menu → Popular → Shop
```

The template preserves the order of board items returned by the `sirsoft-board` board-menu API.

## Features

- Independent Gnuboard7 user template
- Based on the Sirsoft Basic template structure
- Board menu positioned immediately after Home
- Popular and Shop menus positioned after the board menu
- Desktop and mobile navigation support
- Production-ready compiled assets included in `dist/`
- Runtime vendor assets included for standalone deployment
- Source code and build configuration included

## Requirements

This template is intended for Gnuboard7 installations using the following extensions:

- `sirsoft-board`
- `sirsoft-ecommerce`
- `sirsoft-page`
- `sirsoft-daum_postcode`
- `glitter-board_menu_sort` (server-side board-menu ordering filter)

`sirsoft-basic` is used as a development reference and is not a runtime dependency of this template.

## Installation

Extract or copy the template directory into the Gnuboard7 bundled template source directory:

```text
templates/_bundled/sirsoft-basic_menu_reverse/
```

The directory should contain `template.json` at its root:

```text
templates/
└── _bundled/
    └── sirsoft-basic_menu_reverse/
        ├── dist/
        ├── layouts/
        ├── src/
        ├── template.json
        └── ...
```

Use the standard Gnuboard7 template installation and activation workflow for your environment.

## Board Menu Ordering

Board items are displayed in the order returned by the `sirsoft-board` board-menu API. The companion `glitter-board_menu_sort` plugin subscribes to the official `sirsoft-board.board.filter_menu_list_result` filter and sorts the already-authorized result without changing board models or cached data.

The plugin uses newest-created-first, with `id DESC` as a stable tie-breaker. This intentionally takes priority over the administrator's `display_order`; disabling the plugin restores the official administrator ordering.

For setup, policy, verification, and migration from the old repository edit, see:

**[by-latest-posts.md](./by-latest-posts.md)**

With the default policy, the navigation becomes:

```text
Home → Newest Board → Older Boards → Popular → Shop
```

The plugin acts on the API for all consumers, because the official hook does not identify the requesting template or screen. Both desktop and mobile header menus use the same authorized API result.

## Build

Install the Node.js dependencies using the included lock file:

```bash
npm ci
```

Create the production build:

```bash
npm run build
```

The production distribution files are generated under:

```text
dist/
```

The release archives include the compiled `dist/` assets, so rebuilding is not required when using a prepared release package.

## Documentation

### Newest Board First

[`by-latest-posts.md`](./by-latest-posts.md) documents the official filter plugin, its scope, verification, and migration from the former repository-edit instructions.

The guide includes:

- Target source file and method
- Original and modified queries
- Minimal source diff
- Official Filter Hook registration and sorting policy
- Authorization, cache, PC/mobile, and API consumer scope
- Verification and rollback guidance

## Release Package

Release archives are distributed in both ZIP and tar.gz formats:

```text
sirsoft-basic_menu_reverse-v1.0.1.zip
sirsoft-basic_menu_reverse-v1.0.1.tar.gz
```

Both archives contain `sirsoft-basic_menu_reverse/` as their top-level directory.

## License

See [LICENSE](./LICENSE) for license information.

## Author

[Glitter.kr](https://glitter.kr)
