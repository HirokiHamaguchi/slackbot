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

   Ubuntuで1日毎にBashファイルを定期実行するには、**cronジョブ**を使うのが一般的。
   
   ターミナルを開いて、以下のコマンドを実行：

   ```bash
   crontab -e
   ```

   すると、エディタ（vimやnano）が開く。

   例えば、`/home/fivelab/ドキュメント/HirokiHamaguchi/slackbot/run.sh` を平日18時に実行する場合、次の行を追加する：

   ```bash
   0 18 * * 1-5 /bin/bash /home/fivelab/ドキュメント/HirokiHamaguchi/slackbot/run.sh
   ```

   `crontab -l` を実行すると、設定が正しく反映されているか確認できる：

   ```bash
   crontab -l
   ```

   `cron` が有効になっているかチェックし、停止していたら開始する：

   ```bash
   systemctl status cron  # cronの状態を確認
   sudo systemctl start cron  # cronを開始
   sudo systemctl enable cron  # 自動起動を有効化
   ```


なお、`run.sh`では、nodeの不変な絶対パスを指定する必要がある。

`which node`で確認できるパス (e.g., /run/user/1000/fnm_multishells/874222_1744677080484/bin/node) は使っては駄目。これは実行毎に変わってしまう。
