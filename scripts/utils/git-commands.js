const github = require('@actions/github');
const { execute } = require('./execute');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
/**
 * Creates a new commit with the current changes.
 * @param {string} commitMessage
 */
const createCommit = async (commitMessage) => {
  await execute('git add .');
  await execute(`git commit -m ${commitMessage}`);
};

/**
 * Returns the current modified files in the repo.
 */
const getChanges = async () => {
  const { stdout } = await execute('git status --porcelain');

  return stdout.trim();
};

/**
 * Creates a new commit and pushes the given branch
 * @param {string} branch
 * @param {string} message
 */
const pushChanges = async (branch, message) => {
  await createCommit(message);
  await execute(`git push origin ${branch}`);
};

/**
 * Force pushes the changes to the documentation update branch
 * and creates a new PR if there is none available.
 * @param {string} branch
 * @param {string} base
 * @param {string} message
 */
const createPR = async (branch, base, message) => {
  await createCommit(message);
  await execute(`git push --force --set-upstream origin ${branch}`);
  const { context } = github;
  const octokit = github.getOctokit(GITHUB_TOKEN);

  const pulls = await octokit.pulls.list({
    owner: context.repo.owner,
    repo: context.repo.repo,
    state: 'open',
  });

  const doesExist = pulls.data.some((pull) => {
    return pull.head.ref === branch;
  });

  if (doesExist) {
    console.log('PR already exists, nothing to do.');
  } else {
    const result = await octokit.pulls.create({
      owner: context.repo.owner,
      repo: context.repo.repo,
      base,
      head: branch,
    });

    console.log(`PR created (#${result.data.id})`);
  }
};

module.exports = {
  createPR,
  getChanges,
  pushChanges,
};
