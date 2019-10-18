import { SwaggerTypes, SwaggerEntitySchema } from "./interface/propertie";
import SwaggerEntityFormate from "./SwaggerEntityFormate";

/**
 * 提取泛型类型
 * @description WebReturn«PageInfo«AdInfoVo»» 提取为 WebReturn
 * @param entityName
 */
export function extractGenericName(entityName: string) {
    const i = entityName.indexOf("«");
    if (i !== -1) {
        return entityName.slice(0, i);
    } else {
        return entityName;
    }
}

/**
 * 是否泛型名称
 * @param name
 */
export function isGenericName(entityName: string) {
    return entityName.indexOf("«") !== -1 && entityName.indexOf("»") !== -1;
}

/**
 * 格式化所有类型接口字符串
 * @param types
 */
export function formateTypes(types: SwaggerTypes) {
    let code = "";
    for (let type in types) {
        const schemaInstance = new SwaggerEntityFormate(types[type]);
        code += `${schemaInstance.toString()}\n\n`;
    }
    return code;
}

/**
 * 格式化所有 SwaggerEntitySchema
 * @param schemas
 */
export function formateSchemas(schemas: SwaggerEntitySchema[]) {
    let code = "";
    code = schemas.reduce((prev, current) => {
        const schemaInstance = new SwaggerEntityFormate(current);
        return (prev += `${schemaInstance.toString()}\n\n`);
    }, code);
    return code;
}
