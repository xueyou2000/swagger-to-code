import SwaggerDocument from "./SwaggerDocument";
import { SwaggerPath } from "./interface/path";
import * as vscode from "vscode";

/**
 * SwaggerPathCover
 * 用于获取最终的请求地址
 */
export default class SwaggerPathCover {
    /**
     * 所属Swagger文档
     */
    private document: SwaggerDocument;

    /**
     * 请求接口信息
     */
    private path: SwaggerPath;

    /**
     * 请求地址
     */
    private url: string;

    /**
     * 构造函数
     * @param document
     * @param path
     */
    public constructor(document: SwaggerDocument, url: string, path: SwaggerPath) {
        this.document = document;
        this.url = url;
        this.path = path;
    }

    public get data() {
        this.path.url = this.url;
        return this.path;
    }

    public toQuickPickItem(): vscode.QuickPickItem {
        const { data } = this;
        return {
            label: data.url || "未知",
            description: data.tags ? data.tags.toString() : "",
            detail: `[${data.method || "post"}] ${data.summary || ""}`,
        };
    }
}
