const GitHub = require('./src/github-api.js');
const config = require('./src/config/config.js')

var githubOrg = "jca-test"


async function main() {
    let github = new GitHub(config.flags, config.settings);
    // get all repos in org
    let payload = await github.getOrgRepos(githubOrg);

    // Loop through all repos and update them with configured settings
    for(var item of payload.data){
        await github.updateRepo(item.full_name, item.default_branch);
        console.log("-----------------------------------------------")
    }
}

main();