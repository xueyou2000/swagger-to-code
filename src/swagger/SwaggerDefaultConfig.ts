import { SwaggerConfig } from "./interface";

const SwaggerDefaultConfig: SwaggerConfig = {
    "swagger-urls": [],
    generic: {
        WebReturn: {
            generic: ["T"],
            properties: {
                data: "T",
            },
        },
        PageInfo: {
            generic: ["T"],
            properties: {
                list: "T[]",
            },
        },
    },
    out: "./src/api",
    fetch: "./src/api/fetch",
};

export default SwaggerDefaultConfig;
