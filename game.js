// 游戏状态
let gameState = 'menu'; // 可能的状态: 'menu', 'playing', 'end'

// DOM 元素
const startMenu = document.getElementById('start-menu');
const gameBoard = document.getElementById('game-board');
const endMenu = document.getElementById('end-menu');
const restartButton = document.getElementById('restart-button');
const levelSelect = document.getElementById('level-select');

// 游戏配置
let boardSize = 8; // 初始为8x8的游戏板
let totalPairs;
let gameTime = 60; // 初始游戏时间60秒

// 新增关卡配置
const levelConfigs = [
    { boardSize: 8, gameTime: 60, leftAlign: false },  // 第一关
    { boardSize: 10, gameTime: 80, leftAlign: false }, // 第二关
    { boardSize: 12, gameTime: 100, leftAlign: false }, // 第三关
    { boardSize: 8, gameTime: 90, leftAlign: true },  // 第四关
    { boardSize: 8, gameTime: 60, rightAlign: true }, // 第五关
    { boardSize: 8, gameTime: 70, topAlign: true },   // 第六关
    { boardSize: 8, gameTime: 75, bottomAlign: true }, // 第七关
    { boardSize: 12, gameTime: 120, randomAlign: true } // 新增第八关
];

// 游戏数据
let tiles = [];
let selectedTiles = [];

// 新增变量
let timeLeft = gameTime;
let timerInterval;
const timeBar = document.getElementById('time-bar');
const timeBarContainer = document.getElementById('time-bar-container');

let currentLevel = 1;
let isLeftAligned = false;
let isRightAligned = false;
let isTopAligned = false;
let isBottomAligned = false;
let isRandomAligned = false;

// 在文件顶部添加新的全局变量
const bgm = document.getElementById('bgm');
let isMusicPlaying = true; // 新增变量，用于跟踪音乐状态
const clickSound = document.getElementById('clickSound');
const matchSound = document.getElementById('matchSound');
const errorSound = document.getElementById('errorSound');

// 初始化游戏
function initGame() {
    totalPairs = (boardSize * boardSize) / 2;
    generateSolvableBoard();
    
    gameBoard.innerHTML = '';
    for (let i = 0; i < boardSize * boardSize; i++) {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        tile.dataset.index = i;
        if (tiles[i] !== null) {
            tile.textContent = symbols[tiles[i] % symbols.length];
            tile.style.visibility = 'visible';
        } else {
            tile.style.visibility = 'hidden';
        }
        tile.addEventListener('click', onTileClick);
        gameBoard.appendChild(tile);
    }

    if (isLeftAligned) {
        leftAlignTiles();
    } else if (isRightAligned) {
        rightAlignTiles();
    } else if (isTopAligned) {
        topAlignTiles();
    } else if (isBottomAligned) {
        bottomAlignTiles();
    } else if (isRandomAligned) {
        randomAlignTiles();
    }

    clearHintHighlight();
    
    console.log('Game board initialized:', tiles);
}

// 新增函数: 左对齐图块
function leftAlignTiles() {
    for (let row = 0; row < boardSize; row++) {
        let emptyIndex = -1;
        for (let col = 0; col < boardSize; col++) {
            const index = row * boardSize + col;
            const tile = gameBoard.children[index];
            if (tile.style.visibility === 'hidden' && emptyIndex === -1) {
                emptyIndex = col;
            } else if (tile.style.visibility === 'visible' && emptyIndex !== -1) {
                // 移动可见图块到空位置
                const emptyTile = gameBoard.children[row * boardSize + emptyIndex];
                emptyTile.textContent = tile.textContent;
                emptyTile.style.visibility = 'visible';
                tile.textContent = '';
                tile.style.visibility = 'hidden';
                emptyIndex++;
            }
        }
    }
}

