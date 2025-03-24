import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import * as iconv from "iconv-lite";
import * as dotenv from "dotenv";
import { sendSlackNotification } from "./slackNotifier";

dotenv.config();

const TARGET_URL = "https://info.t.u-tokyo.ac.jp/student_other_all.html";
const CACHE_FILE = path.join(__dirname, "cache.txt");

async function fetchPage(): Promise<string> {
    try {
        const response = await axios.get(TARGET_URL, {
            responseType: "arraybuffer", // バイナリデータとして取得
        });

        // 正しいエンコーディングを指定（対象のサイトに応じて変更）
        const content = iconv.decode(response.data, "EUC-JP");
        return content;
    } catch (error) {
        console.error("Error fetching page:", error);
        return "";
    }
}

function loadPreviousHash(): string {
    if (fs.existsSync(CACHE_FILE))
        return fs.readFileSync(CACHE_FILE, "utf-8").trim();
    throw new Error("cannot read cache.");
}

function saveHash(content: string): void {
    fs.writeFileSync(CACHE_FILE, content, "utf-8");
}

async function checkForUpdates() {
    console.log(`Checking for updates on ${TARGET_URL}...`);

    const html = await fetchPage();
    if (!html) return;

    const $ = cheerio.load(html);
    const mainContent = $("body").text().trim();
    const previousHash = loadPreviousHash();

    // mainContentとpreviousHashを行単位で比較して差分を抽出
    const mainContentLines = mainContent.split("\n");
    const previousHashLines = previousHash.split("\n");

    let diffFound = false;
    let diff = "";

    for (let i = 2; i < mainContentLines.length; i++) {
        if (mainContentLines[i] !== previousHashLines[2]) {
            diffFound = true;
            diff += mainContentLines[i] + "\n";
        } else {
            break;
        }
    }

    if (!diffFound) {
        console.log("No changes detected.");

        const now = new Date();
        const japanTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));

        if (japanTime.getDay() === 5) {
            await sendSlackNotification("(正常に動作しているか確認用の定期メッセージです)");
        }

    } else {
        console.log("Website has been updated!");

        // 科研に関する更新がある場合はisKakenを設定
        const isKaken = diff.includes("科研") ? "❗ 特に科研費に関する更新です\n" : "";

        // 差分をSlack通知に送信
        await sendSlackNotification(`🔔 https://info.t.u-tokyo.ac.jp/index_5.html が更新されました！\n` + isKaken + diff);

        // 最新の内容を保存
        saveHash(mainContent);
    }
}


checkForUpdates();
