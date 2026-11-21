# FireflyOS 官网

FireflyOS 是 DomeOS Team 打造的 Windows 精简优化版本，覆盖 Windows 7 / 8.1 / 10 / 11。
站点以「流萤」为主题：深夜蓝、薄荷微光与萤火琥珀，并支持深色 / 浅色模式。

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
    ├── theme.css       深浅色主题令牌
    ├── style.css       站点样式
    ├── main.js         主题切换、交互与萤火粒子
    ├── logo.svg        站点图标
    └── emblem.svg      首屏流萤徽标
```

## 深浅色模式

- 首次访问跟随系统偏好，之后记住用户选择（`localStorage: ff-theme`）。
- 页面头部内联脚本会在渲染前写入 `data-theme`，避免加载时白屏闪烁。
- 主题按钮位于右上角导航区。

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