// 新增函数: 右对齐图块
function rightAlignTiles() {
    for (let row = 0; row < boardSize; row++) {
        let emptyIndex = boardSize;
        for (let col = boardSize - 1; col >= 0; col--) {
            const index = row * boardSize + col;
            const tile = gameBoard.children[index];
            if (tile.style.visibility === 'hidden' && emptyIndex === boardSize) {
                emptyIndex = col;
            } else if (tile.style.visibility === 'visible' && emptyIndex !== boardSize) {
                // 移动可见图块到空位置
                const emptyTile = gameBoard.children[row * boardSize + emptyIndex];
                emptyTile.textContent = tile.textContent;
                emptyTile.style.visibility = 'visible';
                tile.textContent = '';
                tile.style.visibility = 'hidden';
                emptyIndex--;
            }
        }
    }
}

// 新增函数: 顶部对齐图块
function topAlignTiles() {
    for (let col = 0; col < boardSize; col++) {
        let emptyIndex = -1;
        for (let row = 0; row < boardSize; row++) {
            const index = row * boardSize + col;
            const tile = gameBoard.children[index];
            if (tile.style.visibility === 'hidden' && emptyIndex === -1) {
                emptyIndex = row;
            } else if (tile.style.visibility === 'visible' && emptyIndex !== -1) {
                // 移动可见图块到空位置
                const emptyTile = gameBoard.children[emptyIndex * boardSize + col];
                emptyTile.textContent = tile.textContent;
                emptyTile.style.visibility = 'visible';
                tile.textContent = '';
                tile.style.visibility = 'hidden';
                emptyIndex++;
            }
        }
    }
}

// 新增函数: 底部对齐图块
function bottomAlignTiles() {
    for (let col = 0; col < boardSize; col++) {
        let emptyIndex = boardSize;
        for (let row = boardSize - 1; row >= 0; row--) {
            const index = row * boardSize + col;
            const tile = gameBoard.children[index];
            if (tile.style.visibility === 'hidden' && emptyIndex === boardSize) {
                emptyIndex = row;
            } else if (tile.style.visibility === 'visible' && emptyIndex !== boardSize) {
                // 移动可见图块到空位置
                const emptyTile = gameBoard.children[emptyIndex * boardSize + col];
                emptyTile.textContent = tile.textContent;
                emptyTile.style.visibility = 'visible';
                tile.textContent = '';
                tile.style.visibility = 'hidden';
                emptyIndex--;
            }
        }
    }
}

// 新增函数: 随机对齐图块
function randomAlignTiles() {
    const alignFunctions = [leftAlignTiles, rightAlignTiles, topAlignTiles, bottomAlignTiles];
    const randomFunction = alignFunctions[Math.floor(Math.random() * alignFunctions.length)];
    randomFunction();
}

// 新增函数: 生成可解的游戏板
function generateSolvableBoard() {
    tiles = new Array(boardSize * boardSize).fill(null);
    const availablePositions = new Array(boardSize * boardSize).fill().map((_, i) => i);
    const values = new Array(totalPairs).fill().map((_, i) => i);
    
    while (values.length > 0) {
        const value = removeRandomElement(values);
        const pos1 = removeRandomElement(availablePositions);
        const pos2 = removeRandomElement(availablePositions);
        tiles[pos1] = value;
        tiles[pos2] = value;
    }
}

// 新增函数: 从数组中随机移除并返回一个元素
function removeRandomElement(array) {
    const index = Math.floor(Math.random() * array.length);
    return array.splice(index, 1)[0];
}

// 点击图块
function onTileClick(event) {
    if (gameState !== 'playing') return;
    
    clearHintHighlight();
    
    const tile = event.target;
    if (tile.style.visibility === 'hidden') return;
    
    if (selectedTiles.length > 0 && selectedTiles[0] === tile) return;
    
    playClickSound(); // 添加这行
    
    tile.classList.add('selected');
    selectedTiles.push(tile);
    
    if (selectedTiles.length === 2) {
        checkMatch();
    }
}

