class SnakeGame {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        setInterval(this.loop.bind(this), 100);
        document.addEventListener('keydown', this.onPressKey.bind(this));
        this.scoreboard = document.getElementById("scoreboard"); 
    }

    init() {
        this.snake = [];
        this.cellSize = 20;
        this.food = {
            x: Math.floor(Math.random() * this.canvas.width / this.cellSize) * this.cellSize,
            y: Math.floor(Math.random() * this.canvas.height / this.cellSize) * this.cellSize
        };
        this.snake.push({
            x: Math.floor(Math.random() * this.canvas.width / this.cellSize) * this.cellSize,
            y: Math.floor(Math.random() * this.canvas.height / this.cellSize) * this.cellSize
        });
        this.score = 0;
        this.velocity = {
            x: 0,
            y: 0
        };
        this.updateScoreboard();
    }

    loop() {
        this.update();
        this.draw();
    }

    onPressKey(e) {
        switch(e.key) {
            case 'w':
            case 'ArrowUp':
                this.velocity.x = 0;
                this.velocity.y = -1;
                break;
            case 's': 
            case 'ArrowDown':
                this.velocity.x = 0;
                this.velocity.y = 1;
                break;
            case 'a':
            case 'ArrowLeft':
                this.velocity.x = -1;
                this.velocity.y = 0;
                break;
            case 'd':
            case 'ArrowRight':
                this.velocity.x = 1;
                this.velocity.y = 0;
                break;
            default:
                break;
        }
    }


    update() {
        for (let i = this.snake.length-1; i > 0; i--) {
            this.snake[i].x = this.snake[i-1].x;
            this.snake[i].y = this.snake[i-1].y;
        }
        this.snake[0].x += this.velocity.x * this.cellSize;
        this.snake[0].y += this.velocity.y * this.cellSize;
        this.checkCollision();
    }

    updateScoreboard() {
        this.leaderboard = localStorage.getItem("leaderboard");
        this.leaderboardJSON = JSON.parse(this.leaderboard);
        this.scoreboard.innerHTML = "";
        this.leaderboardJSON.sort((a,b) => b.score - a.score);
        const size = (this.leaderboardJSON.length >= 5) ? 5 : this.leaderboardJSON.length;
        for (let i = 0; i < size; i++) {
            let div = document.createElement("div");
            div.setAttribute("class", "score");
            let p = document.createElement("p");
            p.innerHTML = this.leaderboardJSON[i].name + " : " + this.leaderboardJSON[i].score;
            div.appendChild(p);
            scoreboard.appendChild(div);
        }
    }

    reset() {
        let name = prompt("Enter your name: ");
        let leaderboard = localStorage.getItem("leaderboard");
        let leaderboardJSON;
        if (leaderboard === null) {
            leaderboardJSON = [];
        } else {
            leaderboardJSON = JSON.parse(leaderboard);
        }
        leaderboardJSON.push({name: name, score: this.score});
        localStorage.setItem("leaderboard", JSON.stringify(leaderboardJSON));
        this.updateScoreboard();
        this.init();
    }

    draw() {
        // drawing background
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height);
        // drawing food
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(this.food.x, this.food.y , this.cellSize - 5, this.cellSize - 5);
        //drawing snake
        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < this.snake.length; i++) {
            this.ctx.fillRect(this.snake[i].x, this.snake[i].y , this.cellSize - 3 , this.cellSize - 3);
        }
        //drawing score text
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '20px sarif';
        this.ctx.fillText(`Score: ${this.score}`, 5,20); 
        
    }

    createRandomFood() {
        this.food = {
            x: Math.floor(Math.random() * this.canvas.width / this.cellSize) * this.cellSize,
            y: Math.floor(Math.random() * this.canvas.height / this.cellSize) * this.cellSize
        };
        let isValidPosition = false;
        while (!isValidPosition) {
            isValidPosition = true;
            for (let i = 0; i < this.snake.length; i++) {
                if (this.snake[i].x === this.food.x && this.snake[i].y === this.food.y) {
                    this.food = {
                        x: Math.floor(Math.random() * this.canvas.width / this.cellSize) * this.cellSize,
                        y: Math.floor(Math.random() * this.canvas.height / this.cellSize) * this.cellSize
                    };
                    isValidPosition = false;
                    break;
                }
            }
        }
    }

    checkCollision() {
        // food collision
        if (this.snake[0].x === this.food.x && this.snake[0].y === this.food.y) {
            this.createRandomFood();
            const tail = this.snake[this.snake.length - 1];
            let newTail;
            if (this.velocity.x === 1) {
                newTail = { x: tail.x - this.cellSize, y: tail.y };
            } else if (this.velocity.x === -1) {
                newTail = { x: tail.x + this.cellSize, y: tail.y };
            } else if (this.velocity.y === 1) {
                newTail = { x: tail.x, y: tail.y - this.cellSize };
            } else if (this.velocity.y === -1) {
                newTail = { x: tail.x, y: tail.y + this.cellSize };
            }
            let isValidPosition = false;
            while (!isValidPosition) {
                isValidPosition = true;
                for (let i = 0; i < this.snake.length; i++) {
                    if (this.snake[i].x === newTail.x && this.snake[i].y === newTail.y) {
                        newTail.x += Math.random() > 0.5 ? this.cellSize : -this.cellSize;
                        newTail.y += Math.random() > 0.5 ? this.cellSize : -this.cellSize;
                        isValidPosition = false;
                        break;
                    }
                }
            }
            this.snake.push(newTail);
            this.score += 5;
        }
        // self collision
        for (let i = 0; i < this.snake.length; i++) {
            for (let j = 0; j < this.snake.length; j++) {
                if (this.snake[i].x === this.snake[j].x && this.snake[i].y === this.snake[j].y && i != j) {
                    this.reset();
                }
            }
        }
        // wall collision
        if (this.snake[0].x < 0) {
            this.snake[0].x = this.canvas.width - this.cellSize;
        } else if (this.snake[0].x >= this.canvas.width) { 
            this.snake[0].x = 0;
        } else if (this.snake[0].y < 0) {
            this.snake[0].y = this.canvas.height - this.cellSize;
        } else if (this.snake[0].y >= this.canvas.height) { 
            this.snake[0].y = 0;
        }
    }
}