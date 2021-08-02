# Chrome Extension GitHub info digger created with React Typescript

Extends Pull requests list with 
- reviewers approvals,
- target branch 
- pull request build status from jenkins.

## Getting started

Clone the project

```
$ git clone
```

Navigate to the project directory and install the dependencies.

```
$ npm install
```

To build the extension, and rebuild it when the files are changed, run

```
$ npm start
```

After the project has been built, a directory named `dist` has been created. You have to add this directory to your Chrome browser:

1. Open Chrome.
2. Navigate to `chrome://extensions`.
3. Enable _Developer mode_.
4. Click _Load unpacked_.
5. Select the `dist` directory.

## Configuration

Click on the extension icon to display the configuration popup.

Setup your GitHub token and save.