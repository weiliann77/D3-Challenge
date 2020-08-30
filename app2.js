function chart2(){
const svgWidth = 960;
const svgHeight = 500;

const margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
const svg = d3
  .select(".chart2")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
const chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
let chosenXAxis = "age";
let chosenYAxis ="smokes";
// function used for updating x-scale var upon click on axis label
function xScale(Data, chosenXAxis) {
  // create scales
  const xLinearScale = d3.scaleLinear()
    .domain([d3.min(Data, d => d[chosenXAxis]) * 0.8,
    d3.max(Data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}



// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  const bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function YrenderAxes(newYScale, yAxis) {
  const bottomAxis = d3.axisBottom(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return yAxis;
}


// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));
    
  return circlesGroup;
}

function renderText(textGroup, newXScale, chosenXAxis) {

  textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));

  return textGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  let label;

  if (chosenXAxis === "age") {
    label = "age";
  }
  if (chosenXAxis === "income") {
    label = "income";
  }
  if (chosenXAxis === "poverty") {
    label = "poverty";
  }
  const toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function (d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);
 // textGroup.call(toolTip);

  circlesGroup.on("mouseover", function (data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function (data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("Data.csv").then(function (Data, err) {
  if (err) throw err;

  // parse data
  Data.forEach(function (data) {
    data.age = +data.age
    data.healthcare = +data.healthcare;
    data.poverty = +data.poverty;
    data.income = +data.income;
    data.abbr =data.abbr;
    data.smokes =+data.smokes;
  });

  // xLinearScale function above csv import
  let xLinearScale = xScale(Data, chosenXAxis);

  // Create y scale function
  let yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(Data, d => d[chosenYAxis])])
    .range([height, 0]);

  // Create initial axis functions
  const bottomAxis = d3.axisBottom(xLinearScale);
  const leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  let xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

    let textGroup = chartGroup.selectAll("text")
    .data(Data)
    .enter()
    .append("text")
    .text(d => d.abbr)
    .attr("font-size","20px")
    .attr("text-anchor",'middle')
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]));

    let circlesGroup = chartGroup.selectAll("circle")
    .data(Data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("fill", "blue")
    .attr("opacity", ".5");


  

  const yLabelsGroup = chartGroup.append("g");
    //.attr("transform", `translate(${width / 2}, ${height + 20})`);


  // Create group for two x-axis labels
  const labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  const ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "age") // value to grab for event listener
    .classed("active", true)
    .text("Age (Median)");

  const povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "poverty") // value to grab for event listener
    .classed("inactive", true)
    .text("in Poverty %");

    const incomeLabel= labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  // append y axis
  const smokeLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("active", true)
    .text("Smoke %");


  // updateToolTip function above csv import
  circlesGroup = updateToolTip(chosenXAxis, circlesGroup);



  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      const value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(Data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis,"cx");

        textGroup = renderText(textGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

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
        if (chosenXAxis === "age") {
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
        if (chosenXAxis === "income") {
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

    
    });

 
}).catch(function (error) {
  console.log(error);
});
};
chart2();