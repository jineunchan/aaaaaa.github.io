const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 캔버스 크기 설정
canvas.width = 800;
canvas.height = 600;

// 플레이어 설정
const player = {
    x: canvas.width / 2,
    y: canvas.height - 50, // 화면 하단에 위치 (3D 효과를 위해 단순화)
    width: 20,
    height: 20,
    color: 'blue',
    speed: 5,
    rotationSpeed: 0.05,
    angle: 0 // 현재 바라보는 각도 (라디안)
};

// 간단한 맵 (벽 표현)
const walls = [
    { x: 100, y: 100, width: 50, height: 200, color: 'gray' },
    { x: 300, y: 200, width: 150, height: 50, color: 'darkgray' },
    { x: 500, y: 100, width: 50, height: 300, color: 'dimgray' }
];

// 키 입력 상태
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

document.addEventListener('keydown', (event) => {
    if (event.key in keys) {
        keys[event.key] = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key in keys) {
        keys[event.key] = false;
    }
});

function updatePlayerPosition() {
    // 시점 회전
    if (keys.ArrowLeft) {
        player.angle -= player.rotationSpeed;
    }
    if (keys.ArrowRight) {
        player.angle += player.rotationSpeed;
    }

    // 앞/뒤 이동 (실제 3D 이동은 복잡하므로 여기서는 단순화)
    // 이 예제에서는 플레이어가 화면 하단에 고정되어 있고, 주변 환경이 움직이는 것처럼 보임
    // 진정한 FPS 이동은 레이캐스팅이나 3D 벡터 연산이 필요합니다.
    if (keys.ArrowUp) {
        // 이 부분은 시야에 따라 월드를 움직이는 로직으로 대체되어야 합니다.
        // 여기서는 플레이어 y 좌표를 변경하는 대신, 월드 객체들을 반대로 움직이는 효과를 줘야 합니다.
        // 간단한 예시로, 월드 객체들이 플레이어 방향으로 다가오는 것처럼 보이게 할 수 있습니다.
        walls.forEach(wall => {
            wall.y += player.speed * Math.sin(player.angle + Math.PI / 2); // 가상의 Z축 이동
            wall.x -= player.speed * Math.cos(player.angle + Math.PI / 2); // 가상의 X축 이동 (시점에 따라)
        });
    }
    if (keys.ArrowDown) {
        walls.forEach(wall => {
            wall.y -= player.speed * Math.sin(player.angle + Math.PI / 2);
            wall.x += player.speed * Math.cos(player.angle + Math.PI / 2);
        });
    }
}

function drawPlayer() {
    // FPS에서는 플레이어 자신은 보통 보이지 않거나, 손/무기만 보입니다.
    // 여기서는 디버깅 목적으로 간단히 표시하거나 생략할 수 있습니다.
    // ctx.fillStyle = player.color;
    // ctx.fillRect(player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);

    // 크로스헤어 (십자선)
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 10, canvas.height / 2);
    ctx.lineTo(canvas.width / 2 + 10, canvas.height / 2);
    ctx.moveTo(canvas.width / 2, canvas.height / 2 - 10);
    ctx.lineTo(canvas.width / 2, canvas.height / 2 + 10);
    ctx.stroke();
}

