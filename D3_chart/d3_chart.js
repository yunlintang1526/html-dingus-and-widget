// Constants
const DINGUS_PRICE = 16.25;
const WIDGET_PRICE = 10.99;
const ZERO_FORMAT = '0.00';

// Global store (What else would you need here?)
let store = {
  orderHistory : [],
  dingus: 0,
  widget: 0,
  sale: 0
};


function generateEntries() {
    // Returns an orderHistory array
    // [ID#, Date, Dingus quantity, Widget quantity]

    return [ [1, '04/19/2020', 1, 2, 'Paypal'],
                  [2, '04/20/2020', 3, 4, 'Visa'] ]

}

//clear the local storage for testing
//localStorage.clear();
//alert(localStorage.getItem('orderHistory'));


// add/edit initial values to store
function initial_value(){
	// set all the initial values for forms
	set_value();

	// retrieve the order history list from local storage
	var store_orderHistory = localStorage.getItem('orderHistory');

	// if the local storage is null which indicates that it is the first time to open this page
	// then modify the store variable and seve them into local storage by using the 2 initial rows
	if (store_orderHistory == null){
		store.orderHistory.push(generateEntries()[0]);
		store.orderHistory.push(generateEntries()[1]);
		(store.orderHistory[0]).splice(4, 0, '$38.23');
		(store.orderHistory[1]).splice(4, 0, '$92.71');
		store.dingus = 4;
		store.widget = 6;
		store.sale = 130.94;
		localStorage.setItem('orderHistory',JSON.stringify(store.orderHistory));
		localStorage.setItem('dingus', store.dingus);
		localStorage.setItem('widget', store.widget);
		localStorage.setItem('sale', store.sale);
	} else {
		// if this is not the first time to open this page, the local storage should save some order history
		// retrieve these information and store them into store variable
		store.orderHistory = JSON.parse(store_orderHistory);
		store.dingus = JSON.parse(localStorage.getItem('dingus'));
		store.widget = JSON.parse(localStorage.getItem('widget'));
		store.sale = JSON.parse(localStorage.getItem('sale'));
	}

	// modify the flexbox contents by using the updated store variable
	document.getElementById('dingus-total').innerHTML = store.dingus;
	document.getElementById('widget-total').innerHTML = store.widget;
	var new_total = "<p><span id='green-text'>$</span>"+store.sale+"</p>";
	document.getElementById('sale-total').innerHTML = new_total;

	// insert rows (order history) into the table
	set_table();

	renderPie(store);
	renderLine(store);
}


// insert rows into the table by using the order history array which saved in the store variable
function set_table(){
	var table = document.getElementById('order');
	var i;
	var j;

	for (i = 0; i < (store.orderHistory).length; i++){
		var row = table.insertRow(i+2);
		for (j = 0; j < 6; j++){
			var cell = row.insertCell(j);
			cell.innerHTML = (store.orderHistory)[i][j];
		}
	}

}

// set the initial values in form
function set_value(){
	document.getElementById('dingus-order1').value = DINGUS_PRICE;
	document.getElementById('dingus-order2').value = ZERO_FORMAT;
	document.getElementById('widget-order1').value = WIDGET_PRICE;
	document.getElementById('widget-order2').value = ZERO_FORMAT;
	document.getElementById('total').value = ZERO_FORMAT;
}

// update the form if the user have input some value(s) in the input sections
function update_value(){
	var dingus_amount = document.getElementById('dingus-amount').value;
	var widget_amount = document.getElementById('widget-amount').value;
	var total = dingus_amount * DINGUS_PRICE + widget_amount * WIDGET_PRICE;

	// modify the content 
	document.getElementById('dingus-order2').value = (dingus_amount * DINGUS_PRICE).toFixed(2);
	document.getElementById('widget-order2').value = (widget_amount * WIDGET_PRICE).toFixed(2);
	document.getElementById('total').value = total.toFixed(2);

	// check if is valid to make order (enable the order button)
	enable_order();
}

// check if the user have selected at least one options in the drop-down list (payments)
function selected_option(list){
	var option;
	for (var i = 0; i < list.options.length; i++){
		option = list.options[i];
		if (option.selected == true){
			return option;
		}
	}
	// will return null if the user have not yet selected
	return null;
}

// check if is valid to enable the order button
function enable_order(){
	// get the updated input from user (dingus quantity, widget quantity, and one selected payment)
	var dingus_amount = document.getElementById('dingus-amount').value;
	var widget_amount = document.getElementById('widget-amount').value;
	var payment = document.getElementById('payment');
	var selected_pay = selected_option(payment);

	// determine whether enable or disable the button
	if (dingus_amount % 1 == 0  && widget_amount % 1 == 0){
		if (dingus_amount > 0 && widget_amount >= 0 && selected_pay != null){
			document.getElementById('order-button').removeAttribute('disabled');
		} else if (dingus_amount >= 0 && widget_amount > 0 && selected_pay != null){
			document.getElementById('order-button').removeAttribute('disabled');
		} else {
			document.getElementById('order-button').disabled = true;
		}
	} else {
		document.getElementById('order-button').disabled = true;
	}

	if (dingus_amount.length == 0 || widget_amount.length == 0){
		document.getElementById('order-button').disabled = true;
	}
}

