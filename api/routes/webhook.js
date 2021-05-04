//@ts-check

const semver = require('semver');

const {
  getLatestInformation,
  isEvent,
  verifyIntegrity,
  sendRepositoryDispatchEvent,
} = require('../utils/utils');

const SOURCE_REPO = 'electron/electron';
const TARGET_REPO = 'electron/electronjs.org-new';

/**
 * Verifies there is at least one file added, modified, or removed
 * in the given `folder` through all the commits associated in the
 * push.
 * @param {import('@octokit/webhooks-types').PushEvent} pushEvent
 * @param {string} folder
 */
const areFilesInFolderChanged = (pushEvent, folder) => {
  const isInPath = (file) => {
    return file.includes(folder);
  };

  const { commits } = pushEvent;

  return commits.some((commit) => {
    return (
      commit.modified.some(isInPath) ||
      commit.added.some(isInPath) ||
      commit.removed.some(isInPath)
    );
  });
};

/**
 * Handler for the GitHub webhook `push` event.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const pushHandler = async (req, res) => {
  const { branch } = await getLatestInformation();
  const ref = `refs/heads/${branch}`;

  /** @type {import('@octokit/webhooks-types').PushEvent} */
  const payload = req.body;

  if (
    payload.ref === ref &&
    payload.repository.full_name === SOURCE_REPO &&
    areFilesInFolderChanged(payload, 'docs')
  ) {
    console.log('Send notification');

    await sendRepositoryDispatchEvent(TARGET_REPO, payload.after);
  }

  return res.status(200).send();
};

/**
 * Handler for the GitHub webhook `release` event.
 * The payload will be processed only if the release
 * payload is for the stable branch.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const releaseHandler = async (req, res) => {
  /** @type {import('@octokit/webhooks-types').ReleaseEvent} */
  const payload = req.body;

  const { release } = await getLatestInformation();

  // Tags can be v14.0.0-nightly.20210504, v13.0.0-beta.21, v10.4.5, etc.
  // We only want to process the stable ones, i.e.: v10.4.5
  // so we remove the initial `v` and we "clean it". If the cleaned
  // string is the same as before, then it's a stable release.
  // We also check that the new release is greater or equal than the
  // published npm version. There can be 30-120s delay between a GitHub
  // release and an npm one.
  const tag = payload.release.tag_name.replace(/^v/, '');
  const isStable = semver.clean(tag) === tag;

  if (
    payload.action === 'released' &&
    !payload.release.draft &&
    !payload.release.prerelease &&
    isStable &&
    semver.gte(tag, release)
  ) {
    await sendRepositoryDispatchEvent(
      TARGET_REPO,
      payload.release.target_commitish
    );
  }
  return res.status(200).send();
};

/**
 * Adds the right handles for the `push` and `release`
 * webhooks to the given `app`.
 * @param {import('express').Application} app
 */
const addWebhooks = async (app) => {
  app.post('/webhook/push', isEvent('push'), verifyIntegrity, pushHandler);
  app.post(
    '/webhook/release',
    isEvent('release'),
    verifyIntegrity,
    releaseHandler
  );
};

module.exports = {
  addWebhooks,
};
