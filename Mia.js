'use strict';


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

        // show who's turn it is by turning the player green for a bit
        show_turn: (player) => {
            d3.select(`#${player.get_name()}`)
                .transition()
                    .duration(500)
                    .attr('fill', 'green')
                .transition()
                    .duration(1500)
                    .attr('fill', player.get_color());
        },

        // just update some players color without turning them green
        update_color: (player) => {
            d3.select(`#${player.get_name()}`)
                .transition()
                    .duration(1500)
                    .attr('fill', player.get_color());
        },

        // refresh (more like replace) the logs
        update_log: (logs) => {
            document.getElementById('log-text').innerText = logs;
        },
    }
}


const Dice = () => {
    // Two dice are rolled simultaneously:
    // The higher die is counted as the higher denomination.
    // Doubles are always higher than normal rolls.
    // The "Mia" (1 and 2) is a special roll and has the highest value.
    const order = [
        31, 32,
        41, 42, 43,
        51, 52, 53, 54,
        61, 62, 63, 64, 65,
        11, 22, 33, 44, 55, 66,
        21,
    ];

    // This is an array containing the probabilities corresponding to the order array
    const probs = Array(21).fill().map(
        // all double rolls have a probability of 1/36
        // all other rolls have a probability of 2/36
        (_, idx) => {return idx < 14 || idx === 20 ? 2/36 : 1/36}
    );

    // single die roll function: returns a random integer in [1, 6]
    const roll_die = () => {return Math.floor(Math.random() * 6) + 1};

    return {
        // roll two dice, sort in decending order, then concatenate
        roll_dice: () => {
            let dice = [roll_die(), roll_die()].sort((a, b) => b - a);
            let dice_roll = Number(`${dice[0]}${dice[1]}`);
            return dice_roll;
        },

        // check if the roll is the Mia
        is_mia: (roll) => {
            return roll === 21;
        },

        // returns true if roll1 is lower than roll2
        lower_than: (roll1, roll2) => {
            return order.indexOf(roll1) <= order.indexOf(roll2);
        },

        // return the probability of rolling higher than 'roll' by summing probs
        prob_rolling_higher_than: (roll) => {
            return probs
                .slice(order.indexOf(roll), probs.length+1)
                .reduce((a, b) => a + b, 0);
        },

        // return a random roll higher than 'roll'
        get_higher_roll_than: (roll) => {
            let higher_rolls = order.slice(order.indexOf(roll) + 1, order.length);
            return higher_rolls[Math.floor(Math.random() * higher_rolls.length)];
        },
    }
}


const Logs = (players) => {
    // log human readable events as a list of strings
    const logs = ['Game starts'];
    const render = Render();

    render.update_log(logs);
    render.init_draw(players);

    //// helper functions:
    const check_death = (p) => {if (p.is_dead()) logs.push(`${p.get_name()} just died! :(`)}
    const believe_and_roll = (curr_p, prev_p, announcement, true_roll) => {
        if (!(announcement === null)) logs.push(`${curr_p.get_name()} believes ${prev_p.get_name()}!`);
        logs.push(`${curr_p.get_name()} rolls a: ${true_roll}`);
    }

    return {
        // when a Mia has been announced:
        mia_and_dont_believe_false: (curr_p, prev_p) => {
            logs.push(`The Mia was announced!`);
            logs.push(`${curr_p.get_name()} didn't believe the Mia: loses 2 lives`);
            check_death(curr_p);
        },

        mia_and_dont_believe_true: (curr_p, prev_p) => {
            logs.push(`The Mia was announced!`);
            logs.push(`${curr_p.get_name()} didn't believe the Mia: ${prev_p.get_name()} loses a life`);
            check_death(prev_p);
        },

        mia_and_believe: (curr_p, prev_p) => {
            logs.push(`The Mia was announced!`);
            logs.push(`${curr_p.get_name()} believes the Mia and loses a life`);
            check_death(curr_p);
        },


        // when a player believes the previous player and rolls the dice:
        roll_and_lie: (curr_p, prev_p, announced_roll, announcement, true_roll) => {
            believe_and_roll(curr_p, prev_p, announcement, true_roll);
            logs.push(`${curr_p.get_name()} lies and announces: ${announced_roll}`);
        },

        roll_and_truth: (curr_p, prev_p, announcement, true_roll) => {
            believe_and_roll(curr_p, prev_p, announcement, true_roll);
            logs.push(`${curr_p.get_name()} tells the truth and announces: ${true_roll}`);
        },


        // when a player does not believe a player and calls them out:
        call_out_and_false: (curr_p, prev_p) => {
            logs.push(`${curr_p.get_name()} calls out ${prev_p.get_name()}!`);
            logs.push(`They were telling the truth.`);
            check_death(curr_p);
        },

        call_out_and_true: (curr_p, prev_p) => {
            logs.push(`${curr_p.get_name()} calls out ${prev_p.get_name()}!`);
            logs.push(`They were indeed lying.`);
            check_death(prev_p);
        },


        // when the turn, the round, or the game is over:
        round_ended: () => {
            logs.push(`THE ROUND IS OVER`);
        },

        end_of_turn: (curr_p, prev_p) => {
            render.update_log(logs.join('\n'));
            render.show_turn(curr_p);
            render.update_color(prev_p);
        },

        game_over: (curr_p, prev_p) => {
            let winner = curr_p || prev_p;
            logs.push(`THE GAME IS OVER, ${winner.get_name()} wins!`);
            logs.push(`PRESS SETUP TO RESTART`);
            render.update_log(logs.join('\n'));
        },
    }
}


