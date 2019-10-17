/**
 * Swagger实体定义
 * @description 对应 Swagger 数据的 definitions中的任意项
 */
export interface SwaggerEntity {
    /**
     * 实体类型
     */
    type?: SwaggerPropertieType;
    /**
     * 格式化
     */
    format?: "int32" | "int64" | "double";
    /**
     * 实体名称
     */
    title: string;
    /**
     * 实体描述
     */
    description?: string;
    /**
     * 是否允许为空
     */
    allowEmptyValue?: boolean;
    /**
     * 枚举值
     */
    enum?: string[];
    /**
     * 列表项类型
     * @description 当 type = 'array' 时可用
     */
    items?: SwaggerEntity;
    /**
     * 字段
     * @description 当 type = 'object' 时可用
     */
    properties?: SwaggerEntitys;
    /**
     * 引用
     * @description 指向另一个实体定义，比如 #/definitions/QueryBaseDto
     */
    $ref?: string;
}

/**
 * Swagger实体Map
 * @description 对应 Swagger 数据的 definitions
 */
export type SwaggerEntitys = { [key: string]: SwaggerEntity };

/**
 * Swagger实体定义Map
 */
export type SwaggerTypes = { [key: string]: SwaggerEntitySchema };

/**
 * Swagger字段类型
 * @description Swagger的数据类型
 */
export type SwaggerPropertieType = "object" | "string" | "number" | "array" | "integer";

/**
 * Swagger实体字段元数据
 * @description 字段元数据，用于生成ts接口
 */
export interface SwaggerPropertieMeta {
    /**
     * 字段名
     */
    name: string;
    /**
     * 字段说明
     */
    description?: string;
    /**
     * 字段类型
     * @description 这里的type就已经要是准换后的类型，ts中的类型
     * @example "FIRST_LEVEL_AGENT" | "SECOND_LEVEL_AGENT" | "SALESMANE"
     * @example string[]
     */
    type: string;
}

/**
 * 实体类型定义
 * @description 实体类型定义，用于生成ts接口
 */
export interface SwaggerEntitySchema {
    /**
     * 实体类型名称
     */
    name: string;
    /**
     * 实体类型描述
     */
    description: string;
    /**
     * 实体类型字段元数据
     */
    properties: SwaggerPropertieMeta[];
}
