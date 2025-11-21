// 全局变量
let config = {};
let seatTypes = {};
let durationTypes = {};

// 版本号 - 每次部署时更新此版本号
const APP_VERSION = 'v0.0.2';

// 加载配置文件
async function loadConfig() {
    try {
        const response = await fetch('config.json');
        config = await response.json();
        seatTypes = config.seatTypes;
        durationTypes = config.durationTypes;
        
        // 初始化下拉选项
        initSelectOptions();
        
        // 预生成价目表（但不显示）
        generatePriceTable();
    } catch (error) {
        console.error('Failed to load config:', error);
        alert('配置文件加载失败，请检查 config.json 文件');
    }
}

// 初始化下拉选项
function initSelectOptions() {
    const seatTypeSelect = document.getElementById('seatType');
    const durationTypeSelect = document.getElementById('durationType');
    
    // 清空现有选项（保留第一个提示选项）
    seatTypeSelect.innerHTML = '<option value="">请选择座位类型</option>';
    durationTypeSelect.innerHTML = '<option value="">请选择时长类型</option>';
    
    // 添加座位类型选项
    Object.keys(seatTypes).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = seatTypes[key].name;
        seatTypeSelect.appendChild(option);
    });
    
    // 添加时长类型选项
    Object.keys(durationTypes).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = durationTypes[key].name;
        durationTypeSelect.appendChild(option);
    });
}

// 根据时长类型自动计算结束日期
function calculateEndDate() {
    const startDate = document.getElementById('startDate').value;
    const durationType = document.getElementById('durationType').value;
    const endDateInput = document.getElementById('endDate');
    
    if (!startDate || !durationType) {
        return;
    }
    
    const durationConfig = durationTypes[durationType];
    if (!durationConfig) {
        return;
    }
    
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + durationConfig.days);
    
    // 格式化为 YYYY-MM-DD
    const endDateStr = end.toISOString().split('T')[0];
    endDateInput.value = endDateStr;
}

// 计算价格
function calculatePrice() {
    const seatType = document.getElementById('seatType').value;
    const durationType = document.getElementById('durationType').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    // 验证输入
    if (!seatType || !durationType || !startDate || !endDate) {
        alert('请填写完整信息');
        return;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) {
        alert('结束日期必须晚于起始日期');
        return;
    }
    
    // 计算天数
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // 获取座位类型和时长类型配置
    const seatConfig = seatTypes[seatType];
    const durationConfig = durationTypes[durationType];
    
    if (!seatConfig || !durationConfig) {
        alert('配置错误，请检查配置文件');
        return;
    }
    
    // 获取固定价格
    const fixedPrice = seatConfig.prices && seatConfig.prices[durationType];
    
    if (fixedPrice === undefined) {
        alert('未找到对应的价格配置，请检查配置文件');
        return;
    }
    
    // 获取时长类型对应的天数
    const durationDays = durationConfig.days;
    
    // 计算价格
    let totalPrice = fixedPrice;
    let extraDays = 0;
    let extraPrice = 0;
    let hasExtra = false;
    
    // 如果实际天数超过时长类型对应的天数，计算超出部分
    if (diffDays > durationDays) {
        hasExtra = true;
        extraDays = diffDays - durationDays;
        // 按原周期单价计算超出部分：固定价格 / 周期天数 * 超出天数
        const dailyPrice = fixedPrice / durationDays;
        extraPrice = Math.round(dailyPrice * extraDays * 100) / 100; // 保留两位小数
        totalPrice = Math.round((fixedPrice + extraPrice) * 100) / 100;
    }
    
    // 计算每天单价（用于显示）
    const dailyPrice = hasExtra ? Math.round((fixedPrice / durationDays) * 100) / 100 : 0;
    
    // 显示结果
    displayResult(seatType, durationType, startDate, endDate, diffDays, totalPrice, fixedPrice, durationDays, hasExtra, extraDays, extraPrice, dailyPrice);
}

