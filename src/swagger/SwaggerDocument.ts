import { Swagger, SwaggerConfig } from "./interface";
import { SwaggerEntity, SwaggerEntitySchema, SwaggerPropertieMeta, SwaggerTypes } from "./interface/propertie";
import SwaggerTypeConver from "./SwaggerTypeConver";
import { SwaggerPaths, SwaggerPath } from "./interface/path";
import SwaggerPathCover from "./SwaggerPathCover";
import SwaggerDefaultConfig from "./SwaggerDefaultConfig";
import * as lodash from "lodash";
import { extractGenericName, isGenericName } from "./utils";

/**
 * Swagger文档对象
 */
export default class SwaggerDocument {
    /**
     * swagger配置
     */
    private swagger: Swagger;

    /**
     * Swagger配置
     */
    private config: SwaggerConfig;

    /**
     * 是否开启类型缓存
     */
    private _cache: boolean = false;

    /**
     * 接口数量
     */

    /**
     * Getter pathCount
     * @return {number}
     */
    public get pathCount(): number {
        return this._pathCount;
    }

    private _pathCount: number;

    /**
     * 实体数量
     */

    /**
     * Getter entityCount
     * @return {number}
     */
    public get entityCount(): number {
        return this._entityCount;
    }
    private _entityCount: number;

    /**
     * Getter types
     */
    public get types(): SwaggerTypes {
        return this._types;
    }
    /**
     * 缓存类型定义
     */
    private _types: SwaggerTypes = {};

    /**
     * 初始化Swagger文档
     * @param json
     */
    public constructor(json: string, config?: SwaggerConfig) {
        if (config) {
            this.config = lodash.merge({}, SwaggerDefaultConfig, config);
        } else {
            this.config = SwaggerDefaultConfig;
        }
        this.swagger = JSON.parse(json);
        this._pathCount = this.getPathCount();
        this._entityCount = this.getEntityCount();
    }

    /**
     * 获取接口数量
     */
    private getPathCount() {
        const { paths } = this.swagger;
        return Object.keys(paths).length;
    }

    /**
     * 获取实体数量
     */
    private getEntityCount() {
        const { definitions } = this.swagger;
        return Object.keys(definitions).length;
    }

    /**
     * 转换实体名称
     * @param entityName 实体名称，可以是definitions下的key名称, 也可以是#/definitions/AdSetMeal这种引用
     */
    public converEntityName(entityName: string) {
        return entityName.indexOf("#/definitions/") === -1 ? entityName : entityName.replace("#/definitions/", "");
    }

    /**
     * SwaggerEntity实体定义转SwaggerEntitySchema
     * @param entity 实体名或实体定义
     */
    public toEntitySchema(entityOrName: string | SwaggerEntity): SwaggerEntitySchema {
        if (typeof entityOrName === "string" && isGenericName(entityOrName)) {
            return this.resolveGenericEntityName(this.converEntityName(entityOrName));
        } else {
            return this.entityToSchema(this.findEntity(entityOrName));
        }
    }

    /**
     * 寻找实体
     * @param entityOrName 实体名称
     */
    private findEntity(entityOrName: string | SwaggerEntity): SwaggerEntity {
        const { definitions } = this.swagger;
        let entity: SwaggerEntity;
        if (typeof entityOrName === "string") {
            const entityName = this.converEntityName(entityOrName);
            if (entityName in definitions) {
                entity = definitions[entityName];
                entity.title = entityName;
            } else {
                throw new Error(`无效的实体名称: ${entityName}`);
            }
        } else {
            entity = entityOrName;
        }
        return entity;
    }

    /**
     * 提取泛型名称
     * @description WebReturn«PageInfo«AdInfoVo»» 提取为 ["WebReturn«PageInfo«AdInfoVo»»", "PageInfo«AdInfoVo»", "AdInfoVo"]
     * @param genericName
     */
    private extractextractGenericNames(genericName: string) {
        const names = genericName
            .split("«")
            .map((x) => x.replace(/»/g, ""))
            .reverse();
        const result = [];
        let lastName = "";

        for (let i = 0; i < names.length; ++i) {
            const name = names[i];
            if (i === 0) {
                lastName = name;
            } else {
                lastName = `${name}«${lastName}»`;
            }
            result.push(lastName);
        }
        return result.reverse();
    }

    /**
     * 解析泛型实体名称
     * @param name
     */
    private resolveGenericEntityName(entityName: string): SwaggerEntitySchema {
        const { definitions } = this.swagger;
        const names = this.extractextractGenericNames(entityName);
        names.forEach((name) => {
            if (name in definitions) {
                this.entityToSchema(this.findEntity(name));
            } else if (!(name in SwaggerTypeConver)) {
                throw new Error(`不存在 ${name} 定义`);
            }
        });
        return this.entityToSchema(this.findEntity(entityName));
    }

