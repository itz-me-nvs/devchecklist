# Change Log

All notable changes to the "devchecklist" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-06-29
### New Features
- checklist edit option.
- Import csv and json files for tasks.

## Fixed
- task timer functionality changes.

## [0.0.2] - 2025-06-12
### Added
- Icon status indicator for checklist headers: ✅ (complete), 🟡 (in progress), ⬜ (empty)
- Custom SVG icon support for sub-items and status icons
- Live timer display for task items while timer is running
- Automatic progress calculation per header (percentage of completed items)
- Improved visuals for item states and date display

### Changed
- Refactored `getTreeItem` to conditionally apply `iconPath` based on `progressStatus`
- Cleaned up and improved readability of `ChecklistProvider` logic

### Fixed
- Timer was not resetting properly on stop — now handles intervals cleanly

## [0.0.1] - 2025-06-01
### Initial Release
- Add checklist headers and items
- Toggle item checked state
- Delete items and headers
