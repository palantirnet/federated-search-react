# Federated Search ReactJS app

This app renders search results from a Solr search index.  It was developed as the front end to the [search_api_federated_solr Drupal module](https://github.com/palantirnet/search_api_federated_solr#federated-solr-search-api-module).  Read the sections below to learn how to use this app.

## Requirements

- Node.js
- Yarn
- An Apache Solr server

### Node

You’ll need to have Node version 6 or greater on your local development machine. You can use [nvm](https://github.com/creationix/nvm#installation) (macOS/Linux) or [nvm-windows](https://github.com/coreybutler/nvm-windows#node-version-manager-nvm-for-windows) to easily switch Node versions between different projects.

### Yarn

Yarn is used instead of Node Package Manager (NPM) for package management and running commands.

[Yarn installation instructions](https://yarnpkg.com/en/docs/install)

### Apache Solr

This project depends on configuring a Solr search server. The server can exist locally or hosted.

Note: If you are hosting the search server at a different domain, you may need to configure CORS support for Apache Solr. If this is not configured correctly, you may get notices in the browser console and the results will not be returned. See [https://opensourceconnections.com/blog/2015/03/26/going-cross-origin-with-solr/](https://opensourceconnections.com/blog/2015/03/26/going-cross-origin-with-solr/) for some information on how that can be set up.

## Local setup

### Install dependencies

Run `yarn install` from the repo root.

### Configure the app

Create a `src/.env.local.js` configuration file.

You can copy the [src/.env.local.js.example](src/.env.local.js.example) example and edit the values provided.

### Start the development server

Run `yarn start` from the repo root to run the app in development mode.

It should automatically open http://localhost:3000 in a browser.

The page will automatically reload if you make changes to the code.

You will see the build errors and lint warnings in the console.

## Local testing

When you run the start script `yarn start`, code quality (linting) tests are automatically run and feedback is provided in the terminal.

If you are using this app with Drupal, enable CORS support in `services.yml`:
```
  cors.config:
    enabled: true
    # Specify allowed headers, like 'x-allowed-header'.
    allowedHeaders: []
    # Specify allowed request methods, specify ['*'] to allow all possible ones.
    allowedMethods: []
    # Configure requests allowed from specific origins.
    allowedOrigins: ['http://localhost:3000']
    # Sets the Access-Control-Expose-Headers header.
    exposedHeaders: false
    # Sets the Access-Control-Max-Age header.
    maxAge: false
    # Sets the Access-Control-Allow-Credentials header.
    supportsCredentials: false
```

Cypress is installed for end-to-end testing. You can run the tests by running `yarn cypress`. This will open an Electron
 binary to run the end-to-end testing. You can then run a specific test or run all tests using "Run all specs" link.
 See `cypress/integration` folder to view tests.

**Note**:
 - Cypress is configured to run the test suites on: `http://localhost:3000`.
  This is set in the `cypress.json` configuration file, `baseUrl` value. You might need to close any other existing scripts using port `3000`.

For more information see:
 - Cypress documentation: https://docs.cypress.io/guides/core-concepts/introduction-to-cypress.html#Cypress-Can-Be-Simple-Sometimes
 - Pull Request adding Cypress: https://github.com/palantirnet/federated-search-react/pull/68
## Code quality

### Linting

We recommend using linters to review your work.

ESLint is included and configured in `.eslintrc`.

Note that even if you edit your `.eslintrc` file further, these changes will **only affect the editor integration**. They won’t affect the terminal and in-browser lint output. This is because Create React App intentionally provides a minimal set of rules that find common mistakes.

#### Linting in an editor

Some editors, including Sublime Text, Atom, and Visual Studio Code, provide plugins for ESLint.

#### Linting in the console

You should see the linter output right in your terminal as well as the browser console.

## Theme the search app

TODO

## Use the app on your site

TODO

## Publishing releases

1. Ensure that `package.json` reflects the version number you would like to release
1. Run `yarn build` which builds the static assets and copies the `package.json` file into the `build/static` directory.
1. Run `yarn deploy tag` which pushes the contents of `build/static` to the `master` branch and tags it with the version listed in `package.json`.

### Requiring this project as a dependency

Deploying this package produces production-ready JS and CSS files that can be referenced in a project as external dependencies.

- CSS: `https://cdn.jsdelivr.net/gh/palantirnet/federated-search-react@[VERSION]/css/[FILENAME].css`
- JS: `https://cdn.jsdelivr.net/gh/palantirnet/federated-search-react@[VERSION]/js/[FILENAME].js`

To update the package, replace the the version number AND hash for each file based on the current release.  For example, if you just released `v2.1.3`:

1. Browse to the tag that was made in github as a result of running `yarn deploy tag` (in this example: https://github.com/palantirnet/federated-search-react/tree/v2.1.3)
1. Browse to the `js/` directory in the release you've just created
    1. Observe the filename for the compiled js ([in this example](https://github.com/palantirnet/federated-search-react/tree/v2.1.3/js): `main.3dcebe99.js`)
    1. Note: if the js has not been updated since the last release which has been deployed, the filename hash will likely be the same.
1. Browse to the `css/` directory in the release you've just created
    1. Observe the filename for the compiled css ([in this example](https://github.com/palantirnet/federated-search-react/tree/v2.1.3/css): `main.ec684809.css`)
    1. Note: if the css has not been updated since the last release which has been deployed, the filename hash will likely be the same.

The corresponding CDN urls for the css and js assets for this example should be:
- CSS: `https://cdn.jsdelivr.net/gh/palantirnet/federated-search-react@v2.1.3/css/main.ec684809.css`
- JS: `https://cdn.jsdelivr.net/gh/palantirnet/federated-search-react@v2.1.3/js/main.3dcebe99.js`

## Additional documentation

This project was created with the [Create React App](https://github.com/facebook/create-react-app).

The original documentation is located at [/docs/README.create-react-app.md](/docs/README.create-react-app.md).
