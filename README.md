# GitHub Permissions Automation
This project is intended to help automate repository level permissions for new repositories using a [AWS Lambda function](https://aws.amazon.com/lambda/). This project listens to organization-level hooks and does the following:
1. Checks if the repo's default branch exists in the repo. The default branch [can be set at the organization level](https://docs.github.com/en/organizations/managing-organization-settings/managing-the-default-branch-name-for-repositories-in-your-organization) for new repos.
    - if not, creates that branch with a README.md and a CODEOWNER's file
1. Adds [branch protection settings](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches) to that default branch
1. (optional) Adds [teams](https://docs.github.com/en/organizations/organizing-members-into-teams/about-teams) of your choosing to the repo with [permissions](https://docs.github.com/en/organizations/managing-access-to-your-organizations-repositories/repository-roles-for-an-organization) you specify.
1. Create an [issue](https://github.com/features/issues) to document the updates.

In addition to these repo-level settings, organization-level security setting should be configured. These are outside the scope of this project but can be configured manually:
- [GitHub Actions Settings](https://docs.github.com/en/organizations/managing-organization-settings/disabling-or-limiting-github-actions-for-your-organization)
- [Organization security settings](https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/managing-security-and-analysis-settings-for-your-organization)

## Setup
### Initial setup
1. Run `npm install` to download project dependencies
1. Generate a [GitHub personal access token (PAT)](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) with the permissions:
    - `repo`
    - `admin:org`
1. Run the setup script to create a config file with a new webhook secret. This will prompt you for your PAT.
```bash
chmod +x setup.sh
./setup.sh
```
4. Edit generated (config.js)[src/config/config.js]
1. Rerun setup after configuration update to generated a new [zip](outputs/lambdaFunction.zip)

### Run for all existing repos in a org (standalone)
1. Edit [runExisting.js](runExisting.js). Set `githubOrg` to your organization's name
1. Run `node runExisting.js`
This will loop through all repos in the org an update them with the settings set in `config.js`

### AWS Setup (Webhook receiver)
#### Setup Lambda function
1. Create a new Lambda function in AWS:
    1. Author from Scratch
    1. Runtime: Node.js 14.x
    1. Architecture: x86_64
1. Once the function has created select **Upload from** -> **.zip file** and provide the zip in the `outsput` directory
1. Create an API gateway for your Lambda function (click the **+ Add trigger** button in the Lambda function's overview):
    1. Select API Gateway as the trigger type.
    1. Create a new REST API.
    1. Set Security to Open.
    1. Click the Add button to create this gateway.
1. Copy the API Gateway URL

#### Setup GitHub webhook
1. Create an organization [webhook](https://docs.github.com/en/enterprise-cloud@latest/developers/webhooks-and-events/webhooks/about-webhooks) in GitHub
    1. Go to your user settings
    1. Select **Switch to another account** and select your org
    1. Click the **Webhooks** menu item
    1. **Add webhhok**
        1. Payload URL: Your API Gateway URL
        1. Content type: `application/json`
        1. Secret: value of `settings.secrets.webhook_secret` in [config.js](src/config/config.js)
        1. Which events would you like to trigger this webhook? `Let me select individual events`
            1. checkbox next to `Repositories`
        1. Click **Add webhook** button



## Testing Lambda locally
1. Generate your config.js from step 2 of AWS Setup (above)
1. Generate an event to Lambda and capture the event data. Save this data in `test-events/event.json`.
1. Install `lambda-local` (See [stackoverflow answer](https://stackoverflow.com/a/52935918) on this topic)
```bash
npm install -g lambda-local
```
1. Run the script with your captured event data
```bash
npm run locally
```

## References
Tools:
- https://github.com/octokit/webhooks.js
- https://github.com/octokit/rest.js/
- Lambda setup instructions: https://github.com/jcantosz/codefresh-jira-event-listener

Ref:
- https://docs.github.com/en/code-security/getting-started/securing-your-repository
- https://docs.github.com/en/rest
