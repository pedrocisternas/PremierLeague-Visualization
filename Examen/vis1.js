const WIDTH = 1300;
const HEIGHT = 740;
const MARGIN = {
  top: 80,
  bottom: 60,
  right: 30,
  left: 30,
};
const WIDTHPOSITION = 35;
const WIDTHNAME = 225;
// Si activo esto tengo que sacarle 40 a WIDTHNAME y agregar WIDTHPOINTS a WIDTHTABLE
const WIDTHPOINTS = 35;
const WIDTHTABLE = WIDTHPOSITION + WIDTHNAME + WIDTHPOINTS;
const RADIUS = 10;
const BIGRADIUS = RADIUS + 3;
const ARRAYCOLORS = ['#DA2C43', '#E15566', '#E97E88', '#F0A8AB', '#F8D1CD', '#D3E8D3', '#A7D1A7', '#7AB97A', '#4EA24E', '#228B22']
// const ARRAYCOLORS = ['#800000', '#AD0000', '#D10000', '#E83F3F', '#FD6868', '#FD8E8E', '#FDB6B6', '#FDD2D2', '#FDFDFD', '#DAFDE7', '#C3FDDA', '#B3FFC9', '#94FFA6', '#4DFF6A', '#00DB17', '#00B313', '#00870E']
const FONTSIZE = 17;
const FONTFAMILY = "Noto Sans, sans-serif";
const NUMBERSIDEDOT = 34;
const DISTANCEFILTERCIRCLES = 140;

const TeamsProcessedURL = "https://raw.githubusercontent.com/pedrocisternas/Examen-InfoVis/main/premier_league_18-19_teams.csv"

function parseTeam(d) {
    const data = {
        team_name: d.team_name,
        common_name: d.common_name,
        season: d.season,
        matches_played: +d.matches_played,
        points_per_game: +d.points_per_game,
        league_position: +d.league_position,
        league_position_home: +d.league_position_home,
        league_position_away: +d.league_position_away,
        goals_scored: +d.goals_scored,
        goals_conceded: +d.goals_conceded,
        goal_difference: +d.goal_difference,
        goals_scored_home: +d.goals_scored_home,
        goals_scored_away: +d.goals_scored_away,
        goals_conceded_home: +d.goals_conceded_home,
        goals_conceded_away: +d.goals_conceded_away,
        goal_difference_home: +d.goal_difference_home,
        goal_difference_away: +d.goal_difference_away,
        clean_sheets: +d.clean_sheets,
        clean_sheets_home: +d.clean_sheets_home,
        clean_sheets_away: +d.clean_sheets_away,
        xg_for_avg_overall: +d.xg_for_avg_overall,
        xg_for_avg_home: +d.xg_for_avg_home,
        xg_for_avg_away: +d.xg_for_avg_away,
        xg_against_avg_overall: +d.xg_against_avg_overall,
        xg_against_avg_home: +d.xg_against_avg_home,
        xg_against_avg_away: +d.xg_against_avg_away,
    }
    return data
}

d3.csv(TeamsProcessedURL, parseTeam).then(teams => {
    // console.log(teams);
    createVisTeams(teams);
})

// Creamos SVG en lugar específico con dimensiones específicas
const SVG = d3.select("#vis-1")
    .append("svg")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);

// Creamos un contenedor específico para el eje y la visualización.
const containerX = SVG
  .append("g")
  .attr("transform", `translate(${WIDTHTABLE + MARGIN.left}, ${HEIGHT - MARGIN.bottom})`)
  .attr("visibility", "hidden")
  .attr("id", "containerX");

const containerXDifference = SVG
  .append("g")
  .attr("transform", `translate(${WIDTHTABLE + MARGIN.left}, ${HEIGHT - MARGIN.bottom})`)
  .attr("visibility", "visible")
  .attr("id", "containerXDifference");

const containerVis = SVG
  .append("g")
//   .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

