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

// global chart objects
var globalPie;
var globalLine;

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
	let new_total = "<p><span id='green-text'>$</span>"+store.sale+"</p>";
	document.getElementById('sale-total').innerHTML = new_total;

	// insert rows (order history) into the table
	set_table();

	renderPie(store);
	renderLine(store);
}


// insert rows into the table by using the order history array which saved in the store variable
function set_table(){
	let table = document.getElementById('order');
	let i;
	let j;

	for (i = 0; i < (store.orderHistory).length; i++){
		let row = table.insertRow(i+2);
		for (j = 0; j < 6; j++){
			let cell = row.insertCell(j);
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
	let dingus_amount = document.getElementById('dingus-amount').value;
	let widget_amount = document.getElementById('widget-amount').value;
	let total = dingus_amount * DINGUS_PRICE + widget_amount * WIDGET_PRICE;

	// modify the content 
	document.getElementById('dingus-order2').value = (dingus_amount * DINGUS_PRICE).toFixed(2);
	document.getElementById('widget-order2').value = (widget_amount * WIDGET_PRICE).toFixed(2);
	document.getElementById('total').value = total.toFixed(2);

	// check if is valid to make order (enable the order button)
	enable_order();
}

// check if the user have selected at least one options in the drop-down list (payments)
function selected_option(list){
	let option;
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
	let dingus_amount = document.getElementById('dingus-amount').value;
	let widget_amount = document.getElementById('widget-amount').value;
	let payment = document.getElementById('payment');
	let selected_pay = selected_option(payment);

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
	let d = new Date();
	let month = d.getMonth() + 1;
	let day = d.getDate();
	let year = d.getFullYear();
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
	let table = document.getElementById('order');
	let row = table.insertRow(store.orderHistory.length+2);

	// create array to store the latest order history information
	let new_order = [];
	new_order[0] = store.orderHistory.length + 1;
	new_order[1] = convert_date();
	new_order[2] = document.getElementById('dingus-amount').value;
	new_order[3] = document.getElementById('widget-amount').value;
	new_order[4] = '$' + document.getElementById('total').value;
	new_order[5] = document.getElementsByTagName('select')[0].value;

	// insert cells into the table
	let i;
	for (i = 0; i < 6; i++) {
		let cell = row.insertCell(i);
		cell.innerHTML = new_order[i];
	}

	// update the information saved in the store variable with the latest order
	let new_dingus = (JSON.parse(store.dingus) + JSON.parse(new_order[2])).toFixed(0);
	let new_widget = (JSON.parse(store.widget) + JSON.parse(new_order[3])).toFixed(0);
	let new_total = (JSON.parse(store.sale) + JSON.parse(document.getElementById('total').value)).toFixed(2);

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

	renderPie(store);

	//console.log(new_order[3]);
	//globalLine.series[0].addPoint(Number(new_order[2]));
	//globalLine.series[1].addPoint(Number(new_order[3]));
	//globalLine.xAxis[0].categories.push(new_order[1]);
	//globalLine.redraw();

	renderLine(store);

	reset_form();
	
}

// reset the form if the user click on the cancel button
function reset_form(){
	document.getElementsByTagName('form')[0].reset();
	set_value();
	document.getElementById('order-button').disabled = true;
}

// draw the pie chart
function renderPie(data) {
	let dingus = data.dingus / (data.dingus + data.widget) * 100;
	let widget = data.widget / (data.dingus + data.widget) * 100;
	
	var chartPie = Highcharts.chart('pie-chart',{
		chart: {
			type:'pie'
		},
		title: {
			text: 'Dingus vs. Widget'
		},
		subtitle: {
			text: 'Total Number of Solds in Percentage'
		},
		plotOptions: {
			pie: {
				showInLegend: true
			}
		},
		credits: {
			enabled: false
		},
		tooltip: {
			pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
		},
		series: [{
			name: 'Sales',
			colorByPoint: true,
			data: [{
				name: 'Dingus',
				y: dingus
			}, {
				name: 'Widget',
				y: widget
			}]
		}],
	});
	globalPie = chartPie;
}

// draw the line chart
function renderLine(data) {
	let dingus = [];
	let widget = [];
	let date = [];
	for (var i = 0; i < data.orderHistory.length; i++){
		if (!date.includes(data.orderHistory[i][1])){
			date.push(data.orderHistory[i][1]);
			dingus.push(Number(data.orderHistory[i][2]));
			widget.push(Number(data.orderHistory[i][3]));
		} else {
			function check(c){
				return c == data.orderHistory[i][1]
			}
			let idx = date.findIndex(check);

			dingus[idx] += Number(data.orderHistory[i][2]);
			widget[idx] += Number(data.orderHistory[i][3]);
		}
	}

	var charLine = Highcharts.chart('line-chart',{
		chart: {
			type: 'line'
		},
		title: {
			text: 'Dingus vs. Widget'
		},
		subtitle: {
			text: 'Sale per Day'
		},
		xAxis: {
			categories: date,
			title: {
				text: 'date'
			}
		},
		yAxis: {
			min: 0,
			title: {
				text: 'Number of Sales'
			},
			labels: {
				overflow: 'justify'
			}
		},
		legend: {
			layout: 'vertical',
			align: 'right',
			vecticalAlign: 'top',
			floating: true,
			borderWidth: 1,
			shadow: true,
			backgroundColor: '#e2ede1',
			x: 0,
			y: -300
		},
		credits: {
			enabled: false
		},
		series: [{
			data: dingus,
			name: 'Dingus'
		}, {
			data: widget,
			name: 'Widget'
		}]
	});

	globalLine = charLine;
}

