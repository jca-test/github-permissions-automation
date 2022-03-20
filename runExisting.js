const GitHub = require('./src/github-api.js');
const config = require('./src/config/config.js')


async function handleWebhook(data) {
    try {
        var payload = data.payload
        // could grab direct from webhook (organization.login || owner.login) but need to read on the nuances of these two fields
        var [owner, repo] = payload.repository.full_name.split('/');

        await github.updateRepo(owner, repo);
        //if(!hasBranch){
        //    createREADME()
        //}
        // if repo private -- add to depdendcies list for dependabot if desired (may be better to manage manually)
        //protectBranch()
        //createIssue()

    } catch(error) {
        handleError(error);
    }
}

async function main() {
    let github = new GitHub(config.flags, config.settings);
    let payload = await github.getOrgRepos("jca-test");
    payload.data.forEach(element => {
        console.log(`Updating repo: ${element.full_name}`);

    });
    var full_name = "jca-test/demo";
    //github.updateRepo(full_name);
    if(config.settings.codeowners) {
        var path = "CODEOWNERS";
        var message = "Add CODEOWNERS";
        var contents = "";
        for(var rule of config.settings.codeowners) {
            contents += `${rule.files} ${rule.team}\n`;
        }
        console.log(contents)
    }
}
main();