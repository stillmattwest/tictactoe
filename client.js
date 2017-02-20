$('document').ready(function () {

    // ******************
    // GAMESTATE
    // ******************

    var BaseGrid = {
        y1x1: { value: 2, occupied: false },
        y1x2: { value: 1, occupied: false },
        y1x3: { value: 2, occupied: false },
        y2x1: { value: 1, occupied: false },
        y2x2: { value: 2, occupied: false },
        y2x3: { value: 1, occupied: false },
        y3x1: { value: 2, occupied: false },
        y3x2: { value: 1, occupied: false },
        y3x3: { value: 2, occupied: false }
    };

    var gameState = {
        grid: $.extend(true, {}, BaseGrid),
        playersTurn: false,
        playerIcon: 'X',
        computerIcon: 'O',
        gameOver: false,
        winningArr: []
    }

    //************
    // CLICK FUNCTIONS
    // ***********

    // allow a player to choose an icon
    $('.choose').click(function () {
        // turn icon blue
        $(this).css('color', 'lightblue');
        var playerIcon = $(this).attr('data');
        var computerIcon = $(this).siblings('.choose').attr('data');
        // a half-second later turn other icon red
        $(this).siblings('.choose').css('color', 'lightgreen');
        // assing correct icon to player, and other to computer
        gameState.playerIcon = playerIcon;
        gameState.computerIcon = computerIcon;
        // wait a second and then clear the message area 
        setTimeout(function () {
            $('#message-area').html('');
            firstMove();
        }, 500);
    });

    // allow player to place an icon on the grid
    $('.gridrow li').click(function () {
        if (gameState.playersTurn === true && gameState.gameOver === false) {
            var square = this.id;
            var piece = gameState.playerIcon;
            if (!checkOccupied(square)) {
                placePiece(square, piece, 'player');
                gameState.playersTurn = false;
                var talkOrNot = getRandom(1, 10);
                if (talkOrNot > 5) {
                    getMessage('noBestMove');
                }
                computerTurn();
                
            }
        }
    });


    //*************
    // DOM FUNCTIONS
    //*************

    // place an icon on the grid
    function placePiece(square, icon, player) {
        $('#' + square).children('.square').html('<p class="' + player + '">' + icon + '</p>');
        // add square to occupied array, along with who occupied it
        gameState.grid[square].occupied = player;
        // check for win
        if (checkWin(player, gameState.grid)) {
            getMessage(player + 'Wins');
            changeRed(gameState.winningArr);
            gameState.gameOver = true;
            reset();
        }
        valueDiags();
    };

    //turn winning pieces red
    function changeRed(arr) {
        arr.forEach(function (square) {
            $('#' + square).children('.square').addClass('win');
        });
    }

    function clearBoard() {
        var square;
        for (var key in gameState.grid) {
            square = key;
            $('#' + square).children('.square').html('');
        }
    }

    function reset() {
        // wait three seconds and reset
        setTimeout(function () {
            for (var key in gameState.grid) {
                $('#' + key).children('.square').removeClass('win');
            }
            gameState.grid = $.extend(true, {}, BaseGrid);
            gameState.playersTurn = false;
            gameState.gameOver = false;
            gameState.winningArr = [];
            clearBoard();
            firstMove();
        }, 3000);
    };

    //***************
    // GAME AI 
    //***************

    function firstMove() {
        var num = getRandom(1, 2);
        if (num === 2) {
            getMessage('goingFirst');
            setTimeout(function () {
                computerTurn();
            }, 1000);
        } else {
            getMessage('goingLast');
            gameState.playersTurn = true;
        }
    }


    function computerTurn() {
        //check for a tie
            possibleMoves = sortGrid(gameState.grid);
            if (possibleMoves.length === 0) {
                getMessage('tieGame');
                gameState.gameOver = true;
                reset();
                return;
            }
        // don't do anything if game is over
        if (gameState.gameOver === true) { return; };
        //wait a second before making a move
        setTimeout(function () {
            var finished = false;
            // Computer gets possible squares sorted by value
            var possibleMoves = sortGrid(gameState.grid);
            // check for a tie
            if (possibleMoves.length === 0) {
                getMessage('tieGame');
                gameState.gameOver = true;
                reset();
                return;
            }
            // Computer checks to see if it can win. If so, it does.
            for (var i = 0; i < possibleMoves.length; i++) {
                if (detectWinningMove(possibleMoves[i][0], 'computer')) {
                    placePiece(possibleMoves[i][0], gameState.computerIcon, 'computer');
                    finsihed = true;
                    return;
                }
            }
            if (finished) { return; }
            // If computer can't win, it checks to see if opponent has possible win. If so, it blocks the move
            for (var i = 0; i < possibleMoves.length; i++) {
                if (detectWinningMove(possibleMoves[i][0], 'player')) {
                    placePiece(possibleMoves[i][0], gameState.computerIcon, 'computer');
                    finsihed = true;
                    gameState.playersTurn = true;
                    return;
                }

            }
            if (finished) { return; }
            // If not, it selects randomly from the highest value moves
            var bestMoves = getBestMoves(possibleMoves);
            var max = bestMoves.length;
            var num = getRandom(1, max) - 1;
            placePiece(bestMoves[num][0], gameState.computerIcon, 'computer');
            //check for a tie
            possibleMoves = sortGrid(gameState.grid);
            if (possibleMoves.length === 0) {
                getMessage('tieGame');
                gameState.gameOver = true;
                reset();
                return;
            }
            gameState.playersTurn = true;
        }, 500);
    }

    // sort gameState.gridValue based on values, eliminates occupied squares from result
    function sortGrid(grid) {
        var sortable = [];
        // change grid into array, ignore occupied squares
        for (var key in grid) {
            if (!grid[key].occupied) {
                sortable.push([key, grid[key].value]);
            }
        }
        // sort array by value
        sortable.sort(function (a, b) {
            return (b[1] - a[1]);
        });
        // return array
        return sortable;

    }

    function valueDiags() {
        // game strategy is based a lot on the number of occupied corners. If there is one, and center is empty, take center. However, if three corners are already occupied, or two and the center, stay away from them.
        var occupiedDiags = 0;
        var square;
        var row;
        var col;
        for (var key in gameState.grid) {
            square = key;
            row = square[1];
            col = square[3];
            if (gameState.grid[key].occupied) {
                if ((row == 1 && col == 3) || (row == 3 && col == 1) || (row == col)) {
                    occupiedDiags++;
                }
            }
        }
        if (occupiedDiags > 0 && checkOccupied('y2x2') === false) {
            gameState.grid.y2x2.value++;

        } else if ((occupiedDiags > 1 && checkOccupied('y2x2')) || occupiedDiags > 3) {
            gameState.grid.y1x1.value = 1;
            gameState.grid.y3x1.value = 1;
            gameState.grid.y1x3.value = 1;
            gameState.grid.y3x3.value = 1;
            gameState.grid.y2x2.value = 1;
        }

    }

    // check if square is occupied
    function checkOccupied(square) {
        if (gameState.grid[square].occupied !== false) {
            return true;
        } else {
            return false;
        }
    }

    // checks a move to see if it results in a win
    function detectWinningMove(square, player) {
        var grid = $.extend(true, {}, gameState.grid);
        grid[square].occupied = player;
        if (checkWin(player, grid)) {
            return true;
        } else {
            return false;
        }
    }

    function getRandom(min, max) {
        return Math.floor(Math.random() * max) + min;
    }

    function getBestMoves(moves) {
        var result = [];
        var score = moves[0][1];
        moves.forEach(function (element) {
            if (element[1] === score) {
                result.push(element);
            }
        });
        return result;
    }


    // check for a win state
    function checkWin(player, grid) {
        // check  y1x1 diagonal
        if (grid.y1x1.occupied === player && grid.y2x2.occupied === player && grid.y3x3.occupied === player) {
            gameState.winningArr = ['y1x1', 'y2x2', 'y3x3'];
            return true;
        }
        // check y1x3 diagonal
        if (grid.y1x3.occupied === player && grid.y2x2.occupied === player && grid.y3x1.occupied === player) {
            gameState.winningArr = ['y1x3', 'y2x2', 'y3x1'];
            return true;
        }
        // check verticals
        if (grid.y1x1.occupied === player && grid.y2x1.occupied === player && grid.y3x1.occupied === player) {
            gameState.winningArr = ['y1x1', 'y2x1', 'y3x1'];
            return true;
        }
        if (grid.y1x2.occupied === player && grid.y2x2.occupied === player && grid.y3x2.occupied === player) {
            gameState.winningArr = ['y1x2', 'y2x2', 'y3x2'];
            return true;
        }
        if (grid.y1x3.occupied === player && grid.y2x3.occupied === player && grid.y3x3.occupied === player) {
            gameState.winningArr = ['y1x3', 'y2x3', 'y3x3'];
            return true;
        }
        // check horizontals
        if (grid.y1x1.occupied === player && grid.y1x2.occupied === player && grid.y1x3.occupied === player) {
            gameState.winningArr = ['y1x1', 'y1x2', 'y1x3'];
            return true;
        }
        if (grid.y2x1.occupied === player && grid.y2x2.occupied === player && grid.y2x3.occupied === player) {
            gameState.winningArr = ['y2x1', 'y2x2', 'y2x3'];
            return true;
        }
        if (grid.y3x1.occupied === player && grid.y3x2.occupied === player && grid.y3x3.occupied === player) {
            gameState.winningArr = ['y3x1', 'y3x2', 'y3x3'];
            return true;
        }
        return false;
    }

    //*************
    // MESSAGE FUNCTIONS
    //*************
    function getMessage(condition) {
        var max = messages[condition].length -1;
        var num = getRandom(1, max) - 1;
        var msg = messages[condition][num];
        $('#message-area').html('<h2>' + msg + '</h2>');
    }

    var messages = {
        goingFirst: ["I will go first", "I'll go first this time", "Watch and Learn"],
        goingLast: ["I'll let you go first this time", "You can go first, but it won't save you", "I'm thinking about something else, you go first", "You go first. Try not to think too long"],
        noBestMove: ["I see you've played this game before", "Not bad... for a second grader", "I hope you're paying attention...", "Can you see what I'm planning?","I would have made that move... in version 0.7"],
        playerWins: ["I am humbled by your genius", "Not bad... for a human", "Vengeance will be mine", "Inconceivable","You better not have hacked the source code"],
        computerWins: ["I win...again", "It was so cute when you challenged me to a game", "A predictable outcome", "What did you expect? Your brain is analog", "You're not playing down to my level, are you?"],
        tieGame: ["A tie? In Tic Tac Toe? That hardly EVER happens", "I may not have beaten you yet... but give it time", "About the best outcome you could have hoped for", "Did you know Tic Tac Toe was invented in the dungeons of ancient China? Players would scratch their games on the wall, using severed toes for pens. That's where it gets the name.", "In the Persian Empire, entire wars were settled with a game of Tic Tac Toe. The ties contributed to the stability of the region","Don't look at it as a tie. Look at it as a prelude to losing"]
    };


}); // end document.ready