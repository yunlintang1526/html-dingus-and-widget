// Constants
const DINGUS_PRICE = 14.25;
const WIDGET_PRICE = 9.99;
const ZERO_FORMAT = '0.00';
var sales;
var stocks;
var pieChart;
var lineChart;


// draw the initial values
document.addEventListener('DOMContentLoaded', initial_value, false);

// load the json data
async function loadJSON(path){
	let response = await fetch(path);
	let dataset = await response.json();
	return dataset;
}

// add/edit initial values to store
function initial_value(){
	// modify the flexbox contents by using the updated store variable
	document.getElementById('dingus-total').innerHTML = '';
	document.getElementById('widget-total').innerHTML = '';
	let new_total = "<p><span id='green-text'>$</span></p>";
	document.getElementById('sale-total').innerHTML = new_total;

	sales = loadJSON('/data/sales.json');
	stocks = loadJSON('/data/stocks.json');

	renderMap();
	
	stocks.then(function (s) {
		renderArea(s);
	})
}

function renderMap(){

	// Create the chart
	Highcharts.mapChart('myMap', {

		chart:{
			height: 450,
		},
		title: {
			text: ''
		},
		// data in hint2_js
		series: data,
		tooltip: {
            formatter: function () {
				if (this.series.name == 'NORTHAMERICA'){
					return "NORTH<br>AMERICA";
				} else if (this.series.name=='SOUTHAMERICA'){
					return 'SOUTH<br>AMERICA';
				} else {
					return this.series.name;
				}
			},
			style: {
				textAlign: 'center',
				fontSize: '10px'
			}
		},
		plotOptions:{
			series:{
				dataLabels:{
					enabled: true,
					align: 'center',
					vecticalAlign: 'middle',
					formatter: function () {
						if (this.series.name == 'NORTHAMERICA'){
							return "NORTH<br>AMERICA";
						} else if (this.series.name=='SOUTHAMERICA'){
							return 'SOUTH<br>AMERICA';
						} else {
							return this.series.name;
						}
					},
					style:{
						fontSize: '9px',
						color: 'black',
						textOutline: '0px',
						fontWeight: 'normal'
					}
				},
				states:{
					hover:{
						color:'#a8a8a8',
					},
				},
				className: function(){
					return this.series.name;
				}
			},
			map:{
				color: '#dbdbdb',
				events: {
					click: function(e){
						let event_name = this.name;
						Highcharts.each(this.chart.series, function(el){
							if (event_name == el.name){
								el.update({
									color: '#7CA82B',
									states: {
										hover: {
											color: '#0C3'
										},
									}
								});
								sales.then(function (s) {
									renderLine(s, el.name);
								})
							} else {
								el.update({
									color: '#dbdbdb',
									states: {
										hover: {
											color: '#a8a8a8'
										},
										
									}
								})
							}
						})
					},
				}
			},
		},
		legend:{
			enabled: false
		},
		credits:{
			enabled: false
		},


	});
}


function renderArea(data){

	var prices = [];
	for (datum of data){
		prices.push([datum['Date'], datum['Adj Close']]);
	}

	Highcharts.setOptions({
		global: {
			timezone: 'America/Los_Angeles'
		}
	});

	Highcharts.chart('myArea', {
		chart: {
			type: 'area',
			zoomType: 'xy'
		},
		title: {
			text: 'Dynamic Growth',
			style: {
				fontWeight: 'bold'
			}
		},
		subtitle: {
			text: 'Stock Prices of D&W Corp. from 2015-Present'
		},
		xAxis: {
			type: 'datetime',
			labels: {
				format: '{value:%m/%d/%y}',
			},
			title: {
				text: 'Date',
				style: {
					fontSize: '12px',
					fontWeight: 'bold',
				}
			},
			crosshair: {
				width: 1.5,
				enabled: true,
				label: {
					enabled: true,
					format: '{value:%m/%d/%y}',
					backgroundColor: '#7d7d7d'
				}
			},
			//startOnTick: true,
			min: 1449619200000,
			max: 1581984000000,
			lineWidth: 1,
			lineColor: 'grey'
		},
		yAxis: {
			title: {
				text: 'Adj Close Stock Price',
				style: {
					fontSize: '12px',
					fontWeight: 'bold'
				}
			},
			// TODO: too far from axis
			crosshair: {
				enabled: true,
				width: 1.5,
				label: {
					enabled: true,
					format: '{value:.0f}',
					backgroundColor: '#328ba8'
				}
			},
			labels: {
				enabled: true
			},
			tickInterval: 20,
			max: 160,
			lineColor: 'grey',
			lineWidth: 1,
			tickWidth: 0.5,
			tickColor: 'grey',
			
		},
		tooltip: {
			formatter: function(){
				return '$'+(this.y).toFixed(2);
			}
		},
		series: [{
			showInLegend: false,
			data: prices,
			color: '#a9d1de'
		}],
		plotOptions: {
			series: {
				lineColor: '#328ba8'
			}
		},
		credits:{
			enabled: false
		},
	})
}