// convert the date and time to the mm/dd/yyyy format
function convert_date(){
	var d = new Date();
	var month = d.getMonth() + 1;
	var day = d.getDate();
	var year = d.getFullYear();
	if (month < 10){
		month = '0' + month;
	}
	if (day < 10){
		day = '0' + day;
	}
	return month + '/' + day + '/' + year;
}

// if the order has successfully made, update the order history table
function update_table(){
	var table = document.getElementById('order');
	var row = table.insertRow(store.orderHistory.length+2);

	// create array to store the latest order history information
	let new_order = [];
	new_order[0] = store.orderHistory.length + 1;
	new_order[1] = convert_date();
	new_order[2] = document.getElementById('dingus-amount').value;
	new_order[3] = document.getElementById('widget-amount').value;
	new_order[4] = '$' + document.getElementById('total').value;
	new_order[5] = document.getElementsByTagName('select')[0].value;

	// insert cells into the table
	var i;
	for (i = 0; i < 6; i++) {
		var cell = row.insertCell(i);
		cell.innerHTML = new_order[i];
	}

	// update the information saved in the store variable with the latest order
	var new_dingus = (JSON.parse(store.dingus) + JSON.parse(new_order[2])).toFixed(0);
	var new_widget = (JSON.parse(store.widget) + JSON.parse(new_order[3])).toFixed(0);
	var new_total = (JSON.parse(store.sale) + JSON.parse(document.getElementById('total').value)).toFixed(2);

	// modify the content of the flexbox to display the total quantity and sales amount
	document.getElementById('dingus-total').innerHTML = new_dingus;
	document.getElementById('widget-total').innerHTML = new_widget;
	new_total_1 = "<p><span id='green-text'>$</span>"+new_total+"</p>";
	document.getElementById('sale-total').innerHTML = new_total_1;

	// update the store variable
	store.orderHistory.push(new_order);
	store.dingus = new_dingus;
	store.widget = new_widget;
	store.sale = new_total;

	// save the updated store variable into the local storage
	localStorage.setItem('orderHistory', JSON.stringify(store.orderHistory));
	localStorage.setItem('dingus', store.dingus);
	localStorage.setItem('widget', store.widget);
	localStorage.setItem('sale', store.sale);

		
	d3.select('#pie-chart').select('svg').remove();
	renderPie(store);

	d3.select('#line-chart').select('svg').remove();
	renderLine(store);
	reset_form();
}

// reset the form if the user click on the cancel button
function reset_form(){
	document.getElementsByTagName('form')[0].reset();
	set_value();
	document.getElementById('order-button').disabled = true;
}

// function for drawing the pie chart
function renderPie(data){
	// set up margin measurements
	let width = 400;
	let height = 400;
	let margin = 40;
	let radius = width/2 - margin;

	// the data used (number of sale)
	let pie_data = {dingus:data.dingus, widget:data.widget};

	// scale the color for dingus and widget
	let color = d3
		.scaleOrdinal()
		.domain(pie_data)
		.range(['#fceb79', '#9fd69a']);

	// set up the svg for pie chart
	let svg = d3
		.select('#pie-chart')
		.append('svg')
		//.attr('width',width)
		//.attr('height',height)
		.attr('viewBox', '0 0 '+height+' '+width)
		.append('g')
		.attr('transform', 'translate(' + width/2 +',' +height/2 +')');

	// set up the value for pie data
	let pie = d3
		.pie()
		.value(function(cnt){return cnt.value});

	// set up the arcs for the partial circles
	let arc = d3
		.arc()
		.innerRadius(0)
		.outerRadius(radius);

	// draw the pie chart
	svg.selectAll('#pie-chart')
		.data(pie(d3.entries(pie_data)))
		.enter()
		.append('path')
		.attr('d', arc)
		.attr('fill', function(d){return (color(d.data.key))} )
		.attr('stroke', 'white')
		.style('stroke-width','10px');
	
	// compute the percentage for dingus and widget
	let total_sale = Number(data.widget) + Number(data.dingus);
	
	// add the categories names on the pie chart
	svg.selectAll('#pie-chart')
		.data(pie(d3.entries(pie_data)))
		.enter()
		.append('text')
		.text(function(d) {
			return d.data.key + ': ' + 
			Math.round(d.data.value/total_sale*100) + '%'})
		.attr('transform', function(d) {
			return 'translate('+arc.centroid(d)+')';})
		.style('text-anchor', 'middle')
		.style('fill','#63625e')

	// add legend (squares dots)
	let size = 20;
	let types = Object.keys(pie_data)
	svg.selectAll('#pie-chart')
		.data(types)
		.enter()
		.append('rect')
		.attr('x', function(d, i){
			return i*size*5 -80
		})
		.attr('y', 180)
		.attr('width', size)
		.attr('height',size)
		.style('fill', function(d) {return (color(d))})
	
	// add legend (texts)
	svg.selectAll('#pie-chart')
		.data(types)
		.enter()
		.append('text')
		.text(function(d) {return d})
		.attr('x', function(d, i){
			return i*size*5 - 55
		})
		.attr('y', 195)
		.style('text-anchor', 'left')
		.style('fill', '#63625e')
	
	// draw title
	svg.append('text')
		.attr('x', 10)
		.attr('y', -180)
		.text('Total Number of Sales')
		.style('text-anchor', 'middle')
		.style('font-size','20px')
}

