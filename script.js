// 全局变量
let config = {};
let seatTypes = {};
let durationTypes = {};
let seatMapConfig = {};
let currentFloor = '2层';

// 版本号 - 每次部署时更新此版本号
const APP_VERSION = 'v0.0.8';

// 加载配置文件
async function loadConfig() {
    try {
        // 添加时间戳和版本号参数防止缓存
        const timestamp = new Date().getTime();
        const version = APP_VERSION.replace('v', '').replace(/\./g, '');
        const url = `config.json?v=${version}&t=${timestamp}`;
        
        const response = await fetch(url, {
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        
        config = await response.json();
        seatTypes = config.seatTypes;
        durationTypes = config.durationTypes;
        
        // 初始化下拉选项
        initSelectOptions();
        
        // 预生成价目表（但不显示）
        generatePriceTable();
        
        // 加载座位图配置
        await loadSeatMapConfig();
    } catch (error) {
        console.error('Failed to load config:', error);
        alert('配置文件加载失败，请检查 config.json 文件');
    }
}

// 加载座位图配置文件
async function loadSeatMapConfig() {
    try {
        const timestamp = new Date().getTime();
        const version = APP_VERSION.replace('v', '').replace(/\./g, '');
        const url = `seat-map.json?v=${version}&t=${timestamp}`;
        
        const response = await fetch(url, {
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        
        seatMapConfig = await response.json();
    } catch (error) {
        console.error('Failed to load seat map config:', error);
        // 座位图配置加载失败不影响主功能，只记录错误
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
    
    // 计算每天单价
    const dailyPrice = fixedPrice / durationDays;
    
    // 计算价格
    let totalPrice = fixedPrice;
    let extraDays = 0;
    let extraPrice = 0;
    let hasExtra = false;
    let hasLess = false;
    let lessDays = 0;
    
    // 如果实际天数少于时长类型对应的天数，按每天单价计算
    if (diffDays < durationDays) {
        hasLess = true;
        lessDays = durationDays - diffDays;
        // 按每天单价计算：固定价格 / 周期天数 * 实际天数
        totalPrice = Math.round(dailyPrice * diffDays * 100) / 100;
    }
    // 如果实际天数超过时长类型对应的天数，计算超出部分
    else if (diffDays > durationDays) {
        hasExtra = true;
        extraDays = diffDays - durationDays;
        // 按原周期单价计算超出部分：固定价格 / 周期天数 * 超出天数
        extraPrice = Math.round(dailyPrice * extraDays * 100) / 100; // 保留两位小数
        totalPrice = Math.round((fixedPrice + extraPrice) * 100) / 100;
    }
    // 如果实际天数等于套餐天数，使用固定价格
    else {
        totalPrice = fixedPrice;
    }
    
    // 计算每天单价（用于显示，保留两位小数）
    const dailyPriceDisplay = Math.round(dailyPrice * 100) / 100;
    
    // 显示结果
    displayResult(seatType, durationType, startDate, endDate, diffDays, totalPrice, fixedPrice, durationDays, hasExtra, extraDays, extraPrice, dailyPriceDisplay, hasLess, lessDays);
}

// 显示计算结果
function displayResult(seatType, durationType, startDate, endDate, days, price, basePrice, durationDays, hasExtra, extraDays, extraPrice, dailyPrice, hasLess, lessDays) {
    document.getElementById('resultSeatType').textContent = seatTypes[seatType].name;
    document.getElementById('resultDurationType').textContent = durationTypes[durationType].name;
    document.getElementById('resultStartDate').textContent = formatDate(startDate);
    document.getElementById('resultEndDate').textContent = formatDate(endDate);
    document.getElementById('resultDays').textContent = days;
    document.getElementById('resultPrice').textContent = price.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    // 显示费用明细
    const priceDetailDiv = document.getElementById('priceDetail');
    const basePeriodItem = document.getElementById('basePeriodItem');
    const extraDaysItem = document.getElementById('extraDaysItem');
    const lessDaysItem = document.getElementById('lessDaysItem');
    const durationName = durationTypes[durationType].name;
    
    // 隐藏所有明细项
    basePeriodItem.style.display = 'none';
    extraDaysItem.style.display = 'none';
    lessDaysItem.style.display = 'none';
    
    if (hasLess) {
        // 实际天数少于套餐天数
        document.getElementById('actualDays').textContent = days;
        document.getElementById('lessDurationName').textContent = durationName;
        document.getElementById('lessDailyPrice').textContent = dailyPrice.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        lessDaysItem.style.display = 'block';
        priceDetailDiv.classList.remove('hidden');
    } else if (hasExtra) {
        // 实际天数超过套餐天数
        document.getElementById('basePeriodName').textContent = durationName;
        document.getElementById('basePeriodPrice').textContent = `${basePrice.toLocaleString('zh-CN')} 元`;
        document.getElementById('extraDays').textContent = extraDays;
        document.getElementById('extraDaysPrice').textContent = `${extraPrice.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 元`;
        document.getElementById('extraDurationName').textContent = durationName;
        document.getElementById('dailyPrice').textContent = dailyPrice.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        basePeriodItem.style.display = 'block';
        extraDaysItem.style.display = 'block';
        priceDetailDiv.classList.remove('hidden');
    } else {
        // 实际天数等于套餐天数，不显示明细
        priceDetailDiv.classList.add('hidden');
    }
    
    const resultDiv = document.getElementById('result');
    resultDiv.classList.remove('hidden');
    
    // 为结果容器创建水印
    createResultWatermark();
    
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
    
    // 在年卡行下面添加次卡特殊行
    const specialRow = document.createElement('tr');
    specialRow.className = 'special-price-row';
    
    // 第一列：次卡
    const specialDurationCell = document.createElement('td');
    specialDurationCell.className = 'duration-type';
    specialDurationCell.textContent = '次卡';
    specialRow.appendChild(specialDurationCell);
    
    // 后续列：根据座位类型显示内容
    seatKeys.forEach(seatKey => {
        const priceCell = document.createElement('td');
        priceCell.className = 'price';
        if (seatKey === '大厅') {
            // 大厅列显示次卡价格信息（两行显示）
            priceCell.innerHTML = '180元/10次<br>（无固定座位）';
            priceCell.style.fontSize = '13px';
        } else {
            // 其他列显示"-"
            priceCell.textContent = '-';
        }
        specialRow.appendChild(priceCell);
    });
    
    tbody.appendChild(specialRow);
    
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
    // 为价目表弹窗创建水印
    createPriceModalWatermark();
}

// 关闭价目表弹窗
function closePriceListModal() {
    const modal = document.getElementById('priceListModal');
    modal.classList.add('hidden');
    document.body.style.overflow = ''; // 恢复滚动
    // 移除价目表弹窗水印
    const priceModalWatermark = document.getElementById('price-modal-watermark');
    if (priceModalWatermark) {
        priceModalWatermark.remove();
    }
}

// 创建水印
function createWatermark() {
    // 在白色容器内创建水印（灰色，用于白色背景）
    createContainerWatermark();
    
    // 窗口大小改变时重新创建水印
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const containerWatermark = document.getElementById('container-watermark');
            if (containerWatermark) {
                containerWatermark.remove();
            }
            createContainerWatermark();
        }, 300);
    });
}

// 在白色容器内创建水印
function createContainerWatermark() {
    const container = document.querySelector('.container');
    if (!container) {
        // 如果容器还没加载，延迟执行
        setTimeout(createContainerWatermark, 100);
        return;
    }
    
    // 检查是否已存在容器水印
    let containerWatermark = document.getElementById('container-watermark');
    if (containerWatermark) {
        return;
    }
    
    // 创建容器水印
    containerWatermark = document.createElement('div');
    containerWatermark.id = 'container-watermark';
    containerWatermark.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        overflow: hidden;
        border-radius: 20px;
    `;
    
    // 获取容器尺寸（使用offsetWidth和offsetHeight更可靠）
    const containerWidth = container.offsetWidth || container.clientWidth;
    const containerHeight = container.offsetHeight || container.clientHeight;
    const watermarkWidth = 300;
    const watermarkHeight = 200;
    const cols = Math.ceil(containerWidth / watermarkWidth) + 1;
    const rows = Math.ceil(containerHeight / watermarkHeight) + 1;
    
    // 创建容器内的水印元素（灰色，用于白色背景）
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const watermark = document.createElement('div');
            watermark.textContent = '宁博自习室';
            watermark.style.cssText = `
                position: absolute;
                top: ${row * watermarkHeight}px;
                left: ${col * watermarkWidth}px;
                font-size: 40px;
                color: rgba(0, 0, 0, 0.05);
                font-weight: 300;
                letter-spacing: 15px;
                transform: rotate(-25deg);
                white-space: nowrap;
                user-select: none;
            `;
            containerWatermark.appendChild(watermark);
        }
    }
    
    // 将水印插入到容器的第一个位置
    container.insertBefore(containerWatermark, container.firstChild);
}

// 在价目表弹窗内创建水印
function createPriceModalWatermark() {
    const modalContent = document.querySelector('#priceListModal .modal-content');
    if (!modalContent) {
        // 如果弹窗还没加载，延迟执行
        setTimeout(createPriceModalWatermark, 100);
        return;
    }
    
    // 检查是否已存在价目表弹窗水印
    let priceModalWatermark = document.getElementById('price-modal-watermark');
    if (priceModalWatermark) {
        // 如果已存在，先移除再重新创建（因为弹窗大小可能变化）
        priceModalWatermark.remove();
    }
    
    // 创建价目表弹窗水印
    priceModalWatermark = document.createElement('div');
    priceModalWatermark.id = 'price-modal-watermark';
    priceModalWatermark.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        overflow: hidden;
        border-radius: 20px;
    `;
    
    // 获取弹窗内容区域尺寸
    const modalWidth = modalContent.offsetWidth || modalContent.clientWidth;
    const modalHeight = modalContent.offsetHeight || modalContent.clientHeight;
    const watermarkWidth = 300;
    const watermarkHeight = 200;
    const cols = Math.ceil(modalWidth / watermarkWidth) + 1;
    const rows = Math.ceil(modalHeight / watermarkHeight) + 1;
    
    // 创建价目表弹窗内的水印元素（灰色，用于白色背景）
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const watermark = document.createElement('div');
            watermark.textContent = '宁博自习室';
            watermark.style.cssText = `
                position: absolute;
                top: ${row * watermarkHeight}px;
                left: ${col * watermarkWidth}px;
                font-size: 40px;
                color: rgba(0, 0, 0, 0.05);
                font-weight: 300;
                letter-spacing: 15px;
                transform: rotate(-25deg);
                white-space: nowrap;
                user-select: none;
            `;
            priceModalWatermark.appendChild(watermark);
        }
    }
    
    // 将水印插入到弹窗内容的第一个位置
    modalContent.insertBefore(priceModalWatermark, modalContent.firstChild);
}