// draw the line chart
function renderLine(sale_data, sale_name) {

	// read data for selected continent
	sale_data = sale_data[sale_name];
	var month = [];
	var dingus = [];
	var widget = [];
	for (datum of sale_data){
		month.push(datum['Month']);
		dingus.push(datum['Dingus']);
		widget.push(datum['Widget']);
	}

	findTickInterval(sale_name,dingus,widget);

	lineChart = Highcharts.chart('line-chart',{
		chart: {
			type: 'line'
		},
		title: {
			text: 'Monthly Sales',
			style: {
				fontWeight: 'bold'
			}
		},
		xAxis: {
			title: {
				text: 'Month',
				style: {
					fontWeight: 'bold'
				}
			},
			labels: {
				formatter: function(){
					return month[this.value];
				},
			},
			maxPadding: 0,
			tickWidth: 1,
			tickInterval: 1,
		},
		yAxis: {
			title: {
				text: 'Number of units sold',
				style: {
					fontWeight: 'bold'
				}
			},
			labels: {
				overflow: 'justify'
			},
			min: 0,
			offset: 0,
			lineWidth: 1,
			tickInterval:findTickInterval(sale_name),
			tickWidth: 1,
			tickAmount: findTickAmount(sale_name)
		},
		legend: {
			layout: 'vertical',
			align: 'right',
			vecticalAlign: 'top',
			floating: true,
			borderWidth: 1,
			backgroundColor: 'white',
			x: 0,
			y: -315
		},
		tooltip: {
			formatter: function(){
				return this.y;
			},
		},
		credits: {
			enabled: false
		},
		series: [{
			name:'Dinguses',
			data: dingus,
			color: '#56b2d1'
		}, {
			name:'Widgets',
			data: widget,
			color: '#de362a'
		}],
		plotOptions:{
			pointPlacement: 'on'
		}
	});

	updateScoreBoard(dingus, widget, sale_name);
}


function findTickInterval(name){
	//let comb = lst1.concat(lst2);
	//max_y = Math.max.apply(Math,comb);
	if(name == 'ANTARCTICA'){
		return 2
	} else {
		return 10
	}
}

function findTickAmount(name){
	if(name == 'ANTARCTICA'){
		return 6
	} else{
		return undefined
	}
}


// update the score board if a continent is selected
function updateScoreBoard(dingus_arr, widget_arr, sale_name){
	var dingus_total = 0;
	var widget_total = 0;
	for (let i = 0; i < dingus_arr.length; i++){
		dingus_total += dingus_arr[i];
	}
	for (let i = 0; i < widget_arr.length; i++){
		widget_total += widget_arr[i];
	}

	document.getElementById('dingus-total').innerHTML = dingus_total;
	document.getElementById('widget-total').innerHTML = widget_total;

	let total_sale = (DINGUS_PRICE * dingus_total + WIDGET_PRICE * widget_total).toFixed(2);
	let total_sale_format = "<p><span id='green-text'>$</span>"+total_sale+"</p>";
	document.getElementById('sale-total').innerHTML = total_sale_format;

	renderPie(dingus_total, widget_total, sale_name);
}


function renderPie(dingus,widget,sale_name){

	if(sale_name == 'ANTARCTICA'){
		if (pieChart != undefined){
			pieChart.destroy();
		}
		return;
	}

	pieChart = Highcharts.chart('pie-chart', {
		chart: {
			type: 'pie'
		}, 
		title: {
			text: 'Total Sales',
			style: {
				fontWeight: 'bold'
			}
		},
		plotOptions: {
			pie: {
				dataLabels: {
					formatter: function(){
						return (this.percentage).toFixed(1)+'%'
					},
					distance: -80,
					style: {
						textOutline: '0px',
						fontSize: '13px'
					}

				},
				showInLegend: true,
				tooltip: {
					pointFormat: '{point.y}'
				},
				startAngle: 90
			}
		},
		legend: {
			align: 'right',
			layout: 'vertical',
			verticalAlign: 'top',
			floating: true,
			x: 0,
			y: 20,
			borderWidth: 1,
			backgroundColor: 'white',
		},
		series: [{
			name: 'Sales',
			colorByPoint: true,
			data: [{
				name: 'Dinguses',
				y:dingus,
				color: '#56b2d1'
			}, {
				name: 'Widgets',
				y:widget,
				color: '#de362a'
			}]
		}],
		credits: {
			enabled: false
		},
	})
}
