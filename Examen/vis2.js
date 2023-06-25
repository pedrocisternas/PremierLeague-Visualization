const MATCHESROW = 7;
// const heightContainerMatch = 140;
// const heightHeaderMatch = heightContainerMatch * 0.2;
const heightHeaderMatch = 25;
// const heightCentralMatch = heightContainerMatch * 0.4;
const heightCentralMatch = 55;
// const heightBottomMatch = heightContainerMatch * 0.4;
const heightBottomMatch = 20;
const heightContainerMatch = heightHeaderMatch + heightCentralMatch + heightBottomMatch;
const widthContainerMatch = (WIDTH - MARGIN.right - MARGIN.left) / MATCHESROW;

const MatchesProcessedURL = "https://raw.githubusercontent.com/pedrocisternas/Examen-InfoVis/main/premier_league_18-19_matches.csv"

const parseMatch = (d) => ({
    timestamp: +d.timestamp,
    date_GMT: d.date_GMT,
    attendance: +d.attendance,
    home_team_name: d.home_team_name,
    away_team_name: d.away_team_name,
    home_team_goal_count: +d.home_team_goal_count,
    away_team_goal_count: +d.away_team_goal_count,
    referee: d.referee,
    gameweek: +d.gameweek,
    home_team_goal_timings: d.home_team_goal_timings,
    away_team_goal_timings: d.away_team_goal_timings,
    home_team_shots: +d.home_team_shots,
    away_team_shots: +d.away_team_shots,
    home_team_shots_on_target: +d.home_team_shots_on_target,
    away_team_shots_on_target: +d.away_team_shots_on_target,
    team_a_xg: +d.team_a_xg,
    team_b_xg: +d.team_b_xg,
    stadium_name: d.stadium_name,
    home_team_initial: d.home_team_initial,
    away_team_initial: d.away_team_initial,
})

function importData(team) {
    d3.csv(MatchesProcessedURL, parseMatch)
    .then((data) => {
        createVisMatches(data, team);
    })
}

