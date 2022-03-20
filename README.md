# GitHub Permissions Automation
This project is intended to help automate repository level permissions for new repositories using a [AWS Lambda function](https://aws.amazon.com/lambda/). This project listens to organization-level hooks and does the following:
1. Checks if the [organization's default branch](https://docs.github.com/en/organizations/managing-organization-settings/managing-the-default-branch-name-for-repositories-in-your-organization) exists in the repo
    - if not, creates that branch with a README.md and a CODEOWNER's file
1. Adds [branch protection settings](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches) to that default branch
1. Adds [teams](https://docs.github.com/en/organizations/organizing-members-into-teams/about-teams) of your choosing to the repo with [permissions](https://docs.github.com/en/organizations/managing-access-to-your-organizations-repositories/repository-roles-for-an-organization) you specify.
1. Create an [issue](https://github.com/features/issues) to document the updates.

## AWS Setup
1. Generate a [GitHub personal access token (PAT)]() with the permissions:
1. Run the setup script to create a config file with a new webhook secret. This will prompt you for your PAT.
```bash
chmod +x setup.sh
./setup.sh
```

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
1. Create an organization webhook in GitHub

### Create Lambda function

## Testing locally
Install `lambda-local`
```bash
npm install -g lambda-local
```

run:
```bash
npm run locally
```