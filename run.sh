set -e

FNM_PATH="/home/fivelab/.local/share/fnm"
if [ -d "$FNM_PATH" ]; then
  export PATH="$FNM_PATH:$PATH"
  eval "`fnm env`"
fi

/run/user/1000/fnm_multishells/3010412_1744170021080/bin/node /home/fivelab/ドキュメント/HirokiHamaguchi/slackbot/src/checkUpdates.js | /usr/bin/tee "/home/fivelab/ドキュメント/HirokiHamaguchi/slackbot/log/$(date +'%Y-%m-%d_%H-%M-%S').log"
