$('document').ready(function () {

    // set base values for grid squares
    var BaseGrid = {
        y1x1: { value: 3, occupied: false },
        y1x2: { value: 1, occupied: false },
        y1x3: { value: 3, occupied: false },
        y2x1: { value: 1, occupied: false },
        y2x2: { value: 4, occupied: false },
        y2x3: { value: 1, occupied: false },
        y3x1: { value: 3, occupied: false },
        y3x2: { value: 1, occupied: false },
        y3x3: { value: 3, occupied: false }
    };

    // ******************
    // GAMESTATE
    // ******************

    var gameState = {
        grid: BaseGrid,
        playersTurn: true,
        playerIcon: 'X',
        computerIcon: 'O'
    }

    //************
    // CLICK FUNCTIONS
    // ***********

    // allow player to place an icon on the grid
    $('.gridrow li').click(function () {
        if (gameState.playersTurn === true) {
            var square = this.id;
            var piece = gameState.playerIcon;
            placePiece(square, piece, 'player');
        }
    });


    //*************
    // DOM FUNCTIONS
    //*************

    // place an icon on the grid
    function placePiece(square, icon, player) {
        $('#' + square).children('.square').html('<p>' + icon + '</p>');
        // add square to occupied array, along with who occupied it
        gameState.grid[square].occupied = 'player';
        checkWin('player', gameState.grid);
        gridEval(square, player);
    };

    //***************
    // GAME AI MOVE DECISIONS
    //***************

    // Computer gets possible squares sorted by value
    var possibleMoves = sortGrid(gameState.grid);
    // Computer checks to see if it can win. If so, it does.
    
    // If it can't win, it checks to see if opponent has possible win

    // If not, it takes the highest value square





    //***************
    // GAME EVALUATION FUNCTIONS
    //***************

    // sort gameState.gridValue based on values, eliminates occupied squares from result
    function sortGrid(grid) {
        var sortable = [];
        // change grid into array
        for (var key in grid) {
            sortable.push([key, grid[key].value]);
        }
        // sort array by value
        sortable.sort(function (a, b) {
            return (b[1] - a[1]);
        });
        // remove occupied squares from results
        sortable.forEach(function (element, index) {
            var square = element[0];
            if (gameState.grid[square].occupied) {
                sortable.splice(index, 1);
            }
        })
        // return array
        return sortable;

    }

    // re-evaluate grid squares

    function gridEval(square, player) {
        var row = square[1];
        var col = square[3];
        // loop through grid and check for match of row or column on key. If match, increment value
        for (var key in gameState.grid) {
            if (key[1] === row || key[3] === col) {
                if (gameState.grid[key].occupied === false) {
                    gameState.grid[key].value++;
                }
            }
        }
        // if square is a corner or center, increment diagonal win squares
        if ((row == 1 && col == 3) || (row == 3 && col == 1) || (row == col)) {
            valueDiags();
        }
        //  for testing
        var result = sortGrid(gameState.grid);
        for (var i = 0; i < result.length - 1; i++) {
            if (detectWinningMove(result[i][0], player)) {
                return;
            }

        }
    }

    function valueDiags() {
        gameState.grid.y1x1.value++;
        gameState.grid.y3x1.value++;
        gameState.grid.y1x3.value++;
        gameState.grid.y3x3.value++;
        gameState.grid.y2x2.value++;

    }

    // checks a move to see if it results in a win
    function detectWinningMove(square, player) {
        // jQuery deep copy
        var grid = $.extend(true,{},gameState.grid);
        grid[square].occupied = player;
        if (checkWin(player, grid)) {
            console.log('I can win at ' + square);
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