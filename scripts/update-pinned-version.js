//@ts-check

const fs = require('fs').promises;
const path = require('path');
const packageJsonPath = path.join(__dirname, '..', 'package.json');

/**
 * Updates the field `sha` of the `package.json` with the value passed
 * via parameter in the CLI.
 * @param {string} sha
 */
const updateSha = async (sha) => {
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
  const oldSha = packageJson.sha;
  console.log(`New SHA: ${sha}`);
  console.log(`Old SHA: ${oldSha}`);

  if (sha === oldSha) {
    console.log(`Nothing to update`);
    return;
  }

  packageJson.sha = sha;

  await fs.writeFile(
    packageJsonPath,
    `${JSON.stringify(packageJson, null, 2)}\n`,
    'utf-8'
  );

  console.log(`SHA updated`);
};

if (require.main === module) {
  const sha = process.argv[2];

  if (!sha) {
    console.error('Please provide an SHA value as follows:');
    console.error('yarn update-pinned-version SHA');
  } else {
    updateSha(sha);
  }
}

module.exports = {
  updateSha,
};
