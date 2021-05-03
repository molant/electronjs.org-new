# webhook

This project handles the webhooks from `electron/electron` and filters them
to dispatch only the appropriate ones as `repository_dispatch` events.

## Local setup

### Getting Code Locally

In order to be capable of testing this project end-to-end you will have to
fork `electron/electron` and `electron/electronjs.org-new` into your account.
Once you've done that you will only need to clone `electronjs.org-new`:

```console
git clone https://github.com/YOUR_USER_NAME/electronjs.org-new
cd electronjs.org-new
yarn
cd webhook
npm install
```

You will also have to create a `.env` file with the following values:

```
GITHUB_TOKEN=YOUR_GITHUB_TOKEN
SECRET=YOUR_WEBHOOK_SECRET
```

### Configuring the webhooks

You will have to add a webhook to your fork of `electron/electron` and deliver
the payload to your local machine. To do that follow this steps:

1. Go to [smee.io](https://smee.io/) and click **Start a new channel**.
   You will be redirected to a new URL, this will be the webhook URL later on.
1. Create a `.env` under `webhook/` with the contents of `webhook/.env.example`
1. Create a new webhook in your `electron/electron` fork in
   https://github.com/YOUR_USER_NAME/electron/settings/hooks/new
   - **Payload URL**: The URL from the first step.
   - **Content type**: `application/json`
   - **Secret**: `development`
1. Create a new Personal Access Token (PAT) [here][pat] with the `repo` scope and write it down.
1. Update your `webhook/.env` file with the previous values:
   ```
   GITHUB_TOKEN=THE_PAT_CREATED_PREVIOUSLY
   SECRET=development
   ```

### Running the code locally

Open a terminal and navigate to the `webhook/` folder. Once there run the
following:

```console
npm run development -- THE_SMEE_WEBHOOK_URL
```

Without closing this terminal, open a new one and in the same folder run:

```console
npm start
```

This will start the local server in the port 3000 and tunnel all the
GitHub webhook payloads to your local environment.

[pat]: https://github.com/settings/tokens
