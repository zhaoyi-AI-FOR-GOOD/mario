// 常量
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const MOVE_SPEED = 5;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const BULLET_SPEED = 8;
const BULLET_SIZE = 4;

// 获取画布
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 输入状态
const keys = {};

// 游戏状态
let gameState = 'menu'; // 'menu', 'playing', 'paused', 'gameOver', 'levelComplete'
let score = 0;
let lives = 3;
let currentLevel = 1;
let levelObjectives = {
    1: { coins: 7, enemies: 2, time: 120 },
    2: { coins: 14, enemies: 7, time: 100 },
    3: { coins: 25, enemies: 12, time: 80 }
};
let levelProgress = {
    coinsCollected: 0,
    enemiesDefeated: 0,
    timeRemaining: 120
};

// 初始化游戏
function initGame() {
    gameState = 'menu';
    score = 0;
    lives = 3;
    currentLevel = 1;
    levelProgress = {
        coinsCollected: 0,
        enemiesDefeated: 0,
        timeRemaining: levelObjectives[1].time
    };
    bullets = [];
    particles = [];
    camera = { x: 0, y: 0 };
}

// 子弹类
class Bullet {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.width = BULLET_SIZE;
        this.height = BULLET_SIZE;
        this.vx = direction * BULLET_SPEED;
        this.vy = 0;
        this.alive = true;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // 如果子弹超出地图范围，销毁
        if (this.x < -50 || this.x > 3200 + 50) {
            this.alive = false;
        }
    }
    
    draw() {
        if (!this.alive) return;
        
        ctx.save();
        
        // 绘制子弹（带发光效果）
        const bulletGradient = ctx.createRadialGradient(
            this.x + this.width/2, this.y + this.height/2, 0,
            this.x + this.width/2, this.y + this.height/2, 6
        );
        bulletGradient.addColorStop(0, '#FFFF00');
        bulletGradient.addColorStop(0.5, '#FFA500');
        bulletGradient.addColorStop(1, '#FF0000');
        
        ctx.fillStyle = bulletGradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 子弹轮廓
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // 子弹尾迹
        ctx.fillStyle = 'rgba(255, 255, 0, 0.6)';
        ctx.fillRect(this.x - this.vx * 0.5, this.y, 2, this.height);
        
        // 调试：显示碰撞框
        // ctx.strokeStyle = 'red';
        // ctx.lineWidth = 2;
        // ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        ctx.restore();
    }
    
    collidesWith(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
}

let bullets = [];

// 粒子系统
class Particle {
    constructor(x, y, vx, vy, color, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = life;
        this.maxLife = life;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2;
        this.life--;
    }
    draw() {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, 4, 4);
        ctx.restore();
    }
}

let particles = [];

// 平台类
class Platform {
    constructor(x, y, width, height, type = 'brick') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
    }
    draw() {
        ctx.save();
        if (this.type === 'brick') {
            // 绘制阴影
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(this.x + 2, this.y + 2, this.width - 2, this.height - 2);
            
            // 绘制砖块（带渐变）
            const brickGradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
            brickGradient.addColorStop(0, '#DEB887');
            brickGradient.addColorStop(0.5, '#CD853F');
            brickGradient.addColorStop(1, '#A0522D');
            ctx.fillStyle = brickGradient;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // 砖块轮廓
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            
            // 砖块纹理
            ctx.strokeStyle = '#A0522D';
            ctx.lineWidth = 1;
            // 水平线
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + this.height/2);
            ctx.lineTo(this.x + this.width, this.y + this.height/2);
            ctx.stroke();
            // 垂直线
            ctx.beginPath();
            ctx.moveTo(this.x + this.width/2, this.y);
            ctx.lineTo(this.x + this.width/2, this.y + this.height);
            ctx.stroke();
            
            // 砖块高光
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, 2);
            
        } else if (this.type === 'question') {
            // 绘制阴影
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(this.x + 2, this.y + 2, this.width - 2, this.height - 2);
            
            // 绘制问号方块（带渐变）
            const questionGradient = ctx.createRadialGradient(
                this.x + this.width/2, this.y + this.height/2, 0,
                this.x + this.width/2, this.y + this.height/2, 16
            );
            questionGradient.addColorStop(0, '#FFD700');
            questionGradient.addColorStop(0.7, '#FFA500');
            questionGradient.addColorStop(1, '#FF8C00');
            ctx.fillStyle = questionGradient;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // 问号方块轮廓
            ctx.strokeStyle = '#FF8C00';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            
            // 问号符号
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('?', this.x + this.width/2, this.y + this.height/2 + 6);
            
            // 问号方块高光
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, 4);
        }
        ctx.restore();
    }
    
    collidesWith(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
}

