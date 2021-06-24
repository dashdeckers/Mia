'use strict';

const Render = (logs) => {
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
                .attr('r', player_size)
                .append('title')
                .text((p) => p.get_name() + ':\n' + logs.get_one_human_data(p.get_name()));
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

        // update the hover text for each player
        update_tooltip: () => {
            d3.select('#main-svg').selectAll('title')
                .text((p) => p.get_name() + ':\n' + logs.get_one_human_data(p.get_name()));
        },

        // just update some players color without turning them green
        update_color: (player) => {
            d3.select(`#${player.get_name()}`)
                .transition()
                    .duration(1500)
                    .attr('fill', player.get_color());
        },

        // refresh (more like replace) the logs and data
        update_log_and_data: (logs) => {
            document.getElementById('log-text').innerText = logs.get_human_logs();
            document.getElementById('data-text').innerText = logs.get_human_data();
        },
    }
}
