import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import * as iconv from "iconv-lite";
import * as dotenv from "dotenv";
import { sendSlackNotification } from "./slackNotifier";

dotenv.config(
    {
        path: path.resolve('/home/fivelab/ドキュメント/HirokiHamaguchi/slackbot/.env')
    }
);

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
    const previousHashIds = new Set<string>();

    for (let i = 0; i < TARGET_URLS.length; i++) {
        const previousHash = loadPreviousHash(i);
        const previousHashLines = new Set(previousHash.split("\n").map(line => line.trim()));
        previousHashLines.forEach(line => {
            if (!line.startsWith("http")) return; // URL以外の行は無視
            const id = line.split("/").pop() || line;
            previousHashIds.add(id);
        });
    }

    for (let i = 0; i < TARGET_URLS.length; i++) {
        const { index, rss } = TARGET_URLS[i];
        console.log(`Checking for updates on ${rss}...`);

        const html = await fetchPage(rss);
        if (!html) continue;

        const $ = cheerio.load(html);
        const mainContent = $("body").text().trim();

        // 最新の内容を保存
        saveHash(mainContent, i);

        let lines = mainContent
            .split("\n")
            .map(line => line.trim())
            .filter(line => line !== "");

        let ja_idx = 0;
        for (let j = 0; j < lines.length; j++) {
            if (lines[j] === "ja") {
                ja_idx = j;
                break;
            }
        }
        lines = lines.slice(ja_idx + 1);

        if (lines.length % 2 !== 0) {
            console.warn("Line count not even, skipping...");
            continue;
        }

        let diff = "";

        const excludeWords = ["実験", "集中講義", "厚労省", "ＡＭＥＤ"];
        const includeWords = ["科研", "期限", "重要", "研推", "学振", "旅費", "JSPS"];

        for (let j = 0; j < lines.length; j += 2) {
            let desc = lines[j];
            const url = lines[j + 1];
            if (excludeWords.some(keyword => desc.includes(keyword))) {
                continue;
            }
            if (includeWords.some(keyword => desc.includes(keyword))) {
                desc = "❗ " + desc;
            }
            desc = desc.replace(/<[^>]*>/g, ""); // HTMLタグを除去
            desc = desc.replace(/&lt;br&gt;&lt;font size=-1&gt;/g, "");
            desc = desc.replace(/&lt;\/font&gt;/g, "");

            console.assert(url.startsWith("http"), "URLが不正です:", url);
            const id = url.split("/").pop() || url;
            if (!previousHashIds.has(id)) {
                diff += desc + "\n" + url + "\n";
                previousHashIds.add(id);
            }
        }

        if (diff) {
            console.log("Website has been updated!");
            console.log("Diff:", diff);

            // 差分をSlack通知に送信
            await sendSlackNotification(`🔔 ${index} が更新されました！\n` + diff);
        } else {
            console.log("No changes detected.");
        }
    }

    console.log("Done.");
}

checkForUpdates();