// 敌人类
class Enemy {
    constructor(x, y, type = 'goomba') {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 24;
        this.vx = -1;
        this.vy = 0;
        this.type = type;
        this.alive = true;
        this.onGround = true; // 初始时在地面上
    }
    update() {
        if (!this.alive) return;
        
        this.vy += GRAVITY;
        this.x += this.vx;
        this.y += this.vy;
        
        // 简单AI - 在边界转向
        if (this.x <= 0 || this.x + this.width >= 3200) {
            this.vx *= -1;
        }
        
        // 平台碰撞检测
        let onAnyPlatform = false;
        for (let platform of platforms) {
            if (this.collidesWith(platform)) {
                if (this.vy > 0 && this.y < platform.y) {
                    this.y = platform.y - this.height;
                    this.vy = 0;
                    this.onGround = true;
                    onAnyPlatform = true;
                }
            }
        }
        
        // 地面碰撞
        if (!onAnyPlatform && this.y + this.height >= CANVAS_HEIGHT - 50) {
            this.y = CANVAS_HEIGHT - 50 - this.height;
            this.vy = 0;
            this.onGround = true;
        }
        
        // 悬崖检测 - 如果前面没有地面，转向
        if (this.onGround) {
            const checkX = this.vx > 0 ? this.x + this.width + 5 : this.x - 5;
            const checkY = this.y + this.height + 5;
            let hasGround = false;
            
            // 检查地面
            if (checkY >= CANVAS_HEIGHT - 50) {
                hasGround = true;
            }
            
            // 检查平台
            for (let platform of platforms) {
                if (checkX >= platform.x && checkX <= platform.x + platform.width &&
                    checkY >= platform.y && checkY <= platform.y + platform.height) {
                    hasGround = true;
                    break;
                }
            }
            
            if (!hasGround) {
                this.vx *= -1;
            }
        }
    }
    draw() {
        if (!this.alive) return;
        
        ctx.save();
        if (this.type === 'goomba') {
            // 绘制阴影
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(this.x + 1, this.y + this.height + 1, this.width - 2, 3);
            
            // 绘制身体（带渐变）
            const bodyGradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
            bodyGradient.addColorStop(0, '#A0522D');
            bodyGradient.addColorStop(0.5, '#8B4513');
            bodyGradient.addColorStop(1, '#654321');
            ctx.fillStyle = bodyGradient;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // 身体轮廓
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            
            // 绘制眼睛（带高光）
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(this.x + 4, this.y + 6, 6, 6);
            ctx.fillRect(this.x + 14, this.y + 6, 6, 6);
            
            // 眼睛轮廓
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x + 4, this.y + 6, 6, 6);
            ctx.strokeRect(this.x + 14, this.y + 6, 6, 6);
            
            // 瞳孔
            ctx.fillStyle = '#000000';
            ctx.fillRect(this.x + 6, this.y + 8, 2, 2);
            ctx.fillRect(this.x + 16, this.y + 8, 2, 2);
            
            // 眼睛高光
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(this.x + 6, this.y + 8, 1, 1);
            ctx.fillRect(this.x + 16, this.y + 8, 1, 1);
            
            // 绘制眉毛
            ctx.fillStyle = '#654321';
            ctx.fillRect(this.x + 3, this.y + 4, 8, 2);
            ctx.fillRect(this.x + 13, this.y + 4, 8, 2);
            
            // 绘制嘴巴
            ctx.fillStyle = '#000000';
            ctx.fillRect(this.x + 10, this.y + 16, 4, 2);
            
            // 绘制脚
            ctx.fillStyle = '#654321';
            ctx.fillRect(this.x + 2, this.y + this.height - 4, 6, 4);
            ctx.fillRect(this.x + 16, this.y + this.height - 4, 6, 4);
            
            // 绘制纹理
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, 2);
            
        } else if (this.type === 'koopa') {
            // 绘制库巴龟（带渐变）
            const shellGradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
            shellGradient.addColorStop(0, '#228B22');
            shellGradient.addColorStop(0.5, '#32CD32');
            shellGradient.addColorStop(1, '#006400');
            ctx.fillStyle = shellGradient;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // 龟壳轮廓
            ctx.strokeStyle = '#006400';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            
            // 龟壳纹理
            ctx.fillStyle = '#32CD32';
            ctx.fillRect(this.x + 4, this.y + 4, 16, 16);
            
            // 头部
            ctx.fillStyle = '#90EE90';
            ctx.fillRect(this.x + 8, this.y + 2, 8, 6);
            
            // 眼睛
            ctx.fillStyle = '#000000';
            ctx.fillRect(this.x + 10, this.y + 4, 2, 2);
            ctx.fillRect(this.x + 14, this.y + 4, 2, 2);
            
            // 脚
            ctx.fillStyle = '#90EE90';
            ctx.fillRect(this.x + 2, this.y + this.height - 4, 4, 4);
            ctx.fillRect(this.x + 18, this.y + this.height - 4, 4, 4);
            
        } else if (this.type === 'piranha') {
            // 绘制食人花（带渐变）
            const plantGradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
            plantGradient.addColorStop(0, '#228B22');
            plantGradient.addColorStop(0.5, '#32CD32');
            plantGradient.addColorStop(1, '#006400');
            ctx.fillStyle = plantGradient;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // 植物轮廓
            ctx.strokeStyle = '#006400';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            
            // 花瓣
            ctx.fillStyle = '#FF6B6B';
            ctx.fillRect(this.x + 2, this.y + 2, 20, 8);
            ctx.fillRect(this.x + 2, this.y + 14, 20, 8);
            
            // 花蕊
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(this.x + 8, this.y + 8, 8, 8);
            
            // 眼睛
            ctx.fillStyle = '#000000';
            ctx.fillRect(this.x + 10, this.y + 10, 2, 2);
            ctx.fillRect(this.x + 14, this.y + 10, 2, 2);
            
            // 嘴巴
            ctx.fillStyle = '#000000';
            ctx.fillRect(this.x + 11, this.y + 12, 2, 2);
        }
        ctx.restore();
    }
    die() {
        this.alive = false;
        
        // 计分
        score += 200;
        
        // 死亡粒子效果
        for (let i = 0; i < 8; i++) {
            particles.push(new Particle(
                this.x + this.width / 2,
                this.y + this.height / 2,
                (Math.random() - 0.5) * 6,
                -Math.random() * 4,
                '#8B4513',
                30
            ));
        }
    }
    
    collidesWith(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
}