// 在计算结果容器内创建水印
function createResultWatermark() {
    const resultDiv = document.getElementById('result');
    if (!resultDiv) {
        return;
    }
    
    // 检查是否已存在结果水印
    let resultWatermark = document.getElementById('result-watermark');
    if (resultWatermark) {
        // 如果已存在，先移除再重新创建（因为容器大小可能变化）
        resultWatermark.remove();
    }
    
    // 创建结果容器水印
    resultWatermark = document.createElement('div');
    resultWatermark.id = 'result-watermark';
    resultWatermark.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        overflow: hidden;
        border-radius: 15px;
    `;
    
    // 获取结果容器尺寸
    const resultWidth = resultDiv.offsetWidth || resultDiv.clientWidth;
    const resultHeight = resultDiv.offsetHeight || resultDiv.clientHeight;
    const watermarkWidth = 300;
    const watermarkHeight = 200;
    const cols = Math.ceil(resultWidth / watermarkWidth) + 1;
    const rows = Math.ceil(resultHeight / watermarkHeight) + 1;
    
    // 创建结果容器内的水印元素（灰色，用于浅灰色背景）
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const watermark = document.createElement('div');
            watermark.textContent = '宁博自习室';
            watermark.style.cssText = `
                position: absolute;
                top: ${row * watermarkHeight}px;
                left: ${col * watermarkWidth}px;
                font-size: 40px;
                color: rgba(0, 0, 0, 0.04);
                font-weight: 300;
                letter-spacing: 15px;
                transform: rotate(-25deg);
                white-space: nowrap;
                user-select: none;
            `;
            resultWatermark.appendChild(watermark);
        }
    }
    
    // 将水印插入到结果容器的第一个位置
    resultDiv.insertBefore(resultWatermark, resultDiv.firstChild);
}

// 初始化应用
function initApp() {
    // 初始化版本号
    initVersion();
    
    // 创建水印
    createWatermark();
    
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
            closeSeatMapModal();
        }
    });
    
    // 座位图按钮点击事件
    document.getElementById('seatMapBtn').addEventListener('click', openSeatMapModal);
    
    // 关闭座位图弹窗按钮点击事件
    document.getElementById('closeSeatMapModal').addEventListener('click', closeSeatMapModal);
    
    // 点击座位图弹窗背景关闭
    document.getElementById('seatMapModal').addEventListener('click', (e) => {
        if (e.target.id === 'seatMapModal') {
            closeSeatMapModal();
        }
    });
    
    // 楼层切换按钮事件
    document.querySelectorAll('.floor-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const floor = tab.getAttribute('data-floor');
            switchFloor(floor);
        });
    });
}

// 打开座位图弹窗
function openSeatMapModal() {
    const modal = document.getElementById('seatMapModal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    // 渲染当前楼层的座位图
    renderSeatMap(currentFloor);
}

// 关闭座位图弹窗
function closeSeatMapModal() {
    const modal = document.getElementById('seatMapModal');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

// 切换楼层
function switchFloor(floor) {
    currentFloor = floor;
    
    // 更新标签页状态
    document.querySelectorAll('.floor-tab').forEach(tab => {
        if (tab.getAttribute('data-floor') === floor) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // 重新渲染座位图
    renderSeatMap(floor);
}

// 渲染座位图
function renderSeatMap(floor) {
    const canvas = document.getElementById('seatMapCanvas');
    if (!canvas || !seatMapConfig.floors || !seatMapConfig.floors[floor]) {
        return;
    }
    
    const floorData = seatMapConfig.floors[floor];
    const baseUnit = seatMapConfig.baseUnit;
    const seatTypeSizes = seatMapConfig.seatTypeSizes;
    
    if (!baseUnit || !seatTypeSizes) {
        console.error('Seat map config missing baseUnit or seatTypeSizes');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // 获取设备像素比（处理高DPI屏幕）
    const dpr = window.devicePixelRatio || 1;
    
    // 计算画布实际尺寸（基于基础单位）
    const canvasWidth = floorData.unitWidth * baseUnit.width;
    const canvasHeight = floorData.unitHeight * baseUnit.height;
    
    // 设置画布尺寸（考虑缩放）
    const maxWidth = window.innerWidth * 0.8;
    const maxHeight = window.innerHeight * 0.7;
    const scale = Math.min(1, maxWidth / canvasWidth, maxHeight / canvasHeight);
    
    // 设置CSS尺寸（显示尺寸）
    const displayWidth = canvasWidth * scale;
    const displayHeight = canvasHeight * scale;
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    
    // 设置实际像素尺寸（考虑设备像素比，提高清晰度）
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    
    // 缩放context以匹配设备像素比
    ctx.scale(dpr, dpr);
    
    // 清空画布（使用显示尺寸，因为context已经缩放）
    ctx.clearRect(0, 0, displayWidth, displayHeight);
    
    // 绘制背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, displayWidth, displayHeight);
    
    // 绘制网格线（可选，帮助查看基础单位）
    drawGrid(ctx, displayWidth, displayHeight, floorData.unitWidth, floorData.unitHeight, baseUnit.width * scale, baseUnit.height * scale);
    
    // 绘制座位
    floorData.seats.forEach(seat => {
        const seatSize = seatTypeSizes[seat.type];
        if (!seatSize) {
            console.warn(`Unknown seat type: ${seat.type}`);
            return;
        }
        
        // 计算座位实际位置和尺寸（基于基础单位）
        const x = seat.unitX * baseUnit.width * scale;
        const y = seat.unitY * baseUnit.height * scale;
        const width = seatSize.unitWidth * baseUnit.width * scale;
        const height = seatSize.unitHeight * baseUnit.height * scale;
        
        // 根据座位类型设置颜色
        let fillColor = '#e0e0e0';
        let strokeColor = '#999';
        if (seat.type === 'VIP单间') {
            fillColor = '#ffd700';
            strokeColor = '#ff8c42';
        } else if (seat.type === '大厅') {
            fillColor = '#4a90e2';
            strokeColor = '#2e5c8a';
        }
        
        // 绘制座位矩形
        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.fillRect(x, y, width, height);
        ctx.strokeRect(x, y, width, height);
        
        // 绘制朝向箭头
        drawDirectionArrow(ctx, x, y, width, height, seat.direction);
        
        // 绘制座位名称
        ctx.fillStyle = '#333';
        ctx.font = `${Math.max(12, 14 * scale)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(seat.name, x + width / 2, y + height / 2);
    });
}

