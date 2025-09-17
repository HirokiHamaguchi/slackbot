# run-checkUpdates.ps1

# エラー時に停止
$ErrorActionPreference = "Stop"

# ログフォルダとファイル名を定義
$logDir = "$env:USERPROFILE\Documents\HirokiHamaguchi\slackbot\log"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logFile = "$logDir\$timestamp.log"

# ログフォルダがなければ作成
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}

# Node.js スクリプトのパス
$nodePath = "C:\Program Files\nodejs\node.exe"
$scriptPath = "$env:USERPROFILE\Documents\HirokiHamaguchi\slackbot\src\checkUpdates.js"

# 実行とログ出力
& "$nodePath" "$scriptPath" | Tee-Object -FilePath $logFile
