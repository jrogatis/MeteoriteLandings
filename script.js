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
	interpolateRainbow
	
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
				
				
				console.log('min max mass', minMass, maxMass);
				
				const sizes = scaleLinear()
								.domain([minMass, maxMass])
								.range([2,40]);				
				
				const maxYear = max(myData, d => d.properties.year);
				const minYear = min(myData, d => d.properties.year);
				
				g.selectAll('circle')
					.data(myData)
					.enter()
						.append('circle')
						.attr('cx', d=> projection([d.properties.reclong, d.properties.reclat])[0])
						.attr('cy', d=> projection([d.properties.reclong, d.properties.reclat])[1])	
						.attr('r', d=> {
								console.log( 'sizes', sizes(d.properties.mass), d.properties.mass);
								return 5;
							})
						.style('fill', (d)=> interpolateRainbow(d.properties.year/(maxYear-minYear)))
						.style('opacity', 0.6);				
			
			});		

		
	const zooming = zoom()
		.on("zoom", () => {
			console.log(d3.event.transform);
			g.attr('transform', 
				   `translate( ${d3.event.transform.x} , ${ d3.event.transform.y} )scale(${ d3.event.transform.k })`);
				
			g.selectAll("path")
				.attr('d',path.projection(projection));
					
			
		});
	
	svg.call(zooming);	
		
	
	
	
	
					
});