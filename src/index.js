/**
 * Main entry point -- this file has been added to index.html in a <script> tag. Add whatever imports and code you
 * want below.  For a detailed explanation of JS modules, see
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
 */
import * as d3 from "d3";
import * as topojson from "topojson";

//https://github.com/topojson/us-atlas#states-albers-10m.json
const padding = {top: 100, left: 100, right: 10, bottom: 100}
const svgWidth = 975;
const svgHeight = 610;
const height = svgHeight - padding.top - padding.bottom;
const width = svgWidth - padding.right - padding.left;

window.addEventListener("load", drawCircles);
const svg = d3.select("svg")
.attr('width', svgWidth)
.attr('height', svgHeight);


  // Define path generator
const path = d3.geoPath() // path generator that will convert GeoJSON to SVG paths

function drawCircles() {

    d3.csv("social-capital-states.csv").then(function(data) {

      data.forEach(function (d) {
        d.State_Level_Index = parseFloat(d.State_Level_Index)
      })

      const index_range = d3.extent(data.map(d => d.State_Level_Index))
      const color = d3.scaleQuantize().domain(index_range).range(["#000099", "#0066ff", "#36ADAB", "#91E38E", "#E4E5A6"])

      d3.json("states-albers-10m.json").then(function(us) {
        const feat = topojson.feature(us, us.objects.states).features;
        // https://bl.ocks.org/wboykinm/dbbe50d1023f90d4e241712395c27fb3
        for (var i = 0; i < data.length; i++) {

          var dataState = data[i].State;
          var dataValue = parseFloat(data[i].State_Level_Index);
          
          for (var j = 0; j < feat.length; j++)  {
            var jsonState = feat[j].properties.name;

            if (dataState == jsonState) {
            feat[j].properties.social_index = dataValue; 
            break;
            }
          }
        }

        // https://observablehq.com/@d3/state-choropleth
        svg.append("g")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        .join("path")
        .attr("fill",d => color(d.properties.social_index))
        .attr("d", path)


        svg.append("path")
            .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-linejoin", "round")
            .attr("d", path);

        });
    });

}
