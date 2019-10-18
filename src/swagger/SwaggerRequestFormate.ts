import { SwaggerPath, SwaggerParameterCover, SwaggerParameter } from "./interface/path";
import * as vscode from "vscode";
import SwaggerDocument from "./SwaggerDocument";
import { SwaggerEntity } from "./interface/propertie";

const template = `
/**
 * {{summary}}
 * {{parameterComments}}
 */
export function {{methodName}}({{parameterList}}) {
    return fetch(
        url: \`{{url}}\`,
    );
}
`;

export default class SwaggerRequestFormate {
    /**
     * Swagger文档
     */
    private document: SwaggerDocument;

    /**
     * 请求信息
     */
    private request: SwaggerPath;

    /**
     * 构造函数
     * @param document Swagger文档
     * @param request 请求信息
     */
    public constructor(document: SwaggerDocument, request: SwaggerPath) {
        this.document = document;
        this.request = request;
    }

    /**
     * 获取参数类型优先级
     * @param type
     */
    private parameterInPriority(type?: "header" | "body" | "path") {
        switch (type) {
            case "path":
                return 0;
            case "body":
                return 1;
            case "header":
                return 2;
            default:
                return 3;
        }
    }

    /**
     * 参数可先优先级
     * @param required
     */
    private parameterRequiredPriority(required?: boolean) {
        return required ? 0 : 1;
    }

    /**
     * 获取请求参数
     */
    private getParameters() {
        const { request, document } = this;
        const { parameters } = request;
        let hasHeaderParame = false;
        if (!parameters) {
            return [];
        }
        const sortParameters = parameters.sort((a, b) => {
            return (
                this.parameterInPriority(a.in) +
                this.parameterRequiredPriority(a.required) -
                (this.parameterInPriority(b.in) + this.parameterRequiredPriority(b.required))
            );
        });

        // SwaggerParameter配置转换SwaggerParameterCover
        const parameterCovers = sortParameters.map((x) => {
            const param: SwaggerParameterCover = { name: x.name, in: x.in, required: x.required, type: "any", description: x.description || "" };
            if (x.in === "header") {
                hasHeaderParame = true;
            }
            param.type = this.resoveType(x);
            return param;
        });

        // 将所有 header 参数生成一个对象类型, 然后从数组中去除 header 参数
        // 类似 { Authorization?: string; }
        const headerCover: SwaggerParameterCover = {
            name: "headers",
            in: "header",
            required: false,
            description: "headers",
            type:
                "{ " +
                parameterCovers.reduce((prev, current) => {
                    if (current.in !== "header") {
                        return prev;
                    }
                    return `${prev ? `${prev} ` : ""}${current.name}?: ${current.type}`;
                }, "") +
                " }",
        };

        const result = parameterCovers.filter((x) => x.in !== "header");

        return hasHeaderParame ? result.concat(headerCover) : result;
    }

    /**
     * 获取请求方法名称
     */
    private getMethodName() {
        const { request } = this;
        if (!request.url) {
            throw new Error("必须设置请求地址");
        }
        let name = "";
        const parts = request.url.split("/").reverse();
        parts.forEach((x) => {
            if (name === "" && x.indexOf("{") === -1) {
                name = x;
            }
        });
        return name;
    }

    /**
     * 获取参数注释字符串
     * @param parameters
     */
    private getParameterComments(parameters: SwaggerParameterCover[]) {
        return parameters.reduce((prev, current) => {
            return (prev ? `${prev}\n` : "") + ` * @param ${current.name} ${current.description}`;
        }, "");
    }

    /**
     * 获取参数列表字符串
     * @param parameters
     */
    private getParameterList(parameters: SwaggerParameterCover[]) {
        return parameters.reduce((prev, current) => {
            return (prev ? `${prev}, ` : "") + `${current.name}${current.required ? "" : "?"}: ${current.type}`;
        }, "");
    }

    /**
     * 解析类型
     * @param parameter
     */
    private resoveType(parameter: any) {
        const { document } = this;
        let type = "";
        if (parameter.type) {
            type = document.entitytoTypeName(parameter);
        } else if (parameter.schema && parameter.schema.$ref) {
            document.toEntitySchema(parameter.schema.$ref);
            type = document.converEntityName(parameter.schema.$ref);
        }
        return type.replace("«", "<").replace("»", ">");
    }

    /**
     * 获取返回类型
     */
    private getResponseType() {
        const { request } = this;
        return this.resoveType(request.responses[200]);
    }

    /**
     * 转换接口请求代码
     */
    public toString() {
        const { request } = this;
        let code = "";
        if (!request.url) {
            throw new Error("url字段未赋值");
        }
        const parameters = this.getParameters();
        const methodName = this.getMethodName();
        const parameterComments = this.getParameterComments(parameters);
        const parameterList = this.getParameterList(parameters);
        const url = request.url.replace(/\/\{/g, "/${");
        const restype = this.getResponseType();

        const headers = parameters.find((x) => x.in === "header");
        const body = parameters.find((x) => x.in === "body");

        code += `/**\n * ${request.summary}\n${parameterComments}\n */\n`;
        code += `export function ${methodName}(${parameterList}) {\n`;
        code += `\treturn fetch${restype ? `<${restype}>` : ""}({\n\t\turl: \`${url}\`,\n`;
        if (body) {
            code += `\t\tdata: ${body.name},\n`;
        }
        if (headers) {
            code += `\t\t\headers: ${headers.name},\n`;
        }
        code += `\t});\n}`;
        return code;
    }
}
