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
const urlMap = "https://s3.amazonaws.com/rogatis/world-50m.json";
	
	const projection = geoMercator()
				.center([0, 0])
				.scale(100)
				.rotate([0,0]);

	const divResp = select('body')
						.append('div')
						.attr('class','svg-container');

	const svg =divResp
				.append("svg")
				  //responsive SVG needs these 2 attributes and no width and height attr
   				.attr("preserveAspectRatio", "xMinYMin meet")
   				.attr("viewBox", "0 0 800 600")
   				//class to make it responsiv
   				.attr('class', "svg-content-responsive")
				.style('background-color', 'darkblue');


	
	const tooltip = select('body').append('div')
            .style('position', 'absolute')
            .style('padding', '0 10px')
            .style('background', 'black')
		    .style('color', 'white')
            .style('opacity', 0);

	const toolText = (d)  =>{
			const text = `<div id= toolTip>
			   	<p> fall: <strong> ${d.properties.fall}  </strong> <br>
				   	mass: <strong> ${d.properties.mass}  </strong> <br>
				   	name: <strong> ${d.properties.name}  </strong> <br>
				   	nametype: <strong> ${d.properties.nametype}  </strong> <br>
				   	recclass: <strong> ${d.properties.recclass}  </strong> <br>
				   	reclat: <strong> ${d.properties.reclat}  </strong> <br>
				   	year: <strong> ${d.properties.year}  </strong> <br></p>
			  	</div>`;

		return text;
		
	};

	const path = geoPath()
		.projection(projection);
		
	const g = svg.append("g");
	
	// load and display the World
	json(urlMap, (error, topology) => {
			g.selectAll("path")
				.data(topojson.object(topology, topology.objects.countries).geometries)
				.enter()
				.append("path")
				.attr("d", path);
		
			json(url, (error, json) =>{
			
				const myData = json.features;
						
				
				if (error) { return console.warn(error);}
				
				const toTime = timeParse("%Y-%m-%dT%H:%M:%S.%L");
											
				myData.map(d =>{
					let newTime = toTime(d.properties.year);
						newTime = timeFormat('%Y')(newTime);
						d.properties.year = newTime;
					});

				
				const color = scaleThreshold()
								.domain([1000, 1100, 1200,1300, 1400,1500, 1600, 1700, 1800, 1900, 1950, 2000])
								.range(['red', 'white', 'blue', 'yellow', 'green', 'pink','brown','grey', 'purple', 'darkorange', 'wheat', '#54278f']);
				
				const sizes = scaleThreshold()
								.domain([10000,100000,1000000,10000000])
								.range([1,6,12,20]);



				
				g.selectAll('circle')
					.data(myData)
					.enter()
						.append('circle')
						.attr('cx', d=> projection([d.properties.reclong, d.properties.reclat])[0])
						.attr('cy', d=> projection([d.properties.reclong, d.properties.reclat])[1])
						.attr('stroke', 'black')
						.attr('r', d=>  sizes(d.properties.mass))
						.attr('id', (d,i) => i)
						.style('fill', d =>color(d.properties.year))
						.style('opacity', 0.3)
						.on('mouseover', (d)=> {
							select(`#${d.id}`)
									.style('cursor', 'pointer');
								tooltip.transition()
									.style('opacity', 0.8);

								tooltip.html(toolText(d))
									.style('left', (d3.event.pageX + 100) + 'px')
									.style('top',  (d3.event.pageY + 30) + 'px');
								})
						.on('mouseout', (d)=>{
								tooltip.style('opacity', 0);
			   					select(`#${d.id}`)
									.style('cursor', 'default');
								 });
			
			});		

		
		const clampScale = (e) =>{
			const scale = max([e.transform.k,1]);
			e.transform.k = scale;
			console.log('tranform',e.transform,'newScale', scale);
			return e.transform.k;
		};


	const zooming = zoom()
		.on("zoom", () => {
			console.log(d3.event);
			g.attr('transform', 
				    //`translate(${t})scale( ${d3.event.scale} )`);
				   `translate( ${d3.event.transform.x} , ${ d3.event.transform.y} )scale(${ clampScale(d3.event) })`);
				
			g.selectAll("path")
				.attr('d',path.projection(projection));
					
			
		});
	
	svg.call(zooming);
	
					
});
