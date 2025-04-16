"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var cheerio = require("cheerio");
var fs = require("fs");
var path = require("path");
var iconv = require("iconv-lite");
var dotenv = require("dotenv");
var slackNotifier_1 = require("./slackNotifier");
dotenv.config({
    path: path.resolve('/home/fivelab/ドキュメント/HirokiHamaguchi/slackbot/.env')
});
var TARGET_URLS = [
    { index: "https://info.t.u-tokyo.ac.jp/index.html", rss: "https://info.t.u-tokyo.ac.jp/rss/index.xml" },
    { index: "https://bps.t.u-tokyo.ac.jp/index.html", rss: "https://bps.t.u-tokyo.ac.jp/rss/index.xml" },
];
function fetchPage(url) {
    return __awaiter(this, void 0, void 0, function () {
        var response, content, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get(url, {
                            responseType: "arraybuffer", // バイナリデータとして取得
                        })];
                case 1:
                    response = _a.sent();
                    content = iconv.decode(response.data, "UTF-8");
                    return [2 /*return*/, content];
                case 2:
                    error_1 = _a.sent();
                    console.error("Error fetching page:", error_1);
                    return [2 /*return*/, ""];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function loadPreviousHash(index) {
    var cacheFile = path.join(__dirname, "cache".concat(index, ".txt"));
    if (fs.existsSync(cacheFile))
        return fs.readFileSync(cacheFile, "utf-8").trim();
    return "";
}
function saveHash(content, index) {
    var cacheFile = path.join(__dirname, "cache".concat(index, ".txt"));
    fs.writeFileSync(cacheFile, content, "utf-8");
}
function checkForUpdates() {
    return __awaiter(this, void 0, void 0, function () {
        var previousHashIds, i, previousHash, previousHashLines, i, _a, index, rss, html, $, mainContent, lines, ja_idx, j, diff, excludeWords, includeWords, _loop_1, j;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    previousHashIds = new Set();
                    for (i = 0; i < TARGET_URLS.length; i++) {
                        previousHash = loadPreviousHash(i);
                        previousHashLines = new Set(previousHash.split("\n").map(function (line) { return line.trim(); }));
                        previousHashLines.forEach(function (line) {
                            if (!line.startsWith("http"))
                                return; // URL以外の行は無視
                            var id = line.split("/").pop() || line;
                            previousHashIds.add(id);
                        });
                    }
                    i = 0;
                    _b.label = 1;
                case 1:
                    if (!(i < TARGET_URLS.length)) return [3 /*break*/, 6];
                    _a = TARGET_URLS[i], index = _a.index, rss = _a.rss;
                    console.log("Checking for updates on ".concat(rss, "..."));
                    return [4 /*yield*/, fetchPage(rss)];
                case 2:
                    html = _b.sent();
                    if (!html)
                        return [3 /*break*/, 5];
                    $ = cheerio.load(html);
                    mainContent = $("body").text().trim();
                    // 最新の内容を保存
                    saveHash(mainContent, i);
                    lines = mainContent
                        .split("\n")
                        .map(function (line) { return line.trim(); })
                        .filter(function (line) { return line !== ""; });
                    ja_idx = 0;
                    for (j = 0; j < lines.length; j++) {
                        if (lines[j] === "ja") {
                            ja_idx = j;
                            break;
                        }
                    }
                    lines = lines.slice(ja_idx + 1);
                    if (lines.length % 2 !== 0) {
                        console.warn("Line count not even, skipping...");
                        return [3 /*break*/, 5];
                    }
                    diff = "";
                    excludeWords = ["実験", "集中講義", "厚労省", "ＡＭＥＤ", "表彰・賞", "週刊"];
                    includeWords = ["科研", "期限", "重要", "研推", "学振", "旅費", "JSPS"];
                    _loop_1 = function (j) {
                        var desc = lines[j];
                        var url = lines[j + 1];
                        if (excludeWords.some(function (keyword) { return desc.includes(keyword); })) {
                            return "continue";
                        }
                        if (includeWords.some(function (keyword) { return desc.includes(keyword); })) {
                            desc = "❗ " + desc;
                        }
                        desc = desc.replace(/<[^>]*>/g, ""); // HTMLタグを除去
                        desc = desc.replace(/&lt;br&gt;&lt;font size=-1&gt;/g, "");
                        desc = desc.replace(/&lt;\/font&gt;/g, "");
                        console.assert(url.startsWith("http"), "URLが不正です:", url);
                        var id = url.split("/").pop() || url;
                        if (!previousHashIds.has(id)) {
                            diff += desc + "\n" + url + "\n";
                            previousHashIds.add(id);
                        }
                    };
                    for (j = 0; j < lines.length; j += 2) {
                        _loop_1(j);
                    }
                    if (!diff) return [3 /*break*/, 4];
                    console.log("Website has been updated!");
                    console.log("Diff:", diff);
                    // 差分をSlack通知に送信
                    return [4 /*yield*/, (0, slackNotifier_1.sendSlackNotification)("\uD83D\uDD14 ".concat(index, " \u304C\u66F4\u65B0\u3055\u308C\u307E\u3057\u305F\uFF01\n") + diff)];
                case 3:
                    // 差分をSlack通知に送信
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    console.log("No changes detected.");
                    _b.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 1];
                case 6:
                    console.log("Done.");
                    return [2 /*return*/];
            }
        });
    });
}
checkForUpdates();
