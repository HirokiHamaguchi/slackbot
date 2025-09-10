# Slack Bot

5研用のSlack Botです。

## How to Run

node.jsやnpmなどは既にある前提

https://nodejs.org/en/download

1. このレポジトリをcloneする。

2. 以下を走らせ、node_modulesをinstallする。

    ```bash
    npm install
    ```

3. .envにSLACK_WEBHOOK_URLを記載する。セキュリティ上の理由より、localにのみ保存している。

4. 以下を走らせ、jsファイルを生成する。

   ```bash
   npx tsc src/checkUpdates.ts
   ```

5. 以下で正常に走ることを確認

   ```bash
   node src/checkUpdates.js
   ```

6. 定期実行を設定する

  sleepでも大丈夫なようにsystemedを使用 /etc/systemd/system

  https://qiita.com/ExtremeCarvFJ/items/785e303009989233f836

なお、`run.sh`では、nodeの不変な絶対パスを指定する必要がある。

`which node`で確認できるパス (e.g., /run/user/1000/fnm_multishells/874222_1744677080484/bin/node) は使っては駄目。これは実行毎に変わってしまう。

<!-- 
hiroki@s6:/etc/systemd/system$ cat AAA_hiroki_made.service 
[Unit]
Description = Hiroki made service. See Qiita https://qiita.com/ExtremeCarvFJ/items/785e303009989233f836
After=local-fs.target

[Service]
Type=oneshot
ExecStart=/home/hiroki/ドキュメント/slackbot/run.sh
hiroki@s6:/etc/systemd/system$ cat AAA_hiroki_made.timer 
[Unit]
Description=Run Slackbot script at 18:00 on weekdays

[Timer]
OnCalendar=Mon..Fri 18:00
Persistent=true
WakeSystem=true

[Install]
WantedBy=timers.target -->
