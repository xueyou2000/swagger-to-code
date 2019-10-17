import { SwaggerEntity } from "./propertie";

/**
 * 接口请求参数
 */
export interface SwaggerParameter extends SwaggerEntity {
    /**
     * 参数名称
     */
    name?: string;
    /**
     * 参数所属位置
     */
    in?: "header" | "body" | "path";
    /**
     * 是否必填
     */
    required?: boolean;
    /**
     * 架构
     * @description
     */
    schema?: SwaggerEntity;
    /**
     * 集合格式化，比如要求类型是数组，但允许传入 1,2,3
     */
    collectionFormat?: "multi";
}

/**
 * 接口地址
 */
export interface SwaggerPath {
    /**
     * 请求地址
     */
    url?: string;
    /**
     * 请求方法
     */
    method?: "post" | "get";
    /**
     * 所属标签
     */
    tags?: string[];
    /**
     * 接口说明
     */
    summary?: string;
    /**
     * 请求参数列表
     */
    parameters?: SwaggerParameter[];
    /**
     * 响应
     */
    responses?: {
        200: {
            description?: string;
            schema?: SwaggerEntity;
        };
    };
}

export type SwaggerMethod = "post" | "get";
export type SwaggerPaths = Partial<Record<SwaggerMethod, SwaggerPath>>;
