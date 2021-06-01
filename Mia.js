'use strict';

// dice roll function: returns a random integer in [1, 6]
const roll_die = () => {
    return Math.floor(Math.random() * 6) + 1;
}

// Two dice are rolled simultaneously:
// The higher die is counted as the higher denomination.
// Doubles are always higher than normal rolls.
// The "Mia" (1 and 2) is a special roll and has the highest value.
const value_order = [
    // all double rolls have a probability of 1/36
    // all other rolls have a probability of 2/36
    31, 32,
    41, 42, 43,
    51, 52, 53, 54,
    61, 62, 63, 64, 65,
    11, 22, 33, 44, 55, 66,
    12,
]
const Player = (name) => {
    let lives = 6;
    let x, y = 0;


    return {
        get_lives: () => lives,
        get_name: () => name,
        // players are red when they are dead, black otherwise
        get_color: () => {return lives <= 0 ? 'red': 'black'},
        get_x: () => x,
        get_y: () => y,

        // roll two dice and sort in decending order
        roll_dice: () => {return [roll_die(), roll_die()].sort((a, b) => b - a)},

        lose_life: () => {lives > 0 ? lives -= 1 : lives = 0},
        set_pos: (new_x, new_y) => {[x, y] = [new_x, new_y]},
    }
}


const Game = (render, num_players) => {
    let turn_idx = 0;
    // names are IDs, so don't allow duplicate names.
    let players = [
        'Pheobe', 'Ross', 'Joey',
        'Rachel', 'Monica', 'Chandler',
        'Alice', 'Bob', 'Eve',
        'Jim', 'Dwight', 'Pam',
    // take num_players names from the list and turn them into Players
    ].slice(0, num_players).map((name) => {return Player(name)});

    render.init_draw(players);

    return {
        get_players: () => players,

        play_turn: () => {
            // show who's turn it is by turning green for a bit
            d3.select(`#${players[turn_idx].get_name()}`)
                .transition()
                    .duration(500)
                    .attr('fill', 'green')
                .transition()
                    .duration(1500)
                    .attr('fill', players[turn_idx].get_color());

            // do turn
            players[turn_idx].lose_life();

            // update turn index
            turn_idx = (turn_idx + 1) % players.length;
        },
    }
}


const Render = () => {
    return {
        init_draw: (players, circle_size=100, player_size=6) => {
            // remove any old SVG elements
            d3.select('#main-svg').html(null);

            // arange players positions around a circle
            let angle = (2 * Math.PI) / players.length;
            players.forEach((p, i) => {
                p.set_pos(
                    circle_size * Math.cos(i * angle),
                    circle_size * Math.sin(i * angle),
                )
            });

            // draw the players
            d3.select('#main-svg').selectAll('circle')
                .data(() => players)
                .enter().append('circle')
                .attr('id', (p) => p.get_name())
                .attr('fill', (p) => p.get_color())
                .attr('cx', (p) => p.get_x())
                .attr('cy', (p) => p.get_y())
                .attr('r', player_size);
        },
    }
}


const setup = (num_players) => {
    const render = Render();
    const game = Game(render, num_players);

    d3.select('#setup').on('click', () => setup(3));
    d3.select('#step').on('click', game.play_turn);

    return game;
}

let game = setup(10);

