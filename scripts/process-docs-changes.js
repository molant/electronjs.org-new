/**
 * Checks if there are any changes in the repo and creates or updates
 * a PR if needed. This is part of the `update-docs.yml` workflow and
 * depends on `update-pinned-version` and `prebuild` being run before
 * in order to produce the right result.
 */

//@ts-check

if (!process.env.CI) {
  require('dotenv-safe').config();
}

const { createPR, getChanges, pushChanges } = require('./utils/git-commands');

/**
 * Wraps a function on a try/catch and changes the exit code if it fails.
 * @param {Function} func
 */
const changeExitCodeIfException = async (func) => {
  try {
    await func();
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
};

const PR_BRANCH = 'chore/docs-updates';
const COMMIT_MESSAGE = '"chore: update ref to docs (🤖)"';
const HEAD = 'main';

const processDocsChanges = async () => {
  const output = await getChanges();

  if (output === '') {
    console.log('Nothing updated, skipping');
    return;
  } else if (!output.includes('M package.json')) {
    console.log('package.json is not modified, skipping');
    return;
  } else {
    const lines = output.split('\n');
    if (lines.length > 1) {
      console.log(`New documents available, creating PR.`);
      await createPR(PR_BRANCH, HEAD, COMMIT_MESSAGE);
    } else {
      console.log(
        `Only existing content has been modified. Pushing changes directly.`
      );
      await pushChanges(HEAD, COMMIT_MESSAGE);
    }
  }
};

if (require.main === module) {
  changeExitCodeIfException(processDocsChanges);
}

module.exports = {
  processDocsChanges,
};