    /**
     * SwaggerEntity实体定义转SwaggerEntitySchema
     * @param entity 实体
     */
    private entityToSchema(entity: SwaggerEntity): SwaggerEntitySchema {
        const name = entity.title;
        if (!name) {
            throw new Error("gg");
        }
        const generic = isGenericName(name);
        const genericName = extractGenericName(name);
        const schema: SwaggerEntitySchema = {
            name: name,
            description: entity.description || "",
            properties: [],
            generic,
            genericSchema: null,
        };

        // 使用缓存类型
        if (name in this.types) {
            return this.types[name];
        }

        // 寻找对应泛型配置
        const genericConfig = generic ? this.config.generic[genericName] : null;
        schema.genericSchema = genericConfig;

        if (entity.type === "object") {
            if (entity.properties) {
                for (let name in entity.properties) {
                    const entityDefin = entity.properties[name];
                    // todo: 如果在泛型配置中找到, 就将对应的 type 设置成泛型 T
                    const meta: SwaggerPropertieMeta = { name, description: entityDefin.description || "", type: "any" };
                    if (genericConfig && name in genericConfig.properties) {
                        meta.type = genericConfig.properties[name];
                    } else {
                        meta.type = this.entitytoTypeName(entityDefin);
                    }
                    schema.properties.push(meta);
                }
            } else {
                // 真object类型
                const meta: SwaggerPropertieMeta = { name: name, description: entity.description || name, type: "object" };
                schema.properties.push(meta);
            }
        } else {
            console.error(entity);
            throw new Error(`无法转换实体对象 {${JSON.stringify(entity)}}`);
        }

        // 加入缓存
        if (name) {
            this._types[name] = schema;
        }
        return schema;
    }

    /**
     * SwaggerEntity实体定义转ts接口类型
     * @description  注意 { "name"?: string } 也是ts的类型, 匿名对象
     * @param entity
     */
    public entitytoTypeName(entity: SwaggerEntity): string {
        let _entity: SwaggerEntity;
        if ("$ref" in entity) {
            if (!entity.$ref) {
                throw new Error(`$ref必须赋值 {${JSON.stringify(entity)}}`);
            }
            entity.title = this.converEntityName(entity.$ref);
            // 将引用类型也加入缓存
            if (this._cache) {
                this.toEntitySchema(entity.$ref);
            }
            return this.converEntityName(entity.$ref);
        } else {
            _entity = entity;
        }
        if (_entity.type && _entity.type in SwaggerTypeConver) {
            return SwaggerTypeConver[_entity.type].converType(this, _entity);
        } else {
            console.warn(`暂不支持的字段类型: ${_entity.type} ${JSON.stringify(_entity, null, 4)}`);
            return "any";
        }
    }

    /**
     * 开启类型缓存
     */
    public startTypeCache() {
        this._types = {};
        this._cache = true;
    }

    /**
     * 关闭类型缓存
     */
    public endTypeCache() {
        this._cache = false;
    }

    /**
     * 清除缓存类型
     */
    public cleanTypeCache() {
        this._types = {};
    }

    /**
     * 获取Swagger数据
     */
    public get swaggerRaw() {
        return this.swagger;
    }

    /**
     * 选择接口(优先选择post)
     * @description 在很多请求方法中选择最优的
     * @param paths
     */
    public pickerInterface(paths: SwaggerPaths) {
        if ("post" in paths) {
            if (paths.post) {
                paths.post.method = "get";
            }
            return paths.post;
        } else if ("get" in paths) {
            if (paths.get) {
                paths.get.method = "post";
            }
            return paths.get;
        } else {
            const method = Object.keys(paths)[0];
            (paths as any)[method].method = method;
            return (paths as any)[method];
        }
    }

    /**
     * 获取所有接口
     */
    public getInterfaces(): SwaggerPathCover[] {
        const { paths } = this.swaggerRaw;
        const result: SwaggerPathCover[] = [];
        for (let url in paths) {
            result.push(new SwaggerPathCover(this, url, this.pickerInterface((paths as any)[url])));
        }
        return result;
    }

    /**
     * 获取所有实体
     */
    public getEntitys(): SwaggerEntitySchema[] {
        const { definitions } = this.swaggerRaw;
        const result: SwaggerEntitySchema[] = [];

        for (let name in definitions) {
            definitions[name].title = name;
            result.push(this.toEntitySchema(definitions[name]));
        }
        return result;
    }
}
