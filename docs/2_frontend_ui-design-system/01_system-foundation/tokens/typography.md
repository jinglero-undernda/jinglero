# Design Tokens: Typography

## Status
- **Status**: current_implementation
- **Last Updated**: 2025-11-19
- **Last Validated**: 2025-11-19
- **Code Reference**: `frontend/src/styles/theme/variables.css:12-14`

## Overview

Typography scale and font specifications for the Jinglero design system. Uses system font stack for optimal performance and native feel.

## Typography Values

### Font Family
- **Value**: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif`
- **CSS Variable**: `--font-family`
- **Usage**: All text content
- **Code Reference**: `frontend/src/styles/theme/variables.css:12`

### Base Font Size
- **Value**: `16px`
- **CSS Variable**: `--font-size-base`
- **Usage**: Base font size for body text
- **Code Reference**: `frontend/src/styles/theme/variables.css:13`

### Base Line Height
- **Value**: `1.5`
- **CSS Variable**: `--line-height-base`
- **Usage**: Base line height for readable text
- **Code Reference**: `frontend/src/styles/theme/variables.css:14`

## Usage Guidelines

- Use `--font-family` for all text content to ensure consistent typography
- Use `--font-size-base` as the foundation for font sizing (use relative units like `em` or `rem` for scaling)
- Use `--line-height-base` for readable body text
- Maintain consistent typography hierarchy throughout the application

## Implementation

Typography values are defined as CSS variables in the theme:

```css
--font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
--font-size-base: 16px;
--line-height-base: 1.5;
```

## Change History

- 2025-11-19: Initial documentation of current implementation
