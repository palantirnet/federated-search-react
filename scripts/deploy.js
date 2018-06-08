#!/usr/bin/env node

/**
 * This task pushes to the `package` branch of the repo.
 */

const ghpages = require('gh-pages');

ghpages.publish('build/static', {
  branch: 'package'
});
