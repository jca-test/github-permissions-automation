#!/bin/bash

# Make sure we execute in this directory (paths are relative)
cd $(dirname $0)

CONFIG_DIR="src/config/"
WEBHOOK_SECRET_SEARCH="{{webhook_secret}}"
GITHUB_TOKEN_SEARCH="{{github_token}}"
SAMPLE_CONFIG="${CONFIG_DIR}/config.example.js"
USER_CONFIG="${CONFIG_DIR}/config2.js"

# https://stackoverflow.com/questions/3466166/how-to-check-if-running-in-cygwin-mac-or-linux
if [[ "$(uname)" == "Darwin" ]]; then
    # Use GNU sed for macs
    alias sed=gsed
fi

# If config file DNE, create it
if [[ ! -f "${USER_CONFIG}" ]]; then
    # Generate shared webhook secret
    WEBHOOK_SHARED_SECRET="$(dd if=/dev/urandom bs=3 count=16 2>/dev/null | base64)"
    printf "Input GitHub token: "
    read GITHUB_TOKEN

    # Create user config using user input
    sed "s/${WEBHOOK_SECRET_SEARCH}/${WEBHOOK_SHARED_SECRET}/g" ${SAMPLE_CONFIG} | sed "s/${GITHUB_TOKEN_SEARCH}/${GITHUB_TOKEN}/g" > ${USER_CONFIG}
else
    echo "Setup complete previously, not generating new config"
fi

# Make a zip for lambda
mkdir -p output
zip -r output/lambdaFunction.zip *