// Creamos función que crea con la visualización ocupando los datos que tenemos
function createVisTeams(teams) {

    // variables
    const lastPosition = d3.max(teams, d => d.league_position);
    // No sólo hay que contabilizar los goles, si no también los expected (por el caso en que haya un equipo que tenga más xG que goles)
    const maxGoalsScored = d3.max(teams, d => d.goals_scored);
    const maxGoalsConceded = d3.max(teams, d => d.goals_conceded);
    const maxGoals = d3.max([maxGoalsScored, maxGoalsConceded]);
    const heightContainerTeam = (HEIGHT - MARGIN.top - MARGIN.bottom) / lastPosition;
    // Esto se podría cambiar por convención mundial de "underperforming" en un partido
    const xGoalsDifferenceGoalsScored = d3.max(teams, d => Math.abs((d.goals_scored / d.matches_played) - d.xg_for_avg_overall));
    const xGoalsDifferenceGoalsConceded = d3.max(teams, d => Math.abs((d.goals_conceded / d.matches_played) - d.xg_against_avg_overall));
    const maxDifferenceScoredOrConceded = d3.max([xGoalsDifferenceGoalsScored, xGoalsDifferenceGoalsConceded]);
    const maxGoalDifference = d3.max(teams, d => Math.abs(d.goals_scored - d.goals_conceded));
    const maxxGDifference = d3.max(teams, d => Math.abs((d.xg_for_avg_overall - d.xg_against_avg_overall) * d.matches_played));
    const maxDifferenceGoalOrxG = d3.max([maxGoalDifference, maxxGDifference]);
    const xGDifferenceGoalDifference = d3.max(teams, d => Math.abs((d.goals_scored - d.goals_conceded) - (d.xg_for_avg_overall - d.xg_against_avg_overall) * d.matches_played));

    let xGFilterCircle = true;
    let goalFilterCircle = true;

    // escalas
    const axisXScale = d3
        .scaleLinear()
        .domain([0, maxGoals * 1.08])
        .rangeRound([0, WIDTH - WIDTHTABLE - MARGIN.right - MARGIN.left]);

    const axisXDifferenceScale = d3
        .scaleLinear()
        .domain([-maxDifferenceGoalOrxG * 1.12, maxDifferenceGoalOrxG * 1.12])
        .rangeRound([0, WIDTH - WIDTHTABLE - MARGIN.right - MARGIN.left]);

    const positionScale = d3
        .scaleLinear()
        .domain([1, lastPosition])
        .rangeRound([0, HEIGHT - MARGIN.top - MARGIN.bottom - heightContainerTeam]);

    const colorScale = d3.scaleQuantize()
        .domain([-maxDifferenceScoredOrConceded, maxDifferenceScoredOrConceded])
        .range(ARRAYCOLORS);

    const colorScaleDifference = d3.scaleQuantize()
        .domain([-xGDifferenceGoalDifference, xGDifferenceGoalDifference])
        .range(ARRAYCOLORS);

    const axisX = d3.axisBottom(axisXScale);
    const axisXDifference = d3.axisBottom(axisXDifferenceScale);

    containerX.call(axisX)
        .selectAll("line")
        .attr("stroke-dasharray", "5")
        .attr("opacity", 1)
        
    containerX.call(axisX)
        .selectAll("text")
        .attr("opacity", "1").
        attr("font-size", FONTSIZE);

    containerXDifference.call(axisXDifference)
        .selectAll("line")
        .attr("stroke-dasharray", "5")
        .attr("opacity", 1)
    
    containerXDifference.call(axisXDifference)
        .selectAll("text")
        .attr("opacity", "1").
        attr("font-size", FONTSIZE);

    // círculos filtro
    SVG
        .append("circle")
        .attr("r", BIGRADIUS)
        .attr("cx", WIDTH / 2 - DISTANCEFILTERCIRCLES)
        .attr("cy", 20)
        .attr("fill", "grey")
        .attr("stroke", "black")
        .attr("stroke-width" , 2.5)
        .attr("class", "filterCircle")
        .attr("id", "xGFilterCircle")
    
    SVG
        .append("circle")
        .attr("r", BIGRADIUS)
        .attr("cx", WIDTH / 2 + DISTANCEFILTERCIRCLES)
        .attr("cy", 20)
        .attr("fill", "#A7D1A7")
        .attr("stroke", "black")
        .attr("stroke-width" , 2.5)
        .attr("class", "filterCircle")
        .attr("id", "goalFilterCircle")

    // texto círculos filtro
    SVG
        .append("text")
        .attr("x", WIDTH / 2 - DISTANCEFILTERCIRCLES + RADIUS + 10)
        .attr("y", (MARGIN.top - heightContainerTeam) / 2)
        .style("dominant-baseline", "middle")
        .style("font-size", FONTSIZE)
        .style("font-family", FONTFAMILY)
        .attr("id", "xGFilterCircleLabel")
        .text("Expected Goal Difference");

    SVG
        .append("text")
        .attr("x", WIDTH / 2 + DISTANCEFILTERCIRCLES + RADIUS + 10)
        .attr("y", (MARGIN.top - heightContainerTeam) / 2)
        .style("dominant-baseline", "middle")
        .style("font-size", FONTSIZE)
        .style("font-family", FONTFAMILY)
        .attr("id", "goalFilterCircleLabel")
        .text("Goal Difference");

    // header
    containerVis.append("rect")
        .attr("width", WIDTH - WIDTHTABLE - MARGIN.right - MARGIN.left)
        .attr("height", heightContainerTeam)
        .attr("x", MARGIN.left)
        .attr("y", MARGIN.top - heightContainerTeam)
        .style("stroke", "black")
        .style("stroke-width", 0.1)
        .style("fill", "transparent")
        .attr("transform",`translate(${WIDTHTABLE}, 0)`)
        .attr("class", "header")
            
    containerVis.append("rect")
        .attr("width", WIDTHPOSITION)
        .attr("height", heightContainerTeam)
        .attr("x", MARGIN.left)
        .attr("y", MARGIN.top - heightContainerTeam)
        .style("stroke", "black")
        .style("fill", "transparent")
        .attr("class", "header")

    containerVis.append("rect")
        .attr("width", WIDTHNAME)
        .attr("height", heightContainerTeam)
        .attr("x", MARGIN.left)
        .attr("y", MARGIN.top - heightContainerTeam)
        .style("stroke", "black")
        .style("fill", "transparent")
        .attr("transform",`translate(${WIDTHPOSITION}, 0)`)
        .attr("class", "header")
        
    containerVis.append("rect")
        .attr("width", WIDTHPOINTS)
        .attr("height", heightContainerTeam)
        .attr("x", MARGIN.left)
        .attr("y", MARGIN.top - heightContainerTeam)
        .style("stroke", "black")
        .style("fill", "transparent")
        .attr("transform",`translate(${WIDTHPOSITION + WIDTHNAME}, 0)`)

    containerVis.append("text")
        .attr("x", MARGIN.left + WIDTHPOSITION / 2)
        .attr("y", MARGIN.top - heightContainerTeam + heightContainerTeam / 2)
        .style("dominant-baseline", "middle")
        .style("text-anchor", "middle")
        .style("font-family", FONTFAMILY)
        .attr("fill", "black")
        .text("P")
        .attr("font-weight", 700)
        .attr("class", "header")
        
    containerVis.append("text")
        .attr("x", MARGIN.left + WIDTHPOSITION * 1.3)
        .attr("y", MARGIN.top - heightContainerTeam + heightContainerTeam / 2)
        .style("dominant-baseline", "middle")
        .style("font-size", FONTSIZE)
        .style("font-family", FONTFAMILY)
        .attr("fill", "black")
        .text("Team Name")
        .attr("font-weight", 700)
        .attr("class", "header")

    containerVis.append("text")
        .attr("x", MARGIN.left + WIDTHPOSITION + WIDTHNAME + WIDTHPOINTS / 2)
        .attr("y", MARGIN.top - heightContainerTeam + heightContainerTeam / 2)
        .style("dominant-baseline", "middle")
        .style("text-anchor", "middle")
        .style("font-size", FONTSIZE)
        .style("font-family", FONTFAMILY)
        .attr("fill", "black")
        .text("PTS")
        .attr("font-weight", 700)
        .attr("class", "header")
    
    // label eje x
    SVG
        .append("text")
        .attr("x", MARGIN.left + WIDTHTABLE - MARGIN.right + (WIDTH - WIDTHTABLE) / 2)
        .attr("y", HEIGHT - MARGIN.bottom + 40)
        .style("text-anchor", "middle")
        .style("dominant-baseline", "middle")
        .style("font-size", FONTSIZE)
        .style("font-family", FONTFAMILY)
        .text("Goals");

    containerVis
        .selectAll("g")
        .data(teams, d => d.common_name)
        .join(enter => {
            const grupo = enter.append("g");

            grupo.append("rect")
                .attr("width", WIDTH - WIDTHTABLE - MARGIN.right - MARGIN.left)
                .attr("height", heightContainerTeam)
                .style("stroke", "black")
                .style("stroke-width", 0.1)
                .style("fill", "transparent")
                .attr("transform",`translate(${WIDTHTABLE}, 0)`)
                .attr("class", d => d.common_name.replaceAll(" ", "").replace("&", ""))
            
            grupo.append("rect")
                .attr("width", WIDTHPOSITION)
                .attr("height", heightContainerTeam)
                .style("stroke", "black")
                .style("fill", "transparent")
                .attr("id", "press")
                .attr("class", d => d.common_name.replaceAll(" ", "").replace("&", ""))

            grupo.append("rect")
                .attr("width", WIDTHNAME)
                .attr("height", heightContainerTeam)
                .style("stroke", "black")
                .style("fill", "transparent")
                .attr("transform",`translate(${WIDTHPOSITION}, 0)`)
                .attr("id", "press")
                .attr("class", d => d.common_name.replaceAll(" ", "").replace("&", ""))
                
            grupo.append("rect")
                .attr("width", WIDTHPOINTS)
                .attr("height", heightContainerTeam)
                .style("stroke", "black")
                .style("fill", "transparent")
                .attr("transform",`translate(${WIDTHPOSITION + WIDTHNAME}, 0)`)

            grupo.append("text")
                .attr('x', WIDTHPOSITION / 2)
                .attr('y', heightContainerTeam / 2)
                .style("dominant-baseline", "middle")
                .style("text-anchor", "middle")
                .style("font-family", FONTFAMILY)
                .attr("fill", "black")
                .text(d => d.league_position)
                .attr("id", "press")
                .attr("class", d => d.common_name.replaceAll(" ", "").replace("&", ""))
                
            grupo.append("text")
                .attr('x', WIDTHPOSITION * 1.3)
                .attr('y', heightContainerTeam / 2)
                .style("dominant-baseline", "middle")
                .style("font-size", FONTSIZE)
                .style("font-family", FONTFAMILY)
                .attr("fill", "black")
                .text(d => d.common_name)
                .attr("id", "press")
                .attr("class", d => d.common_name.replaceAll(" ", "").replace("&", ""))

            grupo.append("text")
                .attr('x', WIDTHPOSITION + WIDTHNAME + WIDTHPOINTS / 2)
                .attr('y', heightContainerTeam / 2)
                .style("dominant-baseline", "middle")
                .style("text-anchor", "middle")
                .style("font-size", FONTSIZE)
                .style("font-family", FONTFAMILY)
                .attr("fill", "black")
                .text(d => Math.round(d.points_per_game * d.matches_played))
                .attr("id", "press")
                .attr("class", d => d.common_name.replaceAll(" ", "").replace("&", ""))

            grupo.append("circle")
                .attr("r", RADIUS)
                .attr("cx", d => WIDTHTABLE + axisXDifferenceScale(d.matches_played * (d.xg_for_avg_overall- d.xg_against_avg_overall)))
                .attr("cy", heightContainerTeam / 2)
                .attr("fill", "grey")
                .attr("stroke", "black")
                .attr("stroke-width" , 1)
                .attr("class", d => d.common_name.replaceAll(" ", "").replace("&", ""))
                .attr("id", d => `xGDot${d.common_name.replaceAll(" ", "").replace("&", "")}`)

            grupo.append("circle")
                .attr("r", RADIUS)
                .attr("cx", d => WIDTHTABLE + axisXDifferenceScale(d.goals_scored - d.goals_conceded))
                .attr("cy", heightContainerTeam / 2)
                .attr("fill", "transparent")
                .attr("stroke", "black")
                .attr("stroke-width" , 1)
                .style("fill", d => colorScaleDifference((d.goals_scored - d.goals_conceded) - (d.xg_for_avg_overall - d.xg_against_avg_overall) * d.matches_played))
                .attr("class", d => d.common_name.replaceAll(" ", "").replace("&", ""))
                .attr("id", d => `goalDot${d.common_name.replaceAll(" ", "").replace("&", "")}`)
            
            grupo.append("text")
                .attr("x", d => (d.goals_scored - d.goals_conceded) > (d.matches_played * (d.xg_for_avg_overall - d.xg_against_avg_overall)) ? WIDTHTABLE + axisXDifferenceScale(d.matches_played * (d.xg_for_avg_overall - d.xg_against_avg_overall)) - NUMBERSIDEDOT: WIDTHTABLE + axisXDifferenceScale(d.matches_played * (d.xg_for_avg_overall - d.xg_against_avg_overall)) + NUMBERSIDEDOT)
                .attr("y", heightContainerTeam / 2)
                .style("dominant-baseline", "middle")
                .style("text-anchor", "middle")
                .style("fill", "black")
                .text(d => (d.matches_played * (d.xg_for_avg_overall - d.xg_against_avg_overall)).toFixed(1))
                .style("font-family", FONTFAMILY)
                .attr("visibility", "hidden")
                .attr("class", d => d.common_name.replaceAll(" ", "").replace("&", ""))
                .attr("id", d => `xGLabelDot${d.common_name.replaceAll(" ", "").replace("&", "")}`)

            grupo.append("text")
                .attr("x", d => (d.goals_scored - d.goals_conceded) > (d.matches_played * (d.xg_for_avg_overall - d.xg_against_avg_overall)) ? WIDTHTABLE + axisXDifferenceScale(d.goals_scored - d.goals_conceded) + NUMBERSIDEDOT : WIDTHTABLE + axisXDifferenceScale(d.goals_scored - d.goals_conceded) - NUMBERSIDEDOT)
                .attr("y", heightContainerTeam / 2)
                .style("dominant-baseline", "middle")
                .style("text-anchor", "middle")
                .style("fill", "black")
                .text(d => (d.goals_scored - d.goals_conceded))
                .style("font-family", FONTFAMILY)
                .attr("visibility", "hidden")
                .attr("class", d => d.common_name.replaceAll(" ", "").replace("&", ""))
                .attr("id", d => `goalLabelDot${d.common_name.replaceAll(" ", "").replace("&", "")}`)
            
            return grupo.attr("transform", (d, i) => `translate(${MARGIN.left}, ${MARGIN.top + positionScale(d.league_position)})`)
        });

        // d3.selectAll(`[id*="Dot"]`)
        // .on("mouseenter", (event, d) => {
        //     // console.log(event, d["common_name"].replaceAll(" ", "").replace("&", ""));
        //     labelDot = d3.selectAll(`[id*=LabelDot${d["common_name"].replaceAll(" ", "").replace("&", "")}]`)
        //     labelDot.style("visibility", "visible")
        //     goalDot = d3.selectAll(`#goalDot${d["common_name"].replaceAll(" ", "").replace("&", "")}`)
        //     goalDot.attr("stroke-width" , 2.5).attr("r" , BIGRADIUS)
        //     xGDot = d3.selectAll(`#xGDot${d["common_name"].replaceAll(" ", "").replace("&", "")}`)
        //     xGDot.attr("stroke-width" , 2.5).attr("r" , BIGRADIUS)
        // })
        // .on("mouseleave", (event, d) => {
        //     labelDot.style("visibility", "hidden")
        //     goalDot.attr("stroke-width" , 1).attr("r" , RADIUS)
        //     xGDot.attr("stroke-width" , 1).attr("r" , RADIUS)
        // });

        d3.selectAll(`[id*="xGDot"]`)
        // .on("click", (event, d) => {
        //     if (goalDotActive) {
        //         d3.selectAll(`[id*="goalDot"]`).attr("visibility", "hidden")
        //         d3.selectAll(`[id*="goalLabelDot"]`).attr("visibility", "hidden")
        //         goalDotActive = false
        //     } else {
        //         d3.selectAll(`[id*="goalDot"]`).attr("visibility", "visible")
        //         goalDotActive = true
        //     }
        // })
        .on("mouseenter", (event, d) => {
            console.log(goalFilterCircle);
            xGLabelDot = d3.selectAll(`[id*=xGLabelDot${d["common_name"].replaceAll(" ", "").replace("&", "")}]`)
            xGLabelDot.style("visibility", "visible")
            if (goalFilterCircle) {
                goalLabelDot = d3.selectAll(`[id*=goalLabelDot${d["common_name"].replaceAll(" ", "").replace("&", "")}]`)
                goalLabelDot.style("visibility", "visible")
            }
            goalDot = d3.selectAll(`#goalDot${d["common_name"].replaceAll(" ", "").replace("&", "")}`)
            goalDot.attr("stroke-width" , 2.5).attr("r" , BIGRADIUS)
            xGDot = d3.selectAll(`#xGDot${d["common_name"].replaceAll(" ", "").replace("&", "")}`)
            xGDot.attr("stroke-width" , 2.5).attr("r" , BIGRADIUS)
        })
        .on("mouseleave", (event, d) => {
            xGDot.attr("stroke-width" , 1).attr("r" , RADIUS)
            xGLabelDot.style("visibility", "hidden")
            goalDot.attr("stroke-width" , 1).attr("r" , RADIUS)
            if (goalFilterCircle) {
                goalLabelDot.style("visibility", "hidden")
            }
        }); 

        d3.selectAll(`[id*="goalDot"]`)
        // .on("click", (event, d) => {
        //     if (xGDotActive) {
        //         d3.selectAll(`[id*="xGDot"]`).attr("visibility", "hidden");
        //         d3.selectAll(`[id*="xGLabelDot"]`).attr("visibility", "hidden");
        //         xGDotActive = false;
        //     } else {
        //         d3.selectAll(`[id*="xGDot"]`).attr("visibility", "visible")
        //         xGDotActive = true
        //     }
        // })
        .on("mouseenter", (event, d) => {
            console.log(goalFilterCircle);
            goalLabelDot = d3.selectAll(`[id*=goalLabelDot${d["common_name"].replaceAll(" ", "").replace("&", "")}]`)
            goalLabelDot.style("visibility", "visible")
            if (xGFilterCircle) {
                xGLabelDot = d3.selectAll(`[id*=xGLabelDot${d["common_name"].replaceAll(" ", "").replace("&", "")}]`)
                xGLabelDot.style("visibility", "visible")
            }
            goalDot = d3.selectAll(`#goalDot${d["common_name"].replaceAll(" ", "").replace("&", "")}`)
            goalDot.attr("stroke-width" , 2.5).attr("r" , BIGRADIUS)
            xGDot = d3.selectAll(`#xGDot${d["common_name"].replaceAll(" ", "").replace("&", "")}`)
            xGDot.attr("stroke-width" , 2.5).attr("r" , BIGRADIUS)
        })
        .on("mouseleave", (event, d) => {
            goalLabelDot.style("visibility", "hidden")
            goalDot.attr("stroke-width" , 1).attr("r" , RADIUS)
            xGDot.attr("stroke-width" , 1).attr("r" , RADIUS)
            if (xGFilterCircle) {
                xGLabelDot.style("visibility", "hidden")
            }
        });  

        function opacity(team) {
            d3.selectAll(`.${team}`).attr("opacity", "1")
            d3.selectAll("g").selectAll(`*:not(.${team})`).attr("opacity", "0.3")
            d3.selectAll("g").selectAll("g").attr("opacity", "1")
            // d3.selectAll("g").selectAll("g").selectAll("text").attr("opacity", "1")
        };

        d3.selectAll("#press").on("click", (event, d) => {
            d3.select(".svg-vis-2").transition().duration(400).remove()
            importData(d.common_name);
            opacity(d["common_name"].replaceAll(" ", "").replace("&", ""))
            d3.select("#wins").attr("class", "button")
            d3.select("#draws").attr("class", "button")
            d3.select("#losses").attr("class", "button")
            d3.select("#all").attr("class", "buttonactive")
        });

        d3.select("#conceded").on("click", (event, d) => {
            d3.select("#goalFilterCircleLabel").text("Goals Conceded")
            d3.select("#xGFilterCircleLabel").text("Expected Goals Conceded")
            d3.select("#scored").attr("class", "button")
            d3.select("#difference").attr("class", "button")
            d3.select("#conceded").attr("class", "buttonactive")
            containerXDifference.attr("visibility", "hidden")
            containerX.attr("visibility", "visible")
            goalDots = d3.selectAll(`[id*="goalDot"]`)
            goalDots.attr("cx", d => WIDTHTABLE + axisXScale(d.goals_conceded)).style("fill", d => colorScale(d.xg_against_avg_overall - (d.goals_conceded / d.matches_played)))
            xGDots = d3.selectAll(`[id*="xGDot"]`)
            xGDots.attr("cx", d => WIDTHTABLE + axisXScale(d.matches_played * d.xg_against_avg_overall))
            goalLabelDots = d3.selectAll(`[id*="goalLabelDot"]`)
            goalLabelDots.text(d => d.goals_conceded).attr("x", d => d.goals_conceded > (d.matches_played * d.xg_against_avg_overall) ? WIDTHTABLE + axisXScale(d.goals_conceded) + NUMBERSIDEDOT : WIDTHTABLE + axisXScale(d.goals_conceded) - NUMBERSIDEDOT)
            xGLabelDots = d3.selectAll(`[id*="xGLabelDot"]`)
            xGLabelDots.text(d => (d.matches_played * d.xg_against_avg_overall).toFixed(1)).attr("x", d => d.goals_conceded > (d.matches_played * d.xg_against_avg_overall) ? WIDTHTABLE + axisXScale(d.matches_played * d.xg_against_avg_overall) - NUMBERSIDEDOT: WIDTHTABLE + axisXScale(d.matches_played * d.xg_against_avg_overall) + NUMBERSIDEDOT)
        });

        d3.select("#scored").on("click", (event, d) => {
            d3.select("#goalFilterCircleLabel").text("Goals Scored")
            d3.select("#xGFilterCircleLabel").text("Expected Goals Scored")
            d3.select("#difference").attr("class", "button")
            d3.select("#conceded").attr("class", "button")
            d3.select("#scored").attr("class", "buttonactive")
            containerXDifference.attr("visibility", "hidden")
            containerX.attr("visibility", "visible")
            goalDots = d3.selectAll(`[id*="goalDot"]`)
            goalDots.attr("cx", d => WIDTHTABLE + axisXScale(d.goals_scored)).style("fill", d => colorScale((d.goals_scored / d.matches_played) - d.xg_for_avg_overall))
            xGDots = d3.selectAll(`[id*="xGDot"]`)
            xGDots.attr("cx", d => WIDTHTABLE + axisXScale(d.matches_played * d.xg_for_avg_overall))
            goalLabelDots = d3.selectAll(`[id*="goalLabelDot"]`)
            goalLabelDots.text(d => d.goals_scored).attr("x", d => d.goals_scored > (d.matches_played * d.xg_for_avg_overall) ? WIDTHTABLE + axisXScale(d.goals_scored) + NUMBERSIDEDOT : WIDTHTABLE + axisXScale(d.goals_scored) - NUMBERSIDEDOT)
            xGLabelDots = d3.selectAll(`[id*="xGLabelDot"]`)
            xGLabelDots.text(d => (d.matches_played * d.xg_for_avg_overall).toFixed(1)).attr("x", d => d.goals_scored > (d.matches_played * d.xg_for_avg_overall) ? WIDTHTABLE + axisXScale(d.matches_played * d.xg_for_avg_overall) - NUMBERSIDEDOT: WIDTHTABLE + axisXScale(d.matches_played * d.xg_for_avg_overall) + NUMBERSIDEDOT)
        });

        d3.select("#difference").on("click", (event, d) => {
            d3.select("#goalFilterCircleLabel").text("Goal Difference")
            d3.select("#xGFilterCircleLabel").text("Expected Goal Difference")
            d3.select("#scored").attr("class", "button")
            d3.select("#conceded").attr("class", "button")
            d3.select("#difference").attr("class", "buttonactive")
            containerX.attr("visibility", "hidden")
            containerXDifference.attr("visibility", "visible")
            console.log(xGDifferenceGoalDifference);
            goalDots = d3.selectAll(`[id*="goalDot"]`)
            goalDots.attr("cx", d => WIDTHTABLE + axisXDifferenceScale(d.goals_scored - d.goals_conceded)).style("fill", d => colorScaleDifference((d.goals_scored - d.goals_conceded) - (d.xg_for_avg_overall - d.xg_against_avg_overall) * d.matches_played))
            xGDots = d3.selectAll(`[id*="xGDot"]`)
            xGDots.attr("cx", d => WIDTHTABLE + axisXDifferenceScale(d.matches_played * (d.xg_for_avg_overall- d.xg_against_avg_overall)))
            goalLabelDots = d3.selectAll(`[id*="goalLabelDot"]`)
            goalLabelDots.text(d => (d.goals_scored - d.goals_conceded)).attr("x", d => (d.goals_scored - d.goals_conceded) > (d.matches_played * (d.xg_for_avg_overall - d.xg_against_avg_overall)) ? WIDTHTABLE + axisXDifferenceScale(d.goals_scored - d.goals_conceded) + NUMBERSIDEDOT : WIDTHTABLE + axisXDifferenceScale(d.goals_scored - d.goals_conceded) - NUMBERSIDEDOT)
            xGLabelDots = d3.selectAll(`[id*="xGLabelDot"]`)
            xGLabelDots.text(d => (d.matches_played * (d.xg_for_avg_overall - d.xg_against_avg_overall)).toFixed(1)).attr("x", d => (d.goals_scored - d.goals_conceded) > (d.matches_played * (d.xg_for_avg_overall - d.xg_against_avg_overall)) ? WIDTHTABLE + axisXDifferenceScale(d.matches_played * (d.xg_for_avg_overall - d.xg_against_avg_overall)) - NUMBERSIDEDOT: WIDTHTABLE + axisXDifferenceScale(d.matches_played * (d.xg_for_avg_overall - d.xg_against_avg_overall)) + NUMBERSIDEDOT)
        });

        d3.select("#xGFilterCircle").on("click", (event, d) => {
            console.log(d);
            if (xGFilterCircle) {
                d3.select("#xGFilterCircle").attr("r", RADIUS).attr("stroke.width", 1).attr("opacity", "0.3")
                d3.select("#xGFilterCircleLabel").attr("opacity", "0.3")
                d3.selectAll(`[id*="xGDot"]`).attr("visibility", "hidden");
                d3.selectAll(`[id*="xGLabelDot"]`).attr("visibility", "hidden");
                xGFilterCircle = false
            } else {
                d3.select("#xGFilterCircle").attr("r", BIGRADIUS).attr("stroke.width", 2.5).attr("opacity", "1")
                d3.select("#xGFilterCircleLabel").attr("opacity", "1")
                d3.selectAll(`[id*="xGDot"]`).attr("visibility", "visible")
                xGFilterCircle = true
            }
        });

        d3.select("#goalFilterCircle").on("click", (event, d) => {
            if (goalFilterCircle) {
                d3.select("#goalFilterCircle").attr("r", RADIUS).attr("stroke.width", 1).attr("opacity", "0.3")
                d3.select("#goalFilterCircleLabel").attr("r", RADIUS).attr("stroke.width", 1).attr("opacity", "0.3")
                d3.selectAll(`[id*="goalDot"]`).attr("visibility", "hidden")
                d3.selectAll(`[id*="goalLabelDot"]`).attr("visibility", "hidden")
                goalFilterCircle = false
            } else {
                d3.select("#goalFilterCircle").attr("r", BIGRADIUS).attr("stroke.width", 2.5).attr("opacity", "1")
                d3.select("#goalFilterCircleLabel").attr("r", RADIUS).attr("stroke.width", 1).attr("opacity", "1")
                d3.selectAll(`[id*="goalDot"]`).attr("visibility", "visible")
                goalFilterCircle = true
            }
        });
};


