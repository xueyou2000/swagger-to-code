/**
 * 泛型类型定义
 */
export interface GenericSchema {
    /**
     * 泛型列表
     * @example ["T"]
     */
    generic: string[];
    /**
     * 泛型字段
     * @example { "data": "T" }
     */
    properties: { [key: string]: string };
}

/**
 * 泛型配置
 */
export type GenericSchemaConfig = { [type: string]: GenericSchema };
