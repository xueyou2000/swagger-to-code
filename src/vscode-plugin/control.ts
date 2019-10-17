import * as vscode from "vscode";
import SwaggerDocumentMultiple from "../swagger/SwaggerDocumentMultiple";
import UI from "./ui";
import { SwaggerConfig } from "../swagger/interface";
import * as path from "path";

export default class Control {
    private static singleInstance: Control;

    public config: SwaggerConfig;

    public documents: SwaggerDocumentMultiple;

    public ui: UI | null = null;

    public commands: any = {
        findInterface: "swagger.findInterface",
        findEntity: "swagger.findEntity",
    };

    public constructor(documents: SwaggerDocumentMultiple, config: SwaggerConfig) {
        this.documents = documents;
        this.config = config;
        Control.initInstance(this, documents, config);
        this.createCommands();
    }

    private createCommands() {
        const { commands } = this;
        for (let methodName in commands) {
            vscode.commands.registerCommand(commands[methodName], (this as any)[methodName].bind(this));
        }
    }

    /**
     * 寻找接口 - 插件命令
     */
    private findInterface() {
        if (this.ui) {
            this.ui.showInterfacePicker();
        }
    }

    /**
     * 寻找实体 - 插件命令
     */
    private findEntity() {
        if (this.ui) {
            this.ui.showEntityPicker();
        }
    }

    /**
     * 生成实体ts文件
     */
    public generateEntity(entityName: string) {
        const { config, documents } = this;

        console.log("config ", config);

        const folders = vscode.workspace.workspaceFolders;
        if (folders && folders.length > 0) {
            const uri = folders[0].uri;
            if (uri.scheme === "file") {
                const dist = path.resolve(uri.fsPath, config.out || "./src/api", "types");
                console.log(dist);
            } else {
                console.warn("不支持的工作空间路径 " + uri);
            }
        }
    }

    public static initInstance(instance: Control, documents: SwaggerDocumentMultiple, config: SwaggerConfig) {
        instance.documents = documents;
        instance.config = config;
        if (!instance.ui) {
            instance.ui = new UI(instance);
        }
        instance.ui.render();
    }

    public static getSingleInstance(documents: SwaggerDocumentMultiple, config: SwaggerConfig) {
        if (!Control.singleInstance) {
            Control.singleInstance = new Control(documents, config);
        } else if (documents) {
            const instance = Control.singleInstance;
            Control.initInstance(instance, documents, config);
        }
        return Control.singleInstance;
    }
}
