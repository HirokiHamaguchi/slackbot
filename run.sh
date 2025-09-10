#!/bin/bash
set -e

/home/hiroki/.nvm/versions/node/v22.19.0/bin/node /home/hiroki/ドキュメント/slackbot/src/checkUpdates.js | /usr/bin/tee "/home/hiroki/ドキュメント/slackbot/log/$(date +'%Y-%m-%d_%H-%M-%S').log"

