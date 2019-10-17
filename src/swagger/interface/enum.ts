import SwaggerDocument from "../SwaggerDocument";
import { SwaggerEntity } from "./propertie";

export interface SwaggerPropertieEnum {
    /**
     * 枚举值
     */
    name: string;
    /**
     * Swagger类型转换ts接口类型
     */
    converType(document: SwaggerDocument, entity: SwaggerEntity): string;
}
