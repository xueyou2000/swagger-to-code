// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";
import * as url from "url";
import { readFile, readConfig } from "./utils.js";
import { SwaggerConfig } from "../swagger/interface/index.js";
import SwaggerDocumentMultiple from "../swagger/SwaggerDocumentMultiple.js";
import SwaggerDocument from "../swagger/SwaggerDocument.js";
import Control from "./control.js";
import SwaggerDefaultConfig from "../swagger/SwaggerDefaultConfig.js";
import * as lodash from "lodash";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration("swagger");
    const SwaggerConfigName = config.get<string>("filename");
    if (!SwaggerConfigName) {
        vscode.window.showErrorMessage("swagger配置文件名称不能为空");
        return;
    }
    const fileWatcher = vscode.workspace.createFileSystemWatcher(`**/${SwaggerConfigName}`);

    function reloadConfig(uri: vscode.Uri) {
        vscode.window.withProgress(
            {
                title: "初始化Swagger配置",
                location: vscode.ProgressLocation.Window,
            },
            async (progress, token) => {
                try {
                    if (uri.scheme === "file") {
                        progress.report({ increment: 0, message: "加载Swagger配置文件" });
                        var config = new url.URL("file://" + path.resolve(uri.fsPath || uri.path));
                        const swaggerConfig: SwaggerConfig = lodash.merge({}, SwaggerDefaultConfig, JSON.parse(readFile(config)));
                        const sources: SwaggerDocument[] = [];
                        const length = swaggerConfig["swagger-urls"].length;
                        for (let i = 0; i < length; ++i) {
                            const filePath = swaggerConfig["swagger-urls"][i];
                            progress.report({ increment: ((i + 1) / length) * 100, message: "加载Swagger配置文件" });
                            const swaggerData = await readConfig(new url.URL(filePath));
                            sources.push(new SwaggerDocument(swaggerData, swaggerConfig));
                        }
                        const documents = new SwaggerDocumentMultiple(sources);
                        Control.getSingleInstance(documents, swaggerConfig);
                    } else {
                        throw new Error("暂不支持的地址类型 " + uri);
                    }
                } catch (error) {
                    vscode.window.showErrorMessage(error.message);
                }
            },
        );
    }

    const uris = await vscode.workspace.findFiles(SwaggerConfigName);
    if (uris && uris.length > 0) {
        reloadConfig(uris[0]);
    }

    fileWatcher.onDidCreate(reloadConfig);
    fileWatcher.onDidChange(reloadConfig);
}

// this method is called when your extension is deactivated
export function deactivate() {}
