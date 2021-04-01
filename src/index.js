/**
 * Main entry point -- this file has been added to index.html in a <script> tag. Add whatever imports and code you
 * want below.  For a detailed explanation of JS modules, see
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
 */
import * as d3 from "d3";
import * as topojson from "topojson";
import { sliderBottom } from 'd3-simple-slider';
import { easeLinear } from "d3";


//https://github.com/topojson/us-atlas#states-albers-10m.json
const padding = {top: 10, left: 100, right: 10, bottom: 80}
const svgWidth = 975;
const svgHeight = 680;
const height = svgHeight - padding.top - padding.bottom;
const width = svgWidth - padding.right - padding.left;

window.addEventListener("load", drawCircles);
const svg = d3.select(".map")
.attr('width', svgWidth)
.attr('height', svgHeight);


  // Define path generator
const path = d3.geoPath() // path generator that will convert GeoJSON to SVG paths
const parseTime = d3.timeParse('%Y-%m-%d');

function drawCircles() {

    d3.csv("social-capital-states.csv").then(function(data) {

      data.forEach(function (d, i) {
        // console.log(i)
        d.State_Level_Index = parseFloat(d.State_Level_Index);
        d.rank_percentage = i/50.00;
        // rank out of 50 states plus DC = 51
        d.rank = i+1;
      })

      const index_range = d3.extent(data.map(d => d.State_Level_Index))
      // const color = d3.scaleOrdinal().domain(index_range).range(["#E4E5A6", "#91E38E", "#36ADAB", "#0066ff", "#000099"])
      const color = d3.scaleQuantize().domain(index_range).range(["#000099", "#0066ff", "#36ADAB", "#91E38E", "#E4E5A6"])

      const legend_color = ["#000099", "#0066ff", "#36ADAB", "#91E38E", "#E4E5A6"];
      d3.json("states-albers-10m.json").then(function(us) {
        var feat = topojson.feature(us, us.objects.states).features;


        // https://bl.ocks.org/wboykinm/dbbe50d1023f90d4e241712395c27fb3
        for (var i = 0; i < data.length; i++) {

          const dataState = data[i].State;
          const dataValue = parseFloat(data[i].State_Level_Index);

          const dat = feat.find(d => d.properties.name == dataState);
          dat.properties.social_index = dataValue;
          // for (var j = 0; j < feat.length; j++)  {
          //   const jsonState = feat[j].properties.name;

          //   if (dataState == jsonState) {
          //   feat[j].properties.social_index = dataValue;
          //   break;
          //   }
          // }
        }
        d3.json("covid_cases_states.json").then(function(cov_data) {

          cov_data.forEach(function(d,i) {
            d.date = parseTime(d.date);
            d.states = d.states;

            for (var i = 0; i < d.states.length; i++) {
              const dataState = d.states[i].state;
              const dat = feat.find(d => d.properties.name == dataState);
              d.states[i].centroid = path.centroid(dat)

            }
          });
        // https://observablehq.com/@d3/state-choropleth
      //   svg.append("g")
      //   .attr('transform', "translate(0,70)")
      //   .selectAll("path")
      //   .data(topojson.feature(us, us.objects.states).features)
      //   .join("path")
      //   .attr("fill",d => color(d.properties.social_index))
      //   .attr("d", path)
      //   // .on("mouseover", (mouseEvent, d)=>{
      //   //   d3.select('.tooltip').attr("fill","black")})
      //   .on("mouseover", (mouseEvent, d) => {
      //     // Runs when the mouse enters a rect.  d is the corresponding data point.
      //     // Show the tooltip and adjust its text to say the temperature.
      //     d3.select(".tooltip").text(d).attr("style","opacity:20");
      // })
      //   .on("mousemove", (mouseEvent, d) => {/* Runs when mouse moves inside a rect */
      //   d3.select(".tooltip")
      //     .style("left", d3.pointer(mouseEvent)[0]-60 + 'px')
      //     .style("top", d3.pointer(mouseEvent)[1] -60+'px').attr("data-html", "true")
      //     .html("<b>"+d.properties.name+"</b> <br/>"
      //     +"SCI :"+d.properties.social_index
      //     +"<br/> SCI Rank: "+data.find(da => da.State == d.properties.name).rank
      //     +"<br/> Covid Rate: ")})
      //     .on("mouseout", (mouseEvent, d) => {/* Runs when mouse exits a rect */
      //       d3.select(".tooltip").attr("style","opacity:0")});





      //   svg.append("path")
      //     .attr('transform', "translate(0,70)")
      //     .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
      //     .attr("fill", "none")
      //     .attr("stroke", "white")
      //     .attr("stroke-linejoin", "round")
      //     .attr("d", path)



          // d3.json("covid_cases_states.json").then(function(cov_data) {

          //   cov_data.forEach(function(d,i) {
          //     d.date = parseTime(d.date);
          //     d.states = d.states;

          //     for (var i = 0; i < d.states.length; i++) {
          //       const dataState = d.states[i].state;
          //       const dat = feat.find(d => d.properties.name == dataState);
          //       d.states[i].centroid = path.centroid(dat)

          //     }
          //   });
          // time slider
          // https://www.npmjs.com/package/d3-simple-slider
          // turning string into datetime
          const slider = sliderBottom().tickFormat(d3.timeFormat('%m/%d/%y'))
          .min(parseTime('2020-01-21')).max(parseTime('2021-03-22')).width(900)
          .on("onchange", (val) => {
            svg.selectAll('.spike_map').remove();
            update_spikes(val)
          });

        const time_slider = d3.select(".time-slider")
          .append('svg')
          .attr('width', 1000)
          .attr('height', 70)
          .append('g')
          .attr('transform', 'translate(30,30)')

          time_slider.call(slider);

        //playButton for animating the visualization
        const playButton = d3.select(".play-button");
        var timerID = undefined;

        //pauses the animation and changes the button text and color
        function pauseAnimation() {
          clearInterval(timerID);
          playButton.text("▶️ Play");
          playButton.style("background-color", "#77DD77");
        }

        playButton.on("click", function() {
          if (d3.select(this).text() == "▶️ Play") {
            //change text and styling to indicate that the user can pause if desired
            d3.select(this).text("⏸Pause");
            d3.select(this).style("background-color", "#FF6961");

            //begin animation
            timerID = setInterval(animate, 50);
          } else {
            pauseAnimation();
          }
        })

        function animate() {
          if (slider.value() >= slider.max()) {
            //pause automatically because we have reached the end of the time series
            pauseAnimation();
          } else {
            //increment value of slider by 1 day to render the next day
            var date = slider.value();
            date.setDate(date.getDate() + 1);
            slider.value(date);
          }
        }

        // covid cases spike map
          function update_spikes(date) {

            const covid_data = (cov_data.find(d =>
              d.date.getMonth() == date.getMonth() &&
              d.date.getDay() == date.getDay() &&
              d.date.getYear() == date.getYear()
              ))

            // calculating centroids of each state for spike location and adding
            // to covid data

            const states = covid_data.states;
            // [0, d3.max(covid_data.states, d => d.covid_rate)]
            const length = d3.scaleLinear().domain(d3.extent(covid_data.states, d => d.covid_rate))
              .range([0,150]);

            function spike(length, width=7) {
              return `M${-width / 2},0L0,${-length}L${width / 2},0`
            }

            //legend detailing what the sizes of the spikes mean
            //remove old legend
            svg.select("g.spike_legend").remove();

            //calculate min and max covid rate
            const extent = d3.extent(covid_data.states, d => d.covid_rate);
            const min_rate = extent[0];
            const max_rate = extent[1];

            const spike_legend = svg.append("g")
                .attr("transform", "translate(850,200)")
                .attr("class", "spike_legend");

            if (min_rate == max_rate) {
              spike_legend.append('path')
              .attr('transform', "translate(" + 50 + ",300)")
              .attr('fill', 'red')
              .attr('fill-opacity', 0.6)
              .attr('stroke', 'red')
              .attr('d', spike(75));

              var covid_rate_num = parseFloat(min_rate.toPrecision(2))

              if (covid_rate_num < 0.0001) {
                covid_rate_num = covid_rate_num.toExponential();
              }

              spike_legend.append("text")
              .attr("x", 50 + 13)
              .attr("y", 315)
              .style("text-anchor", "end")
              .text(covid_rate_num)
              .attr('fill', 'black');
            } else {
              for (var i = 1; i <= 3; i++) {
                spike_legend.append('path')
                .attr('transform', "translate(" + (i - 1) * 50 + ",300)")
                .attr('fill', 'red')
                .attr('fill-opacity', 0.6)
                .attr('stroke', 'red')
                .attr('d', spike(50 * i));

                var covid_rate_num = parseFloat((min_rate + (max_rate - min_rate) * (i / 3.0)).toPrecision(2))

                if (covid_rate_num < 0.0001) {
                  covid_rate_num = covid_rate_num.toExponential();
                }

                spike_legend.append("text")
                .attr("x", (i - 1) * 50 + 13)
                .attr("y", 315)
                .style("text-anchor", "end")
                .text(covid_rate_num)
                .attr('fill', 'black');
              }
            }

            spike_legend.append("text")
            .attr("x", 125)
            .attr("y", 335)
            .style("text-anchor", "end")
            .text("Cumulative cases / population")
            .attr('fill', 'black');


            const spikes_g = svg.append('g')
            .attr('transform', "translate(0,70)")
            .attr('class', 'spike_map')

            spikes_g.selectAll('path')
            .attr('transform', "translate(0,70)")
            .data(covid_data.states)
            .join(
              enter => {
                const ll = enter.append('path')
                .attr('transform', "translate(0,70)")

                .attr('fill', 'red')
                .attr('fill-opacity', 0.6)
                .attr('stroke', 'red')
                .attr('d', (d) => {
                  if (d.centroid) {
                    return spike(length(d.covid_rate));
                  }
                })
                .attr('transform', (d) => {
                  if (!isNaN(d.centroid[0]) && !isNaN(d.centroid[1])) {
                    return `translate(${d.centroid})`
                  }
                  return `translate(0,-80)`
                })
              },
              update => update,
              exit => {
                exit.transition().duration(1000).ease(easeLinear)
                .attr('d', (d) => {
                  if (d.centroid) {
                    return spike(length(d.covid_rate))
                  }
                })
                .remove()
              }
            )
          }
          svg.append("g")
        .attr('transform', "translate(0,70)")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        .join("path")
        .attr("fill",d => color(d.properties.social_index))
        .attr("d", path)
        // .on("mouseover", (mouseEvent, d)=>{
        //   d3.select('.tooltip').attr("fill","black")})
        .on("mouseover", (mouseEvent, d) => {
          // console.log(slider.value())
          // Runs when the mouse enters a rect.  d is the corresponding data point.
          // Show the tooltip and adjust its text to say the temperature.
          d3.select(".tooltip").text(d).attr("style","opacity:20");
      })
        .on("mousemove", (mouseEvent, d) => {
          var sname = d.properties.name
          var date = slider.value()
          var covid_date = cov_data.find(d =>
            d.date.getMonth() == date.getMonth() &&
            d.date.getDay() == date.getDay() &&
            d.date.getYear() == date.getYear()
            )
          var state = covid_date.states.find(d=>d.state == sname)
          // console.log(cov_data)
          var rate = 0
          var cases = 0
          if(state){
            rate = parseFloat(state.covid_rate).toFixed(3)*100
            cases = state.cases
          }
          
          d3.select(".tooltip")
          .style("left", d3.pointer(mouseEvent)[0]-60 + 'px')
          .style("top", d3.pointer(mouseEvent)[1] -60+'px').attr("data-html", "true")
          .html("<b>"+d.properties.name+"</b> <br/>"
          +"SCI:"+d.properties.social_index
          +"<br/> ranks <b>"+data.find(da => da.State == d.properties.name).rank + "</b> out of 50 states and DC"
          +"<br/> Covid Rate: "+rate+"%"
          +"<br/> Covid Cases: "+cases)})
          .on("mouseout", (mouseEvent, d) => {/* Runs when mouse exits a rect */
            d3.select(".tooltip").attr("style","opacity:0")});


        svg.append("path")
          .attr('transform', "translate(0,70)")
          .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
          .attr("fill", "none")
          .attr("stroke", "white")
          .attr("stroke-linejoin", "round")
          .attr("d", path)
          });
      });

        // legend code found here: http://bl.ocks.org/dougdowson/9832019
        const legend = svg.append("g")
		        .attr("id", "legend")
            .attr('transform', "translate(-200,80)");

        const legenditem = legend.selectAll(".legenditem")
        .data(d3.range(5))
        .enter()
        .append("g")
        .attr("class", "legenditem")
        .attr("transform", function(d, i) { return "translate(" + i * 31 + ",0)"; });

        legenditem.append("rect")
        .attr("x", width - 240)
        .attr("y", -7)
        .attr("width", 30)
        .attr("height", 8)
        .attr("class", "rect")
        .style("fill", function(d, i) { return legend_color[i]; });

        legend.append("text")
        .attr("x", width - 243)
        .attr("y", 0)
        .style("text-anchor", "end")
        .text("Lowest SCI (-2.15)")
        .attr('fill', 'black');

        legend.append("text")
        .attr("x", width+8)
        .attr("y", 0)
        .style("text-anchor", "end")
        .text("Highest SCI (2.08)")
        .attr('fill', 'black')
  });
}
