import * as fs from "fs";
import * as http from "http";
import * as https from "https";
import { URL } from "url";

/**
 * 读取文件
 * @param uri
 */
export function readFile(uri: URL) {
    if (fs.existsSync(uri)) {
        return fs.readFileSync(uri, { encoding: "utf-8" });
    } else {
        throw new Error("文件不存在: " + uri);
    }
}

/**
 * http请求
 * @param uri
 */
export function httpRequest(uri: URL) {
    return get(uri);
}

/**
 * https请求
 * @param uri
 */
export function httpsRequest(uri: URL) {
    return get(uri, true);
}

/**
 * get请求
 * @param uri
 */
export function get(uri: URL, _https = false) {
    const protocol = _https ? https : http;
    return new Promise<string>((resolve, reject) => {
        protocol.get(uri, (res) => {
            const contentType = res.headers["content-type"];

            try {
                if (res.statusCode) {
                    if (res.statusCode < 200 || res.statusCode >= 300) {
                        throw new Error("请求失败 " + res.statusMessage);
                    } else {
                        if (contentType && contentType.indexOf("application/json") === -1) {
                            throw new Error(`无效的响应类型 ${contentType}`);
                        }
                    }
                } else {
                    throw new Error("请求失败 " + res.statusMessage);
                }
            } catch (error) {
                reject(error);
                // 消费响应数据来释放内存。
                res.resume();
                return;
            }

            res.setEncoding("utf-8");
            var rawData = "";
            res.on("data", (chunk) => {
                rawData += chunk;
            })
                .on("end", () => {
                    try {
                        // 尝试解析json数据
                        resolve(JSON.parse(rawData));
                    } catch (error) {
                        reject(error);
                    }
                })
                .on("error", reject);
        });
    });
}

/**
 * 读取文件
 * @param url
 */
export async function readConfig(url: URL) {
    switch (url.protocol) {
        case "file:":
            return readFile(url);
        case "http:":
            var json = await httpRequest(url);
            return JSON.stringify(json);
        case "https:":
            var json = await httpsRequest(url);
            return JSON.stringify(json);
        default:
            throw new Error("不支持的协议地址 " + url.href);
    }
}