// 检查匹配
function checkMatch() {
    const [tile1, tile2] = selectedTiles;
    if (tile1.textContent === tile2.textContent && canConnect(tile1, tile2)) {
        playMatchSound();
        setTimeout(() => {
            tile1.style.visibility = 'hidden';
            tile2.style.visibility = 'hidden';
            tile1.classList.remove('selected');
            tile2.classList.remove('selected');
            timeLeft += 3;
            if (timeLeft > gameTime) timeLeft = gameTime;
            updateTimeBar();
            
            if (isLeftAligned) {
                leftAlignTiles();
            } else if (isRightAligned) {
                rightAlignTiles();
            } else if (isTopAligned) {
                topAlignTiles();
            } else if (isBottomAligned) {
                bottomAlignTiles();
            } else if (isRandomAligned) {
                randomAlignTiles();
            }
            
            if (document.querySelectorAll('.tile[style*="visibility: visible"]').length === 0) {
                endGame(true);
            }
        }, 300);
    } else {
        playErrorSound(); // 添加这行
        setTimeout(() => {
            tile1.classList.remove('selected');
            tile2.classList.remove('selected');
        }, 500);
    }
    selectedTiles = [];
}

// 检查两个图块是否可以连接
function canConnect(tile1, tile2) {
    const index1 = parseInt(tile1.dataset.index);
    const index2 = parseInt(tile2.dataset.index);
    const row1 = Math.floor(index1 / boardSize);
    const col1 = index1 % boardSize;
    const row2 = Math.floor(index2 / boardSize);
    const col2 = index2 % boardSize;

    // 检查直线连接
    if (row1 === row2 && canConnectHorizontally(row1, col1, col2)) return true;
    if (col1 === col2 && canConnectVertically(col1, row1, row2)) return true;

    // 检查一次拐弯
    if (canConnectWithOneCorner(row1, col1, row2, col2)) return true;

    // 检查两次拐弯
    if (canConnectWithTwoCorners(row1, col1, row2, col2)) return true;

    return false;
}

// 检查水平方向是否可以连接
function canConnectHorizontally(row, col1, col2) {
    const start = Math.min(col1, col2);
    const end = Math.max(col1, col2);
    for (let col = start + 1; col < end; col++) {
        if (!isTileEmpty(row, col)) return false;
    }
    return true;
}

// 检查垂直方向是否可以连接
function canConnectVertically(col, row1, row2) {
    const start = Math.min(row1, row2);
    const end = Math.max(row1, row2);
    for (let row = start + 1; row < end; row++) {
        if (!isTileEmpty(row, col)) return false;
    }
    return true;
}

// 检查是否可以通过一次拐弯连接
function canConnectWithOneCorner(row1, col1, row2, col2) {
    if (isTileEmpty(row1, col2) && canConnectHorizontally(row1, col1, col2) && canConnectVertically(col2, row1, row2)) return true;
    if (isTileEmpty(row2, col1) && canConnectHorizontally(row2, col1, col2) && canConnectVertically(col1, row1, row2)) return true;
    return false;
}

// 检查是否可以通过两次拐弯连接
function canConnectWithTwoCorners(row1, col1, row2, col2) {
    for (let row = 0; row < boardSize; row++) {
        if (row !== row1 && row !== row2 &&
            isTileEmpty(row, col1) && isTileEmpty(row, col2) &&
            canConnectVertically(col1, row1, row) &&
            canConnectHorizontally(row, col1, col2) &&
            canConnectVertically(col2, row, row2)) {
            return true;
        }
    }
    for (let col = 0; col < boardSize; col++) {
        if (col !== col1 && col !== col2 &&
            isTileEmpty(row1, col) && isTileEmpty(row2, col) &&
            canConnectHorizontally(row1, col1, col) &&
            canConnectVertically(col, row1, row2) &&
            canConnectHorizontally(row2, col, col2)) {
            return true;
        }
    }
    return false;
}

// 检查指定位置的图块是否为空
function isTileEmpty(row, col) {
    const index = row * boardSize + col;
    const tile = gameBoard.children[index];
    return tile.style.visibility === 'hidden';
}

// 开始游戏
function startGame() {
    startMenu.style.display = 'none';
    levelSelect.style.display = 'flex';
    document.getElementById('music-toggle').style.display = 'block';
    if (isMusicPlaying) {
        bgm.play();
    }
}

