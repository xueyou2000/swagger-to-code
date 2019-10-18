import SwaggerDocument from "./SwaggerDocument";
import { SwaggerEntitySchema, SwaggerTypes } from "./interface/propertie";
import { SwaggerPath } from "./interface/path";
import SwaggerPathCover from "./SwaggerPathCover";
import SwaggerEntityFormate from "./SwaggerEntityFormate";
import { SwaggerConfig } from "./interface";
import { objectToArray } from "../vscode-plugin/utils";
import SwaggerRequestFormate from "./SwaggerRequestFormate";

/**
 * Swagger多文档管理器
 */
export default class SwaggerDocumentMultiple {
    /**
     * Swagger文档对象集合
     */
    private sources: SwaggerDocument[];

    /**
     * 构造函数
     * @param sources Swagger文档对象集合
     */
    public constructor(sources: SwaggerDocument[] = []) {
        this.sources = sources;
    }

    /**
     * 获取接口数量
     */
    public pathCount(): number {
        return this.sources.reduce((prev, current) => {
            return prev + current.pathCount;
        }, 0);
    }

    /**
     * 获取实体数量
     */
    public entityCount(): number {
        return this.sources.reduce((prev, current) => {
            return prev + current.entityCount;
        }, 0);
    }

    /**
     * 获取实体定义
     * @param entityName 实体名称
     * @returns 找不到则返回 null
     */
    public getEntitySchema(entityName: string) {
        const { sources } = this;
        let schema: SwaggerEntitySchema | null = null;
        try {
            for (let i = 0; i < sources.length; ++i) {
                if (entityName in sources[i].swaggerRaw.definitions) {
                    schema = sources[i].toEntitySchema(entityName);
                }
            }
        } catch (error) {
            schema = null;
            console.warn(`解析实体 ${entityName} 失败`);
            console.error(error);
        }
        return schema;
    }

    /**
     * 获取实体ts接口代码
     * @param entityName
     */
    public getEntityCode(entityName: string) {
        const schema = this.getEntitySchema(entityName);
        if (schema) {
            const schemaInstance = new SwaggerEntityFormate(schema);
            return schemaInstance.toString();
        } else {
            return null;
        }
    }

    /**
     * 获取接口请求
     * @param path 请求路径
     */
    public getRequest(path: string): SwaggerRequestFormate | null {
        const { sources } = this;
        let result: SwaggerRequestFormate | null = null;
        sources.forEach((x) => {
            if (path in x.swaggerRaw.paths) {
                const request = x.pickerInterface((x.swaggerRaw.paths as any)[path]);
                if (request) {
                    result = new SwaggerRequestFormate(x, request);
                }
            }
        });
        return result || null;
    }

    /**
     * 获取接口列表
     */
    public getInterfaceList(): SwaggerPathCover[] {
        const { sources } = this;
        let list: SwaggerPathCover[] = [];

        sources.forEach((x) => {
            list = list.concat(x.getInterfaces());
        });

        return list;
    }

    /**
     * 获取实体列表
     */
    public getEntityList(): SwaggerEntitySchema[] {
        const { sources } = this;
        let list: SwaggerEntitySchema[] = [];

        sources.forEach((x) => {
            list = list.concat(x.getEntitys());
        });

        return list;
    }

    /**
     * 开启类型缓存
     */
    public startTypeCache() {
        const { sources } = this;
        sources.forEach((x) => x.startTypeCache());
    }

    /**
     * 关闭类型缓存
     */
    public endTypeCache() {
        const { sources } = this;
        sources.forEach((x) => x.endTypeCache());
    }

    /**
     * 获取缓存类型
     */
    public getTypeCache() {
        const { sources } = this;
        let result: SwaggerEntitySchema[] = [];
        sources.forEach((x) => {
            result = result.concat(objectToArray<SwaggerEntitySchema>(x.types));
        });
        return result;
    }
}
