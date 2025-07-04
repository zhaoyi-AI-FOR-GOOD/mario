/**
 * 高品质游戏图形渲染系统
 * Professional Game Graphics Rendering System
 */

class SpriteRenderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.spriteCache = new Map();
        this.animationCache = new Map();
        this.init();
    }

    init() {
        // 预生成所有精灵图
        this.generateMarioSprites();
        this.generateEnemySprites();
        this.generateEnvironmentSprites();
        this.generateEffectSprites();
        this.generateUISprites();
    }

    // 创建高品质像素艺术马里奥精灵
    generateMarioSprites() {
        // 小马里奥 - 站立
        this.spriteCache.set('mario_small_idle', this.createMarioSmallIdle());
        
        // 小马里奥 - 行走动画帧
        this.spriteCache.set('mario_small_walk1', this.createMarioSmallWalk1());
        this.spriteCache.set('mario_small_walk2', this.createMarioSmallWalk2());
        
        // 小马里奥 - 跳跃
        this.spriteCache.set('mario_small_jump', this.createMarioSmallJump());
        
        // 大马里奥 - 先使用小马里奥的精灵（后续可扩展）
        this.spriteCache.set('mario_big_idle', this.createMarioSmallIdle());
        this.spriteCache.set('mario_big_walk1', this.createMarioSmallWalk1());
        this.spriteCache.set('mario_big_walk2', this.createMarioSmallWalk2());
        this.spriteCache.set('mario_big_jump', this.createMarioSmallJump());
        
        // 火焰马里奥 - 先使用小马里奥的精灵（后续可扩展）
        this.spriteCache.set('mario_fire_idle', this.createMarioSmallIdle());
        this.spriteCache.set('mario_fire_walk1', this.createMarioSmallWalk1());
        this.spriteCache.set('mario_fire_walk2', this.createMarioSmallWalk2());
        this.spriteCache.set('mario_fire_jump', this.createMarioSmallJump());
    }

    createMarioSmallIdle() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        // 禁用图像平滑以保持像素完美
        ctx.imageSmoothingEnabled = false;
        
        // 马里奥的帽子 (红色)
        ctx.fillStyle = '#DC143C';
        ctx.fillRect(8, 4, 16, 8);
        ctx.fillRect(6, 8, 20, 2);
        
        // 帽子阴影
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(22, 6, 2, 4);
        ctx.fillRect(20, 10, 4, 2);
        
        // 脸部 (肤色)
        ctx.fillStyle = '#FFB366';
        ctx.fillRect(10, 10, 12, 8);
        ctx.fillRect(8, 12, 2, 4);
        ctx.fillRect(22, 12, 2, 4);
        
        // 鼻子高光
        ctx.fillStyle = '#FFCC99';
        ctx.fillRect(16, 14, 2, 2);
        
        // 眼睛
        ctx.fillStyle = '#000000';
        ctx.fillRect(12, 12, 2, 2);
        ctx.fillRect(18, 12, 2, 2);
        
        // 胡须
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(10, 16, 2, 1);
        ctx.fillRect(14, 16, 4, 1);
        ctx.fillRect(20, 16, 2, 1);
        
        // 工作服 (蓝色)
        ctx.fillStyle = '#0066CC';
        ctx.fillRect(10, 18, 12, 10);
        
        // 工作服按钮和细节
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(15, 20, 2, 2);
        ctx.fillRect(15, 24, 2, 2);
        
        // 工作服阴影
        ctx.fillStyle = '#004499';
        ctx.fillRect(20, 20, 2, 8);
        ctx.fillRect(18, 26, 4, 2);
        
        // 手臂 (肤色)
        ctx.fillStyle = '#FFB366';
        ctx.fillRect(6, 18, 4, 6);
        ctx.fillRect(22, 18, 4, 6);
        
        // 手套 (白色)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(4, 22, 4, 4);
        ctx.fillRect(24, 22, 4, 4);
        
        // 鞋子 (棕色)
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(8, 28, 6, 4);
        ctx.fillRect(18, 28, 6, 4);
        
        return canvas;
    }

    createMarioSmallWalk1() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        // 基于idle版本，调整手臂和腿部位置
        // 帽子
        ctx.fillStyle = '#DC143C';
        ctx.fillRect(8, 4, 16, 8);
        ctx.fillRect(6, 8, 20, 2);
        
        // 脸部
        ctx.fillStyle = '#FFB366';
        ctx.fillRect(10, 10, 12, 8);
        ctx.fillRect(8, 12, 2, 4);
        ctx.fillRect(22, 12, 2, 4);
        
        // 眼睛
        ctx.fillStyle = '#000000';
        ctx.fillRect(12, 12, 2, 2);
        ctx.fillRect(18, 12, 2, 2);
        
        // 胡须
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(10, 16, 2, 1);
        ctx.fillRect(14, 16, 4, 1);
        ctx.fillRect(20, 16, 2, 1);
        
        // 工作服
        ctx.fillStyle = '#0066CC';
        ctx.fillRect(10, 18, 12, 10);
        
        // 左臂向前
        ctx.fillStyle = '#FFB366';
        ctx.fillRect(4, 18, 6, 6);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(2, 22, 4, 4);
        
        // 右臂向后
        ctx.fillStyle = '#FFB366';
        ctx.fillRect(22, 20, 6, 4);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(26, 22, 4, 4);
        
        // 腿部 - 抬腿动作
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(10, 28, 4, 4); // 左脚抬起
        ctx.fillRect(18, 30, 6, 2); // 右脚着地
        
        return canvas;
    }

    createMarioSmallWalk2() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        // 类似walk1但镜像动作
        // 帽子
        ctx.fillStyle = '#DC143C';
        ctx.fillRect(8, 4, 16, 8);
        ctx.fillRect(6, 8, 20, 2);
        
        // 脸部
        ctx.fillStyle = '#FFB366';
        ctx.fillRect(10, 10, 12, 8);
        ctx.fillRect(8, 12, 2, 4);
        ctx.fillRect(22, 12, 2, 4);
        
        // 眼睛
        ctx.fillStyle = '#000000';
        ctx.fillRect(12, 12, 2, 2);
        ctx.fillRect(18, 12, 2, 2);
        
        // 胡须
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(10, 16, 2, 1);
        ctx.fillRect(14, 16, 4, 1);
        ctx.fillRect(20, 16, 2, 1);
        
        // 工作服
        ctx.fillStyle = '#0066CC';
        ctx.fillRect(10, 18, 12, 10);
        
        // 右臂向前
        ctx.fillStyle = '#FFB366';
        ctx.fillRect(22, 18, 6, 6);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(26, 22, 4, 4);
        
        // 左臂向后
        ctx.fillStyle = '#FFB366';
        ctx.fillRect(4, 20, 6, 4);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(2, 22, 4, 4);
        
        // 腿部 - 相反动作
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(8, 30, 6, 2); // 左脚着地
        ctx.fillRect(18, 28, 4, 4); // 右脚抬起
        
        return canvas;
    }

    createMarioSmallJump() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        // 跳跃姿态 - 双臂张开
        // 帽子
        ctx.fillStyle = '#DC143C';
        ctx.fillRect(8, 4, 16, 8);
        ctx.fillRect(6, 8, 20, 2);
        
        // 脸部
        ctx.fillStyle = '#FFB366';
        ctx.fillRect(10, 10, 12, 8);
        ctx.fillRect(8, 12, 2, 4);
        ctx.fillRect(22, 12, 2, 4);
        
        // 眼睛 - 专注表情
        ctx.fillStyle = '#000000';
        ctx.fillRect(12, 12, 2, 2);
        ctx.fillRect(18, 12, 2, 2);
        
        // 胡须
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(10, 16, 2, 1);
        ctx.fillRect(14, 16, 4, 1);
        ctx.fillRect(20, 16, 2, 1);
        
        // 工作服
        ctx.fillStyle = '#0066CC';
        ctx.fillRect(10, 18, 12, 10);
        
        // 双臂张开
        ctx.fillStyle = '#FFB366';
        ctx.fillRect(2, 16, 8, 4); // 左臂
        ctx.fillRect(22, 16, 8, 4); // 右臂
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 18, 4, 4); // 左手套
        ctx.fillRect(28, 18, 4, 4); // 右手套
        
        // 腿部 - 收腿姿态
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(10, 26, 4, 6);
        ctx.fillRect(18, 26, 4, 6);
        
        return canvas;
    }

    // 生成敌人精灵
    generateEnemySprites() {
        this.spriteCache.set('goomba_idle', this.createGoombaSprite());
        this.spriteCache.set('goomba_walk1', this.createGoombaSprite()); // 暂时使用相同精灵
        this.spriteCache.set('goomba_walk2', this.createGoombaSprite()); // 暂时使用相同精灵
        this.spriteCache.set('koopa_idle', this.createKoopaSprite());
        this.spriteCache.set('koopa_walk1', this.createKoopaSprite()); // 暂时使用相同精灵
        this.spriteCache.set('koopa_walk2', this.createKoopaSprite()); // 暂时使用相同精灵
        this.spriteCache.set('piranha_idle', this.createPiranhaSprite());
    }

    createGoombaSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        // Goomba身体 (棕色蘑菇状)
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(6, 12, 20, 16);
        ctx.fillRect(4, 16, 24, 8);
        ctx.fillRect(8, 8, 16, 8);
        
        // 身体高光
        ctx.fillStyle = '#CD853F';
        ctx.fillRect(8, 12, 12, 4);
        ctx.fillRect(6, 16, 16, 2);
        
        // 身体阴影
        ctx.fillStyle = '#654321';
        ctx.fillRect(18, 16, 8, 8);
        ctx.fillRect(20, 24, 6, 4);
        
        // 眼睛 (白色底)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(10, 14, 4, 4);
        ctx.fillRect(18, 14, 4, 4);
        
        // 眼珠 (黑色)
        ctx.fillStyle = '#000000';
        ctx.fillRect(11, 15, 2, 2);
        ctx.fillRect(19, 15, 2, 2);
        
        // 愤怒的眉毛
        ctx.fillStyle = '#000000';
        ctx.fillRect(9, 13, 3, 1);
        ctx.fillRect(20, 13, 3, 1);
        
        // 嘴巴 (凶恶表情)
        ctx.fillStyle = '#000000';
        ctx.fillRect(14, 20, 4, 2);
        ctx.fillRect(12, 21, 2, 1);
        ctx.fillRect(18, 21, 2, 1);
        
        // 小脚
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(8, 28, 4, 4);
        ctx.fillRect(20, 28, 4, 4);
        
        return canvas;
    }

    createKoopaSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        // Koopa龟壳 (绿色)
        ctx.fillStyle = '#228B22';
        ctx.fillRect(6, 8, 20, 18);
        ctx.fillRect(8, 6, 16, 4);
        ctx.fillRect(4, 12, 24, 10);
        
        // 龟壳花纹
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(8, 10, 4, 4);
        ctx.fillRect(16, 10, 4, 4);
        ctx.fillRect(12, 14, 4, 4);
        ctx.fillRect(20, 14, 4, 4);
        ctx.fillRect(8, 18, 4, 4);
        ctx.fillRect(16, 18, 4, 4);
        
        // 龟壳边缘
        ctx.fillStyle = '#006400';
        ctx.fillRect(24, 12, 4, 10);
        ctx.fillRect(20, 22, 8, 4);
        
        // 头部 (黄色)
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(8, 4, 8, 8);
        ctx.fillRect(6, 6, 4, 4);
        
        // 眼睛
        ctx.fillStyle = '#000000';
        ctx.fillRect(9, 6, 2, 2);
        ctx.fillRect(13, 6, 2, 2);
        
        // 鼻孔
        ctx.fillStyle = '#000000';
        ctx.fillRect(11, 9, 1, 1);
        ctx.fillRect(13, 9, 1, 1);
        
        // 腿部
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(4, 24, 6, 6);
        ctx.fillRect(22, 24, 6, 6);
        
        // 脚
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(2, 28, 4, 4);
        ctx.fillRect(26, 28, 4, 4);
        
        return canvas;
    }

    createPiranhaSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 48;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        // 食人花茎部 (绿色)
        ctx.fillStyle = '#228B22';
        ctx.fillRect(14, 24, 4, 24);
        
        // 茎部细节
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(15, 26, 2, 20);
        
        // 花朵主体 (红色)
        ctx.fillStyle = '#DC143C';
        ctx.fillRect(6, 8, 20, 20);
        ctx.fillRect(4, 12, 24, 12);
        ctx.fillRect(8, 4, 16, 8);
        
        // 花朵斑点
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(18, 16, 8, 8);
        ctx.fillRect(20, 20, 6, 4);
        
        // 嘴巴开口 (黑色)
        ctx.fillStyle = '#000000';
        ctx.fillRect(10, 14, 12, 8);
        
        // 尖牙 (白色)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(11, 13, 2, 3);
        ctx.fillRect(14, 13, 2, 3);
        ctx.fillRect(17, 13, 2, 3);
        ctx.fillRect(20, 13, 2, 3);
        
        ctx.fillRect(12, 22, 2, 3);
        ctx.fillRect(15, 22, 2, 3);
        ctx.fillRect(18, 22, 2, 3);
        
        return canvas;
    }

    // 生成环境精灵
    generateEnvironmentSprites() {
        this.spriteCache.set('brick_block', this.createBrickBlock());
        this.spriteCache.set('question_block', this.createQuestionBlock());
        // 其他环境元素暂时不实现
    }

    createBrickBlock() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        // 砖块底色
        ctx.fillStyle = '#CD853F';
        ctx.fillRect(0, 0, 32, 32);
        
        // 砖块纹理线条
        ctx.fillStyle = '#8B4513';
        // 水平线
        ctx.fillRect(0, 8, 32, 1);
        ctx.fillRect(0, 16, 32, 1);
        ctx.fillRect(0, 24, 32, 1);
        
        // 垂直线 (交错模式)
        ctx.fillRect(16, 0, 1, 8);
        ctx.fillRect(8, 8, 1, 8);
        ctx.fillRect(24, 8, 1, 8);
        ctx.fillRect(16, 16, 1, 8);
        ctx.fillRect(8, 24, 1, 8);
        ctx.fillRect(24, 24, 1, 8);
        
        // 高光
        ctx.fillStyle = '#F4A460';
        ctx.fillRect(1, 1, 30, 2);
        ctx.fillRect(1, 1, 2, 30);
        
        // 阴影
        ctx.fillStyle = '#654321';
        ctx.fillRect(30, 2, 2, 30);
        ctx.fillRect(2, 30, 30, 2);
        
        return canvas;
    }

    createQuestionBlock() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        // 问号块底色 (金色)
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(0, 0, 32, 32);
        
        // 问号块边框
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(0, 0, 32, 2);
        ctx.fillRect(0, 0, 2, 32);
        ctx.fillRect(30, 0, 2, 32);
        ctx.fillRect(0, 30, 32, 2);
        
        // 内部装饰边框
        ctx.fillStyle = '#FF8C00';
        ctx.fillRect(4, 4, 24, 2);
        ctx.fillRect(4, 4, 2, 24);
        ctx.fillRect(26, 4, 2, 24);
        ctx.fillRect(4, 26, 24, 2);
        
        // 问号 (黑色)
        ctx.fillStyle = '#000000';
        // 问号上部
        ctx.fillRect(12, 8, 8, 2);
        ctx.fillRect(18, 10, 2, 4);
        ctx.fillRect(14, 14, 4, 2);
        ctx.fillRect(14, 16, 2, 2);
        // 问号点
        ctx.fillRect(14, 20, 2, 2);
        
        // 高光效果
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(2, 2, 28, 4);
        ctx.fillRect(2, 2, 4, 28);
        
        return canvas;
    }

    // 创建道具精灵
    generateEffectSprites() {
        this.spriteCache.set('coin', this.createCoinSprite());
        this.spriteCache.set('mushroom', this.createMushroomSprite());
        this.spriteCache.set('star', this.createStarSprite());
        this.spriteCache.set('flower', this.createFlowerSprite());
        this.spriteCache.set('bullet', this.createBulletSprite());
    }

    createCoinSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 24;
        canvas.height = 24;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        // 金币外圈
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(6, 2, 12, 20);
        ctx.fillRect(4, 4, 16, 16);
        ctx.fillRect(2, 6, 20, 12);
        
        // 金币内圈 (更亮)
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(8, 4, 8, 16);
        ctx.fillRect(6, 6, 12, 12);
        
        // 中心图案
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(10, 8, 4, 8);
        ctx.fillRect(8, 10, 8, 4);
        
        // 高光
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(8, 6, 4, 2);
        ctx.fillRect(6, 8, 2, 4);
        
        return canvas;
    }

    createMushroomSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        // 蘑菇帽 (红色底)
        ctx.fillStyle = '#DC143C';
        ctx.fillRect(6, 8, 20, 16);
        ctx.fillRect(4, 12, 24, 8);
        ctx.fillRect(8, 4, 16, 8);
        
        // 蘑菇白点
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(10, 10, 4, 4);
        ctx.fillRect(18, 10, 4, 4);
        ctx.fillRect(14, 16, 4, 4);
        
        // 蘑菇茎 (米色)
        ctx.fillStyle = '#F5DEB3';
        ctx.fillRect(12, 20, 8, 12);
        ctx.fillRect(10, 24, 12, 6);
        
        // 茎部阴影
        ctx.fillStyle = '#DEB887';
        ctx.fillRect(18, 22, 2, 8);
        ctx.fillRect(16, 28, 4, 2);
        
        // 帽子高光
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(8, 8, 12, 4);
        ctx.fillRect(6, 12, 8, 2);
        
        return canvas;
    }

    createStarSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        // 星星主体 (金色)
        ctx.fillStyle = '#FFD700';
        
        // 绘制五角星
        const centerX = 16;
        const centerY = 16;
        const outerRadius = 12;
        const innerRadius = 5;
        
        // 简化的像素星星
        ctx.fillRect(14, 4, 4, 8); // 上尖
        ctx.fillRect(12, 12, 8, 4); // 中心横条
        ctx.fillRect(4, 14, 8, 4); // 左尖
        ctx.fillRect(20, 14, 8, 4); // 右尖
        ctx.fillRect(8, 20, 4, 8); // 左下尖
        ctx.fillRect(20, 20, 4, 8); // 右下尖
        
        // 星星高光
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(15, 6, 2, 4);
        ctx.fillRect(13, 13, 4, 2);
        
        // 星星边缘 (橙色)
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(18, 12, 2, 8);
        ctx.fillRect(16, 20, 8, 2);
        
        return canvas;
    }

    createFlowerSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        // 火焰花茎
        ctx.fillStyle = '#228B22';
        ctx.fillRect(14, 20, 4, 12);
        
        // 花朵中心
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(12, 12, 8, 8);
        
        // 花瓣 (红色)
        ctx.fillStyle = '#FF4444';
        ctx.fillRect(8, 14, 4, 4); // 左
        ctx.fillRect(20, 14, 4, 4); // 右
        ctx.fillRect(14, 8, 4, 4); // 上
        ctx.fillRect(14, 20, 4, 4); // 下
        
        // 花瓣装饰
        ctx.fillStyle = '#FF6666';
        ctx.fillRect(10, 15, 2, 2);
        ctx.fillRect(20, 15, 2, 2);
        ctx.fillRect(15, 10, 2, 2);
        ctx.fillRect(15, 20, 2, 2);
        
        return canvas;
    }

    // 渲染精灵的主要方法
    drawSprite(spriteKey, x, y, flipX = false, scale = 1) {
        const sprite = this.spriteCache.get(spriteKey);
        if (!sprite) return;
        
        this.ctx.save();
        
        // 缩放处理
        if (scale !== 1) {
            this.ctx.scale(scale, scale);
            x /= scale;
            y /= scale;
        }
        
        // 翻转处理
        if (flipX) {
            this.ctx.scale(-1, 1);
            x = -x - sprite.width;
        }
        
        // 关闭抗锯齿以保持像素完美
        this.ctx.imageSmoothingEnabled = false;
        
        this.ctx.drawImage(sprite, x, y);
        this.ctx.restore();
    }

    // 获取精灵尺寸
    getSpriteSize(spriteKey) {
        const sprite = this.spriteCache.get(spriteKey);
        if (!sprite) return { width: 0, height: 0 };
        return { width: sprite.width, height: sprite.height };
    }
}