// 道具类
class Item {
    constructor(x, y, type = 'coin') {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 16;
        this.type = type;
        this.collected = false;
        this.animationOffset = 0;
    }
    update() {
        if (this.collected) return;
        this.animationOffset = Math.sin(Date.now() * 0.01) * 2;
    }
    draw() {
        if (this.collected) return;
        
        ctx.save();
        if (this.type === 'coin') {
            // 绘制阴影
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(this.x + 1, this.y + this.animationOffset + 1, this.width - 2, this.height - 2);
            
            // 绘制金币（带渐变）
            const coinGradient = ctx.createRadialGradient(
                this.x + this.width/2, this.y + this.animationOffset + this.height/2, 0,
                this.x + this.width/2, this.y + this.animationOffset + this.height/2, 8
            );
            coinGradient.addColorStop(0, '#FFD700');
            coinGradient.addColorStop(0.7, '#FFA500');
            coinGradient.addColorStop(1, '#FF8C00');
            ctx.fillStyle = coinGradient;
            ctx.fillRect(this.x, this.y + this.animationOffset, this.width, this.height);
            
            // 金币轮廓
            ctx.strokeStyle = '#FF8C00';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x, this.y + this.animationOffset, this.width, this.height);
            
            // 金币符号
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('$', this.x + this.width/2, this.y + this.animationOffset + this.height/2 + 4);
            
            // 金币高光
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fillRect(this.x + 2, this.y + this.animationOffset + 2, 4, 2);
            
        } else if (this.type === 'mushroom') {
            // 绘制阴影
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(this.x + 1, this.y + this.animationOffset + 1, this.width - 2, this.height - 2);
            
            // 绘制蘑菇柄
            const stemGradient = ctx.createLinearGradient(this.x, this.y + this.animationOffset + 8, this.x, this.y + this.animationOffset + this.height);
            stemGradient.addColorStop(0, '#FFFFFF');
            stemGradient.addColorStop(1, '#F0F0F0');
            ctx.fillStyle = stemGradient;
            ctx.fillRect(this.x + 4, this.y + this.animationOffset + 8, 8, 8);
            
            // 绘制蘑菇帽
            const capGradient = ctx.createRadialGradient(
                this.x + this.width/2, this.y + this.animationOffset + 4, 0,
                this.x + this.width/2, this.y + this.animationOffset + 4, 8
            );
            capGradient.addColorStop(0, '#FF6B6B');
            capGradient.addColorStop(1, '#FF4444');
            ctx.fillStyle = capGradient;
            ctx.fillRect(this.x + 2, this.y + this.animationOffset, 12, 10);
            
            // 蘑菇帽轮廓
            ctx.strokeStyle = '#CC4444';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x + 2, this.y + this.animationOffset, 12, 10);
            
            // 蘑菇斑点
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(this.x + 4, this.y + this.animationOffset + 2, 3, 3);
            ctx.fillRect(this.x + 9, this.y + this.animationOffset + 4, 2, 2);
            ctx.fillRect(this.x + 6, this.y + this.animationOffset + 6, 2, 2);
            
            // 蘑菇高光
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillRect(this.x + 3, this.y + this.animationOffset + 1, 4, 2);
            
        } else if (this.type === 'star') {
            // 绘制星星（带旋转动画）
            const rotation = Date.now() * 0.01;
            ctx.save();
            ctx.translate(this.x + this.width/2, this.y + this.animationOffset + this.height/2);
            ctx.rotate(rotation);
            
            // 星星主体
            const starGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 8);
            starGradient.addColorStop(0, '#FFFF00');
            starGradient.addColorStop(0.7, '#FFD700');
            starGradient.addColorStop(1, '#FFA500');
            ctx.fillStyle = starGradient;
            
            // 绘制五角星
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                const x = Math.cos(angle) * 8;
                const y = Math.sin(angle) * 8;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
                
                const innerAngle = angle + Math.PI / 5;
                const innerX = Math.cos(innerAngle) * 4;
                const innerY = Math.sin(innerAngle) * 4;
                ctx.lineTo(innerX, innerY);
            }
            ctx.closePath();
            ctx.fill();
            
            // 星星轮廓
            ctx.strokeStyle = '#FF8C00';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            ctx.restore();
            
        } else if (this.type === 'flower') {
            // 绘制火焰花（带渐变）
            const flowerGradient = ctx.createRadialGradient(
                this.x + this.width/2, this.y + this.animationOffset + this.height/2, 0,
                this.x + this.width/2, this.y + this.animationOffset + this.height/2, 8
            );
            flowerGradient.addColorStop(0, '#FF6B6B');
            flowerGradient.addColorStop(0.5, '#FF4444');
            flowerGradient.addColorStop(1, '#CC0000');
            ctx.fillStyle = flowerGradient;
            ctx.fillRect(this.x, this.y + this.animationOffset, this.width, this.height);
            
            // 花瓣
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(this.x + 2, this.y + this.animationOffset + 2, 4, 4);
            ctx.fillRect(this.x + 10, this.y + this.animationOffset + 2, 4, 4);
            ctx.fillRect(this.x + 6, this.y + this.animationOffset + 6, 4, 4);
            
            // 花蕊
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(this.x + 6, this.y + this.animationOffset + 4, 4, 4);
            
            // 火焰花轮廓
            ctx.strokeStyle = '#CC0000';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x, this.y + this.animationOffset, this.width, this.height);
        }
        ctx.restore();
    }
    collect() {
        if (this.collected) return;
        this.collected = true;
        
        // 计分和效果
        if (this.type === 'coin') {
            score += 100;
            levelProgress.coinsCollected++;
        } else if (this.type === 'mushroom') {
            score += 500;
            player.powerUp();
        } else if (this.type === 'star') {
            score += 1000;
            player.starPower();
        } else if (this.type === 'flower') {
            score += 800;
            player.firePower();
        }
        
        // 收集粒子效果
        let particleColor = '#FFD700';
        if (this.type === 'mushroom') particleColor = '#FF6B6B';
        else if (this.type === 'star') particleColor = '#FFFF00';
        else if (this.type === 'flower') particleColor = '#FF4444';
        
        for (let i = 0; i < 6; i++) {
            particles.push(new Particle(
                this.x + this.width / 2,
                this.y + this.height / 2,
                (Math.random() - 0.5) * 4,
                -Math.random() * 3,
                particleColor,
                25
            ));
        }
    }
    
    collidesWith(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
}

