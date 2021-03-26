/**
 * Main entry point -- this file has been added to index.html in a <script> tag. Add whatever imports and code you
 * want below.  For a detailed explanation of JS modules, see
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
 */
import * as d3 from "d3";
import * as topojson from "topojson";
import { sliderBottom } from 'd3-simple-slider';


//https://github.com/topojson/us-atlas#states-albers-10m.json
const padding = {top: 10, left: 100, right: 10, bottom: 80}
const svgWidth = 975;
const svgHeight = 630;
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
          
          for (var j = 0; j < feat.length; j++)  {
            const jsonState = feat[j].properties.name;

            if (dataState == jsonState) {
            feat[j].properties.social_index = dataValue; 
            break;
            }
          }
        }

        // https://observablehq.com/@d3/state-choropleth
        svg.append("g")
        .attr('transform', "translate(0,30)")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        .join("path")
        .attr("fill",d => color(d.properties.social_index))
        .attr("d", path)


        svg.append("path")
          .attr('transform', "translate(0,30)")
          .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
          .attr("fill", "none")
          .attr("stroke", "white")
          .attr("stroke-linejoin", "round")
          .attr("d", path);


          d3.json("covid_cases_states.json").then(function(data) {
  
            data.forEach(function(d,i) {
              d.date = parseTime(d.date);
              d.states = d.states;
            });
      
          // time slider 
          // https://www.npmjs.com/package/d3-simple-slider
          // turning string into datetime 
          const slider = sliderBottom().tickFormat(d3.timeFormat('%m/%d/%y'))
          .min(parseTime('2020-01-21')).max(parseTime('2021-03-22')).width(900)
          .on("onchange", (val) => {
            update_spikes(val)
          });
        
        
        const time_slider = d3.select(".time-slider")
          .append('svg')
          .attr('width', 1000)
          .attr('height', 70)
          .append('g')
          .attr('transform', 'translate(30,30)')
        
          time_slider.call(slider);
      
        // covid cases spike map 
          function update_spikes(date) {
      
            const covid_data = (data.find(d => 
              d.date.getMonth() == date.getMonth() &&
              d.date.getDay() == date.getDay() &&
              d.date.getYear() == date.getYear()
              ))

            // calculating centroids of each state for spike location and adding
            // to covid data 

            const states = covid_data.states;
            for (var i = 0; i < states.length; i++) {
              const dataState = states[i].state;
              
              for (var j = 0; j < feat.length; j++)  {
                const jsonState = feat[j].properties.name;
    
                if (dataState == jsonState) {
                  states[i].centroid = path.centroid(feat[j]); 
                  break;
                }
              }
            }
            const length = d3.scaleLinear().domain([0, d3.max(covid_data.states, d => d.cases)])
              .range([0,150]);

            function spike(length, width=5) {
              return `M${-width / 2},0L0,${-length}L${width / 2},0`
            }
        
            svg.append('g')
            .attr('transform', "translate(0,30)")

              .attr('fill', 'red')
              .attr('fill-opacity', 0.3)
              .attr('stroke', 'red')
              .selectAll('path')
              .data(covid_data.states)
              .join('path')
              .attr('d', d => spike(length(d.cases)))
              .attr('transform', (d) => {
                if (d.centroid) {
                  return `translate(${d.centroid})`
                } 
              })     
            }
          });

        });

        // legend code found here: http://bl.ocks.org/dougdowson/9832019
        const legend = svg.append("g")
		        .attr("id", "legend")
            .attr('transform', "translate(-200,10)");

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
        .attr('fill', 'black');

  });
    
    
}
