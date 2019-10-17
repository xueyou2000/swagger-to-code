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

// 应与 packages.contributes.jsonValidation[0].fileMatch 值相同
const SwaggerConfigName = "swagger.json";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
    const fileWatcher = vscode.workspace.createFileSystemWatcher(`**/${SwaggerConfigName}`);

    async function reloadConfig(uri: vscode.Uri) {
        try {
            if (uri.scheme === "file") {
                var config = new url.URL("file://" + path.resolve(uri.fsPath || uri.path));
                const swaggerConfig: SwaggerConfig = JSON.parse(readFile(config));
                const sources: SwaggerDocument[] = [];
                for (let i = 0; i < swaggerConfig["swagger-urls"].length; ++i) {
                    const filePath = swaggerConfig["swagger-urls"][i];
                    const swaggerData = await readConfig(new url.URL(filePath));
                    sources.push(new SwaggerDocument(swaggerData));
                }
                const documents = new SwaggerDocumentMultiple(sources);
                Control.getSingleInstance(documents);
            } else {
                throw new Error("暂不支持的地址类型 " + uri);
            }
        } catch (error) {
            vscode.window.showErrorMessage(error.message);
        }
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
