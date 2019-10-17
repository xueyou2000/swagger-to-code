import * as vscode from "vscode";
import SwaggerDocumentMultiple from "../swagger/SwaggerDocumentMultiple";
import UI from "./ui";

export default class Control {
    private static singleInstance: Control;

    public documents: SwaggerDocumentMultiple;

    public ui: UI | null = null;

    public commands: any = {
        findInterface: "swagger.findInterface",
        findEntity: "swagger.findEntity",
    };

    public constructor(documents: SwaggerDocumentMultiple) {
        this.documents = documents;
        Control.initInstance(this, documents);
        this.createCommands();
    }

    private createCommands() {
        const { commands } = this;
        for (let methodName in commands) {
            vscode.commands.registerCommand(commands[methodName], (this as any)[methodName].bind(this));
        }
    }

    private findInterface() {
        console.log("寻找到接口" + this.documents.pathCount);
    }

    private findEntity() {
        console.log("寻找到实体" + this.documents.entityCount);
    }

    public static initInstance(instance: Control, documents: SwaggerDocumentMultiple) {
        instance.documents = documents;
        if (!instance.ui) {
            instance.ui = new UI(instance);
        }
        instance.ui.render();
    }

    public static getSingleInstance(documents: SwaggerDocumentMultiple) {
        if (!Control.singleInstance) {
            Control.singleInstance = new Control(documents);
        } else if (documents) {
            const instance = Control.singleInstance;
            Control.initInstance(instance, documents);
        }
        return Control.singleInstance;
    }
}
