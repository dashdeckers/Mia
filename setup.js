'use strict';

const Setup = (num_players) => {
    // get 'num_players' names and lying probs from the list
    // names are IDs, so don't allow duplicate names.
    const player_stats = [
        ['Joey', 0.8], ['Pheobe', 0.5], ['Ross', 0.2],
        ['Rachel', 0.8], ['Monica', 0.5], ['Chandler', 0.2],
    ].slice(0, num_players);

    const play_n_games = (game, logs, num_games=10) => {
        let games_played = 0;
        logs.truncate_logs();
        game.turn_off_rendering();
        game.turn_off_logging();

        while (true) {
            game.play_turn();

            if (game.game_is_over()) {
                game.reset_game();
                games_played += 1;
                console.log('game played');
            }

            if (games_played === num_games) break;
        }
        game.turn_on_rendering();
        game.turn_on_logging();
        game.render();
    }

    let use_AI = true;

    const logs = Logs(player_stats);
    const game = Game(player_stats, logs, use_AI);

    d3.select('#setup').on('click', () => {
        logs.reset_logs_and_data();
        game.reset_game();
        game.render();
    });
    d3.select('#step').on('click', () => game.play_turn());
    d3.select('#run10').on('click', () => play_n_games(game, logs, 10));
    d3.select('#run100').on('click', () => play_n_games(game, logs, 100));
    d3.select('#AI').on('click', () => {
        use_AI = game.toggle_AI();
        document.getElementById('AI').innerText = `Toggle AI (${game.game_uses_AI()})`;
    });

    return logs;
}


const logs = Setup(6);
