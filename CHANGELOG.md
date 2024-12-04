# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.11.1] - 2024-12-04

### Fixed
- Fix dependency vulnerabilities

## [0.11.0] - 2024-11-27

- New `GET_METADATA` command

## [0.10.3] - 2024-10-10

### Changed
- Migrate to CI/CDv2

## [0.10.2] - 2024-05-31

## [0.10.1] - 2024-04-02

### Fixed

- Fix dependency vulnerabilities

## [0.10.0] - 2024-01-25

### Added
- Public `userSettings` property with current theme preference
- New event `USER_SETTINGS_CHANGE` to detect an update of `userSettings` on the change

## [0.9.1-rc.0] - 2023-12-14

## [0.9.0] - 2023-05-22

### Fixed
- Add missing View and VisibilityEventInvoker for umd default export

## [0.8.0] - 2023-05-04

### Added
- UMD version to build output
- Instructions how to initialize without a bundler

## [0.7.1] - 2023-03-29

### Updated

- Updated readme regarding `PAGE_VISIBILITY_STATE` event

## [0.7.0] - 2023-03-28

### Added

- New event `PAGE_VISIBILITY_STATE` to detect if Custom UI is in the visible browser tab

## [0.6.1] - 2023-01-10

- Document `RESIZE` command constraints for floating windows

## [0.6.0] - 2022-11-25

- New `SET_FOCUS_MODE` command

## [0.5.0] - 2022-11-17

- New `SET_NOTIFICATION` command

## [0.4.0] - 2022-10-31

### Added

- `SHOW_FLOATING_WINDOW` and `HIDE_FLOATING_WINDOW` commands

### Updated

- `Event.VISIBILITY` for floating windows will receive `context` property

## [0.3.0] - 2022-10-17

- New type `ACTIVITY` for `OPEN_MODAL` command

## [0.2.0] - 2022-10-13

- New `REDIRECT_TO` command

## [0.1.0] - 2022-05-30

- Rename `Surface` to `Custom UI`
- New event `CLOSE_CUSTOM_MODAL` for listening the updates from custom modal
- Rename `Modal` type `EMBEDDED_ACTION` to `JSON_MODAL`
- Rename `Modal` type `CUSTOM_SURFACE` to `CUSTOM_MODAL`
- New type `CUSTOM_SURFACE` for `OPEN_MODAL` command
- New `CLOSE_MODAL` command
- Rename FOCUS tracking event
- Detect page focus and blur
- Add initialization command and method
- Add new command - get signed token
- Add new command - open modal. Supported modals are: deal, organization, person and embedded action.
- Add new command - resize surface
- Add new command - show confirmation modal
- Add new command - show snackbar
- Add event listener functionality
- Add option to listen for panel collapse and expand event
- Add surface unique id detection and pass it to postMessage invocations