// 显示计算结果
function displayResult(seatType, durationType, startDate, endDate, days, price, basePrice, durationDays, hasExtra, extraDays, extraPrice, dailyPrice) {
    document.getElementById('resultSeatType').textContent = seatTypes[seatType].name;
    document.getElementById('resultDurationType').textContent = durationTypes[durationType].name;
    document.getElementById('resultStartDate').textContent = formatDate(startDate);
    document.getElementById('resultEndDate').textContent = formatDate(endDate);
    document.getElementById('resultDays').textContent = days;
    document.getElementById('resultPrice').textContent = price.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    // 显示费用明细（如果有超出）
    const priceDetailDiv = document.getElementById('priceDetail');
    if (hasExtra) {
        const durationName = durationTypes[durationType].name;
        document.getElementById('basePeriodName').textContent = durationName;
        document.getElementById('basePeriodPrice').textContent = `${basePrice.toLocaleString('zh-CN')} 元`;
        document.getElementById('extraDays').textContent = extraDays;
        document.getElementById('extraDaysPrice').textContent = `${extraPrice.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 元`;
        document.getElementById('extraDurationName').textContent = durationName;
        document.getElementById('dailyPrice').textContent = dailyPrice.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        priceDetailDiv.classList.remove('hidden');
    } else {
        priceDetailDiv.classList.add('hidden');
    }
    
    const resultDiv = document.getElementById('result');
    resultDiv.classList.remove('hidden');
    
    // 滚动到结果区域
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 格式化日期显示
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 初始化版本号显示
function initVersion() {
    const versionElement = document.getElementById('version');
    if (versionElement) {
        versionElement.textContent = APP_VERSION;
    }
}

// 生成价目表
function generatePriceTable() {
    const tableContainer = document.getElementById('priceTable');
    if (!tableContainer) return;
    
    // 创建表格
    const table = document.createElement('table');
    table.className = 'price-table';
    
    // 创建表头
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // 第一列：时长类型（表头为空）
    const header1 = document.createElement('th');
    header1.textContent = '';
    
    // 后续列：各个座位类型
    const seatKeys = Object.keys(seatTypes);
    seatKeys.forEach(seatKey => {
        const seatConfig = seatTypes[seatKey];
        const header = document.createElement('th');
        header.textContent = seatConfig.name;
        header.className = 'seat-header';
        headerRow.appendChild(header);
    });
    
    headerRow.insertBefore(header1, headerRow.firstChild);
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // 创建表体
    const tbody = document.createElement('tbody');
    
    // 遍历时长类型生成表格行
    Object.keys(durationTypes).forEach(durationKey => {
        const durationConfig = durationTypes[durationKey];
        const row = document.createElement('tr');
        
        // 第一列：时长类型名称
        const durationCell = document.createElement('td');
        durationCell.className = 'duration-type';
        durationCell.textContent = durationConfig.name;
        row.appendChild(durationCell);
        
        // 后续列：各个座位类型对应的价格
        seatKeys.forEach(seatKey => {
            const seatConfig = seatTypes[seatKey];
            const prices = seatConfig.prices;
            const price = prices[durationKey];
            
            const priceCell = document.createElement('td');
            priceCell.className = 'price';
            if (price !== undefined) {
                priceCell.textContent = `${price.toLocaleString('zh-CN')} 元`;
            } else {
                priceCell.textContent = '-';
            }
            row.appendChild(priceCell);
        });
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    tableContainer.innerHTML = '';
    tableContainer.appendChild(table);
}

// 打开价目表弹窗
function openPriceListModal() {
    generatePriceTable();
    const modal = document.getElementById('priceListModal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // 防止背景滚动
}

// 关闭价目表弹窗
function closePriceListModal() {
    const modal = document.getElementById('priceListModal');
    modal.classList.add('hidden');
    document.body.style.overflow = ''; // 恢复滚动
}

// 事件监听
document.addEventListener('DOMContentLoaded', () => {
    // 初始化版本号
    initVersion();
    
    loadConfig();
    
    // 时长类型变化时自动计算结束日期
    document.getElementById('durationType').addEventListener('change', () => {
        if (document.getElementById('startDate').value) {
            calculateEndDate();
        }
    });
    
    // 起始日期变化时，如果已选择时长类型，自动计算结束日期
    document.getElementById('startDate').addEventListener('change', () => {
        if (document.getElementById('durationType').value) {
            calculateEndDate();
        }
    });
    
    // 计算按钮点击事件
    document.getElementById('calculateBtn').addEventListener('click', calculatePrice);
    
    // 价目表按钮点击事件
    document.getElementById('priceListBtn').addEventListener('click', openPriceListModal);
    
    // 关闭弹窗按钮点击事件
    document.getElementById('closeModal').addEventListener('click', closePriceListModal);
    
    // 点击弹窗背景关闭
    document.getElementById('priceListModal').addEventListener('click', (e) => {
        if (e.target.id === 'priceListModal') {
            closePriceListModal();
        }
    });
    
    // ESC键关闭弹窗
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closePriceListModal();
        }
    });
});

