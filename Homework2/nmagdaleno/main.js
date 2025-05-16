let numberFilter = 1; //CHECK IF SHOULD CHANGE NUMBER
const width = window.innerWidth;
const height = window.innerHeight;

let scatterLeft = 0, scatterTop = 400;
let scatterMargin = {top: 400, right: 30, bottom: 30, left: 75},
    scatterWidth = width - scatterMargin.left - scatterMargin.right,
    scatterHeight = height - 25 - scatterMargin.top - scatterMargin.bottom; //450

let barLeft = 0, barTop = 10;
let barMargin = {top: 10, right: 30, bottom: 100, left: 80}, //10, 30, 450, 75
    barWidth = width/2 - barMargin.left - barMargin.right, //500
    barHeight = height/2 - barMargin.top - barMargin.bottom; //350

let distrLeft = barWidth + 100, distrTop = 20; //475
let distrMargin = {top: 15, right: 15, bottom: 100, left: 15},
    distrWidth = width/2 - distrMargin.left - distrMargin.right,
    distrHeight = height/2 - distrMargin.top - distrMargin.bottom;

// Plots
d3.csv("./data/pokemon_alopez247.csv").then(rawData =>{ 
    //Processing Data
    console.log("rawData", rawData);

    //Processing ints and floats
    rawData.forEach(function(d){
        d.Number = Number(d.Number);
        d.Total = Number(d.Total);
        d.HP = Number(d.HP);
        d.Attack = Number(d.Attack);
        d.Defense = Number(d.Defense);
        d.Sp_Atk = Number(d.Sp_Atk);
        d.Sp_Def = Number(d.Sp_Def);
        d.Speed = Number(d.Speed);
        d.Generation = Number(d.Generation);
        d.Pr_Male = Number(d.Pr_Male);
        d.Height_m = Number(d.Height_m);
        d.Weight_kg = Number(d.Weight_kg);
        d.Catch_Rate = Number(d.Catch_Rate);
    });

    const filteredData = rawData.filter(d=>d.Number>numberFilter); //numberFilter is function here
    const processedData = filteredData.map(d=>{
                          return {
                            //Color
                            "Generation": d.Generation,

                            //Bar Chart
                            "Type_1":d.Type_1,
                              
                            //Scatter Plot
                            "Total":d.Total,
                            "Speed":d.Speed,

                            //Parallel Coordinates
                            //Will just focus on stats, Total and Speed already accounted for
                            "HP":d.HP,
                            "Attack": d.Attack,
                            "Defense":d.Defense,
                            "Sp_Atk": d.Sp_Atk,
                            "Sp_Def": d.Sp_Def,
                          };
    });
    console.log("processedData", processedData);   

    //Creating svg element
    const svg = d3.select("svg");


    //Plot 1: Bar Chart for the Primary Type
    //The bar chart is able to show the amount of each Pokemon with a Primary Type, it gives the idea of how much there are for each one, along with easy comparision between the amounts

    //Processing data and amount for Primary Types
    const primaryTypeCounts = processedData.reduce((s, { Type_1 }) => (s[Type_1] = (s[Type_1] || 0) + 1, s), {});
    const primaryTypeData = Object.keys(primaryTypeCounts).map((key) => ({ Type_1: key, count: primaryTypeCounts[key] }));
    console.log("primaryTypeData", primaryTypeData);

    //Creating Bar Chart
    const barChart = svg.append("g")
                .attr("width", barWidth + barMargin.left + barMargin.right)
                .attr("height", barHeight + barMargin.top + barMargin.bottom)
                .attr("transform", `translate(${barMargin.left}, ${barTop})`);

    // X label
    barChart.append("text")
    .attr("x", barWidth / 2)
    .attr("y", barHeight + 55)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Primary Type");


    // Y label
    barChart.append("text")
    .attr("x", -(barHeight / 2))
    .attr("y", -40)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Number of Pokemon");

    // X ticks
    const x2 = d3.scaleBand()
    .domain(primaryTypeData.map(d => d.Type_1))
    .range([0, barWidth])
    .paddingInner(0.3)
    .paddingOuter(0.2);

    const xAxisCall2 = d3.axisBottom(x2);
    barChart.append("g")
    .attr("transform", `translate(0, ${barHeight})`)
    .call(xAxisCall2)
    .selectAll("text")
        .attr("y", "10")
        .attr("x", "-5")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40)");

    // Y ticks
    const y2 = d3.scaleLinear()
    .domain([0, d3.max(primaryTypeData, d => d.count)])
    .range([barHeight, 0])
    .nice();

    const yAxisCall2 = d3.axisLeft(y2)
                        .ticks(7);
    barChart.append("g").call(yAxisCall2);

    // Bars
    const bars = barChart.selectAll("rect").data(primaryTypeData);

    bars.enter().append("rect")
    .attr("y", d => y2(d.count))
    .attr("x", d => x2(d.Type_1))
    .attr("width", x2.bandwidth())
    .attr("height", d => barHeight - y2(d.count))
    .attr("fill", "steelblue");



    //Plot 2: Scatter Plot Between the Total Stats and the Speed Stat
    //A scatter plot was chosen as I believed it would easily show a relationship between a Pokemon's total stats and their speed stat.
    //Speed was chosen as the stat to be compared against due to how important it is in game.
    
    //Creating Scatter Plot
    const scatterPlot = svg.append("g")
                .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
                .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
                .attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`);

    //Color Scale
    var color = d3.scaleOrdinal()
        .domain(["1", "2", "3", "4", "5", "6" ]) //Domain is the Different Generations
        .range([ "#324BE1", "#EEEE3C", "#DE3C4B", "#65D9C7", "#189415", "#E392D8"])
    
    // X label
    scatterPlot.append("text")
    .attr("x", scatterWidth / 2)
    .attr("y", scatterHeight + 50)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Speed Stat");


    // Y label
    scatterPlot.append("text")
    .attr("x", -(scatterHeight / 2))
    .attr("y", -40)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Total Stats");

    // X ticks
    const x1 = d3.scaleLinear()
    .domain([0, d3.max(processedData, d => d.Speed)])
    .range([0, scatterWidth]);

    const xAxisCall = d3.axisBottom(x1)
                        .ticks(10);
    scatterPlot.append("g")
    .attr("transform", `translate(0, ${scatterHeight})`)
    .call(xAxisCall)
    .selectAll("text")
        .attr("y", "10")
        .attr("x", "-5")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40)");

    // Y ticks
    const y1 = d3.scaleLinear()
    .domain([0, d3.max(processedData, d => d.Total)])
    .range([scatterHeight, 0]);

    const yAxisCall = d3.axisLeft(y1)
                        .ticks(13);
    scatterPlot.append("g").call(yAxisCall);

    // circles
    const circles = scatterPlot.selectAll("circle").data(processedData);

    circles.enter().append("circle")
         .attr("cx", d => x1(d.Speed))
         .attr("cy", d => y1(d.Total))
         .attr("r", 5)
         .attr("fill", function(d){ return( color(d.Generation))});


    //Plot 3: Parallel Coordinates between Generation, Total Stats, Speed, HP, Defense, SP Atk, and SP Defense
    //Parallel Coordinates were chosen due to it's ability to show the overall trend across a variety of Pokemon Stats through the generations
    const alluvialDiagram = svg.append("g")
                .attr("width", distrWidth + distrMargin.left + distrMargin.right)
                .attr("height", distrHeight + distrMargin.top + distrMargin.bottom)
                .attr("transform", `translate(${distrLeft}, ${distrTop})`);

    //Make dimensions to be used in Parallel Coordinates
    dimensions = d3.keys(processedData[0]).filter(function(d) { 
        return (d == "Generation" 
            || d == "Total" 
            || d == "HP"
            || d == "Attack"
            || d == "Defense"
            || d == "Sp_Atk"
            || d == "Sp_Def"
            || d == "Speed"
        ) })
        //Excludes everything that won't be used in Parallel Coordinates, focus just on stats and Generation

    //Color Scale
    var generations = ["1", "2", "3", "4", "5", "6"]
    var colorScheme = [ "#324BE1", "#EEEE3C", "#DE3C4B", "#65D9C7", "#189415", "#E392D8"]

    var color = d3.scaleOrdinal()
        .domain(generations) //Domain is the Different Generations
        .range(colorScheme)

    //Draw Legend
    alluvialDiagram.append("text").attr("x", distrWidth - distrMargin.left - 10).attr("y", distrHeight/1.5 - 20).text("Legend").style("font-size", "15px").attr("alignment-baseline","middle")
    for (i in generations) {
        alluvialDiagram.append("circle").attr("cx", distrWidth - distrMargin.left - 5).attr("cy", distrHeight/1.5 + 20*i).attr("r", 6).style("fill", colorScheme[i])
        alluvialDiagram.append("text").attr("x", distrWidth - distrMargin.left + 5).attr("y", distrHeight/1.5 + 20*i).text("Gen " + generations[i]).style("font-size", "12px").attr("alignment-baseline","middle")
    }

    //Building a linear scale for each dimension
    const y3 = {}
    for (i in dimensions) {
        name = dimensions[i]
        y3[name] = d3.scaleLinear()
        .domain( d3.extent(processedData, function(d) { return + d[name]; }) )
        .range([distrHeight, 0])
        //Check name
    }

    //X Scale
    const x3 = d3.scalePoint()
        .range([0, distrWidth])
        .padding(1)
        .domain(dimensions);

    //Lines Drawn for the Rows
    function path(d) {
        return d3.line()(dimensions.map(function(p) { return [x3(p), y3[p](d[p])]; }));
    }

    //Draw Lines
    alluvialDiagram
        .selectAll("myPath")
        .data(processedData)
        .enter().append("path")
        .attr("d",  path)
        .style("fill", "none")
        .style("stroke", function(d){ return( color(d.Generation))}) //"#69b3a2"
        .style("opacity", 0.25)

    //Draw Axises
    alluvialDiagram.selectAll("myAxis")
        // For each dimension of the dataset I add a 'g' element:
        .data(dimensions).enter()
        .append("g")
        // I translate this element to its right position on the x axis
        .attr("transform", function(d) { return "translate(" + x3(d) + ")"; })
        // And I build the axis with the call function
        .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y3[d])); })
        // Add axis title
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function(d) { return d; })
        .style("fill", "black")


    }).catch(function(error){
    console.log(error);

    //Code Fragments for Parallel Coordinates from: https://d3-graph-gallery.com/graph/parallel_basic.html
    //Code Fragments for Legend from: https://d3-graph-gallery.com/graph/custom_legend.html
});