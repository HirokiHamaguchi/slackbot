import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import * as iconv from "iconv-lite";
import { sendSlackNotification } from "./slackNotifier";


const TARGET_URLS = [
    { index: "https://info.t.u-tokyo.ac.jp/index.html", rss: "https://info.t.u-tokyo.ac.jp/rss/index.xml" },
    { index: "https://bps.t.u-tokyo.ac.jp/index.html", rss: "https://bps.t.u-tokyo.ac.jp/rss/index.xml" },
];

async function fetchPage(url: string): Promise<string> {
    try {
        const response = await axios.get(url, {
            responseType: "arraybuffer", // バイナリデータとして取得
        });

        // Try to detect encoding from headers or meta tags
        let encoding = "utf-8";
        const contentType = response.headers && (response.headers["content-type"] || response.headers["Content-Type"] || "");
        const m = /charset=([^;\s]+)/i.exec(contentType as string);
        if (m && m[1]) {
            encoding = m[1].toLowerCase();
        } else {
            // Fallback: inspect the first chunk of the HTML for a meta charset declaration
            const snippet = response.data.slice(0, 4096).toString("latin1");
            const meta1 = /<meta[^>]*charset=["']?([^"'>\s]+)/i.exec(snippet);
            const meta2 = /<meta[^>]*content=["'][^"']*charset=([^"'>\s]+)/i.exec(snippet);
            if (meta1 && meta1[1]) encoding = meta1[1].toLowerCase();
            else if (meta2 && meta2[1]) encoding = meta2[1].toLowerCase();
        }

        // Decode using iconv-lite with detected encoding
        const content = iconv.decode(response.data, encoding);
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

        const excludeWords = ["実験", "集中講義", "厚労省", "ＡＭＥＤ", "表彰・賞", "週刊", "国推/交流", "留学", "公共政策大学院", "シンポジウム", "医療機器", "国際推進課", "メルマガ", "アントレ道場", "起業", "エレベーター点検", "危険物", "リマインド"];
        const includeWords = ["科研", "学振", "DC", "JSPS"];

        for (let j = 0; j < lines.length; j += 2) {
            let desc = lines[j];
            const url = lines[j + 1];
            if (!includeWords.some(keyword => desc.includes(keyword))) {
                continue;
            }
            if (excludeWords.some(keyword => desc.includes(keyword))) {
                continue;
            }
            desc = desc.replace(/<[^>]*>/g, ""); // HTMLタグを除去
            desc = desc.replace(/&lt;br&gt;&lt;font size=-1&gt;/g, "");
            desc = desc.replace(/&lt;\/font&gt;/g, "");

            console.assert(url.startsWith("http"), "URLが不正です:", url);
            const id = url.split("/").pop() || url;
            if (!previousHashIds.has(id)) {
                // Fetch page content now that the entry passed filters
                try {
                    const pageContent = await fetchPage(url);
                    const $page = cheerio.load(pageContent);
                    let text = $page("body").text() || $page.root().text() || "";
                    text = text.replace(/\s+/g, " ").trim();
                    // Append description, URL and the extracted page text to the diff
                    diff += desc + "\n" + url + "\n\n" + text + "\n\n" + "---\n";
                } catch (e) {
                    // If fetching fails, still include the URL so it's visible in the diff
                    diff += desc + "\n" + url + "\n\n" + "(Failed to fetch page content)\n\n" + "---\n";
                }
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
