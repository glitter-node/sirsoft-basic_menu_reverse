# Changelog

## 1.0.1 - 2026-10-04

### Accessibility

- Added a main landmark to the primary content area.
- Corrected mobile locale selector ARIA semantics.
- Improved empty-state text contrast.
- Production Lighthouse Accessibility verification improved from 88 to 100.

### Performance

- Removed unused Font Awesome legacy compatibility assets.
- Replaced the monolithic Pretendard Variable font with the official Pretendard 1.3.9 Variable Dynamic Subset distribution.
- Preserved fully self-hosted font delivery with no runtime CDN dependency.
- Added reproducible Pretendard vendor generation support.
- Production Lighthouse Performance verification improved from 70 to 91.

## 1.0.0 - 2026-10-04

- Initial release of the independent `sirsoft-basic_menu_reverse` user template.
- Based on the Sirsoft Basic presentation while maintained as an independent template.
- Places board navigation immediately after Home while preserving the order returned by the board-menu API.
- Includes standalone source and distribution assets.
