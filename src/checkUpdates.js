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
var TARGET_URL = "https://info.t.u-tokyo.ac.jp/student_other_all.html";
var CACHE_FILE = path.join(__dirname, "cache.txt");
function fetchPage() {
    return __awaiter(this, void 0, void 0, function () {
        var response, content, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get(TARGET_URL, {
                            responseType: "arraybuffer", // バイナリデータとして取得
                        })];
                case 1:
                    response = _a.sent();
                    content = iconv.decode(response.data, "EUC-JP");
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
function loadPreviousHash() {
    if (fs.existsSync(CACHE_FILE))
        return fs.readFileSync(CACHE_FILE, "utf-8").trim();
    throw new Error("cannot read cache.");
}
function saveHash(content) {
    fs.writeFileSync(CACHE_FILE, content, "utf-8");
}
function checkForUpdates() {
    return __awaiter(this, void 0, void 0, function () {
        var html, $, mainContent, previousHash, mainContentLines, previousHashLines, diffFound, diff, i, now, japanTime, isKaken;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Checking for updates on ".concat(TARGET_URL, "..."));
                    return [4 /*yield*/, fetchPage()];
                case 1:
                    html = _a.sent();
                    if (!html)
                        return [2 /*return*/];
                    $ = cheerio.load(html);
                    mainContent = $("body").text().trim();
                    previousHash = loadPreviousHash();
                    mainContentLines = mainContent.split("\n");
                    previousHashLines = previousHash.split("\n");
                    diffFound = false;
                    diff = "";
                    for (i = 2; i < mainContentLines.length; i++) {
                        if (mainContentLines[i] !== previousHashLines[2]) {
                            diffFound = true;
                            diff += mainContentLines[i] + "\n";
                        }
                        else {
                            break;
                        }
                    }
                    if (!!diffFound) return [3 /*break*/, 4];
                    console.log("No changes detected.");
                    now = new Date();
                    japanTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
                    if (!(japanTime.getDay() === 5)) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, slackNotifier_1.sendSlackNotification)("(正常に動作しているか確認用の定期メッセージです)")];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [3 /*break*/, 6];
                case 4:
                    console.log("Website has been updated!");
                    isKaken = diff.includes("科研") ? "❗ 特に科研費に関する更新です\n" : "";
                    // 差分をSlack通知に送信
                    return [4 /*yield*/, (0, slackNotifier_1.sendSlackNotification)("\uD83D\uDD14 https://info.t.u-tokyo.ac.jp/index_5.html \u304C\u66F4\u65B0\u3055\u308C\u307E\u3057\u305F\uFF01\n" + isKaken + diff)];
                case 5:
                    // 差分をSlack通知に送信
                    _a.sent();
                    // 最新の内容を保存
                    saveHash(mainContent);
                    _a.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    });
}
checkForUpdates();
