# swagger-to-code

一个将`swagger`接口解析并生成`typescript`代码。

## 特性

-   支持多个`swagger`
-   支持泛型类型
-   生成接口请求代码
-   生成实体接口类型
-   `fetch`工厂函数

> Tip: 目前处于开发阶段，许多功能暂未实现。

## 安装

**Note:** 创建名为`swagger.json`的配置文件, 在项目的根目录。

```json
{
    "swagger-urls": ["https://petstore.swagger.io/v2/swagger.json"]
}
```

## 使用

-   寻找接口 (`Cmd+Alt+i` on macOS or `Ctrl+Alt+i` on Windows and Linux)
-   寻找实体 (`Cmd+Alt+e` on macOS or `Ctrl+Alt+e` on Windows and Linux)

### 更多信息

-   [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
-   [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
