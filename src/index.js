/**
 * Main entry point -- this file has been added to index.html in a <script> tag. Add whatever imports and code you
 * want below.  For a detailed explanation of JS modules, see
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
 */
import * as d3 from "d3";
import * as geo from "d3-geo";


const padding = {top: 60, left: 80, right: 10, bottom: 40}
const svgWidth = 900;
const svgHeight = 600;
const height = svgHeight - padding.top - padding.bottom;
const width = svgWidth - padding.right - padding.left;
/*
 * Why this line? Because if this script runs before the svg exists, then nothing will happen, and d3 won't even
 * complain.  This delays drawing until the entire DOM has loaded.
 */
window.addEventListener("load", drawCircles);


// const projection = d3.geoAlbersUsa()
//   .translate([width / 2, height / 2]) // translate to center of screen
//   .scale([1000]); // scale things down so see entire US
// // Define path generator
// const path = geo.geoPath() // path generator that will convert GeoJSON to SVG paths
//   .projection(projection); // tell path generator to use albersUsa projection

// const svg = d3.select("svg")
// .attr('width', svgWidth)
// .attr('height', svgHeight);

// var map = d3.choropleth()
//     .geofile('/d3-geomap/topojson/countries/USA.json')
//     .projection(d3.geoAlbersUsa)
//     .column('2012')
//     .unitId('fips')
//     .scale(1000)
//     .legend(true);
// var map = geo.geomap()
//     .geofile('/d3-geomap/topojson/world/countries.json')
//     .draw(d3.select('#map'));

function drawCircles() {
    const indexArray = [];

    d3.csv("social-capital-states.csv", function(data) {
        // var dataArray = [];
        // console.log(data)
        // for (var d = 0; d < data.length; d++) {
        //     console.log(data[d])
        //     dataArray.push((data[d].State_Level_Index))
        // }
        // console.log(dataArray)
        // map.draw(svg.datum(data));
        // indexArray.push(data.State_Level_Index)
        // console.log(data)
        // svg.append("g")
        // .selectAll("path")
        // .data(topojson.feature(us, us.objects.states).features)
        // .join("path")
        // //   .attr("fill", d => color(data.get(d.properties.name)))
        //   .attr("d", path)
        // .append("title")
        //   .text(d => `${d.properties.name}

    });



    // svg.selectAll("circle")
    //     .data(data)
    //     .join("circle")
    //         .attr("cx", d => d.x)
    //         .attr("cy", d => d.y)
    //         .attr("r", d => d.r)
    //         .attr("fill", d => d.color);
}
