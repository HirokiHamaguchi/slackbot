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

3. .envにSLACK_WEBHOOK_URLを記載する。セキュリティ上の理由より、localにのみ保存している。Slackのbot管理画面から確認可能

4. 以下を走らせ、jsファイルを生成する。

   ```bash
   npx tsc src/checkUpdates.ts
   ```

5. 以下で正常に走ることを確認

   ```bash
   node src/checkUpdates.js
   ```

6. 定期実行を設定する

  https://faq.nec-lavie.jp/fa/qa/web/knowledge23511.html

  プログラム: powershell.exe
  引数の追加: -ExecutionPolicy Bypass -File C:\Users\5lab\Documents\HirokiHamaguchi\slackbot\run.ps1


なお、`run.ps1`では、nodeの不変な絶対パスを指定する必要がある。

