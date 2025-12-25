const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envTestPath = path.resolve(__dirname, '../../.env.test');
  const envPath = fs.existsSync(envTestPath)
    ? envTestPath
    : path.resolve(__dirname, '../../.env');
  require('dotenv').config({ path: envPath, quiet: true });
}

module.exports = { loadEnv };