const Player = (name) => {
    let lives = 1;
    let x, y = 0;

    return {
        get_lives: () => lives,
        get_name: () => name,
        get_color: () => {return lives === 0 ? 'red': 'black'},
        get_x: () => x,
        get_y: () => y,

        lose_life: () => {lives > 0 ? lives -= 1 : lives = 0;},
        is_dead: () => {return lives === 0},
        set_pos: (new_x, new_y) => {[x, y] = [new_x, new_y]},

        // right now the players are still random, strategies can be implemented here
        wants_to_lie: () => {return Math.random() < 0.5},
        believes: (announcement, prev_p) => {return Math.random() < 0.5},
    }
}


const Game = (num_players) => {
    // remember the previously announced roll, the true roll, and who's turn it is now
    let announcement = null;
    let true_roll = null;
    let turn_idx = 0;

    // turn 'num_players' names from the list into Players
    const players = [
        // names are IDs, so don't allow duplicate names.
        'Pheobe', 'Ross', 'Joey',
        'Rachel', 'Monica', 'Chandler',
        'Alice', 'Bob', 'Eve',
        'Jim', 'Dwight', 'Pam',
    ].slice(0, num_players).map((name) => {return Player(name)});

    // grab some dice, and keep some logs
    const dice = Dice();
    const logs = Logs(players);


    //// helper functions:
    // dumbass javascript cant properly do modulo on negative numbers
    const mod = (n, m) => {return ((n % m) + m) % m};

    // function to return the next or previous player that is still alive
    // if no one else is left alive, return false
    const get_next_player_from = (turn_idx, backwards) => {
        let sign_modifier = backwards ? -1 : 1;
        let offset = backwards ? 0 : 1;
        while (true) {
            let idx = mod(turn_idx + (offset * sign_modifier), players.length);
            if (!players[idx].is_dead()) {
                return players[idx];
            }
            offset += 1;
            if (offset === players.length) {
                return false;
            }
        }
    }

    return {
        play_turn: () => {
            // get the next and previous still alive players (the bool toggles direction)
            const curr_p = get_next_player_from(turn_idx, false);
            const prev_p = get_next_player_from(turn_idx, true);
            turn_idx = players.indexOf(curr_p);

            // if there is only one player left alive, the game is over.
            if (!curr_p || !prev_p || curr_p.get_name() === prev_p.get_name()) {
                logs.game_over(curr_p, prev_p);
                return;
            }

            // if the Mia was announced, then the round is over
            if (dice.is_mia(announcement)) {

                // don't believe the Mia
                if (curr_p.believes(announcement, prev_p)) {

                    // it really was a Mia
                    if (dice.is_mia(true_roll)) {
                        curr_p.lose_life();
                        curr_p.lose_life();
                        logs.mia_and_dont_believe_false(curr_p, prev_p);

                    // it was not a Mia
                    } else {
                        prev_p.lose_life();
                        logs.mia_and_dont_believe_true(curr_p, prev_p);
                    }

                // believe the Mia
                } else {
                    curr_p.lose_life();
                    logs.mia_and_believe(curr_p, prev_p);
                }

                [announcement, true_roll] = [null, null];
                logs.round_ended();
            }

            // believe the previous player
            else if (announcement === null || curr_p.believes(announcement, prev_p)) {

                // roll the dice
                const curr_roll = dice.roll_dice();

                // lie
                if (curr_p.wants_to_lie() || dice.lower_than(curr_roll, announcement)) {
                    const announced_roll = dice.get_higher_roll_than(announcement);
                    logs.roll_and_lie(curr_p, prev_p, announced_roll, announcement, curr_roll);
                    [announcement, true_roll] = [announced_roll, curr_roll];

                // truth
                } else {
                    logs.roll_and_truth(curr_p, prev_p, announcement, curr_roll);
                    [announcement, true_roll] = [curr_roll, curr_roll];

                }

            // call out the previous player
            } else {

                // they were telling the truth
                if (announcement === true_roll) {
                    curr_p.lose_life();
                    logs.call_out_and_false(curr_p, prev_p);

                // they were lying
                } else {
                    prev_p.lose_life();
                    logs.call_out_and_true(curr_p, prev_p);
                }

                [announcement, true_roll] = [null, null];
                logs.round_ended();
            }

            logs.end_of_turn(curr_p, prev_p);
        },
    }
}


// call out threshold && lie prob gradient
// logs + stats
// tooltip
// 


const setup = (num_players) => {
    const game = Game(num_players);

    d3.select('#setup').on('click', () => setup(3));
    d3.select('#step').on('click', game.play_turn);

    return game;
}

const game = setup(10);

