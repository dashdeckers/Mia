'use strict';

const Player = (name) => {
    let lives = 1;
    let x, y = 0;

    return {
        get_lives: () => lives,
        get_name: () => name,
        get_color: () => lives === 0 ? 'red': 'black',
        get_x: () => x,
        get_y: () => y,

        lose_life: () => {lives > 0 ? lives -= 1 : lives = 0;},
        is_dead: () => lives === 0,
        set_pos: (new_x, new_y) => {[x, y] = [new_x, new_y]},

        // right now the players are still random, strategies can be implemented here
        wants_to_lie: (announcement) => Math.random() < 0.5,
        believes: (announcement, prev_p) => Math.random() < 0.5,
    }
}
