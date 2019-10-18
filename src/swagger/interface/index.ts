import { SwaggerPaths } from "./path";
import { SwaggerEntitys } from "./propertie";
import { GenericSchemaConfig } from "./conver";

/**
 * Swagger标签
 */
export interface SwaggerTag {
    /**
     * 标签名称
     */
    name: string;
    /**
     * 标签描述
     */
    description: string;
}

/**
 * Swagger信息
 */
export interface SwaggerInfo {
    /**
     * 接口标题
     */
    title: string;
    /**
     * 接口版本
     */
    version: string;
    /**
     * 接口描述
     */
    description: string;
}

/**
 * Swagger接口数据
 */
export interface Swagger {
    /**
     * swagger版本
     */
    swagger: "1.0" | "2.0";
    /**
     * swagger信息
     */
    info: SwaggerInfo;
    /**
     * host
     */
    host: string;
    /**
     * basePath
     */
    basePath: string;
    /**
     * 标签
     */
    tags: SwaggerTag[];
    /**
     * 请求路径
     */
    paths: SwaggerPaths;
    /**
     * 实体定义
     */
    definitions: SwaggerEntitys;
}

/**
 * 配置文件
 */
export interface SwaggerConfig {
    /**
     * swagger接口地址列表
     * @example [ "https://petstore.swagger.io/v2/swagger.json" ]
     */
    "swagger-urls": string[];
    /**
     * 泛型配置
     */
    generic: GenericSchemaConfig;
    /**
     * 接口输出目录
     */
    out: string;
    /**
     * 网络请求库地址
     */
    fetch: string;
}
