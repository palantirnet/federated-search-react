#!/usr/bin/env node

/**
 * This task pushes the /build/static directory to the `package` branch of the repo.
 */

const ghpages = require('gh-pages');
const version = require('../package.json').version;

ghpages.publish('build/static', {
  branch: 'package',
  message: `Auto-generated commit during deploy: ${version}`
});
