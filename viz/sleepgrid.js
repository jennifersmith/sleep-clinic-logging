


function draw(){


// also offsets so midnight is 0, noon -12
    var hourOfDayAsDecimal = function (d){
        d.fromHour = (d.from - d.fromDay) / (60 * 60 * 1000);
        d.toHour = (d.to - d.fromDay) / (60 * 60 * 1000);
        return d;
    }

    d3.json("/data/sleepwake.json",
            function(error, data) {
                var margin = { top: 50, right: 50, bottom: 100, left: 100 },
                width = 1200 - margin.left - margin.right,
                height = 3500 - margin.top - margin.bottom;
                
                var timesScale = d3.scale.ordinal().domain(d3.range(12,24).concat(d3.range(0,12))).rangeBands([0, width]);
                timesScale = d3.scale.linear().domain([0,24]).range([0, width-margin.right]);

                var data = data.map(function(d,i){
                    d.i = i;
                    d.from = new Date(d.from);
                    d.to = new Date(d.to);
                    
                    d.fromDay = d3.time.hour.offset( d3.time.day.floor(d.from), -12);
                    d.toDay =  d3.time.hour.offset( d3.time.day.floor(d.to), -12);
                    d.fromAfterNoon = d.from> d3.time.hour.offset(d3.time.day.floor(d.from), 12);
                    d.toAfterNoon = d.to> d3.time.hour.offset(d3.time.day.floor(d.to), 12);
                    if (d.fromAfterNoon){
                        d.fromDay =  d3.time.hour.offset(d.fromDay,24);
                    }
                    if (d.toAfterNoon){
                        d.toDay =  d3.time.hour.offset(d.toDay,24);
                    }



                    if ( d.fromDay < d.toDay){
                        var firstPart = Object.create(d);
                        var secondPart = Object.create(d);
                        secondPart.fromDay =  secondPart.toDay;
                        secondPart.from = secondPart.toDay;

                        firstPart.to = d.toDay;
                        
                        return [firstPart, secondPart];
                    }
                    else{
                            return [d];
                    }

                });
                data = [].concat.apply([],data).map(hourOfDayAsDecimal); 
                var dateRange = d3.extent(data,function(d){return d.toDay});
                var dayRange = d3.time.hours(dateRange[0], dateRange[1], 12);
                dayRange = dayRange.filter(function(d,i){return !(i%2);});

window.dayRange = dayRange;
window.data = data;
                var daysScale = d3.scale.ordinal().domain(dayRange).rangeBands([0, height]);                
                
                

                var drawCanvas = function(){
                    var svg = d3.select("#chart").append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                    return svg;
                }
                
                var drawAxes = function(svg){
                    var yAxis = d3.svg.axis()
                        .orient("left")
                        .tickFormat(d3.time.format("%Y-%m-%d"))
                        .scale(daysScale);
                    svg.append("g")
                        .attr("class", "yaxis")
                        .call(yAxis);
                    
                    var xAxis = d3.svg.axis()
                        .orient("top")
                        .scale(timesScale)
                        .tickFormat(function(x) { return  (x + 12) %24+ ":00"})

                    window.xScale = timesScale;
                        
                    svg.append("g")
                        .attr("class", "xaxis")
                        .call(xAxis);
                    
                }

                var drawGrid = function(svg){
                     var xAxis = d3.svg.axis()
                        .orient("top")
                        .scale(timesScale)
                        .tickFormat(function(x) { return (x + 24) %24})

                    var xAxisGrid = xAxis.ticks(24, 1)
                        .tickSize(height, 0)
                        .tickFormat("")
                        .orient("bottom");
                    
                    svg.selectAll(".yGrid")
                        .data(daysScale.range())
                        .enter().append("rect")
                        .attr("x", 0)
                        .attr("y", function(d){ return d})
                        .attr("width", width-50)  // not sure what 50 is for. should prob find out
                        .style("stroke", "green")
                        .style("fill", "oldLace")
                        .attr("height", 20);

                    svg.append("g")
                        .classed('x', true)
                        .classed('grid', true)
                        .style("stroke", "green")
                        .call(xAxisGrid);
                    


                    };
                var drawData = function(svg){

                    svg.selectAll(".sleepWakeData")
                        .data(data)
                        .enter().append("rect")
                        .attr("y", function(d){
                            return daysScale(d.fromDay);})
                        .attr("x", function(d) { return timesScale(d.fromHour);})
                        .attr("width", function(d) { 
                            return timesScale(d.toHour -d.fromHour);}) 
                        .attr("height",daysScale.rangeBand()) 
                        .style("stroke", "green")
                        .style("fill", "pink")
                        .attr("height", 20);
                    svg.selectAll(".sleepWakeDataLabels")
                        .data(data)
                        .enter().append("text")
                        .attr("y", function(d){
                            return (daysScale(d.fromDay)|0) + 14.5;})
                        .attr("x", function(d) { return timesScale(d.fromHour);})
                        .attr("height",daysScale.rangeBand()) 
                        .style("stroke", "green")
                        .style("fill", "pink")
                        .attr("height", 20)
                        .text(function(d){return d.state +  " " +  d.i;});

                    var oneData = data[15];
window.daysScale = daysScale;

                    window.oneData = oneData;
                }
                var svg = drawCanvas();
                drawAxes(svg);
                drawGrid(svg);

                drawData(svg);
    });
    var drawCrap = function (){
      var margin = { top: 50, right: 0, bottom: 100, left: 100 },
          width = 1200 - margin.left - margin.right,
          height = 3500 - margin.top - margin.bottom,
          gridSize = Math.floor(width / 24),
          legendElementWidth = gridSize*2,
          buckets = 9,
          colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
          days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
          times = ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"];
          timesScale = d3.scale.ordinal().domain(d3.range(12,24).concat(d3.range(0,12))).rangeBands([0, width]);
          daysScale = d3.scale.ordinal().domain(d3.range(0,20)).rangeBands([0, height]);

      d3.json("/data/sleepwake.json",
        function(error, data) {
          var colorScale = d3.scale.quantile()
              .domain([0, buckets - 1, d3.max(data, function (d) { return d.value; })])
              .range(colors);

          var svg = d3.select("#chart").append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



      var xAxis = d3.svg.axis()
      .orient("top")
      .scale(timesScale);
      svg.append("g")
      .attr("class", "xaxis")
            .call(xAxis);


      var dateRange = d3.extent(data,function(x){return  Date.parse(x.from)});


      var yScale = d3.time.scale().range([0,height]).domain(dateRange);
window.yScale = yScale

      var yAxis = d3.svg.axis()
      .orient("left")
      .scale(yScale)
      .ticks(d3.time.days, 1)
      .tickFormat(d3.time.format("%Y-%m-%d"));

      svg.append("g")
      .attr("class", "yaxis")
      .call(yAxis);


var numberOfTicks = data.length;

var yAxisGrid = yAxis.ticks(d3.time.days, 1)
    .tickSize(width, 0)
    .tickFormat("")
    .orient("right");


svg.append("g")
    .classed('y', true)
    .classed('grid', true)
    .style("stroke", "black")
    .attr("transform", "translate(0,6)")
    .call(yAxisGrid);


return;
      


      svg.selectAll(".xGrid")
      .data(timesScale.range())
      .enter().append("rect")
      .attr("y", 0)
      .attr("x", function(d){ return d})
      .attr("width", timesScale.rangeBand())
      .style("fill-opacity", function(d,i){ return (i % 2) == 0 ? "0.02" : "0.9";;} )
      .style("fill", "oldLace")
      .attr("height", height)

      svg.selectAll(".yGrid")
      .data(yScale.range())
      .enter().append("rect")
      .attr("x", 0)
      .attr("y", function(d){ return d})
      .attr("width", width)
      .style("stroke", "green")
      .style("fill", "none")
      .attr("height", 20);






                                                                         return;

          var dayLabels = svg.selectAll(".dayLabel")
              .data(days)
              .enter().append("text")
                .text(function (d) { return d; })
                .attr("x", 0)
                .attr("y", function (d, i) { return i * gridSize; })
                .style("text-anchor", "end")
                .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
                .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });


          var timeLabels = svg.selectAll(".timeLabel")
              .data(times)
              .enter().append("text")
                .text(function(d) { return d; })
                .attr("x", function(d, i) { return i * gridSize; })
                .attr("y", 0)
                .style("text-anchor", "middle")
                .attr("transform", "translate(" + gridSize / 2 + ", -6)")
                .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

          var heatMap = svg.selectAll(".hour")
              .data(data)
              .enter().append("rect")
              .attr("x", function(d) { return (d.hour - 1) * gridSize; })
              .attr("y", function(d) { return (d.day - 1) * gridSize; })
              .attr("rx", 4)
              .attr("ry", 4)
              .attr("class", "hour bordered")
              .attr("width", gridSize)
              .attr("height", gridSize)
              .style("fill", colors[0]);

          heatMap.transition().duration(1000)
              .style("fill", function(d) { return colorScale(d.value); });

          heatMap.append("title").text(function(d) { return d.value; });
              
          var legend = svg.selectAll(".legend")
              .data([0].concat(colorScale.quantiles()), function(d) { return d; })
              .enter().append("g")
              .attr("class", "legend");

          legend.append("rect")
            .attr("x", function(d, i) { return legendElementWidth * i; })
            .attr("y", height)
            .attr("width", legendElementWidth)
            .attr("height", gridSize / 2)
            .style("fill", function(d, i) { return colors[i]; });

          legend.append("text")
            .attr("class", "mono")
            .text(function(d) { return "≥ " + Math.round(d); })
            .attr("x", function(d, i) { return legendElementWidth * i; })
            .attr("y", height + gridSize);
      });
        };
}