// 新增函数: 开始关卡
function startLevel(level) {
    currentLevel = level;
    const config = levelConfigs[level - 1];
    boardSize = config.boardSize;
    gameTime = config.gameTime;
    isLeftAligned = config.leftAlign;
    isRightAligned = config.rightAlign;
    isTopAligned = config.topAlign;
    isBottomAligned = config.bottomAlign;
    isRandomAligned = config.randomAlign;
    
    console.log('Starting level:', level);
    console.log('Board size:', boardSize);
    console.log('Game time:', gameTime);
    console.log('Left aligned:', isLeftAligned);
    console.log('Right aligned:', isRightAligned);
    console.log('Top aligned:', isTopAligned);
    console.log('Bottom aligned:', isBottomAligned);
    console.log('Random aligned:', isRandomAligned);
    
    gameState = 'playing';
    levelSelect.style.display = 'none';
    gameBoard.style.display = 'grid';
    timeBarContainer.style.display = 'block';
    document.getElementById('game-controls').style.display = 'flex'; // 使用 flex 布局
    document.getElementById('music-toggle').style.display = 'block'; // 确保音乐控制按钮可见
    endMenu.style.display = 'none';
    initGame();
    startGameTimer();
    
    // 更新游戏板大小
    const containerWidth = gameBoard.offsetWidth;
    const tileSize = Math.floor(containerWidth / boardSize);
    gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
    gameBoard.style.width = `${tileSize * boardSize}px`;
    gameBoard.style.height = `${tileSize * boardSize}px`;
    
    if (isMusicPlaying && bgm.paused) {
        bgm.play(); // 如果音乐应该播放但当前是暂停状态，则开始播放
    }
}

// 结束游戏
function endGame(won = false) {
    gameState = 'end';
    gameBoard.style.display = 'none';
    timeBarContainer.style.display = 'none';
    document.getElementById('game-controls').style.display = 'none'; // 隐藏游戏控制按钮
    endMenu.style.display = 'block';
    clearInterval(timerInterval);
    
    const endMessage = document.getElementById('end-message');
    if (won) {
        if (currentLevel < levelConfigs.length) {
            endMessage.textContent = `恭喜通过第${currentLevel}关！准备进入下一关。`;
            setTimeout(() => startLevel(currentLevel + 1), 2000);
            return;
        } else {
            endMessage.textContent = '恭喜通过所有关卡！';
        }
    } else {
        endMessage.textContent = `游戏结束，您停留在第${currentLevel}关。`;
    }
    
    if (isMusicPlaying) {
        bgm.pause(); // 游戏结束时暂停音乐
        bgm.currentTime = 0; // 重置音乐到开头
    }
    
    document.getElementById('music-toggle').style.display = 'none'; // 游戏结束时隐藏音乐控制按钮
}

// 新增函数: 开始游戏计时器
function startGameTimer() {
    timeLeft = gameTime;
    updateTimeBar();
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft -= 0.1;
        updateTimeBar();
        if (timeLeft <= 0) {
            endGame();
        }
    }, 100);
}

// 新增函数: 更新时间进度条
function updateTimeBar() {
    const percentage = (timeLeft / gameTime) * 100;
    timeBar.style.width = `${percentage}%`;
}

// 新增变量
let hintTiles = [];

// 新增函数: 显示提示
function showHint() {
    if (gameState !== 'playing') return;

    clearHintHighlight();
    const availablePairs = findAvailablePairs();
    if (availablePairs.length > 0) {
        const [tile1, tile2] = availablePairs[Math.floor(Math.random() * availablePairs.length)];
        tile1.classList.add('hint');
        tile2.classList.add('hint');
        hintTiles = [tile1, tile2];
    } else {
        endGame();
    }
}

// 新增函数: 清除提示高亮
function clearHintHighlight() {
    hintTiles.forEach(tile => {
        tile.classList.remove('hint');
    });
    hintTiles = [];
}

// 新增函数: 查找可用的配对
function findAvailablePairs() {
    const pairs = [];
    const tiles = Array.from(gameBoard.children);
    for (let i = 0; i < tiles.length; i++) {
        for (let j = i + 1; j < tiles.length; j++) {
            const tile1 = tiles[i];
            const tile2 = tiles[j];
            if (tile1.style.visibility !== 'hidden' && 
                tile2.style.visibility !== 'hidden' && 
                tile1.textContent === tile2.textContent && 
                canConnect(tile1, tile2)) {
                pairs.push([tile1, tile2]);
            }
        }
    }
    return pairs;
}

