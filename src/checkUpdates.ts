import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import * as iconv from "iconv-lite";
import * as dotenv from "dotenv";
import { sendSlackNotification } from "./slackNotifier";

dotenv.config();

const TARGET_URLS = [
    { index: "https://info.t.u-tokyo.ac.jp/index.html", rss: "https://info.t.u-tokyo.ac.jp/rss/index.xml" },
    { index: "https://bps.t.u-tokyo.ac.jp/index.html", rss: "https://bps.t.u-tokyo.ac.jp/rss/index.xml" },
];

async function fetchPage(url: string): Promise<string> {
    try {
        const response = await axios.get(url, {
            responseType: "arraybuffer", // バイナリデータとして取得
        });

        // 正しいエンコーディングを指定（対象のサイトに応じて変更）
        const content = iconv.decode(response.data, "UTF-8");
        return content;
    } catch (error) {
        console.error("Error fetching page:", error);
        return "";
    }
}

function loadPreviousHash(index: number): string {
    const cacheFile = path.join(__dirname, `cache${index}.txt`);
    if (fs.existsSync(cacheFile))
        return fs.readFileSync(cacheFile, "utf-8").trim();
    return "";
}

function saveHash(content: string, index: number): void {
    const cacheFile = path.join(__dirname, `cache${index}.txt`);
    fs.writeFileSync(cacheFile, content, "utf-8");
}

async function checkForUpdates() {
    let isUpdated = false;

    for (let i = 0; i < TARGET_URLS.length; i++) {
        const { index, rss } = TARGET_URLS[i];
        console.log(`Checking for updates on ${rss}...`);

        const html = await fetchPage(rss);
        if (!html) continue;

        const $ = cheerio.load(html);
        const mainContent = $("body").text().trim();
        const previousHash = loadPreviousHash(i);

        // mainContentとpreviousHashを行単位で比較して差分を抽出
        const mainContentLines = new Set(mainContent.split("\n"));
        const previousHashLines = new Set(previousHash.split("\n"));

        let diffFound = false;
        let diff = "";

        const keywords = ["科研", "期限", "重要", "研推"];

        mainContentLines.forEach(line => {
            if (!previousHashLines.has(line)) {
                diffFound = true;
                if (keywords.some(keyword => line.includes(keyword))) {
                    line = "❗ " + line;
                }
                diff += line + "\n";
            }
        });

        if (diffFound) {
            console.log("Website has been updated!");
            console.log("Diff:", diff);

            // 差分をSlack通知に送信
            await sendSlackNotification(`🔔 ${index} が更新されました！\n` + diff);

            // 最新の内容を保存
            saveHash(mainContent, i);

            isUpdated = true;
        }
    }

    if (!isUpdated) {
        console.log("No changes detected.");
    }
}

checkForUpdates();
