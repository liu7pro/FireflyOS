# FireflyOS 官网

FireflyOS 是 DomeOS Team 打造的 Windows 精简优化版本，覆盖 Windows 7 / 8.1 / 10 / 11。

本仓库为 FireflyOS 项目官网页面，使用纯静态 HTML / CSS / JavaScript 构建，部署于 GitHub Pages。

- 线上地址：https://liu7pro.github.io/FireflyOS/
- 官方下载站：https://fireflyos.choling.cyou

## 目录结构

```
.
├── index.html          首页
├── 404.html            404 页面
├── .nojekyll           关闭 Jekyll 处理
└── assets/
    ├── style.css       公共样式
    ├── theme.css       站点配色
    ├── main.js         交互与入场动画
    └── logo.svg        站点图标
```

## 本地预览

在仓库根目录启动任意静态服务器，例如：

```powershell
python -m http.server 8080
```

然后访问 http://localhost:8080/。

## 维护

- 版本信息与下载地址以 FireflyOS 官方网站为准。
- 页面导航、页脚与产品互链需要与 DomeOS Team、DomeOS-Next 站点保持一致。

© 2026 DomeOS Team
