module.exports = {
    flags: {
        KILL_ON_ERROR: true,
        DEBUG: false
    },
    settings: {
        // TODO: use secrets manager
        secrets: {
            webhook_secret: '{{webhook_secret}}',
            github_token: '{{github_token}}'
        },
        // Committer info if README/CODEOWNERS is created
        committer: {
            name: "first_name last_name",
            email: "name@domain.com"
        },

        // List of teams and their permission level to add to the repo
        // See permissions levels here: https://docs.github.com/en/rest/reference/teams#add-or-update-team-repository-permissions
        teams: [/*
            {
                name: 'developers',
                permission: 'push'
            },
        */],

        // Users to notify of changes in an issue
        notify: [/*
            '@username',
            '@org/team'
        */],
        // initial codeowners settings
        codeowners: [/*{
            files: '*.*',
            team: '@org/team'
        }*/],

        branchProtectionSettings: {
            //branch to set protections settings on
            branch: 'main',

            // no setting to require signed commits via the api, but should be added (setting in UI: 'Require signed commits')
            required_status_checks: {
                strict: true,
                contexts: [],
            },
            enforce_admins: true,
            required_pull_request_reviews: {
                dismiss_stale_reviews: true,
                require_code_owner_reviews: true,
                required_approving_review_count: 1,
            },
            restrictions: null,
            required_linear_history: true,
            required_conversation_resolution: true,
        }
    }
};
