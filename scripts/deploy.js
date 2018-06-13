#!/usr/bin/env node

/**
 * This task pushes the /build/static directory to the `package` branch of the repo.
 */

const ghpages = require('gh-pages');
const version = require('../package.json').version;

// Define options for publish method.
let options = {
  branch: 'master',
  message: `Auto-generated commit during deploy: ${version}`
};

// Process the args passed in to find tag
const tag = process.argv.find((arg) => arg === 'tag');
if (tag) {
 options.tag = `v${version}`;
}

// Deploy the static output to package branch using defined options.
ghpages.publish('build/static', options, function(err) {
  if (err) {
    console.error(`Federated Search React | There was an error during deployment: ${err}`);
  }
  else {
    console.log(`Federated Search React | Woo-hoo! 🎉 The deployment was a success!`)
  }
});