// 玩家类
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 48;
        this.vx = 0;
        this.vy = 0;
        this.onGround = true; // 初始时在地面上
        this.facingRight = true;
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.isBig = false;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.firePower = false;
        this.firePowerTimer = 0;
        this.lastShotTime = 0;
        this.shotCooldown = 200; // 0.2秒冷却时间，可以连发
    }
    update() {
        // 左右移动
        if (keys['a'] || keys['arrowleft']) {
            this.vx = -MOVE_SPEED;
            this.facingRight = false;
        } else if (keys['d'] || keys['arrowright']) {
            this.vx = MOVE_SPEED;
            this.facingRight = true;
        } else {
            this.vx *= 0.8; // 摩擦力
        }
        
        // 跳跃
        if ((keys['w'] || keys['arrowup'] || keys[' ']) && this.onGround) {
            this.vy = JUMP_FORCE;
            this.onGround = false;
            // 跳跃粒子效果
            for (let i = 0; i < 5; i++) {
                particles.push(new Particle(
                    this.x + this.width / 2,
                    this.y + this.height,
                    (Math.random() - 0.5) * 4,
                    -Math.random() * 2,
                    '#8B4513',
                    20
                ));
            }
        }
        
        // 射击
        if ((keys['f'] || keys['enter']) && Date.now() - this.lastShotTime > this.shotCooldown) {
            this.shoot();
            this.lastShotTime = Date.now();
        }
        
        // 应用重力
        if (!this.onGround) {
            this.vy += GRAVITY;
        }
        
        // 更新位置
        this.x += this.vx;
        this.y += this.vy;
    
    // 动画
    this.animationTimer++;
    if (this.animationTimer > 5) {
        this.animationFrame = (this.animationFrame + 1) % 4;
        this.animationTimer = 0;
    }
    
    // 无敌时间
    if (this.invincible) {
        this.invincibleTimer--;
        if (this.invincibleTimer <= 0) {
            this.invincible = false;
        }
    }
    
    // 火焰力量时间
    if (this.firePower) {
        this.firePowerTimer--;
        if (this.firePowerTimer <= 0) {
            this.firePower = false;
        }
    }
    }
    
    shoot() {
        const bulletX = this.facingRight ? this.x + this.width + 8 : this.x - 8;
        const bulletY = this.y + this.height / 2;
        const direction = this.facingRight ? 1 : -1;
        
        bullets.push(new Bullet(bulletX, bulletY, direction));
        
        // 射击粒子效果
        for (let i = 0; i < 3; i++) {
            particles.push(new Particle(
                bulletX, bulletY,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                '#FFA500',
                15
            ));
        }
    }
    
    draw() {
        if (this.invincible && Math.floor(this.invincibleTimer / 5) % 2) {
            return; // 闪烁效果
        }
        
        ctx.save();
        
        // 绘制阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(this.x + 2, this.y + this.height + 2, this.width - 4, 4);
        
        // 绘制身体（带渐变）
        const bodyGradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        bodyGradient.addColorStop(0, '#FF4444');
        bodyGradient.addColorStop(0.5, '#FF0000');
        bodyGradient.addColorStop(1, '#CC0000');
        ctx.fillStyle = bodyGradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制身体轮廓
        ctx.strokeStyle = '#AA0000';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // 绘制帽子（带渐变和装饰）
        const hatGradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + 16);
        hatGradient.addColorStop(0, '#CC0000');
        hatGradient.addColorStop(1, '#AA0000');
        ctx.fillStyle = hatGradient;
        ctx.fillRect(this.x, this.y, this.width, 16);
        
        // 帽子装饰
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this.x + 8, this.y + 2, 16, 4);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(this.x + 10, this.y + 3, 12, 2);
        
        // 帽子边缘
        ctx.fillStyle = '#AA0000';
        ctx.fillRect(this.x - 2, this.y + 12, 4, 4);
        ctx.fillRect(this.x + this.width - 2, this.y + 12, 4, 4);
        
        // 绘制眼睛（带高光）
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this.x + 6, this.y + 18, 8, 8);
        ctx.fillRect(this.x + 18, this.y + 18, 8, 8);
        
        // 眼睛轮廓
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x + 6, this.y + 18, 8, 8);
        ctx.strokeRect(this.x + 18, this.y + 18, 8, 8);
        
        // 绘制瞳孔（带高光）
        ctx.fillStyle = '#000000';
        ctx.fillRect(this.x + 8, this.y + 20, 4, 4);
        ctx.fillRect(this.x + 20, this.y + 20, 4, 4);
        
        // 眼睛高光
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this.x + 9, this.y + 21, 2, 2);
        ctx.fillRect(this.x + 21, this.y + 21, 2, 2);
        
        // 绘制鼻子（带渐变）
        const noseGradient = ctx.createRadialGradient(this.x + 16, this.y + 28, 0, this.x + 16, this.y + 28, 4);
        noseGradient.addColorStop(0, '#FFCCCC');
        noseGradient.addColorStop(1, '#FF9999');
        ctx.fillStyle = noseGradient;
        ctx.fillRect(this.x + 14, this.y + 26, 4, 4);
        
        // 绘制嘴巴（带表情）
        ctx.fillStyle = '#000000';
        ctx.fillRect(this.x + 12, this.y + 32, 8, 2);
        
        // 绘制胡子（更精细）
        ctx.fillStyle = '#8B4513';
        // 上排胡子
        ctx.fillRect(this.x + 8, this.y + 30, 6, 2);
        ctx.fillRect(this.x + 18, this.y + 30, 6, 2);
        // 下排胡子
        ctx.fillRect(this.x + 6, this.y + 32, 4, 2);
        ctx.fillRect(this.x + 22, this.y + 32, 4, 2);
        // 侧边胡子
        ctx.fillRect(this.x + 4, this.y + 28, 3, 1);
        ctx.fillRect(this.x + 25, this.y + 28, 3, 1);
        
        // 绘制手套（带渐变和细节）
        const gloveGradient = ctx.createLinearGradient(this.x - 6, this.y + 24, this.x + 2, this.y + 36);
        gloveGradient.addColorStop(0, '#FFFFFF');
        gloveGradient.addColorStop(1, '#EEEEEE');
        ctx.fillStyle = gloveGradient;
        ctx.fillRect(this.x - 6, this.y + 24, 12, 16);
        ctx.fillRect(this.x + 26, this.y + 24, 12, 16);
        
        // 手套轮廓
        ctx.strokeStyle = '#CCCCCC';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x - 6, this.y + 24, 12, 16);
        ctx.strokeRect(this.x + 26, this.y + 24, 12, 16);
        
        // 手套装饰
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(this.x - 4, this.y + 26, 8, 2);
        ctx.fillRect(this.x + 28, this.y + 26, 8, 2);
        
        // 绘制手枪
        ctx.fillStyle = '#8B4513';
        if (this.facingRight) {
            ctx.fillRect(this.x + 26, this.y + 20, 8, 4);
            ctx.fillRect(this.x + 34, this.y + 19, 6, 6);
        } else {
            ctx.fillRect(this.x - 2, this.y + 20, 8, 4);
            ctx.fillRect(this.x - 8, this.y + 19, 6, 6);
        }
        
        // 绘制裤子
        ctx.fillStyle = '#0000AA';
        ctx.fillRect(this.x + 4, this.y + 36, 24, 8);
        
        // 裤子装饰
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this.x + 8, this.y + 38, 4, 4);
        ctx.fillRect(this.x + 20, this.y + 38, 4, 4);
        
        // 绘制鞋子（带渐变和细节）
        const shoeGradient = ctx.createLinearGradient(this.x, this.y + this.height - 12, this.x, this.y + this.height);
        shoeGradient.addColorStop(0, '#8B4513');
        shoeGradient.addColorStop(1, '#654321');
        ctx.fillStyle = shoeGradient;
        ctx.fillRect(this.x, this.y + this.height - 12, 14, 12);
        ctx.fillRect(this.x + 18, this.y + this.height - 12, 14, 12);
        
        // 鞋子装饰
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this.x + 2, this.y + this.height - 10, 10, 2);
        ctx.fillRect(this.x + 20, this.y + this.height - 10, 10, 2);
        
        // 鞋子轮廓
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y + this.height - 12, 14, 12);
        ctx.strokeRect(this.x + 18, this.y + this.height - 12, 14, 12);
        
        // 绘制动画效果（移动时的摆动）
        if (Math.abs(this.vx) > 0.1) {
            const swingOffset = Math.sin(this.animationFrame * 0.5) * 2;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(this.x + 4, this.y + 4, this.width - 8, 4);
        }
        
        ctx.restore();
    }
    
    collidesWith(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
    
    powerUp() {
        if (!this.isBig) {
            this.isBig = true;
            this.height = 64;
            this.y -= 16;
        }
    }
    
    starPower() {
        // 星星力量：无敌状态
        this.invincible = true;
        this.invincibleTimer = 300; // 5秒无敌
        
        // 星星粒子效果
        for (let i = 0; i < 10; i++) {
            particles.push(new Particle(
                this.x + this.width / 2,
                this.y + this.height / 2,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                '#FFFF00',
                40
            ));
        }
    }
    
    firePower() {
        // 火焰力量：可以发射火焰球
        this.firePower = true;
        this.firePowerTimer = 600; // 10秒火焰力量
        
        // 火焰粒子效果
        for (let i = 0; i < 8; i++) {
            particles.push(new Particle(
                this.x + this.width / 2,
                this.y + this.height / 2,
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 6,
                '#FF4444',
                35
            ));
        }
    }
    
    takeDamage() {
        if (!this.invincible) {
            this.invincible = true;
            this.invincibleTimer = 120;
            lives--;
            
            if (lives <= 0) {
                gameState = 'gameOver';
            }
            
            if (this.isBig) {
                this.isBig = false;
                this.height = 48;
            }
        }
    }
}

