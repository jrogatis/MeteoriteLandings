// JavaScript Document
/*jshint esversion: 6 */



const { 
	json,
	select,
	enter,
    geoMercator,
	geoPath,
	zoom,
	max,
	min,
	scaleLinear,
	scaleTime,
	timeFormat,
	timeParse,
	scaleThreshold
	
} = d3;



const url = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json";
const urlMap = "https://raw.githubusercontent.com/mbostock/topojson/master/examples/world-50m.json";

const margin = { top: 0, right: 0, bottom: 0, left:0 };

const height = 500 - margin.top - margin.bottom,
  	  width = 900 - margin.left - margin.right;
	
	const projection = geoMercator()
				.center([0, 0])
				.scale(100)
				.rotate([-180,0]);
	
	const svg = select("body").append("svg")
		.attr("width", width)
		.attr("height", height);
		
	const path = geoPath()
		.projection(projection);
		
	const g = svg.append("g");
	
	// load and display the World
	d3.json(urlMap, (error, topology) => {		
			g.selectAll("path")
				.data(topojson.object(topology, topology.objects.countries).geometries)
				.enter()
				.append("path")
				.attr("d", path);
		
			d3.json(url, (error, json) =>{
			
				const myData = json.features;
						
				
				if (error) { return console.warn(error);}
				
				const toTime = timeParse("%Y-%m-%dT%H:%M:%S.%L");
											
				myData.map((d,i) =>{
					let newTime = toTime(d.properties.year);
						newTime = timeFormat('%Y')(newTime);
						d.properties.year = newTime;
					});
	
				
				const maxMass = max(myData, d => d.properties.mass);
				const minMass = min(myData, d => d.properties.mass);
				
				
				const color = scaleThreshold()
								.domain([1000, 1100, 1200,1300, 1400,1500, 1600, 1700, 1800, 1900, 1950, 2000])
								.range(['red', 'white', 'blue', 'yellow', 'green', 'pink','brown','grey', 'purple', 'darkorange', 'wheat', '#54278f']);		
				
				
				console.log('min max mass', minMass, maxMass);
				
				const sizeDef = d3.range(1,16);
				console.log([2,3,4,5,6,7,8,9,0,10,11,12,13,14,15,16]);
				
				const sizes = d3.scaleQuantize()
								//.domain([minMass, maxMass])
								.domain([minMass, maxMass])
								.range([2,3,4,5,6,7,8,9,0,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,28,29]);				
				
				g.selectAll('circle')
					.data(myData)
					.enter()
						.append('circle')
						.attr('cx', d=> projection([d.properties.reclong, d.properties.reclat])[0])
						.attr('cy', d=> projection([d.properties.reclong, d.properties.reclat])[1])
						.attr('stroke', 'black')
						.attr('r', d=> {
								console.log( 'sizes', sizes(d.properties.mass), d.properties.mass);
								return sizes(d.properties.mass);
							})
						.style('fill', d =>color(d.properties.year))
						.style('opacity', 0.3);			
			
			});		

		
	const zooming = zoom()
		.on("zoom", () => {
			//console.log(d3.event.transform);
			g.attr('transform', 
				   `translate( ${d3.event.transform.x} , ${ d3.event.transform.y} )scale(${ d3.event.transform.k })`);
				
			g.selectAll("path")
				.attr('d',path.projection(projection));
					
			
		});
	
	svg.call(zooming);	
		
	
	
	
	
					
});