var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 60,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select('#scatter')
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


// Default selections
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenXAxis])*0.95, d3.max(healthData, d => d[chosenXAxis])*1.1])
        .range([0, width]);

    return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(healthData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenYAxis])*0.95, d3.max(healthData, d => d[chosenYAxis])*1.1])
        .range([height, 0]);

    return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    
    return xAxis;

}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    
    return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}


// function used for updating text in circles group with new abbreviated text
function renderText(circleTextGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circleTextGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));

    return circleTextGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    
    // x-Axis labels
    if(chosenXAxis === "poverty") {
        var xLabel = "Poverty: ";
    }
    else if (chosenXAxis === "income") {
        var xLabel = "Median Income: "
    }
    else {
        var xLabel = "Age: "
    }

    // y-Axis labels
    if(chosenYAxis === "healthcare") {
        var yLabel = "Lacks Healthcare: ";
    }
    else if (chosenYAxis === "smokes") {
        var yLabel = "Smokers: "
    }
    else {
        var yLabel = "Obesity: "
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .style("background", "black")
        .style("color", "white")
        .offset([80, -60])
        .html(function(d) {
            if (chosenXAxis === "age") {
                // All y-Axis will be in % format
                // If age is chosen, no number format
                return(`${d.state}<br>${xLabel} ${d[chosenXAxis]}<br>${yLabel}${d[chosenYAxis]}%`)
            }
            // Scenario for when income is chosen, display dollar sign
            else if (chosenXAxis !== "poverty" && chosenXAxis !== "age") {
                return(`${d.state}<br>${xLabel}$${d[chosenXAxis]}<br>${yLabel}${d[chosenYAxis]}%`)
            }
            // Scanerio for when poverty is chosen, display in percentage
            else {
                return(`${d.state}<br>${xLabel}${d[chosenXAxis]}%<br>${yLabel}${d[chosenYAxis]}%`)
            }
        });

        

        circlesGroup.call(toolTip);

        // mouseon event
        circlesGroup.on("mouseover", function(data) {
            toolTip.show(data, this);
        })

        // onmouseout event
        .on("mouseout", function(data, index) {
            toolTip.hide(data)
        });

    return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(healthData) {
    // if (err) throw err;

    // parse data - i.e. all numerical data is being converted to numbers
    healthData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;
    });
    

    // var chosenXAxis = "poverty";
    // var chosenYAxis = "healthcare";

    // xLinearScale and yLinearScale function above csv import
        var xLinearScale = xScale(healthData, chosenXAxis);
        var yLinearScale = yScale(healthData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append x axis and y axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(healthData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", "15")
        .attr("fill", "pink")
        .attr("opacity", ".5");

    // Add text in each scatter point with the State abbreviation
    var circleTextGroup = chartGroup.selectAll()
        .data(healthData)
        .enter()
        .append("text")
        .text(d => (d.abbr))
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .style("font-size", "10px")
        .style("text-anchor", "middle")
        .style("fill", "black")

    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    
    var povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");

        var ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

        var incomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");

        var healthcareLabel = labelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", (margin.left*3))
        .attr("y", 0-(height +10))
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active", true)
        .text("Lacks Healthcare (%)");
    
        var smokeLabel = labelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", (margin.left *3 ))
        .attr("y", 0-(height + 30))
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokes (%)");

        var obesityLabel = labelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", (margin.left*3))
        .attr("y", 0-(height+50))
        .attr("value", "obesity") // value to grab for event listener
        .classed("inactive", true)
        .text("Obesity (%)");

        // updateToolTip function above csv import
        var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    

        // x axis labels event listener
        labelsGroup.selectAll("text")
            .on("click", function() {
                // get value of selection
                var value = d3.select(this).attr("value");

                if(true) {
                    if(value === "poverty" || value === "age" || value === "income") {
                        chosenXAxis = value;

                        // update x scale for new data
                        xLinearScale = xScale(healthData, chosenXAxis);

                        // update x axis with transition
                        xAxis = renderXAxes(xLinearScale, xAxis);

                        // update circles with new x values
                        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

                        // Update tool tips with new info
                        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                        // update state abbreviations with new values
                        circleTextGroup = renderText(circleTextGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                        
                        // changes classes to change bold text
                        if (chosenXAxis === "poverty") {
                            povertyLabel
                                .classed("active", true)
                                .classed("inactive", false);

                            ageLabel
                                .classed("active", false)
                                .classed("inactive", true);
                            
                            incomeLabel
                                .classed("active", false)
                                .classed("inactive", true);
                        }
                        else if(chosenXAxis === "age") {
                            povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);

                            ageLabel
                                .classed("active", true)
                                .classed("inactive", false);
                            
                            incomeLabel
                                .classed("active", false)
                                .classed("inactive", true);
                        }
                        else {
                            povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);

                            ageLabel
                                .classed("active", false)
                                .classed("inactive", true);
                            
                            incomeLabel
                                .classed("active", true)
                                .classed("inactive", false);
                        }
                    }

                    else {
                        chosenYAxis = value

                        // update y scale for new data
                        yLinearScale = yScale(healthData, chosenYAxis);

                        // update y axis 
                        yAxis = renderYAxes(yLinearScale, yAxis);

                        // update circles with new y values
                        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

                        // update tool tups with new info
                        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                        // update state abbreviations with new values
                        circleTextGroup = renderText(circleTextGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

                        // Change classes to bold text
                        if(chosenYAxis === "healthcare") {

                            healthcareLabel
                                .classed("active", true)
                                .classed("inactive", false);
                            
                            smokeLabel
                                .classed("active", false)
                                .classed("inactive", true);

                            obesityLabel
                                .classed("active", false)
                                .classed("inactive", true);

                        }
                        else if (chosenYAxis === "smokes") {
                            healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        
                            smokeLabel
                                .classed("active", true)
                                .classed("inactive", false);

                            obesityLabel
                                .classed("active", false)
                                .classed("inactive", true);

                        }
                        else {
                            healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        
                            smokeLabel
                                .classed("active", false)
                                .classed("inactive", true);

                            obesityLabel
                                .classed("active", true)
                                .classed("inactive", false);
                        }

                    }
                }

            });


});
