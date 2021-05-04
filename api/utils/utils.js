const crypto = require('crypto');

const latestVersion = require('latest-version');
const got = require('got').default;

const SECRET = process.env.SECRET;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const DOC_CHANGES_TYPE = 'doc_changes';

let _stableVersion = '';
let _stableBranch = '';
let _lastUpdated = 0;
const CACHE_TIMEOUT = 5 * 60 * 1000; // we cache version for 5 minutes

const getLatestInformation = async () => {
  const now = Date.now();
  if (now - _lastUpdated > CACHE_TIMEOUT) {
    _stableVersion = await latestVersion('electron');
    _stableBranch = _stableVersion.replace(/\.\d+\.\d+$/, '-x-y');
  }

  return {
    version: _stableVersion,
    branch: _stableBranch,
  };
};

/**
 * Middleware to validate the handler is the right one
 * for the received event.
 * @param {string} event
 * @returns {import('express').Handler}
 */
const isEvent = (event) => {
  return (req, res, next) => {
    if (req.header('X-GitHub-Event') !== event) {
      return res.status(400).send();
    }

    return next();
  };
};

/**
 * Middleware to verify the integraty of a GitHub webhook
 * by using the `X-Hub-Signature`, the secret and the payload.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const verifyIntegrity = (req, res, next) => {
  if (!SECRET) {
    console.log('No secret specified, skipping integrity check');
    return next();
  }

  if (!req.header('X-Hub-Signature-256')) {
    console.error(`Missing singature in payload`);
    return res.status(400).send(`Missing singature in payload`);
  }

  try {
    const signature = Buffer.from(req.header('X-Hub-Signature-256'));
    const payload = req.body;

    const signedPayload = Buffer.from(
      `sha256=${crypto
        .createHmac('sha256', SECRET)
        .update(payload)
        .digest('hex')}`
    );

    if (signature.length !== signedPayload.length) {
      console.error(`Invalid signature`);
      return res.status(400).send(`Invalid signature`);
    }

    if (!crypto.timingSafeEqual(signature, signedPayload)) {
      console.error(`Invalid signature`);
      return res.status(400).send(`Invalid signature`);
    }
    next();
  } catch (e) {
    console.error(`Invalid signature`);
    return res.status(400).send(`Invalid signature`);
  }
};

/**
 * Sends a `repository_dispatch` event top the given repo `target`
 * with the type `doc_changes` and the given commit `sha` as part
 * of the payload.
 * @param {string} target The repo to send the event to
 * @param {string} sha The commit's SHA
 */
const sendRepositoryDispatchEvent = async (target, sha) => {
  return got.post(`https://github.com/${target}/dispatches`, {
    headers: {
      Authorization: `Token ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: {
      event_type: DOC_CHANGES_TYPE, // This is the only event we can send for now
      client_payload: {
        sha,
      },
    },
  });
};

module.exports = {
  isEvent,
  verifyIntegrity,
  getLatestInformation,
  sendRepositoryDispatchEvent,
};
