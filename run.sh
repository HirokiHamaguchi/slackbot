set -e

FNM_PATH="/home/fivelab/.local/share/fnm"
if [ -d "$FNM_PATH" ]; then
  export PATH="$FNM_PATH:$PATH"
  eval "`fnm env`"
fi

/home/fivelab/.local/share/fnm/aliases/default/bin/node /home/fivelab/ドキュメント/HirokiHamaguchi/slackbot/src/checkUpdates.js | /usr/bin/tee "/home/fivelab/ドキュメント/HirokiHamaguchi/slackbot/log/$(date +'%Y-%m-%d_%H-%M-%S').log"
