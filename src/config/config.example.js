module.exports = {
    // Control flags for program
    flags: {
        // Throw an error (and exit the program) if an error is encountered. May be useful to skip errors if permissions related
        THROW_ON_ERROR: true,
        // Print debug info (all data responses, etc)
        DEBUG: false
    },
    settings: {
        // TODO: use secrets manager
        secrets: {
            // The shared secret for the github webhook
            webhook_secret: '{{webhook_secret}}',
            // A github token with appropriate permissions
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
                // Team name
                name: 'developers',
                // Permissions level
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

        // See settings here: https://octokit.github.io/rest.js/v18#repos-update-branch-protection
        branchProtectionSettings: {
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
