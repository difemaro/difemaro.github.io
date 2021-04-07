'use strict';

(function () {
  //let unregisterSettingsEventListener = null;	
  let unregisterFilterEventListener = null;
  let unregisterMarkSelectionEventListener = null;
  let unregisterSettingsEventListener = null;
  let worksheet = null;
  let worksheetName = null;
  let categoryColumnNumber = null;
  let categoryColumnNumberTo = null;
  let valueColumnNumber = null;
  let FilledBackground = null;
  let Opacity = null;
  let Legend = null;
  let Axislabel = null;
  let reverseAxislabel = null;

  $(document).ready(function () { 
    tableau.extensions.initializeAsync({ 'configure':configure }).then(function () {
      // Draw the chart when initialising the dashboard.
		  console.log("initialize");
		  //getSettings();
		  //drawChartJS();
		  if (tableau.extensions.settings.get("worksheet") != null){
			  console.log("initialize2");
			  getSettings();
			  drawChartJS();
		  }
		  if (tableau.extensions.settings.get("configured") != 1) {
				configure();
	      }

      // Set up the Settings Event Listener.
      unregisterSettingsEventListener = tableau.extensions.settings.addEventListener(tableau.TableauEventType.SettingsChanged, (settingsEvent) => {
        // On settings change.
        console.log("SettingsChanged");
		getSettings();
        drawChartJS();
      });
    }, function () { console.log('Error while Initializing: ' + err.toString()); });
  });

  function getSettings() {
    // Once the settings change populate global variables from the settings.
    worksheetName = tableau.extensions.settings.get("worksheet");
    categoryColumnNumber = tableau.extensions.settings.get("categoryColumnNumber");
	categoryColumnNumberTo = tableau.extensions.settings.get("categoryColumnNumberTo");
    valueColumnNumber = tableau.extensions.settings.get("valueColumnNumber");
	FilledBackground = tableau.extensions.settings.get("filled");
	Opacity = tableau.extensions.settings.get("opacity");
	Legend = tableau.extensions.settings.get("legend");
	Axislabel = tableau.extensions.settings.get("axislabel");
	reverseAxislabel = tableau.extensions.settings.get("reverseaxislabel");
	
    // If settings are changed we will unregister and re register the listener.
    if (unregisterFilterEventListener != null) {
      unregisterFilterEventListener();
    }
    // If settings are changed we will unregister and re register the listener.
    if (unregisterMarkSelectionEventListener != null) {
      unregisterMarkSelectionEventListener();
    }

    // Get worksheet
	worksheet=tableau.extensions.dashboardContent.dashboard.worksheets.find(function (sheet) {
		  return sheet.name===worksheetName;
		});


	
    // Add listener
	if (worksheet != undefined){
		unregisterFilterEventListener = worksheet.addEventListener(tableau.TableauEventType.FilterChanged, (filterEvent) => {
			console.log("ListenerFiltros");
			drawChartJS();
		});
	}

	if (worksheet != undefined){
		unregisterMarkSelectionEventListener = worksheet.addEventListener(tableau.TableauEventType.MarkSelectionChanged, (filterEvent) => {
			console.log("ListenerSeleccion");
			drawChartJS();
		});
	}
	
	var body = document.getElementById("myBody");
	body.addEventListener("resize", drawChartJS);


	// Redraw Listener
	if (document.addEventListener) {
		console.log("Resize");
		window.addEventListener('resize', drawChartJS);
	}
	else if (document.attachEvent) {
		console.log("Onresize");
		window.attachEvent('onresize', drawChartJS);
	}
	else {
		console.log("Elseresize");
		drawChartJS();
	}
  }

  var radarChart;
  
  function drawChartJS() {
//	if (radarChart){
//		radarChart.destroy();
//		console.log("destruir");
//	}
	console.log("Act8");
	console.log("drawchart");
	console.log(tableau.extensions.settings.get("worksheet"));
    worksheetName = tableau.extensions.settings.get("worksheet");
    categoryColumnNumber = tableau.extensions.settings.get("categoryColumnNumber");
	categoryColumnNumberTo = tableau.extensions.settings.get("categoryColumnNumberTo");
    valueColumnNumber = tableau.extensions.settings.get("valueColumnNumber");
	FilledBackground = tableau.extensions.settings.get("filled");
	Opacity = tableau.extensions.settings.get("opacity");
	Legend = tableau.extensions.settings.get("legend");
	Axislabel = tableau.extensions.settings.get("axislabel");
	reverseAxislabel = tableau.extensions.settings.get("reverseaxislabel");
	
	worksheet=tableau.extensions.dashboardContent.dashboard.worksheets.find(function (sheet) {
      return sheet.name===worksheetName;
    });
	
    worksheet.getSummaryDataAsync().then(function (sumdata) {
		var worksheetData = sumdata.data;
		var labels = [];
		var label = [];
		var datasetrow = {};
		var dataset = [];
		var marksData = {};
		var colors = ["rgba(156,148,0," + Opacity + ")", "rgba(56,0,158," + Opacity + ")", "rgba(251,154,153," + Opacity + ")", "rgba(235,223,0," + Opacity + ")",
					  "rgba(255,244,25," + Opacity + ")", "rgba(83,0,235," + Opacity + ")", "rgba(31,120,180,"  + Opacity + ")", "rgba(51,160,44,"   + Opacity + ")",
					  "rgba(156,148,0," + Opacity + ")", "rgba(56,0,158," + Opacity + ")", "rgba(251,154,153," + Opacity + ")", "rgba(235,223,0," + Opacity + ")",
					  "rgba(255,244,25," + Opacity + ")", "rgba(83,0,235," + Opacity + ")", "rgba(31,120,180,"  + Opacity + ")", "rgba(51,160,44,"   + Opacity + ")"];	
		
		if (FilledBackground == 1){
			var FillChart = true;
		}else{
			var FillChart = false;
		}
		
		if (Legend == 1){
			var ShowLegend = true;
		}else{
			var ShowLegend = false;
		}
		
		if (Axislabel == 1){
			var ShowAxislabel = true;
		}else{
			var ShowAxislabel = false;
		}
		
		if (reverseAxislabel){ 
			if (reverseAxislabel == 1){
				var RevAxislabel = true;
			}else{
				var RevAxislabel = false;
			}
		}else{
			var RevAxislabel = false;
		}
		console.log(RevAxislabel);
						  
		//Definir las series del Radial Chart
		for (var i=0; i<worksheetData.length; i++) {
			if (label.length == 0){
				label.push(worksheetData[i][categoryColumnNumber-1].formattedValue);
			}
			if (label.includes(worksheetData[i][categoryColumnNumber-1].formattedValue) == false){
				label.push(worksheetData[i][categoryColumnNumber-1].formattedValue);
			}
		}
		label.sort();
		
		//Definir las categorias del Radial Chart
		for (var i=0; i<worksheetData.length; i++) {
			if (labels.length == 0){
				labels.push(worksheetData[i][categoryColumnNumberTo-1].formattedValue);
			}
			if (labels.includes(worksheetData[i][categoryColumnNumberTo-1].formattedValue) == false ){
				labels.push(worksheetData[i][categoryColumnNumberTo-1].formattedValue);
			}
		}
		labels.sort();

		//console.log("Label");
		//console.log(label);
		//console.log("Labels");
		//console.log(labels);

		//Definir los valores para cada serie
		var dataserie = Array(labels.length);
				
		var k=0;

		//console.log(worksheetData);		
		
		for (var i=0; i<label.length; i++) {
			dataserie.fill(0);
			//console.log(label[i]);
			//console.log(dataserie);
			for (var j=0; j<worksheetData.length; j++){
				if (worksheetData[j][categoryColumnNumber-1].formattedValue == label[i]){
					k=0;
					while (worksheetData[j][categoryColumnNumberTo-1].formattedValue != labels[k]){
						k=k+1;
					}
					dataserie[k] = dataserie[k] + worksheetData[j][valueColumnNumber-1].value;
				}
			}
			//console.log("Dataserie");
			//console.log(dataserie);
			datasetrow = {label: label[i],
						  backgroundColor: colors[i],
						  data: Object.values(dataserie),
						  fill: FillChart,
						  borderColor:colors[i],
						  borderWidth:1};
			//console.log("Dataserow");
			//console.log(datasetrow);
			dataset.push(datasetrow);
		}

		//console.log("dataset");
		//console.log(dataset);

		marksData = {labels: labels,
					 datasets: dataset
					};

		//console.log("MarksData");
		//console.log(marksData);
		
		var options = {responsive: true,
//					   animation: true,
					   maintainAspectRatio: false,
					   legend: {
							display: ShowLegend
					   },
					   scale: {
						   ticks: {
							   min:0,
							   display: ShowAxislabel,
							   reverse: RevAxislabel
						   },
					   },
					   tooltips: {
									enabled: true,
									callbacks: {
										label: function(tooltipItem, data) {
											return data.datasets[tooltipItem.datasetIndex].label + ' : ' + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
										}
									}
								}					   
					   };
		
		var width = 0.95*$("#myBody").parent().width();
		var heigth = 0.95*$("#myBody").parent().height();
		
		console.log($("#myBody").parent());
		
		var minwh;
		
		if (width<heigth){
			minwh=width;
		}else{
			minwh=heigth;
		}
		
		console.log(minwh);
		
		var el = document.getElementById("myDiv");
		el.style.height = minwh + "px";
		el.style.width = minwh + "px";
		
		var bd = document.getElementById("myBody");
		bd.style.height = minwh + "px";
		bd.style.width = minwh + "px";
		
		var spinner = document.getElementById("spin");
		spinner.style.display = "none";
		
		console.log(options);
		
		if (radarChart){
			radarChart.config.data = marksData;
			radarChart.options = options;
			radarChart.update();
		} else {
		
			radarChart = new Chart($("#myChart"), {
			type: 'radar',
			data: marksData,
			options: options
			});
		}
	})
  }
  
  function configure() {
	var spinner = document.getElementById("spin");
	spinner.style.display ="inline-block";
    const popupUrl=`${window.location.origin}/Extensiones/Samples/Spider/dialog.html`;
    let defaultPayload="";
    tableau.extensions.ui.displayDialogAsync(popupUrl, defaultPayload, { height:575, width:450 }).then((closePayload) => {
		console.log("Exito");
		drawChartJS();
		var spinner = document.getElementById("spin");
		spinner.style.display = "none";
    }).catch((error) => {
      switch (error.errorCode) {
        case tableau.ErrorCodes.DialogClosedByUser:
          console.log("Dialog was closed by user");
		  var spinner = document.getElementById("spin");
		  spinner.style.display = "none";
          break;
        default:
          console.error(error.message);
      }
    });
  }
})();