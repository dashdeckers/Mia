'use strict';

// TODO:

// players should have one of three lying probabilities [0.2, 0.5, 0.8]
// players know that these three are possible amongst the other players
// lying is announcing the result of a uniform sample of dice rolls higher than X

// players use the evidence gained by playing the game to infer the other players lying prob
// evidence is counts of catching players lying unecessarily or telling the truth

// kripke models initially show for each player, three possible worlds for each other player
// as the game progresses the kripke models should collapse as the probability that an agent
//   has a certain lying probability goes below some threshold

// e.g: of the 100 turns agent_i played, he was caught lying 70 times
//   agent_{i+1} no longer considers it possible for agent_i to have a lying probability of 0.2


const Setup = (num_players) => {
    // get 'num_players' names from the list
    // names are IDs, so don't allow duplicate names.
    const player_names = [
        'Pheobe', 'Ross', 'Joey',
        'Rachel', 'Monica', 'Chandler',
        // 'Alice', 'Bob', 'Eve',
        // 'Jim', 'Dwight', 'Pam',
    ].slice(0, num_players)

    const play_n_games = (game, num_games=10) => {
        let games_played = 0;

        while (true) {
            game.play_turn();

            if (game.game_is_over()) {
                game.reset_game();
                games_played += 1;
            }

            if (games_played === num_games) break;
        }
    }

    const logs = Logs(player_names);
    const game = Game(player_names, logs, true)

    d3.select('#setup').on('click', () => {
        logs.reset_logs();
        game.reset_game();
        game.rerender();
    });
    d3.select('#step').on('click', game.play_turn);
    d3.select('#run').on('click', () => {
        const game = Game(player_names, logs, false)
        play_n_games(game, 6);
        game.render();
    })

    return logs;
}


const logs = Setup(10);
