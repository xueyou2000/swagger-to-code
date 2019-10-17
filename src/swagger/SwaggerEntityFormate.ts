import { SwaggerEntitySchema, SwaggerTypes } from "./interface/propertie";

/**
 * 实体定义格式化
 * @description 用于将实体定义格式化输出ts接口代码
 */
export default class SwaggerEntityFormate {
    private schema: SwaggerEntitySchema;

    public constructor(schema: SwaggerEntitySchema) {
        this.schema = schema;
    }

    /**
     * 生成ts接口字符串
     * @description 只包含字段，不包含实体信息
     */
    public toInterfaceDefinString() {
        let code = "{\n";
        const { properties } = this.schema;
        if (!properties) {
            throw new Error("properties必须定义 " + this.schema);
        }
        properties.forEach((propertie, i) => {
            const str = `\n\t/** ${propertie.description} */\n\t${propertie.name}?: ${propertie.type};\n`;
            code += str;
        });
        return code + `\n}`;
    }

    /**
     * 生成ts接口字符串
     * @description 包含实体信息
     */
    public toString() {
        const code = `/** ${this.schema.description} */\nexport interface ${this.schema.name} ${this.toInterfaceDefinString()}`;
        return code;
    }
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
