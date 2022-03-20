const { Webhooks} = require("@octokit/webhooks");

const GitHub = require('./src/github-api.js');
const config = require('./src/config/config.js')


let github = new GitHub(config.flags, config.settings);

// TODO: change to read from secrets manager
const webhooks = new Webhooks({
  secret: config.settings.secrets.webhook_secret,
});

function handleError(error) {
    console.error(error);
    if(config.flags.THROW_ON_ERROR){
        throw(error);
    }
}


async function handleWebhook(data) {
    try {
        var payload = data.payload
        await github.updateRepo(payload.repository.full_name);

    } catch(error) {
        handleError(error);
    }

}

/**
 * Webhook handler - listen for appropriate webhook events (repo created/edited) and update repo based on them
 * For all cases except error (if caught), return a 200
**/
exports.handler = async (webhookEvent, context) => {

    // Default Response
    let response = {
        statusCode: 200,
        body: JSON.stringify('Webhook received!'),
    };

    // register listener (there will only be one event on any given lambda run)
    webhooks.on(["repository.created","repository.edited"], (data) => handleWebhook(data));

    //webhooks.on(["repository.created","repository.edited"], myEvent(event))
    // Verify webhook signature and trigger registered event
    await webhooks.verifyAndReceive({
        //id: context["awsRequestId"],
        id: webhookEvent.requestContext["requestId"],
        name: webhookEvent.headers["X-GitHub-Event"],
        signature: webhookEvent.headers["X-Hub-Signature"],
        payload: webhookEvent.body,
      })
      .catch( (error) => handleError(error) );

    return response;
};
