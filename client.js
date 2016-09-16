$('document').ready(function () {

    // set base values for grid squares
    var BaseGrid = {
        y1x1: { value: 2, occupied: false },
        y1x2: { value: 1, occupied: false },
        y1x3: { value: 2, occupied: false },
        y2x1: { value: 1, occupied: false },
        y2x2: { value: 3, occupied: false },
        y2x3: { value: 1, occupied: false },
        y3x1: { value: 2, occupied: false },
        y3x2: { value: 1, occupied: false },
        y3x3: { value: 2, occupied: false }
    };

    // ******************
    // GAMESTATE
    // ******************

    var gameState = {
        grid: $.extend(true, {}, BaseGrid),
        playersTurn: true,
        playerIcon: 'X',
        computerIcon: 'O',
        gameOver: false
    }

    //************
    // CLICK FUNCTIONS
    // ***********

    // allow player to place an icon on the grid
    $('.gridrow li').click(function () {
        if (gameState.playersTurn === true && gameState.gameOver === false) {
            var square = this.id;
            var piece = gameState.playerIcon;
            if (!checkOccupied(square)) {
                placePiece(square, piece, 'player');
                gameState.playersTurn = false;
                computerTurn();
            }
        }
    });


    //*************
    // DOM FUNCTIONS
    //*************

    // place an icon on the grid
    function placePiece(square, icon, player) {
        $('#' + square).children('.square').html('<p>' + icon + '</p>');
        // add square to occupied array, along with who occupied it
        gameState.grid[square].occupied = player;
        // check for tie

        // check for win
        if (checkWin(player, gameState.grid)) {
            console.log(player + ' wins!');
            gameState.gameOver = true;
        }
        gridEval(square, player);
    };

    //***************
    // GAME AI MOVE DECISIONS
    //***************

    function computerTurn() {
        // don't do anything if game is over
        if (gameState.gameOver === true) { return; };
        //wait two seconds before making a move
        setTimeout(function () {
            var finished = false;
            // Computer gets possible squares sorted by value
            var possibleMoves = sortGrid(gameState.grid);
            // check for a tie
            if (possibleMoves.length < 1) {
                console.log("Darn, another tie");
                gameState.gameOver = true;
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
            // If not, it takes highest value move
            placePiece(possibleMoves[0][0], gameState.computerIcon, 'computer');
            gameState.playersTurn = true;
        }, 1000);
    }




    //***************
    // GAME EVALUATION FUNCTIONS
    //***************

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

    // gridEval assigns value to squares based on board state

    function gridEval(square, player) {
        console.log('re-evaluating');
        var row = square[1];
        var col = square[3];
        // loop through grid and check for match of row or column on key. If match, increment value
        for (var key in gameState.grid) {
            if (key[1] === row || key[3] === col) {
                if (!checkOccupied(square)) {
                    gameState.grid[key].value++;
                }
            }
        }
        // if square is a corner or center, increment diagonal win squares
        if ((row == 1 && col == 3) || (row == 3 && col == 1) || (row == col)) {
            valueDiags();
        }
    }

    function valueDiags() {
        // check for 3 occupied corners + center, and devalue corners if true
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

        if (occupiedDiags < 4) {
            console.log('corners are valuable');
            gameState.grid.y1x1.value++;
            gameState.grid.y3x1.value++;
            gameState.grid.y1x3.value++;
            gameState.grid.y3x3.value++;
            gameState.grid.y2x2.value++;
        } else {
            console.log('I hate corners');
            gameState.grid.y1x1.value = 0;
            gameState.grid.y3x1.value = 0;
            gameState.grid.y1x3.value = 0;
            gameState.grid.y3x3.value = 0;
            gameState.grid.y2x2.value = 0;
        }

    }

    // check if square is occupied
    function checkOccupied(square) {
        if (gameState.grid[square].occupied !== false) {
            return true;
        } else {
            return;
        }
    }

    // checks a move to see if it results in a win
    function detectWinningMove(square, player) {
        // if sqaure is occupied, disregard
        if (checkOccupied(square)) {
            return;
        }
        // jQuery deep copy
        var grid = $.extend(true, {}, gameState.grid);
        grid[square].occupied = player;
        if (checkWin(player, grid)) {
            console.log(player + ' can win at ' + square);
            return true;
        } else {
            return false;
        }
    }


    // check for a win state
    function checkWin(player, grid) {
        // check  y1x1 diagonal
        if (grid.y1x1.occupied === player && grid.y2x2.occupied === player && grid.y3x3.occupied === player) {
            return true;
        }
        // check y1x3 diagonal
        if (grid.y1x3.occupied === player && grid.y2x2.occupied === player && grid.y3x1.occupied === player) {
            return true;
        }
        // check verticals
        if (grid.y1x1.occupied === player && grid.y2x1.occupied === player && grid.y3x1.occupied === player) {
            return true;
        }
        if (grid.y1x2.occupied === player && grid.y2x2.occupied === player && grid.y3x2.occupied === player) {
            return true;
        }
        if (grid.y1x3.occupied === player && grid.y2x3.occupied === player && grid.y3x3.occupied === player) {
            return true;
        }
        // check horizontals
        if (grid.y1x1.occupied === player && grid.y1x2.occupied === player && grid.y1x3.occupied === player) {
            return true;
        }
        if (grid.y2x1.occupied === player && grid.y2x2.occupied === player && grid.y2x3.occupied === player) {
            return true;
        }
        if (grid.y3x1.occupied === player && grid.y3x2.occupied === player && grid.y3x3.occupied === player) {
            return true;
        }
        return false;
    }


}); // end document.ready