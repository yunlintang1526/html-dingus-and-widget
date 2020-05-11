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
	// [ID#, Date, Dingus quantity, Widget quantity, Payment]
    return [
	  [1, '04/19/2020', 1, 1, 'Paypal'],
	  [2, '04/20/2020', 2, 2, 'Visa']
	]
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
		(store.orderHistory[0]).splice(4, 0, '$27.24');
		(store.orderHistory[1]).splice(4, 0, '$54.48');
		store.dingus = 3;
		store.widget = 3;
		store.sale = 81.72;
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
}

// reset the form if the user click on the cancel button
function reset_form(){
	document.getElementsByTagName('form')[0].reset();
	set_value();
	document.getElementById('order-button').disabled = true;
}