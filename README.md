## App extensions SDK

This SDK provides interactivity between custom UI extensions and Pipedrive.

Learn more about custom UI extensions from [Developer documentation](https://pipedrive.readme.io/docs/custom-ui-extensions).

`npm install --save @pipedrive/app-extensions-sdk`

## Table of contents

- [Overview](#overview)
- [Setup](#setup)
  - [Prerequisites](#prerequisites)
  - [Install](#install)
  - [Initialization](#initialization)
  - [Without module bundler](#without-module-bundler)
  - [User settings](#user-settings)
  - [Building from source](#building-from-source)
  - [Common pitfalls](#common-pitfalls)
- [Testing](#testing)
  - [Unit tests](#unit-tests)
  - [Coverage](#coverage)
  - [Linting and formatting](#linting-and-formatting)
  - [Troubleshooting](#troubleshooting)
- [Architecture](#architecture)
  - [Directory layout](#directory-layout)
  - [Stack](#stack)
  - [Communication flow](#communication-flow)
  - [CI/CD](#cicd)
- [Endpoints (Commands & Events)](#endpoints-commands--events)
  - [Commands](#commands)
    - [Show snackbar](#show-snackbar)
    - [Show confirmation dialog](#show-confirmation-dialog)
    - [Resize](#resize)
    - [Get signed token](#get-signed-token)
    - [Open modal](#open-modal)
    - [Close modal](#close-modal)
    - [Redirect to](#redirect-to)
    - [Show floating window](#show-floating-window)
    - [Hide floating window](#hide-floating-window)
    - [Set notification](#set-notification)
    - [Set focus mode](#set-focus-mode)
    - [Get metadata](#get-metadata)
  - [Events](#events)
    - [Visibility](#visibility)
    - [Close custom modal](#close-custom-modal)
    - [User settings change](#user-settings-change)
    - [Page visibility state](#page-visibility-state)
- [References/Links](#referenceslinks)

## Overview

`@pipedrive/app-extensions-sdk` is a small client-side TypeScript library that runs inside the iframe of a
Pipedrive custom UI extension (panel, modal, or floating window). It lets that extension talk to the parent
Pipedrive window — issuing **commands** (resize, open a modal, show a snackbar, redirect, etc.) and subscribing
to **events** (visibility changes, user settings changes, page visibility state). There is no server component;
the entire implementation lives under [`src/`](./src) and ships as a plain npm package.

## Setup

### Prerequisites

- Node.js `>=22` and npm `>=8` (enforced via `devEngines` in `package.json`). `.nvmrc` pins Node `24` for local
  development.
- These prerequisites only matter if you're building/contributing to this SDK itself. Consumers who just install
  the published package via npm or the CDN don't need to match this Node version.

### Install

```
npm install --save @pipedrive/app-extensions-sdk
```

### Initialization

In order to display a custom UI extension to a user, this SDK has to be initialized.
In the iframe request, query `id` attribute is passed, which has to be provided to the SDK constructor.
The SDK will try to read it from the URL query. If the URL is modified (e.g. with redirects), then it has to be passed manually.

```javascript
import AppExtensionsSDK from '@pipedrive/app-extensions-sdk';

// SDK detects identifier from URL and uses default custom UI size
const sdk = await new AppExtensionsSDK().initialize();

// Pass in id manually and provide custom UI size
const sdk = await new AppExtensionsSDK({ identifier: '123abc' })
  .initialize({ size: { height: 500 } });
```

### Without module bundler

Initialization without a module bundler is possible by adding the following script to your HTML page from jsDelivr CDN:

```HTML
<head>
  <script src="https://cdn.jsdelivr.net/npm/@pipedrive/app-extensions-sdk@0/dist/index.umd.js"></script>
</head>
```

NB: Pay attention to the package version in the URL - `app-extensions-sdk@0`. While you can also use version range,
ensure you do not omit the version completely in production. This is to avoid any issues.

After this, the global `AppExtensionsSDK` will be available. Initialization can be then done the same way below in the HTML body:

```HTML
<body>
  <script>
    (async function() {
      const sdk = await new AppExtensionsSDK().initialize();
    })();
  </script>
</body>
```

### User settings

Contains an object with user settings, such as theme interface preference, and is accessible directly as a property of an instance of `AppExtensionsSDK`.

**Properties**

| Parameter  | Type   | Description                                                                                    |
|------------| ------ |------------------------------------------------------------------------------------------------|
| theme      | String | Selected theme interface preference. Possible values:<br/><ul><li>light</li><li>dark</li></ul> |

#### Example

`sdk.userSettings.theme` can be used to set `data-theme` attribute to `html` tag of the iframe page with specific CSS for different themes.

```css
[data-theme="dark"] body {
    // custom CSS for dark theme
}
```

```javascript
import AppExtensionsSDK from '@pipedrive/app-extensions-sdk';

const sdk = new AppExtensionsSDK();

document.documentElement.setAttribute('data-theme', sdk.userSettings.theme);

await sdk.initialize();
```

See also [User settings change](#user-settings-change) event to implement an immediate update of styles in case of user preference change.

### Building from source

Only needed if you're contributing to this SDK, not for consuming the published package.

```
git clone git@github.com:pipedrive/app-extensions-sdk.git
cd app-extensions-sdk
npm install
npm run build   # compiles src/ with Rollup into dist/ (CJS dist/index.js + UMD dist/index.umd.js)
npm run watch   # same, but in Rollup watch mode while you iterate
```

A Husky `pre-commit` hook automatically runs `npm run format && npm run lint` on every commit — see
[Linting and formatting](#linting-and-formatting).

### Common pitfalls

- **`execute()` throws `SDK is not initialized`** — you must `await sdk.initialize()` before calling
  `sdk.execute(...)`.
- **Constructor throws `Missing custom UI identifier`** — the SDK could not read `?id=` from the URL and no
  `identifier` was passed manually. This typically happens after a redirect that strips query params; pass
  `identifier` explicitly in that case (see [Initialization](#initialization)).
- **CDN version pinning** — never omit the version in the jsDelivr URL in production (e.g. use
  `@pipedrive/app-extensions-sdk@0`, not an unpinned path); see [Without module bundler](#without-module-bundler).
- **Pre-commit hook** — `npm run format && npm run lint` runs automatically via Husky; don't bypass it with
  `--no-verify`.
- **`npm run watch:sync`** invokes an external `npm-utils` CLI that isn't listed in this repo's
  `devDependencies` — **Needs verification** (assumed to be internal Pipedrive tooling not available to external
  contributors; safe to ignore `watch:sync` for regular `build`/`watch` workflows).

## Testing

### Unit tests

Jest is configured (`jest.config.js`) with a `jsdom` test environment. New tests belong in a `__tests__/`
directory colocated with the code under test (e.g. `src/__tests__/index.test.ts`) — `testRegex` only picks up
`__tests__/*.test.[tj]s`, not colocated `*.test.ts` files next to source.

```
npm test
```

This runs `jest --passWithNoTests`. **Needs verification / heads-up:** there are currently no test files in
`src/`, so this command passes trivially (exit code 0) with zero tests executed — it does not yet verify any
actual behavior.

There is no separate functional/e2e test suite in this repository — the only testing harness currently
configured is the Jest unit-test setup described above.

### Coverage

```
npm run coverage
```

Runs `npm test -- --coverage`. Coverage thresholds in `jest.config.js` are currently all set to `0`, so nothing
is enforced yet — add real thresholds once test coverage exists.

### Linting and formatting

```
npm run lint     # tsc --noEmit, then ESLint over **/*.{js,jsx,ts,tsx}
npm run format   # Prettier --write, then eslint --fix
```

These are the effective correctness gate today (in place of enforced test coverage) and also run automatically
on every commit via the Husky `pre-commit` hook.

### Troubleshooting

- `npm test` reporting success with "no tests found" is expected until test files are added under a
  `__tests__/` directory — it is not a false positive, it's the `--passWithNoTests` flag doing its job.
- If a new test file isn't picked up by Jest, check it matches `__tests__/*.test.ts` (or `.js`), per
  `testRegex` in `jest.config.js`.
- Lint failures on commit come from the Husky `pre-commit` hook running `npm run format && npm run lint`; run
  those two commands locally to reproduce and fix before committing.

## Architecture

### Directory layout

```
src/
  index.ts   — AppExtensionsSDK class: postMessage()/execute() for commands, listen() for events
  types.ts   — Command/Event enums and the Args<T>/CommandResponse<T> mapped types (protocol source of truth)
  utils.ts   — DOM-dependent helpers: detectIdentifier, detectUserSettings, detectIframeFocus
  umd.ts     — separate Rollup entry point exporting AppExtensionsSDK with enums as static properties (for <script> tag usage)
dist/        — build output (CJS dist/index.js, UMD dist/index.umd.js) — generated, not committed source
```

### Stack

- **TypeScript**, compiled via Rollup (`rollup.config.mjs`) using `@rollup/plugin-typescript`.
- Two build outputs: CJS (`dist/index.js`) and UMD (`dist/index.umd.js`, minified with `@rollup/plugin-terser`)
  for `<script>`-tag consumers.
- **Jest** + `jest-environment-jsdom` for unit tests (see [Testing](#testing)).
- **ESLint** + **Prettier** for linting/formatting, enforced locally via a **Husky** `pre-commit` hook.
- No server component and no runtime dependencies beyond the browser's own `postMessage`/`MessageChannel` and
  `document.visibilitychange` APIs — this is purely a client-side library.

### Communication flow

The SDK never talks to a backend directly; it talks to the parent Pipedrive window that's hosting the
extension's iframe:

- **Commands** (`sdk.execute(Command.X, ...)`) — `postMessage()` opens a `MessageChannel`, posts
  `{ payload, id: identifier }` to the parent window (`window.parent` by default), and resolves/rejects the
  returned promise based on the response received on `channel.port1`.
- **Events** (`sdk.listen(Event.X, cb)`) — for most events, `listen()` sets up a `MessageChannel`-based
  subscription with the parent window (e.g. `USER_SETTINGS_CHANGE`, which also updates `sdk.userSettings` as a
  side effect). `PAGE_VISIBILITY_STATE` is the one exception: it's backed by a native
  `document.visibilitychange` listener and never leaves the iframe.
- Every `Command`/`Event` is a discriminated union keyed off the enums in `src/types.ts`, so the wire protocol
  is defined in one place and changes there surface as type errors everywhere else that needs updating.

### CI/CD

- `.github/workflows/on-commit.yml` — runs `npm install` + `npm run lint` on every PR targeting `master`.
- `.github/workflows/cicd_npm-publish.yml` — publishes to npm (via OIDC Trusted Publisher) when a PR is labeled
  `npm-ready-for-publish`.

## Endpoints (Commands & Events)

This SDK has no HTTP endpoints — its public API surface is the set of **Commands** you invoke with
`sdk.execute()` and **Events** you subscribe to with `sdk.listen()`, both exchanged with the parent window over
`postMessage` (see [Communication flow](#communication-flow)). This section documents each one — think of a
Command as a "route" (its purpose, parameters, and response), and note [Get signed token](#get-signed-token) for
the one built-in authentication-related capability.

### Commands

Commands can be invoked with the `execute` method. On successful command execution, promise
resolves. On error, it rejects.

```javascript
sdk.execute(/* ... */)
  .then((data) => {
    // handle data
  })
  .catch((err) => {
    // handle error
  });

try {
  const data = await sdk.execute(/* ... */);
} catch (err) {
  // handle error
}
```

#### Show snackbar

Shows snackbar with provided message and link

**Parameters**

| Parameter  | Type   | Description                          | Notes    |
| ---------- | ------ | ------------------------------------ | -------- |
| message    | String | Message displayed in snackbar        | required |
| link       | Object | Link displayed next to the message   | optional |
| link.url   | string | URL for link displayed in snackbar   | required |
| link.label | string | Label for link displayed in snackbar | required |

**Example**

```javascript
await sdk.execute(Command.SHOW_SNACKBAR, {
  message: 'Action completed',
  link: {
    url: 'https://app.pipedrive.com',
    label: 'View',
  },
});
```

#### Show confirmation dialog

Shows confirmation dialog with provided title and description

**Parameters**

| Parameter   | Type   | Description                             | Notes                                                                                                                                          |
| ----------- | ------ | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| title       | String |                                         | required                                                                                                                                       |
| description | String | Longer description of what is confirmed | optional                                                                                                                                       |
| okText      | String | Confirm button text                     | optional, default is "OK"                                                                                                                      |
| cancelText  | String | Cancel button text                      | optional, default is "Cancel"                                                                                                                  |
| okColor     | Color  | Color of the confirmation button        | optional, default is Color.NEGATIVE.<br/><br/>Available colors:<br/>Color.PRIMARY (green)<br/>Color.SECONDARY (white)<br/>Color.NEGATIVE (red) |

**Response**

| Parameter | Type    | Description            | Notes |
| --------- | ------- | ---------------------- | ----- |
| confirmed | Boolean | Result of confirmation |       |

**Example**

```javascript
const { confirmed } = await sdk.execute(Command.SHOW_CONFIRMATION, {
  title: 'Confirm',
  description: 'Are you sure you want to complete this action?',
});
```

#### Resize

Resizes custom UI extension with provided height and width

**Custom panel** - only height can be changed and the value must be between 100px and 750px.

**Custom modal** - both height and width can be changed. The minimum height is 120px and the minimum width is 320px . The maximum height and width are
limited to the user's browser dimensions.

**Custom floating window** - both height and width can be changed. The minimum height is 70px and the maximum height is 700px.
The minimum width is 200px and the maximum width is 800px.

**Parameters**

| Parameter | Type   | Description                       | Notes    |
| --------- | ------ |-----------------------------------| -------- |
| height    | Number | Height of the custom UI extension | optional |
| width     | Number | Width of the custom UI extension  | optional |

**Example**

```javascript
await sdk.execute(Command.RESIZE, { height: 500 });
```

#### Get signed token

A new JSON Web Token (JWT) that is valid for 5 minutes will be generated. It can be verified using
the JWT secret which you can add from Marketplace Manager when configuring a custom UI extension. If it's not
specified, use app's client secret instead. JWT contains Pipedrive user and company ids.

JWT can be used to ensure that the custom UI extension is loaded by Pipedrive. It can be passed to your API
requests and be verified on the server side. As JWT expires in 5 minutes, you can use this command
to get a new one.

If the previously issued token for the extension hasn't expired yet, calling this command again
returns that same cached token instead of generating a new one. This means calling it repeatedly
in a short time span is safe and won't produce a different token each time.

**Response**

| Parameter | Type   | Description | Notes |
| --------- | ------ | ----------- | ----- |
| token     | String |             |       |

**Example**

```javascript
const { token } = await sdk.execute(Command.GET_SIGNED_TOKEN);
```

#### Open modal

Opens a [JSON modal](#json-modal), [custom modal](#custom-modal) or a new
Pipedrive [Deal](#new-deal-modal), [Organization](#new-organization-modal),
[Person](#new-person-modal) or [Activity](#new-activity-modal) modal

##### JSON modal action

**Parameters for JSON modal**

| Parameter | Type   | Description                  | Notes    |
| --------- | ------ | ---------------------------- | -------- |
| type      | Modal  |                              | required |
| action_id | String | JSON modal action id or name | required |

**Response**

| Parameter | Type   | Description                                | Notes |
| --------- | ------ | ------------------------------------------ | ----- |
| status    | String | Indicates if modal was submitted or closed |       |

**Example**

```javascript
const { status } = await sdk.execute(Command.OPEN_MODAL, {
  type: Modal.JSON_MODAL,
  action_id: 'Open settings',
});
```

##### Custom modal

**Parameters for custom modal**

| Parameter | Type   | Description                                                                                                                               | Notes    |
| --------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| type      | Modal  |                                                                                                                                           | required |
| action_id | String | Custom modal id or name                                                                                                                   | required |
| data      | Object | Object to be passed as stringified JSON to iframe, should be used with caution taking into account the maximum length of HTTP GET request | optional |

**Response**

| Parameter | Type   | Description                                | Notes |
| --------- | ------ | ------------------------------------------ | ----- |
| status    | String | Indicates if modal was submitted or closed |       |

**Example**

```javascript
const { status } = await sdk.execute(Command.OPEN_MODAL, {
  type: Modal.CUSTOM_MODAL,
  action_id: 'Open settings',
  data: {
    item: 'xyz',
  },
});
```

##### New deal modal

**Parameters for new deal modal**

| Parameter            | Type   | Description                                | Notes    |
| -------------------- | ------ | ------------------------------------------ | -------- |
| type                 | Modal  |                                            | required |
| prefill              | Object | Object to prefill some deal modal fields   | optional |
| prefill.title        | String | Deal title                                 | optional |
| prefill.organization | String | Organization name to whom the deal belongs | optional |
| prefill.person       | String | Person name to whom the deal belongs       | optional |

**Response**

| Parameter | Type   | Description                                | Notes    |
| --------- | ------ | ------------------------------------------ | -------- |
| status    | String | Indicates if modal was submitted or closed |          |
| id        | Number | ID of created deal if it was submitted     | optional |

**Example**

```javascript
const { status, id } = await sdk.execute(Command.OPEN_MODAL, {
  type: Modal.DEAL,
  prefill: {
    title: 'Important deal',
  },
});
```

##### New person modal

**Parameters for new person modal**

| Parameter            | Type   | Description                                    | Notes    |
| -------------------- | ------ | ---------------------------------------------- | -------- |
| type                 | Modal  |                                                | required |
| prefill              | Object | Object to prefill some new person modal fields | optional |
| prefill.name         | String | Person name                                    | optional |
| prefill.organization | String | Organization name to whom the person belongs   | optional |

**Response**

| Parameter | Type   | Description                                | Notes    |
| --------- | ------ | ------------------------------------------ | -------- |
| status    | String | Indicates if modal was submitted or closed |          |
| id        | Number | ID of added person if it was submitted     | optional |

**Example**

```javascript
const { status, id } = await sdk.execute(Command.OPEN_MODAL, {
  type: Modal.PERSON,
  prefill: {
    name: 'Some name',
    organization: 'Some organization',
  },
});
```

##### New organization modal

**Parameters for new organization modal**

| Parameter    | Type   | Description                                          | Notes    |
| ------------ | ------ | ---------------------------------------------------- | -------- |
| type         | Modal  |                                                      | required |
| prefill      | Object | Object to prefill some new organization modal fields | optional |
| prefill.name | String | Organization name                                    | optional |

**Response**

| Parameter | Type   | Description                                  | Notes    |
| --------- | ------ | -------------------------------------------- | -------- |
| status    | String | Indicates if modal was submitted or closed   |          |
| id        | Number | ID of added organization if it was submitted | optional |

**Example**

```javascript
const { status, id } = await sdk.execute(Command.OPEN_MODAL, {
  type: Modal.ORGANIZATION,
  prefill: {
    name: 'Some organization',
  },
});
```

##### New activity modal

**Parameters for new activity modal**

| Parameter            | Type   | Description                                                                | Notes    |
| -------------------- | ------ | -------------------------------------------------------------------------- | -------- |
| type                 | Modal  |                                                                            | required |
| prefill              | Object | Object to prefill some new activity modal fields                           | optional |
| prefill.subject      | String | Activity subject                                                           | optional |
| prefill.dueDate      | String | Activity due date in yyyy-MM-dd format (UTC)                               | optional |
| prefill.dueTime      | String | Activity due time in HH:mm format                                          | optional |
| prefill.duration     | String | Activity duration in HH:mm format                                          | optional |
| prefill.note         | String | Note, supports formatting with HTML `ul, li, b, u, i` tags                 | optional |
| prefill.description  | String | Activity description, supports formatting with HTML `ul, li, b, u, i` tags | optional |
| prefill.deal         | Number | Deal id that will be connected to the activity                             | optional |
| prefill.organization | Number | Organization id that will be connected to the activity                     | optional |

**Response**

| Parameter | Type   | Description                                | Notes    |
| --------- | ------ | ------------------------------------------ | -------- |
| status    | String | Indicates if modal was submitted or closed |          |
| id        | Number | ID of added activity if it was submitted   | optional |

**Example**

```javascript
const { status, id } = await sdk.execute(Command.OPEN_MODAL, {
  type: Modal.ACTIVITY,
  prefill: {
    subject: 'Follow-up phone call',
    dueDate: '2022-12-18',
    dueTime: '13:00',
    duration: '00:30',
    note: 'Ask about <b>deal next steps</b>',
    description: 'Discussion about deal specifics',
    deal: 10,
    organization: 2,
  },
});
```

#### Close modal

Closes an active modal window; applicable only for **custom modal**.

**Example**

```javascript
await sdk.execute(Command.CLOSE_MODAL);
```

#### Redirect to

Redirects user to specified view.

**Parameters**

| Parameter | Type          | Description                                                                                                                                           | Notes                                                                                                                                                                                                                                                             |
|-----------| ------------- |-------------------------------------------------------------------------------------------------------------------------------------------------------| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| view      | View          | View where the user will be redirected to                                                                                                             | required<br/><br/>Supported views:<br/>View.DEALS<br/>View.LEADS<br/>View.ORGANIZATIONS<br/>View.CONTACTS<br/>View.CAMPAIGNS<br/>View.PROJECTS<br/>View.SETTINGS - redirects to [custom settings page](https://pipedrive.readme.io/docs/custom-ui-extensions-app-settings) |
| id        | String/Number | ID of the entity where the user will be redirected. If not provided, the user will be redirected to list view that's specified by the `view` property | optional                                                                                                                                                                                                                                                          |
| context   | Object | Allows to pass a context object in query params when redirecting to custom settings                                                                          | optional<br/>Supported views:<br/>View.SETTINGS                                                                                                                                                                                           |

**Example**

```javascript
await sdk.execute(Command.REDIRECT_TO, { view: View.DEALS, id: 1, context: { foo: 'bar' } });
```

#### Show floating window

Opens floating window and triggers `Event.VISIBILITY` with an optional `context` parameter
that is dependent on your app's use case (see [Visibility](#visibility) for details).

**Parameters**

| Parameter | Type   | Description                                  | Notes    |
| --------- | ------ | -------------------------------------------- | -------- |
| context   | Object | Object to be passed as JSON to event handler | optional |

**Example**

```javascript
await sdk.execute(Command.SHOW_FLOATING_WINDOW, {
  context: {
    person_id: 42,
  },
});
```

#### Hide floating window

Closes floating window and triggers `Event.VISIBILITY` with an optional `context` parameter
that is dependent on your app's use case (see [Visibility](#visibility) for details).

**Parameters**

| Parameter | Type   | Description                                  | Notes    |
| --------- | ------ | -------------------------------------------- | -------- |
| context   | Object | Object to be passed as JSON to event handler | optional |

**Example**

```javascript
await sdk.execute(Command.HIDE_FLOATING_WINDOW, {
  context: {
    person_id: 42,
  },
});
```

#### Set notification

For apps with floating window, display or remove notifications badge in apps dock. Not specifying
the number or setting it to `0` removes the notification badge. Specifying a number greater than `0`
displays a badge with that number.

**Parameters**

| Parameter | Type   | Description             | Notes    |
|-----------|--------|-------------------------| -------- |
| number    | Number | Number of notifications | optional |

**Example**

```javascript
await sdk.execute(Command.SET_NOTIFICATION, {
  number: 3,
});
```

#### Set focus mode

For apps with a floating window, you can enable or disable focus mode. When the focus mode is
enabled, the close button in the window header is hidden.

This should only be used to avoid users accidentally closing the window while an action is in
progress, e.g., a phone call. There should be a clear call-to-action to disable the focus mode,
e.g., the end call button.

This command only accepts a boolean as the second parameter, and the floating window must be
visible before using this command.

**Example**

```javascript
await sdk.execute(Command.SET_FOCUS_MODE, true);
```

#### Get metadata

Retrieves metadata information about the main window.

**Response**

| Parameter    | Type   | Description                     | Notes |
|--------------|--------|---------------------------------|-------|
| windowHeight | Number | Height of the main window (px). |       |
| windowWidth  | Number | Width of the main window (px).  |       |

**Example**

```javascript
const { windowWidth, windowHeight } = await sdk.execute(Command.GET_METADATA);
```

### Events

Subscribe to events triggered by users.

```javascript
const stopReceivingEvents = sdk.listen(event, ({ error, data }) => {
  // if error is present, handle error
  // handle data
});

stopReceivingEvents(); // Call this function to stop receiving events
```

#### Visibility

Subscribe to visibility changes that are triggered by the user or an SDK command.

##### Custom panel

Event is triggered when the user collapses or expands the panel.

`context` parameter is not included.

##### Floating window

Event is triggered when the floating window is displayed or gets hidden.

`context` property may consist of data passed from `Command.SHOW_FLOATING_WINDOW` or `Command.HIDE_FLOATING_WINDOW` command
and will always contain `invoker` with possible values `command` or `user`.

**Response**

| Parameter       | Type    | Description                                                        | Notes    |
| --------------- | ------- | ------------------------------------------------------------------ | -------- |
| is_visible      | Boolean | Specifies if the extension is visible to the user                  | required |
| context         | Object  | Contains properties specific to extension                          | optional |
| context.invoker | String  | Describes if the event was triggered by an SDK command or the user | optional |

**Example**

```javascript
sdk.listen(Event.VISIBILITY, ({ error, data }) => {
  // handle event
});
```

#### Close custom modal

Subscribe to custom modal events that are triggered by this SDK's `CLOSE_MODAL` command or user interaction with the custom modal.

**Custom panel** - user closes the custom modal

**Example**

```javascript
sdk.listen(Event.CLOSE_CUSTOM_MODAL, () => {
  // handle event
});
```

#### User settings change

This event lets you get an update if any user settings have changed.

**Response**

| Parameter   | Type    | Description                                                                                        |
|-------------|---------|----------------------------------------------------------------------------------------------------|
| theme       | String  | The selected theme interface preference. Possible values:<br/><ul><li>light</li><li>dark</li></ul> |

**Example**

```javascript
sdk.listen(Event.USER_SETTINGS_CHANGE, ({ data }) => {
  // handle data
});
```

#### Page visibility state

Subscribe to the page visibility event that is triggered when the value of the `visibilityState` property changes. This event enables you to find out if the page your app extension will be loaded in is visible/in the background or hidden.

| Parameter | Type   | Description                                   | Notes    |
| --------- | ------ | --------------------------------------------- | -------- |
| state     | String | Indicates if the page is visible for the user | required |

**Possible state values**

`visible`
The page is at least partially visible to the user. In practice this means that the page is the foreground tab of a non-minimized window.

`hidden`
The page is not visible to the user. In practice this means that the page is either a background tab or part of a minimized window, or the OS screen lock is active.

**Example**

```javascript
const stopReceivingPageStateEvent = sdk.listen(Event.PAGE_VISIBILITY_STATE, ({ data }) => {
  // handle data
});

stopReceivingPageStateEvent() // Call this function to stop receiving event
```

## References/Links

- [Custom UI extensions developer documentation](https://pipedrive.readme.io/docs/custom-ui-extensions)
- [Custom settings page documentation](https://pipedrive.readme.io/docs/custom-ui-extensions-app-settings) (see [View.SETTINGS](#redirect-to))
- [jsDelivr CDN build](https://cdn.jsdelivr.net/npm/@pipedrive/app-extensions-sdk@0/dist/index.umd.js) (see [Without module bundler](#without-module-bundler))
- [npm package](https://www.npmjs.com/package/@pipedrive/app-extensions-sdk)
- [GitHub repository](https://github.com/pipedrive/app-extensions-sdk) / [issues](https://github.com/pipedrive/app-extensions-sdk/issues)
- [CHANGELOG.md](./CHANGELOG.md)