// 关卡数据
const levels = {
    1: {
        name: "蘑菇王国 - 新手村",
        description: "收集7个金币，击败2个敌人，在120秒内完成",
        platforms: [
            new Platform(200, 450, 100, 20, 'brick'),
            new Platform(350, 400, 100, 20, 'brick'),
            new Platform(500, 350, 100, 20, 'brick'),
            new Platform(300, 350, 32, 32, 'question'),
            new Platform(450, 300, 32, 32, 'question'),
            new Platform(800, 450, 100, 20, 'brick'),
            new Platform(1000, 400, 100, 20, 'brick'),
            new Platform(1200, 350, 100, 20, 'brick'),
        ],
        enemies: [
            new Enemy(300, CANVAS_HEIGHT - 50 - 32, 'goomba'),
            new Enemy(800, CANVAS_HEIGHT - 50 - 32, 'goomba'),
        ],
        items: [
            new Item(300, 350, 'coin'),
            new Item(450, 300, 'mushroom'),
            new Item(600, 400, 'coin'),
            new Item(800, 400, 'coin'),
            new Item(1000, 350, 'mushroom'),
            new Item(1200, 300, 'coin'),
            new Item(1400, 250, 'coin'),
        ]
    },
    2: {
        name: "森林迷宫 - 进阶挑战",
        description: "收集14个金币，击败7个敌人，在100秒内完成",
        platforms: [
            new Platform(200, 450, 100, 20, 'brick'),
            new Platform(350, 400, 100, 20, 'brick'),
            new Platform(500, 350, 100, 20, 'brick'),
            new Platform(300, 350, 32, 32, 'question'),
            new Platform(450, 300, 32, 32, 'question'),
            new Platform(800, 450, 100, 20, 'brick'),
            new Platform(1000, 400, 100, 20, 'brick'),
            new Platform(1200, 350, 100, 20, 'brick'),
            new Platform(1400, 300, 100, 20, 'brick'),
            new Platform(1600, 250, 100, 20, 'brick'),
            new Platform(1800, 200, 100, 20, 'brick'),
            new Platform(2000, 450, 100, 20, 'brick'),
            new Platform(2200, 400, 100, 20, 'brick'),
            new Platform(2400, 350, 100, 20, 'brick'),
        ],
        enemies: [
            new Enemy(300, CANVAS_HEIGHT - 50 - 32, 'goomba'),
            new Enemy(500, CANVAS_HEIGHT - 50 - 32, 'koopa'),
            new Enemy(800, CANVAS_HEIGHT - 50 - 32, 'goomba'),
            new Enemy(1200, CANVAS_HEIGHT - 50 - 32, 'koopa'),
            new Enemy(1600, CANVAS_HEIGHT - 50 - 32, 'goomba'),
            new Enemy(2000, CANVAS_HEIGHT - 50 - 32, 'koopa'),
            new Enemy(2400, CANVAS_HEIGHT - 50 - 32, 'goomba'),
        ],
        items: [
            new Item(300, 350, 'coin'),
            new Item(450, 300, 'mushroom'),
            new Item(600, 400, 'coin'),
            new Item(800, 400, 'coin'),
            new Item(1000, 350, 'mushroom'),
            new Item(1200, 300, 'coin'),
            new Item(1400, 250, 'coin'),
            new Item(1600, 200, 'mushroom'),
            new Item(1800, 150, 'coin'),
            new Item(2000, 400, 'coin'),
            new Item(2200, 350, 'mushroom'),
            new Item(2400, 300, 'coin'),
            new Item(350, 250, 'star'),
            new Item(750, 200, 'star'),
        ]
    },
    3: {
        name: "城堡挑战 - 终极试炼",
        description: "收集25个金币，击败12个敌人，在80秒内完成",
        platforms: [
            new Platform(200, 450, 100, 20, 'brick'),
            new Platform(350, 400, 100, 20, 'brick'),
            new Platform(500, 350, 100, 20, 'brick'),
            new Platform(300, 350, 32, 32, 'question'),
            new Platform(450, 300, 32, 32, 'question'),
            new Platform(800, 450, 100, 20, 'brick'),
            new Platform(1000, 400, 100, 20, 'brick'),
            new Platform(1200, 350, 100, 20, 'brick'),
            new Platform(1400, 300, 100, 20, 'brick'),
            new Platform(1600, 250, 100, 20, 'brick'),
            new Platform(1800, 200, 100, 20, 'brick'),
            new Platform(2000, 450, 100, 20, 'brick'),
            new Platform(2200, 400, 100, 20, 'brick'),
            new Platform(2400, 350, 100, 20, 'brick'),
            new Platform(2600, 300, 100, 20, 'brick'),
            new Platform(2800, 250, 100, 20, 'brick'),
        ],
        enemies: [
            new Enemy(300, CANVAS_HEIGHT - 50 - 32, 'goomba'),
            new Enemy(500, CANVAS_HEIGHT - 50 - 32, 'koopa'),
            new Enemy(800, CANVAS_HEIGHT - 50 - 32, 'piranha'),
            new Enemy(1200, CANVAS_HEIGHT - 50 - 32, 'goomba'),
            new Enemy(1600, CANVAS_HEIGHT - 50 - 32, 'koopa'),
            new Enemy(2000, CANVAS_HEIGHT - 50 - 32, 'piranha'),
            new Enemy(2400, CANVAS_HEIGHT - 50 - 32, 'goomba'),
            new Enemy(2800, CANVAS_HEIGHT - 50 - 32, 'koopa'),
            new Enemy(400, CANVAS_HEIGHT - 50 - 32, 'piranha'),
            new Enemy(900, CANVAS_HEIGHT - 50 - 32, 'piranha'),
            new Enemy(1500, CANVAS_HEIGHT - 50 - 32, 'piranha'),
            new Enemy(2200, CANVAS_HEIGHT - 50 - 32, 'piranha'),
        ],
        items: [
            new Item(300, 350, 'coin'),
            new Item(450, 300, 'mushroom'),
            new Item(600, 400, 'coin'),
            new Item(800, 400, 'coin'),
            new Item(1000, 350, 'mushroom'),
            new Item(1200, 300, 'coin'),
            new Item(1400, 250, 'coin'),
            new Item(1600, 200, 'mushroom'),
            new Item(1800, 150, 'coin'),
            new Item(2000, 400, 'coin'),
            new Item(2200, 350, 'mushroom'),
            new Item(2400, 300, 'coin'),
            new Item(2600, 250, 'coin'),
            new Item(2800, 200, 'mushroom'),
            new Item(350, 250, 'star'),
            new Item(750, 200, 'star'),
            new Item(1150, 150, 'star'),
            new Item(1550, 100, 'star'),
            new Item(1950, 300, 'star'),
            new Item(2350, 250, 'star'),
            new Item(2750, 200, 'star'),
            new Item(400, 400, 'flower'),
            new Item(900, 350, 'flower'),
            new Item(1400, 300, 'flower'),
            new Item(1900, 250, 'flower'),
            new Item(2400, 200, 'flower'),
        ]
    }
};

