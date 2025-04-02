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
dotenv.config();
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
        var isUpdated, previousHashLines, i, previousHash, previousHashLinesI, _loop_1, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    isUpdated = false;
                    previousHashLines = new Set();
                    for (i = 0; i < TARGET_URLS.length; i++) {
                        previousHash = loadPreviousHash(i);
                        previousHashLinesI = new Set(previousHash.split("\n"));
                        previousHashLinesI.forEach(function (line) {
                            previousHashLines.add(line);
                        });
                    }
                    _loop_1 = function (i) {
                        var _b, index, rss, html, $, mainContent, mainContentLines, diffFound, diff, excludeWords, includeWords, skipNext;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _b = TARGET_URLS[i], index = _b.index, rss = _b.rss;
                                    console.log("Checking for updates on ".concat(rss, "..."));
                                    return [4 /*yield*/, fetchPage(rss)];
                                case 1:
                                    html = _c.sent();
                                    if (!html)
                                        return [2 /*return*/, "continue"];
                                    $ = cheerio.load(html);
                                    mainContent = $("body").text().trim();
                                    mainContentLines = new Set(mainContent.split("\n"));
                                    diffFound = false;
                                    diff = "";
                                    excludeWords = ["実験", "集中講義"];
                                    includeWords = ["科研", "期限", "重要", "研推", "学振"];
                                    skipNext = false;
                                    mainContentLines.forEach(function (line) {
                                        if (skipNext) {
                                            skipNext = false;
                                            return;
                                        }
                                        if (!previousHashLines.has(line)) {
                                            if (excludeWords.some(function (keyword) { return line.includes(keyword); })) {
                                                skipNext = true;
                                                return;
                                            }
                                            if (includeWords.some(function (keyword) { return line.includes(keyword); })) {
                                                line = "❗ " + line;
                                            }
                                            line = line.replace(/<[^>]*>/g, ""); // HTMLタグを除去
                                            line = line.replace(/&lt;br&gt;&lt;font size=-1&gt;/g, "");
                                            line = line.replace(/&lt;\/font&gt;/g, "");
                                            diff += line + "\n";
                                            diffFound = true;
                                        }
                                    });
                                    mainContentLines.forEach(function (line) {
                                        previousHashLines.add(line);
                                    });
                                    if (!diffFound) return [3 /*break*/, 3];
                                    console.log("Website has been updated!");
                                    console.log("Diff:", diff);
                                    // 差分をSlack通知に送信
                                    return [4 /*yield*/, (0, slackNotifier_1.sendSlackNotification)("\uD83D\uDD14 ".concat(index, " \u304C\u66F4\u65B0\u3055\u308C\u307E\u3057\u305F\uFF01\n") + diff)];
                                case 2:
                                    // 差分をSlack通知に送信
                                    _c.sent();
                                    // 最新の内容を保存
                                    saveHash(mainContent, i);
                                    isUpdated = true;
                                    _c.label = 3;
                                case 3: return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < TARGET_URLS.length)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1(i)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4:
                    if (!isUpdated) {
                        console.log("No changes detected.");
                    }
                    return [2 /*return*/];
            }
        });
    });
}
checkForUpdates();