// 绘制网格线（辅助线）
function drawGrid(ctx, canvasWidth, canvasHeight, unitWidth, unitHeight, unitPixelWidth, unitPixelHeight) {
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    
    // 绘制垂直线
    for (let i = 0; i <= unitWidth; i++) {
        const x = i * unitPixelWidth;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
    }
    
    // 绘制水平线
    for (let i = 0; i <= unitHeight; i++) {
        const y = i * unitPixelHeight;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
    }
}

// 绘制朝向箭头
function drawDirectionArrow(ctx, x, y, width, height, direction) {
    ctx.strokeStyle = '#666';
    ctx.fillStyle = '#666';
    ctx.lineWidth = 2;
    
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const arrowSize = Math.min(width, height) * 0.2;
    
    ctx.beginPath();
    
    switch (direction) {
        case 'up':
            ctx.moveTo(centerX, y + height * 0.2);
            ctx.lineTo(centerX - arrowSize / 2, y + height * 0.3);
            ctx.lineTo(centerX + arrowSize / 2, y + height * 0.3);
            ctx.closePath();
            break;
        case 'down':
            ctx.moveTo(centerX, y + height * 0.8);
            ctx.lineTo(centerX - arrowSize / 2, y + height * 0.7);
            ctx.lineTo(centerX + arrowSize / 2, y + height * 0.7);
            ctx.closePath();
            break;
        case 'left':
            ctx.moveTo(x + width * 0.2, centerY);
            ctx.lineTo(x + width * 0.3, centerY - arrowSize / 2);
            ctx.lineTo(x + width * 0.3, centerY + arrowSize / 2);
            ctx.closePath();
            break;
        case 'right':
            ctx.moveTo(x + width * 0.8, centerY);
            ctx.lineTo(x + width * 0.7, centerY - arrowSize / 2);
            ctx.lineTo(x + width * 0.7, centerY + arrowSize / 2);
            ctx.closePath();
            break;
    }
    
    ctx.fill();
}

// 当脚本加载完成时执行初始化
// 由于脚本是动态加载的，DOM肯定已经准备好了
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOM已经加载完成，直接执行
    initApp();
}

