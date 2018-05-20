#! /usr/bin/env node

// Replaces old static assets in module libraries.yml with newly built assets.
// Example usage: yarn run update-libraries

const fs = require('fs');
const replace = require("replace-x");

const jsBuiltPath = './build/static/js/';
const cssBuiltPath = './build/static/css/';
const moduleLibrariesFilePath = '../search_api_federated_solr.libraries.yml';

// Get the name of newly built js asset + update module libraries.yml with it.
fs.readdirSync(jsBuiltPath).forEach(file => {
  if (file.endsWith('.js')) {
    replace({
      regex: "main\.[A-Za-z0-9]*\.js",
      replacement: file,
      paths: [moduleLibrariesFilePath],
      silent: true
    });
  }
});

// Get the name of newly built css asset + update module libraries.yml with it.
fs.readdirSync(cssBuiltPath).forEach(file => {
  if (file.endsWith('.css')) {
    replace({
      regex: "main\.[A-Za-z0-9]*\.css",
      replacement: file,
      paths: [moduleLibrariesFilePath],
      silent: true
    });
  }
});

// Output message that libraries.yml file has been updated.
console.log('\x1b[36m%s\x1b[36m', 'search_api_federated_solr.libraries.yml','\x1b[0m', 'has been updated with newly built assets.');
