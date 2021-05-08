'use strict';

const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}


const Player = (name) => {
    let lives = 6;
    let x, y = 0;
    let r = 6;

    return {
        get_lives: () => lives,
        get_name: () => name,
        get_color: () => {return lives == 0 ? 'red': 'black'},
        get_x: () => x,
        get_y: () => y,
        get_r: () => r,

        lose_life: () => {lives > 0 ? lives -= 1 : lives = 0},
        set_pos: (new_x, new_y) => {[x, y] = [new_x, new_y]},

        move: () => {x += 10},
        on_turn_start: () => {
            r = 15;
            console.log(`Hi, I'm ${name}`);
        },
        on_turn_end: () => {
            r = 6;
        }
    }
}


const Game = (render, num_players) => {
    let turn_idx = 0;
    let players = [
        'Pheobe', 'Ross', 'Joey',
        'Rachel', 'Monica', 'Chandler',
        'Alice', 'Bob', 'Eve',
        'Jim', 'Dwight', 'Pam',
    ].slice(0, num_players).map((name) => {return Player(name)});

    render.init_draw(players);

    return {
        get_players: () => players,

        play_turn: () => {
            // do stuff
            players[turn_idx].on_turn_start();
            render.redraw(players);

            // players[turn_idx].move();
            players[turn_idx].lose_life();
            players[turn_idx].on_turn_end();
            delay(300).then(() => {
                render.redraw(players);
            });

            // update turn index
            turn_idx = (turn_idx + 1) % players.length;
        },
    }
}


const Render = () => {
    let color_palette = {
        'background': '#999b84',
        'header': '#322f3d',
        'nodes': '#59405c',
        'links': '#87556f',
    }

    return {
        init_draw: (players, circle_size=100) => {
            // remove any old SVG elements
            d3.select('svg').html(null);

            // style the basic HTML structure
            d3.select('#header')
                .style('width', '100vw')
                .style('height', '10vh')
                .style('background-color', color_palette.header);

            d3.select('#main-div')
                .style('width', '100vw')
                .style('height', '90vh')
                .style('background-color', color_palette.background);

            d3.select('body')
                .style('margin', '0px')
                .style('overflow', 'hidden');

            d3.select('svg')
                .attr("viewBox", "-300 -200 600 400")
                .style('width', '100%')
                .style('height', '100%');

            // arange players positions around a circle
            let angle = (2 * Math.PI) / players.length;
            players.forEach((p, i) => {
                p.set_pos(
                    circle_size * Math.cos(i * angle),
                    circle_size * Math.sin(i * angle),
                )
            });

            // not sure why this needs to be here
            // but otherwise redraw needs to be called twice
            d3.select('svg').selectAll('circle')
                .data(() => players)
                .enter().append('circle')
                .attr('fill', (p) => p.get_color())
                .attr('cx', (p) => p.get_x())
                .attr('cy', (p) => p.get_y())
                .attr('r', (p) => p.get_r());
        },

        redraw: (players) => {
            let sprites = d3.select('svg').selectAll('circle')
                .data(() => players);

            sprites.exit().remove();
            sprites.enter().append('circle');
            sprites.transition()
                .duration(500)
                .attr('fill', (p) => p.get_color())
                .attr('cx', (p) => p.get_x())
                .attr('cy', (p) => p.get_y())
                .attr('r', (p) => p.get_r());
        }
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