function createVisMatches(matches, team) {
    const filteredMatches = matches.filter(elem => {
        if (elem.home_team_name == team || elem.away_team_name == team) {
            return elem
        }
    });
    console.log(team);
    let exists = false

    const resultFunction = (selected_goals, other_goals) => {
        if (selected_goals > other_goals) {
            return "W"
        }
        else if (selected_goals < other_goals) {
            return "L"
        }
        else {
            return "D"
        }
    };

    const translateXandY = index => {
            let x = 0
            let y = 0
            if (index == 0) {
            } else {
                y = Math.floor(index / MATCHESROW);
                x = index % MATCHESROW;
            }
            y = y * heightContainerMatch;
            x = x * widthContainerMatch;
            return [x, y];
        };
        
    function DJoin(useMatches) {
        const matchesPlayed = filteredMatches.length;
        const ROWS = Math.ceil(matchesPlayed / MATCHESROW);
        const elementsLastRow = matchesPlayed % MATCHESROW;
        const xGoalsDifferenceGoalsHome = d3.max(matches, d => Math.abs(d.home_team_goal_count - d.team_a_xg));
        const xGoalsDifferenceGoalsAway = d3.max(matches, d => Math.abs(d.away_team_goal_count - d.team_b_xg));
        const maxGoalDifference = Math.max(xGoalsDifferenceGoalsHome, xGoalsDifferenceGoalsAway);
        if (exists) {
            d3.select(".svg-vis-2").transition().duration(200).remove()
        }
        exists = true

        // Creamos SVG en lugar específico con dimensiones específicas
        const SVG = d3.select("#vis-2")
            .append("svg")
            .attr("class", "svg-vis-2")
            .attr("width", WIDTH)
            .attr("height", MARGIN.top + MARGIN.bottom + ROWS * heightContainerMatch);

        const containerVis = SVG
            .append("g")
            .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

        const colorScale = d3.scaleQuantize()
            .domain([-maxGoalDifference, maxGoalDifference])
            .range(ARRAYCOLORS);

        var enterUpdate = SVG
            .selectAll("g")
            .data(useMatches, d => d)
            .join(enter => {
                const grupo = enter.append("g");
    
                grupo.append("rect")
                    .attr("width", widthContainerMatch)
                    .attr("height", heightContainerMatch)
                    .style("stroke", "black")
                    .style("stroke-width", 3)
                    .style("fill", "transparent")
    
                grupo.append("rect")
                    .attr("width", widthContainerMatch / 2)
                    .attr("height", heightHeaderMatch)
                    .style("stroke", "black")
                    .style("fill", "transparent")
                
                grupo.append("rect")
                    .attr("x", widthContainerMatch / 2)
                    .attr("y", 0)
                    .attr("width", widthContainerMatch / 2)
                    .attr("height", heightHeaderMatch)
                    .style("stroke", "black")
                    .style("fill", "transparent")
                
                // CAJAS REFERENCIA
                // grupo.append("rect")
                //     .attr("x", 0)
                //     .attr("y", heightHeaderMatch)
                //     .attr("width", widthContainerMatch / 3)
                //     .attr("height", heightCentralMatch)
                //     .style("stroke", "black")
                //     .style("fill", "transparent")
                
                // grupo.append("rect")
                //     .attr("x", widthContainerMatch / 3)
                //     .attr("y", heightHeaderMatch)
                //     .attr("width", widthContainerMatch / 3)
                //     .attr("height", heightCentralMatch)
                //     .style("stroke", "black")
                //     .style("fill", "transparent")
                
                // grupo.append("rect")
                //     .attr("x", (widthContainerMatch / 3) * 2)
                //     .attr("y", heightHeaderMatch)
                //     .attr("width", widthContainerMatch / 3)
                //     .attr("height", heightCentralMatch)
                //     .style("stroke", "black")
                //     .style("fill", "transparent")
                
                grupo.append("text")
                    .attr("x", widthContainerMatch / 4)
                    .attr("y", heightHeaderMatch / 2)
                    .style("dominant-baseline", "middle")
                    .style("text-anchor", "middle")
                    .style("font-family", "Noto Sans, sans-serif")
                    .style("fill", "black")
                    .style("font-weight", d => d.home_team_name == team ? 900 : 200)
                    .text(d => d.home_team_initial)
    
                grupo.append("text")
                    .attr("x", widthContainerMatch / 4 * 3)
                    .attr("y", heightHeaderMatch / 2)
                    .style("dominant-baseline", "middle")
                    .style("text-anchor", "middle")
                    .style("font-family", "Noto Sans, sans-serif")
                    .style("fill", "black")
                    .style("font-weight", d => d.away_team_name == team ? 900 : 200)
                    .text(d => d.away_team_initial)
                
                grupo.append("text")
                    .attr("x", widthContainerMatch / 4)
                    .attr("y", heightHeaderMatch + (heightCentralMatch / 2))
                    .style("dominant-baseline", "middle")
                    .style("text-anchor", "middle")
                    .style("font-family", "Noto Sans, sans-serif")
                    .style("font-size", FONTSIZE * 3)
                    .style("stroke", "black")
                    .style("fill", d => d.home_team_name == team ? colorScale(d.home_team_goal_count - d.team_a_xg) : colorScale(d.team_a_xg - d.home_team_goal_count))
                    .text(d => d.home_team_goal_count)
                
                grupo.append("text")
                    .attr("x", widthContainerMatch / 2)
                    .attr("y", heightHeaderMatch + (heightCentralMatch / 2))
                    .style("dominant-baseline", "middle")
                    .style("text-anchor", "middle")
                    .style("font-family", "Noto Sans, sans-serif")
                    .style("fill", "black")
                    .text("vs")
                
                grupo.append("text")
                    .attr("x", widthContainerMatch / 4 * 3)
                    .attr("y", heightHeaderMatch + (heightCentralMatch / 2))
                    .style("dominant-baseline", "middle")
                    .style("text-anchor", "middle")
                    .style("font-family", "Noto Sans, sans-serif")
                    .style("font-size", FONTSIZE * 3)
                    .style("stroke", "black")
                    .style("fill", d => d.home_team_name == team ? colorScale(d.team_b_xg - d.away_team_goal_count) : colorScale(d.away_team_goal_count - d.team_b_xg))
                    .text(d => d.away_team_goal_count)
    
                grupo.append("text")
                    .attr("x", widthContainerMatch / 4)
                    .attr("y", heightHeaderMatch + heightCentralMatch * 1.1)
                    .style("dominant-baseline", "middle")
                    .style("text-anchor", "middle")
                    .style("font-family", "Noto Sans, sans-serif")
                    .style("font-size", FONTSIZE)
                    .style("fill", "grey")
                    .text(d => `(${d.team_a_xg})`)
    
                grupo.append("text")
                    .attr("x", widthContainerMatch / 4 * 3)
                    .attr("y", heightHeaderMatch + heightCentralMatch * 1.1)
                    .style("dominant-baseline", "middle")
                    .style("text-anchor", "middle")
                    .style("font-family", "Noto Sans, sans-serif")
                    .style("font-size", FONTSIZE)
                    .style("fill", "grey")
                    .text(d => `(${d.team_b_xg})`)
                
                // grupo.append("text")
                //     .attr("x", widthContainerMatch / 2)
                //     .attr("y", heightHeaderMatch + heightCentralMatch * 1.6)
                //     .style("dominant-baseline", "middle")
                //     .style("text-anchor", "middle")
                //     .style("font-family", "Noto Sans, sans-serif")
                //     .style("font-size", FONTSIZE * 2.6)
                //     .style("fill", "darkgrey")
                //     .style("font-weight", 600)
                //     .text(d => d.home_team_name == team ? resultFunction(d.home_team_goal_count, d.away_team_goal_count) : resultFunction(d.away_team_goal_count, d.home_team_goal_count))
                
                return grupo.attr("transform", (d, i) => `translate(${MARGIN.left + translateXandY(i)[0]}, ${MARGIN.top + translateXandY(i)[1]})`)
    
            });
    }
    DJoin(filteredMatches);
    console.log(filteredMatches);

    d3.select("#all").on("click", (event, d) => {
        d3.select("#wins").attr("class", "button")
        d3.select("#draws").attr("class", "button")
        d3.select("#losses").attr("class", "button")
        d3.select("#all").attr("class", "buttonactive")
        DJoin(filteredMatches);
    });

    d3.select("#wins").on("click", (event, d) => {
        const newData = filteredMatches.filter(function(matchObj) {
            const result = matchObj.home_team_name == team ? resultFunction(matchObj.home_team_goal_count, matchObj.away_team_goal_count) : resultFunction(matchObj.away_team_goal_count, matchObj.home_team_goal_count);
            return result == "W"
        });
        d3.select("#all").attr("class", "button")
        d3.select("#draws").attr("class", "button")
        d3.select("#losses").attr("class", "button")
        d3.select("#wins").attr("class", "buttonactive")
        DJoin(newData);
    });

    d3.select("#draws").on("click", (event, d) => {
        const newData = filteredMatches.filter(function(matchObj) {
            const result = matchObj.home_team_name == team ? resultFunction(matchObj.home_team_goal_count, matchObj.away_team_goal_count) : resultFunction(matchObj.away_team_goal_count, matchObj.home_team_goal_count);
            return result == "D"
        });
        d3.select("#all").attr("class", "button")
        d3.select("#wins").attr("class", "button")
        d3.select("#losses").attr("class", "button")
        d3.select("#draws").attr("class", "buttonactive")
        DJoin(newData);
    });

    d3.select("#losses").on("click", (event, d) => {
        const newData = filteredMatches.filter(function(matchObj) {
            const result = matchObj.home_team_name == team ? resultFunction(matchObj.home_team_goal_count, matchObj.away_team_goal_count) : resultFunction(matchObj.away_team_goal_count, matchObj.home_team_goal_count);
            return result == "L"
        });
        d3.select("#all").attr("class", "button")
        d3.select("#wins").attr("class", "button")
        d3.select("#draws").attr("class", "button")
        d3.select("#losses").attr("class", "buttonactive")
        DJoin(newData);
    });
};