// 添加音乐控制函数
function toggleMusic() {
    if (isMusicPlaying) {
        bgm.pause();
        isMusicPlaying = false;
    } else {
        bgm.play();
        isMusicPlaying = true;
    }
    updateMusicButtonText();
}

// 更新音乐按钮文本
function updateMusicButtonText() {
    const musicToggle = document.getElementById('music-toggle');
    musicToggle.textContent = isMusicPlaying ? '关闭音乐' : '开启音乐';
}

// 新增函数: 放弃本关
function abandonLevel() {
    showConfirmDialog('确定要放弃本关吗？', () => {
        endGame(false);
    });
}

// 新增函数: 显示确认对话框
function showConfirmDialog(message, onConfirm) {
    const dialog = document.getElementById('confirm-dialog');
    const overlay = document.querySelector('.overlay');
    const messageElement = dialog.querySelector('p');
    const confirmButton = document.getElementById('confirm-yes');
    const cancelButton = document.getElementById('confirm-no');

    messageElement.textContent = message;
    dialog.style.display = 'block';
    overlay.style.display = 'block';

    confirmButton.onclick = () => {
        onConfirm();
        hideConfirmDialog();
    };

    cancelButton.onclick = hideConfirmDialog;
}

// 新增函数: 隐藏确认对话框
function hideConfirmDialog() {
    const dialog = document.getElementById('confirm-dialog');
    const overlay = document.querySelector('.overlay');
    dialog.style.display = 'none';
    overlay.style.display = 'none';
}

// 添加新的函数来播放音效
function playClickSound() {
    clickSound.currentTime = 0;
    clickSound.play();
}

function playMatchSound() {
    matchSound.currentTime = 0;
    matchSound.play();
}

function playErrorSound() {
    errorSound.currentTime = 0;
    errorSound.play();
}

// 事件监听器
document.getElementById('start-button').addEventListener('click', startGame);
document.getElementById('level-1').addEventListener('click', () => startLevel(1));
document.getElementById('level-2').addEventListener('click', () => startLevel(2));
document.getElementById('level-3').addEventListener('click', () => startLevel(3));
document.getElementById('level-4').addEventListener('click', () => startLevel(4));
document.getElementById('level-5').addEventListener('click', () => startLevel(5));
document.getElementById('level-6').addEventListener('click', () => startLevel(6));
document.getElementById('level-7').addEventListener('click', () => startLevel(7));
document.getElementById('level-8').addEventListener('click', () => startLevel(8));
document.getElementById('restart-button').addEventListener('click', () => startLevel(currentLevel));
document.getElementById('main-menu-button').addEventListener('click', () => {
    startMenu.style.display = 'block';
    endMenu.style.display = 'none';
    if (isMusicPlaying) {
        bgm.pause(); // 返回主菜单时暂停音乐
        bgm.currentTime = 0; // 重置音乐到开头
    }
});

// 在文件底部添加这个事件监听器
document.getElementById('hint-button').addEventListener('click', showHint);
document.getElementById('music-toggle').addEventListener('click', toggleMusic);
document.getElementById('abandon-button').addEventListener('click', abandonLevel);

// 添加新的事件监听器
document.querySelector('.overlay').addEventListener('click', hideConfirmDialog);

// 在文件底部添加这行代码，确保页面加载时音乐按钮文本正确
window.addEventListener('load', updateMusicButtonText);

// 初始显示开始菜单
startMenu.style.display = 'block';

// 在文件顶部添加这个数组
const symbols = ['★', '☆', '♠', '♣', '♥', '♦', '♫', '♪', '☀', '☁', '☂', '☃', '☄', '☮', '☯', '☸'];

// 在文件底部添加这行代码
timeBarContainer.style.display = 'none'; // 初始状态下隐藏进度条

// 初始隐藏音乐控制按钮
document.getElementById('music-toggle').style.display = 'none';

// 添加窗口大小改变事件监听器
window.addEventListener('resize', () => {
    if (gameState === 'playing') {
        const containerWidth = gameBoard.offsetWidth;
        const tileSize = Math.floor(containerWidth / boardSize);
        gameBoard.style.width = `${tileSize * boardSize}px`;
        gameBoard.style.height = `${tileSize * boardSize}px`;
    }
});