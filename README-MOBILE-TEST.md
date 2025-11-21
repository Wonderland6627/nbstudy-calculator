# 手机本地测试指南

## 方法一：使用本地服务器（推荐）

### Windows系统：

1. **启动服务器**
   ```bash
   start-server.bat
   ```

2. **查看你的IP地址**
   - 服务器启动后会显示你的局域网IP
   - 或者手动运行：`ipconfig`
   - 找到"IPv4 地址"，通常是 `192.168.x.x` 或 `10.x.x.x`

3. **手机连接**
   - 确保手机和电脑连接在**同一个WiFi网络**下
   - 在手机浏览器输入：`http://你的IP地址:8000`
   - 例如：`http://192.168.1.100:8000`

### Mac/Linux系统：

1. **启动服务器**
   ```bash
   chmod +x start-server.sh
   ./start-server.sh
   ```

2. **查看IP地址**
   - 服务器启动后会显示IP
   - 或手动运行：`ifconfig` (Linux) 或 `ipconfig getifaddr en0` (Mac)

3. **手机连接**
   - 确保手机和电脑在同一WiFi
   - 访问：`http://你的IP地址:8000`

## 方法二：使用VS Code Live Server插件

1. 安装 VS Code 的 "Live Server" 插件
2. 右键点击 `index.html` → "Open with Live Server"
3. 插件会自动显示局域网地址，手机直接访问即可

## 方法三：使用ngrok（外网访问）

如果需要在外网访问（不在同一WiFi），可以使用ngrok：

1. 下载 ngrok：https://ngrok.com/
2. 启动本地服务器：`python -m http.server 8000`
3. 在另一个终端运行：`ngrok http 8000`
4. 会得到一个公网地址，手机可以访问

## 注意事项

- ✅ 确保手机和电脑在**同一WiFi网络**
- ✅ 确保电脑防火墙允许8000端口
- ✅ 如果无法访问，检查Windows防火墙设置
- ✅ 修改代码后刷新手机浏览器即可看到更新

## 常见问题

**Q: 手机无法访问？**
- 检查IP地址是否正确
- 检查是否在同一WiFi
- 检查防火墙是否阻止了8000端口

**Q: 如何允许防火墙？**
- Windows: 控制面板 → Windows Defender 防火墙 → 允许应用通过防火墙
- 或临时关闭防火墙测试

**Q: 如何查看电脑IP？**
- Windows: `ipconfig`
- Mac: `ifconfig` 或 `ipconfig getifaddr en0`
- Linux: `ifconfig` 或 `ip addr`

