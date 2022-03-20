const { Octokit } = require("@octokit/rest");
class GitHub {
    /**
     * Set up the object and intialize github api package
     * @param {*} flags - Configuration flags (debug and fail_on_error)
     * @param {*} settings - Configuration settings for GitHub Repo
     */
    constructor(flags, settings) {
        this.procedures = [];
        this.settings = settings;
        this.flags = flags;
        this.octokit = new Octokit({
            auth: settings.secrets.github_token,
            userAgent: "github-settings-automation"
          });
    }

    /**
     * Run all update procedures sequentially against repo
     */
    async updateRepo(fullName){
        // could grab direct from webhook (organization.login || owner.login) but need to read on the nuances of these two fields
        var [owner, repo] = fullName.split('/');
        console.log(`Updating repo: ${owner}/${repo}`);

        var branchExists = await this.branchExists(owner, repo, this.settings.branchProtectionSettings.branch)
        // New repo or using a different branch, add branch with files
        if (!branchExists) {
            await this.createREADME(owner, repo);
            await this.createCODEOWNERS(owner, repo);
        } else {
            this.logProcedure("Create README (skipped)");
            this.logProcedure("Create CODEOWNERS (skipped)");
        }
        await this.SetBranchProtection(owner, repo);
        await this.addTeamsToRepo(owner, repo);
        await this.CreateIssue(owner, repo);
        console.log(this.procedures);
    }
    // =============================================================================================
    // ---------------------------------------------------------------------------------------------

    /**
     * Log debug info if debug mode is set
     * @param String data - the data to log
     */
    debugLog(data){
        if (this.flags.DEBUG) {
            console.log("DEBUG: -----------------");
            console.log(data)
            console.log("----------------- :DEBUG");
        }
    };

    /**
     * Print out error message and optionally quit on error
     * @param String error - the error message to display
     */
    handleError(error) {
        console.error(error);
        if(this.flags.THROW_ON_ERROR){
            throw(error);
        }
    }

    /**
     * Log out what currently just ran and save it to an array for later
     * @param String procedure - A string describing what just happened
     */
    logProcedure(procedure) {
        console.log(procedure);
        this.procedures.push(procedure);
    }

    /**
     * Check if a branch exists in the specified repo
     */
    async branchExists(owner, repo, branch) {
        var exists = true;
        try {
            var data = await this.octokit.rest.repos.getBranch({
                owner,
                repo,
                branch,
            });
        } catch (error) { // if error then branch DNE (need more precise handling than this)
            exists = false;
        }
        return exists
    }

    /**
     * Get all repos for the organization
    */
    async getOrgRepos(owner) {
        try {
            // https://octokit.github.io/rest.js/v18#repos-list-for-org
            var data = await this.octokit.rest.repos.listForOrg({
                org: owner,
            });
            this.debugLog(data);
            return data;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Create an initial README.md
     * @param String owner - owner/org that owns the repos
     * @param String repo - repo to create README in
     */
    async createREADME(owner, repo) {
        var path = "REAMDME.md";
        var contents =`#  ${repo}`;
        var message = "Add README";
        await this.createFile(owner, repo, path, contents, message)
    }

    /**
     * Create an initial CODEOWNERS
     * @param String owner - owner/org that owns the repos
     * @param String repo - repo to create README in
     */
    async createCODEOWNERS(owner, repo) {
        if(this.settings.codeowners) {
            var path = "CODEOWNERS";
            var message = "Add CODEOWNERS";
            var contents = "";
            for(var rule of this.settings.codeowners) {
                contents += `${rule.files} ${rule.team}\n`;
            }
            await this.createFile(owner, repo, path, contents, message);
        }
    }

    /**
     * Create an file in the repo's default branch
     */
    async createFile(owner, repo, path, contents, message) {
        try {
            // https://octokit.github.io/rest.js/v18#repos-create-or-update-file-contents
            var data = await this.octokit.rest.repos.createOrUpdateFileContents({
                owner: owner,
                repo: repo,
                path: path,
                message: message,
                content: new Buffer.from(contents).toString('base64'),
                committer: this.settings.committer
            });
            this.logProcedure(`Created ${path}`);
            this.debugLog(data);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Add all teams to repo
     */
    async addTeamsToRepo(owner, repo){
        for(var item of this.settings.teams){
            var team = item.name;
            var permission = item.permission;
            console.log(`team: ${team}, permissions: ${permission}`);
            await this.addTeamToRepo(owner, repo, team, permission);
        }
    }
    /**
     * Add team to repo with specified permissions
     * @param {*} owner
     * @param {*} repo
     * @param {*} team
     * @param {*} permission
     */
    async addTeamToRepo(owner, repo, team, permission){
        try {
            // https://octokit.github.io/rest.js/v18#teams-add-or-update-repo-permissions-in-org
            var data = await this.octokit.rest.teams.addOrUpdateRepoPermissionsInOrg({
                org: owner,
                team_slug: team,
                owner: owner,
                repo: repo,
                permission: permission
            });
            this.logProcedure(`Add team ${team} to repo`);
            this.debugLog(data)
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Set branch protection settings for this repo based on the configuration set in the constructor
     */
    async SetBranchProtection(owner, repo) {
        try {
            var branchProtections = this.settings.branchProtectionSettings;
            branchProtections.owner = owner;
            branchProtections.repo = repo;

            // https://octokit.github.io/rest.js/v18#repos-update-branch-protection
            var data = await this.octokit.rest.repos.updateBranchProtection(
                branchProtections
            );
            this.logProcedure("Set Branch Protection");
            this.debugLog(data)
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Create an issue to document all settings changes
     */
    async CreateIssue(owner, repo) {
        try {
            var message = ""
            for (var item of this.procedures){
                if(item){
                    message += `- ${item}\n`
                }
            }

            for (var user of this.settings.notify){
                message += `${user}\n`
            }

            var data = await this.octokit.rest.issues.create({
                owner: owner,
                repo: repo,
                title: "Repo settings updated",
                body: message
            });
            this.logProcedure("Create issue with details");
            this.debugLog(data);
        } catch(error) {
            this.handleError(error)
        }
    }
}


module.exports = GitHub;