function drawWalls() {
    // "가짜" 3D 렌더링: 원근감을 주기 위해 벽을 화면 중앙을 기준으로 투영합니다.
    // 이는 매우 단순화된 레이캐스팅 또는 유사 3D 기법입니다.
    // 실제로는 각 벽의 정점을 플레이어 시점에 맞게 변환하고 투영해야 합니다.

    walls.forEach(wall => {
        // 화면 중앙을 (0,0)으로 간주하고, 벽의 상대적 위치 계산
        const screenCenterX = canvas.width / 2;
        const screenCenterY = canvas.height / 2; // 이 Y는 시야의 중심

        // 플레이어의 각도를 고려하여 벽의 위치를 변환 (회전)
        // (이 부분이 실제 3D 변환의 핵심이며, 여기서는 매우 간략화)
        const dx = wall.x - screenCenterX; // 임시: 월드 x좌표를 화면 x좌표로 간주
        const dy = wall.y - screenCenterY; // 임시: 월드 y좌표를 화면 깊이(z)로 간주

        // 플레이어 시야각 (FOV - Field of View)
        const fov = Math.PI / 3; // 60도

        // 간단한 원근 투영 (실제로는 더 복잡한 수학 필요)
        // 여기서는 벽의 y 위치를 깊이로 사용하고, 크기를 조절하여 원근감을 표현합니다.
        // z 값 (깊이)이 클수록 작게, 가까울수록 크게 보입니다.
        // 이 예제에서는 벽의 y 좌표를 일종의 "깊이"로 사용하고, 화면 중앙에서 멀어질수록 작게 그립니다.

        // 플레이어 시야를 기준으로 벽의 상대 각도 계산
        let angleToWall = Math.atan2(wall.y - player.y, wall.x - player.x) - player.angle;

        // 각도를 -PI ~ PI 범위로 정규화
        while (angleToWall > Math.PI) angleToWall -= 2 * Math.PI;
        while (angleToWall < -Math.PI) angleToWall += 2 * Math.PI;

        // 시야각 내에 있는지 확인 (매우 단순한 방식)
        if (Math.abs(angleToWall) < fov / 2) {
            // 벽까지의 거리 (2D 거리로 단순화)
            const distToWall = Math.sqrt(Math.pow(wall.x - player.x, 2) + Math.pow(wall.y - player.y, 2));

            // 화면에 투영될 벽의 높이 (거리에 반비례)
            // 이 projectionPlaneDist는 화면과 플레이어 눈 사이의 거리로, 원근감의 강도를 조절합니다.
            const projectionPlaneDist = (canvas.width / 2) / Math.tan(fov / 2);
            let projectedWallHeight = (wall.height / distToWall) * projectionPlaneDist; // 벽의 실제 높이를 사용

            // 화면에 투영될 벽의 너비도 유사하게 계산할 수 있지만, 여기서는 고정 너비 또는 각도 기반 너비 사용
            // 시야각 내에서의 상대적 위치에 따라 화면 x 좌표 결정
            const wallScreenX = screenCenterX + angleToWall * (canvas.width / (fov));


            // 벽 그리기
            const wallTop = screenCenterY - projectedWallHeight / 2;
            const wallBottom = screenCenterY + projectedWallHeight / 2;

            // 간단한 명암 효과 (거리에 따라)
            const brightness = Math.max(0.2, 1 - distToWall / 800); // 거리가 멀수록 어둡게
            const wallDrawColor = lumineux(wall.color, brightness);


            ctx.fillStyle = wallDrawColor;
            // 여기서는 벽을 세로선으로 단순화해서 그립니다. (레이캐스팅 방식과 유사)
            // 실제로는 사각형 벽의 각 꼭짓점을 투영해야 합니다.
            const wallStripWidth = 20; // 벽 조각의 너비 (시야각에 따라 조절 가능)
            ctx.fillRect(wallScreenX - wallStripWidth / 2, wallTop, wallStripWidth, projectedWallHeight);

            // 바닥과 천장 (단순화)
            ctx.fillStyle = "#555555"; // 바닥색
            ctx.fillRect(wallScreenX - wallStripWidth / 2, wallBottom, wallStripWidth, canvas.height - wallBottom);
            ctx.fillStyle = "#AAAAAA"; // 천장색
            ctx.fillRect(wallScreenX - wallStripWidth / 2, 0, wallStripWidth, wallTop);
        }
    });
}

// 색상 밝기 조절 함수
function lumineux(hex, percent) {
    hex = hex.replace(/^\s*#|\s*$/g, '');
    if(hex.length == 3){
        hex = hex.replace(/(.)/g, '$1$1');
    }
    var r = parseInt(hex.substr(0, 2), 16),
        g = parseInt(hex.substr(2, 2), 16),
        b = parseInt(hex.substr(4, 2), 16);

    return '#' +
       ((0|(1<<8) + r + (256 - r) * percent / 100).toString(16)).substr(1) +
       ((0|(1<<8) + g + (256 - g) * percent / 100).toString(16)).substr(1) +
       ((0|(1<<8) + b + (256 - b) * percent / 100).toString(16)).substr(1);
}


function gameLoop() {
    // 화면 지우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updatePlayerPosition();

    // 배경 그리기 (하늘, 땅) - drawWalls에서 일부 처리
    // ctx.fillStyle = '#77b5fe'; // 하늘
    // ctx.fillRect(0, 0, canvas.width, canvas.height / 2);
    // ctx.fillStyle = '#3c280c'; // 땅
    // ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);


    drawWalls(); // 벽을 먼저 그려서 플레이어가 가려지도록
    drawPlayer(); // 플레이어 (또는 크로스헤어) 그리기

    requestAnimationFrame(gameLoop); // 다음 프레임 요청
}

// 게임 시작
gameLoop();
