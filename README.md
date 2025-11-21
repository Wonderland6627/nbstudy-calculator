# 自习室价格计算器

一个简单的网页应用，用于计算自习室座位价格。支持手机端访问，可通过 Gitee Pages 部署。

## 功能特性

- 📱 响应式设计，完美适配手机端
- 🎯 支持选择座位类型（大厅、VIP单间等）
- ⏰ 支持选择时长类型（月卡、季卡、半年卡、年卡等）
- 📅 起始日期和结束日期选择
- 🔄 根据时长类型自动计算结束日期
- 💰 自动计算总价格
- ⚙️ 通过配置文件灵活配置价格

## 文件说明

- `index.html` - 主页面
- `script.js` - 主要逻辑代码
- `style.css` - 样式文件
- `config.json` - 配置文件（可自定义价格）

## 配置文件说明

`config.json` 文件结构：

```json
{
  "seatTypes": {
    "座位类型标识": {
      "name": "显示名称",
      "basePrice": 基础价格（每天）
    }
  },
  "durationTypes": {
    "时长类型标识": {
      "name": "显示名称",
      "days": 天数,
      "discount": 折扣（0-1之间的小数）
    }
  }
}
```

### 价格计算公式

总价格 = 基础价格 × 实际天数 × 折扣

例如：
- 大厅基础价格：100元/天
- 月卡折扣：0.95（95折）
- 实际使用30天
- 总价格 = 100 × 30 × 0.95 = 2850元

## Gitee Pages 部署步骤

### 1. 上传代码到 Gitee

1. 在 Gitee 上创建一个新仓库（或使用现有仓库）
2. 将项目文件上传到仓库根目录：
   - `index.html`
   - `script.js`
   - `style.css`
   - `config.json`
   - `README.md`（可选）

### 2. 启用 Gitee Pages

1. 进入仓库页面，点击 **服务** → **Gitee Pages**
2. 在 Gitee Pages 设置页面：
   - **部署分支**：选择 `master` 或 `main`（根据你的主分支名称）
   - **部署目录**：选择 `/`（根目录）
   - **强制使用 HTTPS**：建议开启
3. 点击 **启动** 按钮

### 3. 访问网站

部署成功后，Gitee 会提供一个访问地址，格式通常为：
```
https://你的用户名.gitee.io/仓库名/
```

例如：`https://username.gitee.io/nbstudy-calculator/`

### 4. 更新配置

如果需要修改价格配置：
1. 编辑 `config.json` 文件
2. 提交更改到仓库
3. Gitee Pages 会自动更新（可能需要几分钟）

## 注意事项

1. **首次部署**：Gitee Pages 可能需要几分钟时间才能生效
2. **更新内容**：修改文件后，Gitee Pages 会自动重新部署，通常几分钟内生效
3. **HTTPS**：建议开启强制 HTTPS，确保数据传输安全
4. **浏览器兼容性**：现代浏览器（Chrome、Safari、Firefox、Edge）均支持

## 自定义配置示例

### 添加新的座位类型

在 `config.json` 的 `seatTypes` 中添加：

```json
"包间": {
  "name": "包间",
  "basePrice": 150
}
```

### 添加新的时长类型

在 `config.json` 的 `durationTypes` 中添加：

```json
"周卡": {
  "name": "周卡",
  "days": 7,
  "discount": 0.98
}
```

### 修改价格

直接修改对应类型的 `basePrice`（座位类型）或 `discount`（时长类型）即可。

## 技术支持

如有问题，请检查：
1. 浏览器控制台是否有错误信息
2. `config.json` 文件格式是否正确（JSON 格式）
3. Gitee Pages 部署状态是否正常

