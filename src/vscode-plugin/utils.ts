import * as fs from "fs";
import * as http from "http";
import * as https from "https";
import * as path from "path";
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

/**
 * 字符串模板替换
 * @param {*} tpls
 * @param {*} data
 */
function tpl(tpls: string, data: any) {
    return tpls
        .replace(/{{(.*?)}}/g, function($1, $2) {
            return data[$2] === undefined ? $1 : data[$2];
        })
        .replace(/{{{(.*?)}}}/g, function($1, $2) {
            return data[$2] === undefined ? `{${$1}}` : `{${data[$2]}}`;
        });
}

/**
 * 驼峰转换下划线
 * @param {*} name
 */
function toLine(name: string) {
    let result = name.replace(/([A-Z])/g, "-$1").toLowerCase();
    if (result[0] === "-") {
        return result.slice(1);
    } else {
        return result;
    }
}

/**
 * 首字母大写
 * @param {*} name
 */
function toUpcase(name: string) {
    return name[0].toUpperCase() + name.slice(1);
}

/**
 * 递归创建目录
 * @param {*} dirname
 */
function mkdirs(dirname: string) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirs(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}

/**
 * 文件是否存在
 */
function exists(file: string) {
    return fs.existsSync(file);
}