// 高级粒子系统
class AdvancedParticle {
    constructor(x, y, vx, vy, config = {}) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        
        // 粒子属性
        this.life = config.life || 60;
        this.maxLife = this.life;
        this.color = config.color || '#FFD700';
        this.size = config.size || 4;
        this.gravity = config.gravity || 0.1;
        this.friction = config.friction || 0.98;
        this.type = config.type || 'circle';
        this.rotation = config.rotation || 0;
        this.rotationSpeed = config.rotationSpeed || 0;
        this.scale = config.scale || 1;
        this.scaleSpeed = config.scaleSpeed || 0;
        this.alpha = config.alpha || 1;
        this.alphaSpeed = config.alphaSpeed || -0.02;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        this.rotation += this.rotationSpeed;
        this.scale += this.scaleSpeed;
        this.alpha += this.alphaSpeed;
        
        this.life--;
        
        return this.life > 0 && this.alpha > 0;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        
        ctx.fillStyle = this.color;
        
        switch (this.type) {
            case 'circle':
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'square':
                ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
                break;
            case 'star':
                this.drawStar(ctx, this.size);
                break;
            case 'sparkle':
                this.drawSparkle(ctx, this.size);
                break;
        }
        
        ctx.restore();
    }
    
    drawStar(ctx, size) {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
            const x = Math.cos(angle) * size;
            const y = Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            
            const innerAngle = ((i + 0.5) * Math.PI * 2) / 5 - Math.PI / 2;
            const innerX = Math.cos(innerAngle) * size * 0.4;
            const innerY = Math.sin(innerAngle) * size * 0.4;
            ctx.lineTo(innerX, innerY);
        }
        ctx.closePath();
        ctx.fill();
    }
    
    drawSparkle(ctx, size) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(-size, 0);
        ctx.lineTo(size, 0);
        ctx.moveTo(0, -size);
        ctx.lineTo(0, size);
        ctx.stroke();
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SpriteRenderer, AdvancedParticle };
}