// 当前关卡数据
let platforms = [];
let enemies = [];
let items = [];

// 初始化玩家
const player = new Player(100, CANVAS_HEIGHT - 50 - 48);

// 相机系统
let camera = { x: 0, y: 0 };

// 碰撞检测
function checkCollisions() {
    // 玩家与平台碰撞
    let onAnyPlatform = false;
    for (let platform of platforms) {
        if (player.collidesWith(platform)) {
            if (player.vy > 0 && player.y < platform.y) {
                player.y = platform.y - player.height;
                player.vy = 0;
                player.onGround = true;
                onAnyPlatform = true;
            }
        }
    }
    
    // 如果没有站在任何平台上，检查地面
    if (!onAnyPlatform && player.y + player.height >= CANVAS_HEIGHT - 50) {
        player.y = CANVAS_HEIGHT - 50 - player.height;
        player.vy = 0;
        player.onGround = true;
    }
    
    // 玩家与敌人碰撞
    for (let enemy of enemies) {
        if (enemy.alive && player.collidesWith(enemy)) {
            if (player.vy > 0 && player.y < enemy.y) {
                // 踩敌人
                enemy.die();
                player.vy = JUMP_FORCE * 0.5;
                levelProgress.enemiesDefeated++;
            } else {
                // 被敌人攻击
                player.takeDamage();
            }
        }
    }
    
    // 玩家与道具碰撞
    for (let item of items) {
        if (!item.collected && player.collidesWith(item)) {
            item.collect();
            if (item.type === 'mushroom') {
                player.powerUp();
            }
        }
    }
    
    // 子弹与敌人碰撞
    for (let bullet of bullets) {
        if (!bullet.alive) continue;
        for (let enemy of enemies) {
            if (enemy.alive && bullet.collidesWith(enemy)) {
                bullet.alive = false;
                enemy.die();
                levelProgress.enemiesDefeated++;
                // 击中粒子效果
                for (let i = 0; i < 5; i++) {
                    particles.push(new Particle(
                        bullet.x, bullet.y,
                        (Math.random() - 0.5) * 4,
                        (Math.random() - 0.5) * 4,
                        '#FFA500',
                        20
                    ));
                }
            }
        }
    }
    
    // 敌人与平台碰撞
    for (let enemy of enemies) {
        if (!enemy.alive) continue;
        
        enemy.onGround = false;
        for (let platform of platforms) {
            if (enemy.collidesWith(platform)) {
                if (enemy.vy > 0 && enemy.y < platform.y) {
                    enemy.y = platform.y - enemy.height;
                    enemy.vy = 0;
                    enemy.onGround = true;
                }
            }
        }
    }
}

