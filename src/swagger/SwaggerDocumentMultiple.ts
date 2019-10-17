import SwaggerDocument from "./SwaggerDocument";
import { SwaggerEntitySchema } from "./interface/propertie";
import { SwaggerPath } from "./interface/path";
import SwaggerPathCover from "./SwaggerPathCover";

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
     * 清除已缓存类型
     */
    public cleanTypes() {
        this.sources.forEach((x) => x.cleanTypes());
    }

    /**
     * 获取实体
     * @param entityName 实体名称
     * @returns 找不到则返回 null
     */
    public toEntitySchema(entityName: string) {
        const { sources } = this;
        let schema: SwaggerEntitySchema | null = null;
        try {
            for (let i = 0; i < sources.length; ++i) {
                schema = sources[i].toEntitySchema(entityName);
            }
        } catch (error) {
            schema = null;
        }
        return schema;
    }

    /**
     * 获取接口列表
     */
    public toInterfaceList(): SwaggerPathCover[] {
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
    public toEntityList(): SwaggerEntitySchema[] {
        const { sources } = this;
        let list: SwaggerEntitySchema[] = [];

        sources.forEach((x) => {
            list = list.concat(x.getEntitys());
        });

        return list;
    }
}
