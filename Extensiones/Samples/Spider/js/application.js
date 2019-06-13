'use strict';

(function () {
  //let unregisterSettingsEventListener = null;	
  let unregisterFilterEventListener = null;
  let unregisterMarkSelectionEventListener = null;
  let worksheet = null;
  let worksheetName = null;
  let categoryColumnNumber = null;
  let categoryColumnNumberTo = null;
  let valueColumnNumber = null;
  let FilledBackground = null;
  let Opacity = null;

  $(document).ready(function () {
    tableau.extensions.initializeAsync({ 'configure':configure }).then(function () {
      // Draw the chart when initialising the dashboard.
		  getSettings();
		  if (worksheetName != null){
			  getSettings();
			  drawChartJS();
		  }
      // Set up the Settings Event Listener.
      unregisterSettingsEventListener = tableau.extensions.settings.addEventListener(tableau.TableauEventType.SettingsChanged, (settingsEvent) => {
        // On settings change.
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

	
	// Redraw Listener
	if (document.addEventListener) {
		window.addEventListener('resize', drawChartJS);
	}
	else if (document.attachEvent) {
		window.attachEvent('onresize', drawChartJS);
	}
	else {
		window.resize = drawChartJS;
	}
  }

  function drawChartJS() {
	console.log("drawchart");
	console.log(tableau.extensions.settings.get("worksheet"));
    worksheetName = tableau.extensions.settings.get("worksheet");
    categoryColumnNumber = tableau.extensions.settings.get("categoryColumnNumber");
	categoryColumnNumberTo = tableau.extensions.settings.get("categoryColumnNumberTo");
    valueColumnNumber = tableau.extensions.settings.get("valueColumnNumber");
	FilledBackground = tableau.extensions.settings.get("filled");
	Opacity = tableau.extensions.settings.get("opacity");
	
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
		
		console.log("Setting" + tableau.extensions.settings.get("filled"));
		console.log("Variable" + FilledBackground);
		
		if (FilledBackground == 1){
			var colors = ["rgba(166,206,227," + Opacity + ")", "rgba(178,223,138," + Opacity + ")", "rgba(251,154,153," + Opacity + ")", "rgba(253,191,111," + Opacity + ")",
						  "rgba(202,178,214," + Opacity + ")", "rgba(255,255,153," + Opacity + ")", "rgba(31,120,180,"  + Opacity + ")", "rgba(51,160,44,"   + Opacity + ")"];	
			var FillChart = true;
		}else{
			var colors = ["rgba(166,206,227,1)", "rgba(178,223,138,1)", "rgba(251,154,153,1)", "rgba(253,191,111,1)",
						  "rgba(202,178,214,1)", "rgba(255,255,153,1)", "rgba(31,120,180,1)", "rgba(51,160,44,1)"];
			var FillChart = false;
		}
		
		console.log("Filled " + FilledBackground + FillChart);
					  
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

		console.log(worksheetData);		
		
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
			console.log("Dataserie");
			console.log(dataserie);
			datasetrow = {label: label[i],
						  backgroundColor: colors[i],
						  data: Object.values(dataserie),
						  fill: FillChart,
						  borderColor:colors[i],
						  borderWidth:1};
			console.log("Dataserow");
			console.log(datasetrow);
			dataset.push(datasetrow);
		}

		console.log("dataset");
		console.log(dataset);

		marksData = {labels: labels,
					 datasets: dataset
					};

		console.log("MarksData");
		console.log(marksData);
		
		var options = {responsive: true, // Instruct chart js to respond nicely.
					   maintainAspectRatio: false, // Add to prevent default behaviour of full-width/height 
					   };

		
		var radarChart = new Chart($("#myChart"), {
		type: 'radar',
		data: marksData,
		options: options
		});
	})
  }

  function configure() {
    const popupUrl=`${window.location.origin}/Extensiones/Samples/Spider/dialog.html`;
    let defaultPayload="";
    tableau.extensions.ui.displayDialogAsync(popupUrl, defaultPayload, { height:600, width:500 }).then((closePayload) => {
      drawChartJS();
	  console.log("Exito");
    }).catch((error) => {
      switch (error.errorCode) {
        case tableau.ErrorCodes.DialogClosedByUser:
          console.log("Dialog was closed by user");
          break;
        default:
          console.error(error.message);
      }
    });
  }
})();