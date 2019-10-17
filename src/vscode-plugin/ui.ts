import * as vscode from "vscode";
import Control from "./control";

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

    render() {
        const { interfaceBar, entityBar, control } = this;
        const { documents } = control;

        interfaceBar.text = `$(zap)${documents.pathCount()}`;
        interfaceBar.show();

        entityBar.text = `$(database)${documents.entityCount()}`;
        entityBar.show();
    }
}
