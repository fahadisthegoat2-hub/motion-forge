#!/usr/bin/env node
// Open a scene (with its Render-on-this-device panel) in the user's Chrome.
// Usage: node open_in_chrome.js scene.html
const { exec } = require('child_process');
const path = require('path');
const f = path.resolve(process.argv[2] || '');
const url = require('url').pathToFileURL(f).href;
const cmd = process.platform === 'win32' ? `start "" chrome "${url}"`
  : process.platform === 'darwin' ? `open -a "Google Chrome" "${url}"`
  : `google-chrome "${url}" || chromium "${url}" || xdg-open "${url}"`;
exec(cmd, (e) => console.log(e ? `Open this in Chrome: ${url}` : `Opened in Chrome: ${url}`));
