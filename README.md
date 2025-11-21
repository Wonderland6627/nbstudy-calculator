# 自习室价格计算器

一个简单的网页应用，用于计算自习室座位价格。支持手机端访问，可通过 GitHub Pages 部署。

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

## GitHub Pages 部署步骤

### 1. 上传代码到 GitHub

1. 在 GitHub 上创建一个新仓库（或使用现有仓库）
2. 将项目文件上传到仓库根目录：
   - `index.html`
   - `script.js`
   - `style.css`
   - `config.json`
   - `README.md`（可选）

### 2. 启用 GitHub Pages

1. 进入仓库页面，点击 **Settings**（设置）
2. 在左侧菜单中找到 **Pages**（页面）
3. 在 **Source**（源）部分：
   - **Branch**：选择 `master` 或 `main`（根据你的主分支名称）
   - **Folder**：选择 `/`（根目录）
4. 点击 **Save**（保存）按钮

### 3. 访问网站

部署成功后，GitHub 会提供一个访问地址，格式通常为：
```
https://你的用户名.github.io/仓库名/
```

例如：`https://wonderland6627.github.io/nbstudy-calculator/`

**注意**：首次部署可能需要几分钟时间，GitHub 会显示部署状态。

### 4. 更新配置

如果需要修改价格配置：
1. 编辑 `config.json` 文件
2. 提交更改到仓库
3. GitHub Pages 会自动更新（通常几分钟内生效）

## 注意事项

1. **首次部署**：GitHub Pages 可能需要几分钟时间才能生效，可以在仓库的 **Actions** 标签页查看部署状态
2. **更新内容**：修改文件后，GitHub Pages 会自动重新部署，通常几分钟内生效
3. **HTTPS**：GitHub Pages 默认使用 HTTPS，确保数据传输安全
4. **浏览器兼容性**：现代浏览器（Chrome、Safari、Firefox、Edge）均支持
5. **自定义域名**：GitHub Pages 支持绑定自定义域名，可在 Pages 设置中配置

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
3. GitHub Pages 部署状态是否正常（在仓库的 **Actions** 标签页查看）
4. 仓库设置中 Pages 功能是否已启用

