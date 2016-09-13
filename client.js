$('document').ready(function () {
    var BaseGrid = {
        y1x1: 2,
        y1x2: 1,
        y1x3: 2,
        y2x1: 1,
        y2x2: 3,
        y2x3: 1,
        y3x1: 2,
        y3x2: 1,
        y3x3: 2
    };

    var gameState = {
        grid: BaseGrid,
        playersTurn: true,
        playerIcon: 'X',
        computerIcon: 'O',
        occupied: []

    }

    // sort gameState.gridValue based on values
    function sortGrid(grid) {
        var sortable = [];
        var result = {};
        for (var key in grid) {
            sortable.push([key, grid[key]]);
        }
        // sort highest to lowest
        sortable.sort(function (a, b) { return b[1] - a[1] });
        // convert back to object
        sortable.forEach(function (element, index) {
            result[element[0]] = element[1];
        });
        return result;
    }

    // place an icon on the grid
    function placePiece(square, icon,player) {
        $('#' + square).children('.square').html('<p>' + icon + '</p>');
        // add square to occupied array, along with who occupied it
        gameState.occupied.push([square,player]);
        console.log(gameState.occupied[gameState.occupied.length-1]);
    };

    // allow player to place an icon on the grid
    $('.gridrow li').click(function () {
        if (gameState.playersTurn === true) {
            var square = this.id;
            var piece = gameState.playerIcon;
            placePiece(square, piece, 'player');
        }
    });

    // check for a win state

}); // end document.ready