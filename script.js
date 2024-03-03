const gameboard = (function () {
    let board = Array(9).fill('');
    const getBoard = () => board;
    const isFull = () => {
        return !board.includes('')
    }
    const reset = () => board.fill('');
    const update = (index,symbol) => board[index-1] = symbol;
    const getArrays = function () {
        let arrays = [];
        for (let i = 0; i < 3; i++) {
        //first for will get the rows of the matrix
            arrays.push(board.slice(i*3,i*3+3));
            let col = [];
            //second for will get the columns
            for (a = i; a < board.length; a+=3){
                col.push(board[a]);
            }
            arrays.push(col);
        }
        //and last the diagonals
        arrays.push([board[0],board[4],board[8]],[board[2],board[4],board[6]])
        return arrays
    }
    return {getBoard,reset,update,getArrays,isFull}
})();


const game = (function () {
    let players = [];
    let nowTurn;
    let winner;
    const createPlayer = (name,symbol) => {
        this.name = name;
        this.symbol = symbol;
        this.points = 0;
        return players.push({name,symbol,points})
    }
    const getPlayers = () => players;
    const switchPlayerTurn = () => nowTurn = (nowTurn === players[0]) ? players[1] : players[0];
    const getPlayerTurn = () => nowTurn;
    function getWinner () {
        gameboard.getArrays().forEach(array => {
            if (array.every((item)=>item=='⨯')) {
                winner = (players[0].symbol == '⨯') ? players[0] : players[1];
            } else if (array.every((item)=>item=='⭘')) {
                winner = (players[0].symbol == '⭘') ? players[0] : players[1];
            }
        });
        return winner
    };
    const message = () => {
        let msg;
        if (winner === undefined){
            msg = (gameboard.isFull() === true) 
            ? `It's a tie!` 
            : `${switchPlayerTurn().name} it's your turn`;
        } else {
            msg = `${winner.name} you won!`;
        }
        return msg
    }
    const play = (index,symbol) => {
        gameboard.update(index,symbol);
        if (getWinner() != undefined) {
            gameboard.reset();
            score.add(players[players.findIndex((a) => a===winner)]);
            controller.scoreUpdate();
            setTimeout(() => {
                winner = undefined;
                controller.board.restart();
            }, 1500);
        } else if (gameboard.isFull()) {
            controller.scoreUpdate();
            setTimeout(() => {
                winner = undefined;
                gameboard.reset();
                controller.board.restart();
            }, 1500);
        }
    }

    const score = ( function () {
        const add = (player) => player.points += 1;
        const get = () => [players[0].points, players[1].points];
        return {add,get}
    })();

    return {play,message,getPlayerTurn,getWinner,createPlayer,score}
})();

const controller = (function () {
    let player1,player2;
    const board = (function () {
        const board = document.querySelector('.board');
        const draw = () => {
            for (let i=1; i <= gameboard.getBoard().length; i++) {
                const cell = document.createElement('button');
                cell.setAttribute('id',i);
                cell.addEventListener('click', (event) => {
                    if (game.getWinner() === undefined) {
                        cell.classList.add(game.getPlayerTurn().symbol);
                        cell.textContent = game.getPlayerTurn().symbol;
                        game.play(event.target.id,game.getPlayerTurn().symbol);
                        message.write();
                        cell.disabled = true;
                    }
                });
                board.appendChild(cell);
            }
        }
        const restart = () => {
            const cells = document.querySelectorAll('.board button');
            cells.forEach(cell => {
                cell.disabled = false;
                cell.textContent = '';
                cell.removeAttribute('class');
            });
            message.write();
        }
        return {draw,restart}
    })();
    const setUp = () => {
        const startBtn = document.getElementById('start');
        const btns = document.querySelectorAll('input + button');
        const [btn1,btn2] = btns;
        btns.forEach((btn) => {
            btn.addEventListener('click', () => {
                if (btn1.textContent === '⨯') {
                    btn1.textContent = '⭘';
                 } else {
                    btn1.textContent = '⨯';
                 }
                if (btn2.textContent === '⨯') {
                    btn2.textContent = '⭘';
                } else { 
                    btn2.textContent = '⨯';
                }
                btn1.classList.toggle('⭘');
                btn1.classList.toggle('⨯');
                btn2.classList.toggle('⭘');
                btn2.classList.toggle('⨯');
            });
        });
        startBtn.addEventListener('click', () => {
            const input1 = document.getElementById('player1');
            const input2 = document.getElementById('player2');
            if (input1.value!=='' || input2.value!=='') {
                input.get();
                btns.forEach((btn) => btn.disabled = true);
                input1.disabled = true;
                input2.disabled = true;
                game.createPlayer(player1.name,player1.symbol);
                game.createPlayer(player2.name,player2.symbol);
                board.draw();
                message.write();
                scoreUpdate();
                startBtn.textContent = 'RESET';
                startBtn.addEventListener('click',() => location.reload());
            }
        });
    }
    const scoreUpdate = () => {
        const score = document.querySelectorAll('button + span');
        for (let i=0; i<2; i++) {
            score[i].textContent = game.score.get()[i];
        }
    }
    const input = (function () {
        const inputs = document.querySelectorAll('input');
        const symbols = document.querySelectorAll('.symbol');
        const get = () => {
            player1 = {name:inputs[0].value,symbol:symbols[0].textContent};
            player2 = {name:inputs[1].value,symbol:symbols[1].textContent};
            return {player1,player2}
        };
        const reset = () => {
            inputs.forEach((input) => input.value = '');
        }
        return {get,reset}
    })();
    const message = (function () {
        const msg = document.querySelector('.message');
        const write = () => msg.textContent = game.message();
        const reset = () => msg.textContent = 'Enter your name and press start!';
        return {write,reset}
    })();
    return {setUp,board,scoreUpdate}
})();

controller.setUp();



