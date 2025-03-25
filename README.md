# Slack Bot

5研用のSlack Botです。

## todo

* 通知方法などの改善
* 定期実行による通知をcron側で制御する?

## How to Run

node.jsやnpmなどは既にある前提

https://nodejs.org/en/download

1. このレポジトリをcloneする。

2. 以下を走らせ、node_modulesをinstallする。

```bash
npm install
```

3. .envにSLACK_WEBHOOK_URLを記載する。セキュリティ上の理由より、localにのみ保存している。

4. src/cache.txtを生成しておく。セキュリティ上の理由より、localにのみ保存している。

5. 以下を走らせ、jsファイルを生成する。

```bash
npx tsc src/checkUpdates.ts
```

6. 以下で正常に走ることを確認

```bash
node src/checkUpdates.js
```

7. 定期実行を設定する

Ubuntuで1日毎にBashファイルを定期実行するには、**cronジョブ**を使うのが一般的です。以下の手順で設定できます。

ターミナルを開いて、以下のコマンドを実行します：
```bash
crontab -e
```
すると、エディタ（vimやnano）が開きます。

例えば、`/home/fivelab/ドキュメント/HirokiHamaguchi/slackbot/run.sh` を毎日12時に実行する場合、次の行を追加します：

```
0 12 * * * /bin/bash /home/fivelab/ドキュメント/HirokiHamaguchi/slackbot/run.sh
```

`crontab -l` を実行すると、設定が正しく反映されているか確認できます：

```bash
crontab -l
```

`cron` が有効になっているかチェックし、停止していたら開始します：

```bash
systemctl status cron  # cronの状態を確認
sudo systemctl start cron  # cronを開始
sudo systemctl enable cron  # 自動起動を有効化
```
