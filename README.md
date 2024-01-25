## App extensions SDK

This SDK provides interactivity between custom UI extensions and Pipedrive.

Learn more about custom UI extensions from [Developer documentation](https://pipedrive.readme.io/docs/custom-ui-extensions).

`npm install --save @pipedrive/app-extensions-sdk`

## Table of contents

- [Initialization](#initialization)
- [User settings](#user-settings)
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
- [Events](#events)
  - [Visibility](#visibility)
  - [Close custom modal](#close-custom-modal)
  - [User settings change](#user-settings-change)

## Initialization

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

## User settings

Contains an object with user settings, such as theme interface preference, and is accessible directly as a property of an instance of `AppExtensionsSDK`.

**Properties**

| Parameter  | Type   | Description                                                                                    |
|------------| ------ |------------------------------------------------------------------------------------------------|
| theme      | String | Selected theme interface preference. Possible values:<br/><ul><li>light</li><li>dark</li></ul> |

### Example

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

See also [USER_SETTINGS_CHANGE](#user-settings-change) event to implement an immediate update of styles in case of user preference change.

## Commands

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

### Show snackbar

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

### Show confirmation dialog

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

### Resize

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

### Get signed token

A new JSON Web Token (JWT) that is valid for 5 minutes will be generated. It can be verified using
the JWT secret which you can add from Marketplace Manager when configuring a custom UI extension. If it's not
specified, use app's client secret instead. JWT contains Pipedrive user and company ids.

JWT can be used to ensure that the custom UI extension is loaded by Pipedrive. It can be passed to your API
requests and be verified on the server side. As JWT expires in 5 minutes, you can use this command
to get a new one.

**Response**

| Parameter | Type   | Description | Notes |
| --------- | ------ | ----------- | ----- |
| token     | String |             |       |

**Example**

```javascript
const { token } = await sdk.execute(Command.GET_SIGNED_TOKEN);
```

### Open modal

Opens a [JSON modal](#json-modal), [custom modal](#custom-modal) or a new
Pipedrive [Deal](#new-deal-modal), [Organization](#new-organization-modal),
[Person](#new-person-modal) or [Activity](#new-activity-modal) modal

### JSON modal action

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

### Custom modal

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

### New deal modal

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

### New person modal

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

### New organization modal

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

### New activity modal

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

### Close modal

Closes an active modal window; applicable only for **custom modal**.

**Example**

```javascript
await sdk.execute(Command.CLOSE_MODAL);
```

### Redirect to

Redirects user to specified view.

**Parameters**

| Parameter | Type          | Description                                                                                                                                           | Notes                                                                                                                                                                                                                                                                      |
| --------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| view      | View          | View where the user will be redirected to                                                                                                             | required<br/><br/>Supported views:<br/>View.DEALS<br/>View.LEADS<br/>View.ORGANIZATIONS<br/>View.CONTACTS<br/>View.CAMPAIGNS<br/>View.PROJECTS<br/>View.SETTINGS - redirects to [custom settings page](https://pipedrive.readme.io/docs/custom-ui-extensions-app-settings) |
| id        | String/Number | ID of the entity where the user will be redirected. If not provided, the user will be redirected to list view that's specified by the `view` property | optional                                                                                                                                                                                                                                                                   |

**Example**

```javascript
await sdk.execute(Command.REDIRECT_TO, { view: View.DEALS, id: 1 });
```

### Show floating window

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

### Hide floating window

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

### Set notification

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

### Set focus mode

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

## Events

Subscribe to events triggered by users.

```javascript
const stopReceivingEvents = sdk.listen(event, ({ error, data }) => {
  // if error is present, handle error
  // handle data
});

stopReceivingEvents(); // Call this function to stop receiving events
```

### Visibility

Subscribe to visibility changes that are triggered by the user or an SDK command.

#### Custom panel

Event is triggered when the user collapses or expands the panel.

`context` parameter is not included.

#### Floating window

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

### Close custom modal

Subscribe to custom modal events that are triggered by this SDK's `CLOSE_MODAL` command or user interaction with the custom modal.

**Custom panel** - user closes the custom modal

**Example**

```javascript
sdk.listen(Event.CLOSE_CUSTOM_MODAL, () => {
  // handle event
});
```

### User settings change

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

### Page visibility state

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