// 加载关卡
function loadLevel(level) {
    currentLevel = level;
    const levelInfo = levels[level];
    
    // 重置进度
    levelProgress = {
        coinsCollected: 0,
        enemiesDefeated: 0,
        timeRemaining: levelInfo.time
    };
    
    // 加载关卡数据
    platforms = [...levelInfo.platforms];
    enemies = [...levelInfo.enemies];
    items = [...levelInfo.items];
    
    // 保存敌人原始位置
    enemies.forEach(enemy => {
        enemy.originalX = enemy.x;
    });
    
    // 重置玩家
    player.x = 100;
    player.y = CANVAS_HEIGHT - 50 - 48;
    player.vx = 0;
    player.vy = 0;
    player.onGround = true;
    player.isBig = false;
    player.height = 48;
    player.invincible = false;
    player.invincibleTimer = 0;
    player.firePower = false;
    player.firePowerTimer = 0;
    
    // 重置游戏状态
    camera.x = 0;
    bullets = [];
    particles = [];
    score = 0;
}

// 检查关卡完成
function checkLevelComplete() {
    const objectives = levelObjectives[currentLevel];
    const progress = levelProgress;
    
    if (progress.coinsCollected >= objectives.coins && 
        progress.enemiesDefeated >= objectives.enemies && 
        progress.timeRemaining > 0) {
        
        if (currentLevel < 3) {
            gameState = 'levelComplete';
        } else {
            gameState = 'gameComplete';
        }
    }
}

// 重置游戏
function resetGame() {
    score = 0;
    lives = 3;
    currentLevel = 1;
    levelProgress = {
        coinsCollected: 0,
        enemiesDefeated: 0,
        timeRemaining: levelObjectives[1].time
    };
    loadLevel(1);
    gameState = 'playing';
}

// 更新相机
function updateCamera() {
    const targetX = player.x - CANVAS_WIDTH / 2;
    camera.x = Math.max(0, Math.min(targetX, 3200 - CANVAS_WIDTH));
}

// 更新游戏
function updateGame() {
    // 时间倒计时
    if (levelProgress.timeRemaining > 0) {
        levelProgress.timeRemaining -= 1/60; // 60FPS
        if (levelProgress.timeRemaining <= 0) {
            gameState = 'gameOver';
        }
    }
    
    // 检查关卡完成
    checkLevelComplete();
    
    // 绘制云朵
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = 0; i < 5; i++) {
        const x = (i * 200 - camera.x * 0.5) % (CANVAS_WIDTH + 100);
        const y = 50 + Math.sin(Date.now() * 0.001 + i) * 20;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.arc(x + 25, y, 15, 0, Math.PI * 2);
        ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 应用相机变换
    ctx.save();
    ctx.translate(-camera.x, 0);
    
    // 绘制地面
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, CANVAS_HEIGHT - 50, 3200, 50);
    
    // 更新和绘制平台
    for (let platform of platforms) {
        platform.draw();
    }
    
    // 更新和绘制道具
    for (let item of items) {
        item.update();
        item.draw();
    }
    
    // 更新和绘制敌人
    for (let enemy of enemies) {
        enemy.update();
        enemy.draw();
    }
    
    // 更新和绘制子弹
    bullets = bullets.filter(bullet => {
        bullet.update();
        bullet.draw();
        return bullet.alive;
    });
    
    // 更新和绘制玩家
    player.update();
    player.draw();
    
    // 更新粒子
    particles = particles.filter(particle => {
        particle.update();
        particle.draw();
        return particle.life > 0;
    });
    
    ctx.restore();
    
    // 碰撞检测
    checkCollisions();
    
    // 更新相机
    updateCamera();
    
    // 绘制UI
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(`关卡 ${currentLevel}: ${levels[currentLevel].name}`, 10, 30);
    ctx.fillText(`分数: ${score}`, 10, 50);
    ctx.fillText(`生命: ${lives}`, 10, 70);
    ctx.fillText(`时间: ${Math.ceil(levelProgress.timeRemaining)}秒`, 10, 90);
    ctx.fillText(`金币: ${levelProgress.coinsCollected}/${levelObjectives[currentLevel].coins}`, 10, 110);
    ctx.fillText(`敌人: ${levelProgress.enemiesDefeated}/${levelObjectives[currentLevel].enemies}`, 10, 130);
    ctx.fillText(`子弹: ${bullets.length}`, 10, 150);
    if (player.firePower) {
        ctx.fillText(`火焰力量: ${Math.ceil(player.firePowerTimer / 60)}秒`, 10, 170);
    }
    ctx.fillText('移动: WASD 或 方向键', 10, 190);
    ctx.fillText('跳跃: W/↑/空格', 10, 210);
    ctx.fillText('射击: F/回车', 10, 230);
    ctx.fillText('暂停: P', 10, 250);
}

