import * as vscode from "vscode";
import Control from "./control";
import { unique } from "./utils";

export default class UI {
    public interfaceBar: vscode.StatusBarItem;
    public entityBar: vscode.StatusBarItem;
    private control: Control;

    constructor(control: Control) {
        this.control = control;

        this.interfaceBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this.interfaceBar.text = "0个接口";
        this.interfaceBar.command = "swagger.findInterface";
        this.interfaceBar.tooltip = "swagger接口数量";
        this.interfaceBar.color = vscode.ThemeColor;

        this.entityBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this.entityBar.text = "0个实体";
        this.entityBar.command = "swagger.findEntity";
        this.entityBar.tooltip = "swagger实体数量";
        this.entityBar.color = vscode.ThemeColor;
    }

    public render() {
        const { interfaceBar, entityBar, control } = this;
        const { documents } = control;

        interfaceBar.text = `$(zap)${documents.pathCount()}`;
        interfaceBar.show();

        entityBar.text = `$(database)${documents.entityCount()}`;
        entityBar.show();
    }

    /**
     * 显示接口选择面板
     */
    public async showInterfacePicker() {
        const { documents } = this.control;
        const items: vscode.QuickPickItem[] = documents.getInterfaceList().map((x) => x.toQuickPickItem());
        const result = await vscode.window.showQuickPick(items, {
            matchOnDetail: true,
        });

        if (result) {
            console.log("选择", result);
        }
    }

    /**
     * 显示实体选择面板
     */
    public async showEntityPicker() {
        const { documents } = this.control;
        let items: vscode.QuickPickItem[] = unique(
            documents.getEntityList().map((x) => ({
                label: x.name,
                description: x.description,
            })),
        );
        const result = await vscode.window.showQuickPick(items, {
            matchOnDescription: true,
        });

        if (result) {
            this.control.generateEntity(result.label);
            // console.log(documents.getEntityCode(result.label));
        }
    }
}