// function drawing the line chart
function renderLine(data){
	// set up the size of graph
	let margin = {top: 10, right:30, bottom:30, left:60};
	let width = 400-margin.left-margin.right;
	let height = 350-margin.top-margin.bottom;

	// set up the canvas for the graph
	let width_svg = width+margin.left+margin.right;
	let height_svg = height+margin.top*10+margin.bottom;
	let svg = d3
		.select('#line-chart')
		.append('svg')
		//.attr('width', width_svg)
		//.attr('height', height_svg)
		.attr('viewBox','0 0 '+height_svg+' '+width_svg)
		.append('g')
		.attr('transform', 'translate('+margin.left+','+margin.top*5+')');
	
	// compute the data for every day
	let dingus = [];
	let widget = [];
	let dates = [];

	for (var i = 0; i < data.orderHistory.length; i++){
		// check if the date element already existed in the list
		if (!dates.includes(data.orderHistory[i][1])){
			dates.push(data.orderHistory[i][1]);
			dingus.push(Number(data.orderHistory[i][2]));
			widget.push(Number(data.orderHistory[i][3]));
		} else {
			// if existed, check which index in dates array match the input date
			function check(c){
				return c == data.orderHistory[i][1]
			}
			let idx = dates.findIndex(check);

			dingus[idx] += Number(data.orderHistory[i][2]);
			widget[idx] += Number(data.orderHistory[i][3]);
		}
	}

	// construct the data for line chart
	let line_data = [];
	for(let i = 0; i < dates.length; i++){
		line_data.push({name:'dingus', amount:dingus[i], date:dates[i]});
		line_data.push({name:'widget', amount:widget[i], date:dates[i]});
	}

	line_data = d3.nest()
				.key(function(d) {return d.name})
				.entries(line_data);

	// set the scale for x-axis
	let xScale = d3.scaleBand()
				.domain(dates)
				.rangeRound([0, width])
	// draw the x-axis
	svg.append('g')
		.attr('transform', 'translate(0,'+height+')')
		.call(d3.axisBottom().scale(xScale));
	
	// compute for y-axis
	let maxNum1 = d3.max(dingus);
	let maxNum2 = d3.max(widget);
	// set the scale for y-axis
	let yScale = d3.scaleLinear()
					.domain([0, Math.max(maxNum1, maxNum2)])
					.range([height, 0]);
	// draw the y-axis
	svg.append('g')
		.call(d3.axisLeft().scale(yScale));

	// set the color for dingus and widget
	let grps = line_data.map(function(d){return d.eky});
	let color = d3.scaleOrdinal()
					.domain(grps)
					.range(['#9fd69a','#ebce42'])
	//draw the line chart
	svg.selectAll('#line-chart')
		.data(line_data)
		.enter()
		.append('path')
			.attr('d', function(d){
				return d3.line()
					.x(function(d){return xScale(d.date)+xScale.bandwidth()/2})
					.y(function(d){return yScale(d.amount)})
					(d.values)
			})
			.attr('fill','none')
			.attr('stroke',function(d){return color(d.key)})
			.attr('stroke-width', 2)
	
	// add legend (sqaures)
	let size = 20;
	let legend_keys = ['dingus', 'widget'];
	svg.selectAll('#line-chart')
		.data(legend_keys)
		.enter()
		.append('rect')
		.attr('x',20)
		.attr('y', function(d, i){
			return i*(size+5)
		})
		.attr('width', size)
		.attr('height',size)
		.style('fill', function(d) {return (color(d))})

	// add legend (texts)
	svg.selectAll('#line-chart')
		.data(legend_keys)
		.enter()
		.append('text')
		.text(function(d) {return d})
		.attr('x', 30+size)
		.attr('y', function(d, i){
			return 5+i*(size+5) + (size/2)
		})
		.style('text-anchor', 'left')
		.style('fill', '#63625e')

	// draw title
	svg.append('text')
		.attr('x', 150)
		.attr('y', -25)
		.text('Sales Per Day')
		.style('text-anchor', 'middle')
		.style('font-size','20px')

	// add label for x-axis
	svg.append('text')
		.attr('transform', 'translate('+(width/2)+','+
			(height+margin.top+20)+')')
		.style('text-anchor','middle')
		.text('Date')
		.style('font-size','13px')
	
	// add label for y-axis
	svg.append('text')
		.attr('transform','rotate(-90)')
		.attr('y', 0-margin.left)
		.attr('x', 0-(height/2))
		.attr('dy','1em')
		.style('text-anchor','middle')
		.style('font-size','13px')
		.text('Number of Solds')
	
}