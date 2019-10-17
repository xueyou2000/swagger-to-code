import { SwaggerPropertieEnum } from "./interface/enum";
import SwaggerDocument from "./SwaggerDocument";
import { SwaggerEntity } from "./interface/propertie";
import SwaggerEntityFormate from "./SwaggerEntityFormate";

/**
 * Swagger字段类型枚举
 */
export default class SwaggerTypeConver {
    /**
     * 字符串
     */
    public static readonly string: SwaggerPropertieEnum = {
        name: "string",
        converType(document: SwaggerDocument, entity: SwaggerEntity) {
            if (entity.enum) {
                return entity.enum.reduce((prev, current, i) => {
                    return prev ? `${prev} | '${current}'` : `'current'`;
                }, "");
            } else {
                return "string";
            }
        },
    };

    /**
     * 布尔值
     */
    public static readonly boolean: SwaggerPropertieEnum = {
        name: "boolean",
        converType(document: SwaggerDocument, entity: SwaggerEntity) {
            return "boolean";
        },
    };

    /**
     * 数值
     */
    public static readonly number: SwaggerPropertieEnum = {
        name: "number",
        converType(document: SwaggerDocument, entity: SwaggerEntity) {
            return "number";
        },
    };

    /**
     * 整数
     */
    public static readonly integer: SwaggerPropertieEnum = {
        name: "integer",
        converType(document: SwaggerDocument, entity: SwaggerEntity) {
            return "number";
        },
    };

    /**
     * 数组
     */
    public static readonly array: SwaggerPropertieEnum = {
        name: "array",
        converType(document: SwaggerDocument, entity: SwaggerEntity) {
            if (entity.items && entity.items) {
                return document.entitytoTypeName(entity.items) + "[]";
            } else {
                throw new Error(`array 类型必须指定 items 字段 {${JSON.stringify(entity)}}`);
            }
        },
    };

    /**
     * 对象
     */
    public static readonly object: SwaggerPropertieEnum = {
        name: "object",
        converType(document: SwaggerDocument, entity: SwaggerEntity) {
            if ("properties" in entity) {
                const schema = document.toEntitySchema(entity);
                const schemaInstance = new SwaggerEntityFormate(schema);
                return schemaInstance.toInterfaceDefinString();
            } else {
                return "any";
            }
        },
    };
}
