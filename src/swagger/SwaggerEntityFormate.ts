import { SwaggerEntitySchema, SwaggerTypes } from "./interface/propertie";
import { isGenericName, extractGenericName } from "./utils";

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
            console.error(this.schema);
            throw new Error("properties必须定义");
        }
        properties.forEach((propertie, i) => {
            const str = `\n\t/** ${propertie.description || propertie.name} */\n\t${propertie.name}?: ${propertie.type};\n`;
            code += str;
        });
        return code + `\n}`;
    }

    /**
     * 生成ts接口字符串
     * @description 包含实体信息
     */
    public toString() {
        const { name, description, genericSchema } = this.schema;
        // ["T", "T2"] 泛型列表，转换 <T = any, T2 = any>
        const genericList =
            genericSchema &&
            genericSchema.generic.reduce((prev, current) => {
                return `${prev ? `${prev}, ` : ""}${current} = any`;
            }, "");
        const _name = isGenericName(name) && genericSchema ? `${extractGenericName(name)}<${genericList}>` : name;
        const code = `/** ${description || extractGenericName(name)} */\nexport interface ${_name} ${this.toInterfaceDefinString()}`;
        return code;
    }
}
