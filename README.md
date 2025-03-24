# Slack Bot

5研用のSlack Bot

.envにSLACK_WEBHOOK_URLがある。セキュリティ上の理由より、localにのみ保存している。

```bash
tsc src/checkUpdates.ts
```

で、jsファイルが生成される。
これを定期的に実行する。
