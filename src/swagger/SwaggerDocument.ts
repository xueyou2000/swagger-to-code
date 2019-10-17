import { Swagger } from "./interface";
import { SwaggerEntity, SwaggerEntitySchema, SwaggerPropertieMeta, SwaggerTypes } from "./interface/propertie";
import SwaggerTypeConver from "./SwaggerTypeConver";

/**
 * Swagger文档对象
 */
export default class SwaggerDocument {
    /**
     * swagger配置
     */
    private swagger: Swagger;

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
    public constructor(json: string) {
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
    private converEntityName(entityName: string) {
        return entityName.indexOf("#/definitions/") === -1 ? entityName : entityName.replace("#/definitions/", "");
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
            } else {
                throw new Error(`无效的实体名称: ${entityName}`);
            }
        } else {
            entity = entityOrName;
        }
        return entity;
    }

    /**
     * SwaggerEntity实体定义转SwaggerEntitySchema
     * @param entity 实体名或实体定义
     */
    public toEntitySchema(entityOrName: string | SwaggerEntity): SwaggerEntitySchema {
        return this.entityToSchema(this.findEntity(entityOrName));
    }

    /**
     * SwaggerEntity实体定义转SwaggerEntitySchema
     * @param entity 实体
     */
    private entityToSchema(entity: SwaggerEntity): SwaggerEntitySchema {
        const schema: SwaggerEntitySchema = { name: entity.title, description: entity.description || entity.title, properties: [] };
        // 使用缓存类型
        if (schema.name in this.types) {
            return this.types[schema.name];
        }

        if (entity.type === "object" && entity.properties) {
            for (let name in entity.properties) {
                const entityDefin = entity.properties[name];
                const meta: SwaggerPropertieMeta = { name, description: entityDefin.description || name, type: "any" };
                meta.type = this.entitytoTypeName(entityDefin);
                schema.properties.push(meta);
            }
        } else {
            throw new Error("无法转换实体对象" + entity);
        }

        // 加入缓存
        this._types[schema.name] = schema;
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
                throw new Error("$ref必须赋值 " + entity);
            }
            // 将引用类型也加入缓存
            this.toEntitySchema(entity.$ref);
            // _entity = this.findEntity(entity.$ref);
            return this.converEntityName(entity.$ref);
        } else {
            _entity = entity;
        }
        if (_entity.type && _entity.type in SwaggerTypeConver) {
            return SwaggerTypeConver[_entity.type].converType(this, _entity);
        } else {
            throw new Error(`暂不支持的字段类型: ${_entity.type}`);
        }
    }

    /**
     * 清除已缓存类型
     */
    public cleanTypes() {
        this._types = {};
    }
}