// 绘制主菜单屏幕
function drawMenuScreen() {
    // 绘制背景
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.5, '#98FB98');
    gradient.addColorStop(1, '#228B22');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // 绘制云朵
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = 0; i < 5; i++) {
        const x = (i * 200) % (CANVAS_WIDTH + 100);
        const y = 50 + Math.sin(Date.now() * 0.001 + i) * 20;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.arc(x + 25, y, 15, 0, Math.PI * 2);
        ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 绘制标题
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('超级马里奥', CANVAS_WIDTH / 2, 150);
    
    // 绘制副标题
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText('网页版冒险', CANVAS_WIDTH / 2, 200);
    
    // 绘制关卡信息
    ctx.font = '18px Arial';
    ctx.fillText('关卡 1: 蘑菇王国 - 新手村', CANVAS_WIDTH / 2, 280);
    ctx.fillText('关卡 2: 森林迷宫 - 进阶挑战', CANVAS_WIDTH / 2, 310);
    ctx.fillText('关卡 3: 城堡挑战 - 终极试炼', CANVAS_WIDTH / 2, 340);
    
    // 绘制控制说明
    ctx.font = '16px Arial';
    ctx.fillText('移动: WASD 或 方向键', CANVAS_WIDTH / 2, 400);
    ctx.fillText('跳跃: W/↑/空格', CANVAS_WIDTH / 2, 420);
    ctx.fillText('射击: F/回车', CANVAS_WIDTH / 2, 440);
    ctx.fillText('暂停: P', CANVAS_WIDTH / 2, 460);
    
    // 绘制开始提示
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('按 空格键 开始游戏', CANVAS_WIDTH / 2, 520);
}

// 绘制暂停屏幕
function drawPauseScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏暂停', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
    
    ctx.font = '24px Arial';
    ctx.fillText('按 P 继续游戏', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
}

// 绘制关卡完成屏幕
function drawLevelCompleteScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('关卡完成！', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 100);
    
    ctx.font = '24px Arial';
    ctx.fillText(`关卡 ${currentLevel} 分数: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
    ctx.fillText(`剩余时间: ${Math.ceil(levelProgress.timeRemaining)}秒`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
    
    if (currentLevel < 3) {
        ctx.fillText('按 N 进入下一关', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    } else {
        ctx.fillText('恭喜通关！', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    }
    ctx.fillText('按 R 重新开始', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
}

// 绘制游戏完成屏幕
function drawGameCompleteScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.fillStyle = '#FFD700';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎉 恭喜通关！ 🎉', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 100);
    
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText(`最终分数: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
    ctx.fillText('你成功拯救了蘑菇王国！', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
    ctx.fillText('按 R 重新开始游戏', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
}

// 绘制游戏结束屏幕
function drawGameOverScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 80);
    
    ctx.font = '24px Arial';
    ctx.fillText(`最终分数: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
    ctx.fillText('按 R 重新开始', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
}

// 主循环
function gameLoop() {
    // 清屏
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // 绘制背景
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.5, '#98FB98');
    gradient.addColorStop(1, '#228B22');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // 根据游戏状态处理
    if (gameState === 'menu') {
        // 主菜单
        drawMenuScreen();
    } else if (gameState === 'playing') {
        // 游戏进行中
        updateGame();
    } else if (gameState === 'paused') {
        // 游戏暂停
        drawPauseScreen();
    } else if (gameState === 'levelComplete') {
        // 关卡完成
        drawLevelCompleteScreen();
    } else if (gameState === 'gameComplete') {
        // 游戏完成
        drawGameCompleteScreen();
    } else if (gameState === 'gameOver') {
        // 游戏结束
        drawGameOverScreen();
    }
    
    // 下一帧
    requestAnimationFrame(gameLoop);
}

// 键盘事件
window.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
    
    // 主菜单开始游戏
    if (e.key === ' ' && gameState === 'menu') {
        loadLevel(1);
        gameState = 'playing';
    }
    
    // 暂停功能
    if (e.key === 'p' || e.key === 'P') {
        if (gameState === 'playing') {
            gameState = 'paused';
        } else if (gameState === 'paused') {
            gameState = 'playing';
        }
    }
    
    // 重新开始游戏
    if (e.key === 'r' || e.key === 'R') {
        if (gameState === 'gameOver' || gameState === 'gameComplete') {
            resetGame();
        }
    }
    
    // 下一关
    if (e.key === 'n' || e.key === 'N') {
        if (gameState === 'levelComplete' && currentLevel < 3) {
            loadLevel(currentLevel + 1);
            gameState = 'playing';
        }
    }
});
window.addEventListener('keyup', e => {
    keys[e.key.toLowerCase()] = false;
});

// 启动游戏
initGame();
requestAnimationFrame(gameLoop); 