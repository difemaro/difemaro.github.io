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
	console.log("getSettings");
	
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
		console.log("iniciar");
		window.addEventListener('resize', drawChartJS);
	}
	else if (document.attachEvent) {
		console.log("iniciar");
		window.attachEvent('onresize', drawChartJS);
	}
	else {
		console.log("iniciar");
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
		var colors = ['rgb(166,206,227,0.2)', 'rgb(178,223,138,0.2)', 'rgb(251,154,153,0.2)', 'rgb(253,191,111,0.2)',
					  'rgb(202,178,214,0.2)', 'rgb(255,255,153,0.2)', 'rgb(31,120,180,0.2)', 'rgb(51,160,44,0.2)'];	
					  
		//Definir las series del Radial Chart
		for (var i=0; i<worksheetData.length; i++) {
			if (label.length == 0){
				label.push(worksheetData[i][categoryColumnNumber-1].formattedValue);
			}
			if (label.includes(worksheetData[i][categoryColumnNumber-1].formattedValue) == false){
				label.push(worksheetData[i][categoryColumnNumber-1].formattedValue);
			}
		}
		
		//Definir las categorias del Radial Chart
		for (var i=0; i<worksheetData.length; i++) {
			if (labels.length == 0){
				labels.push(worksheetData[i][categoryColumnNumberTo-1].formattedValue);
			}
			if (labels.includes(worksheetData[i][categoryColumnNumberTo-1].formattedValue) == false ){
				labels.push(worksheetData[i][categoryColumnNumberTo-1].formattedValue);
			}
		}

		//console.log("Label");
		//console.log(label);
		//console.log("Labels");
		//console.log(labels);

		//Definir los valores para cada serie
		var dataserie = Array(labels.length);
				
		var k=0;
				
		for (var i=0; i<label.length; i++) {
			dataserie.fill(0);
			console.log(label[i]);
			console.log(dataserie);
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
						  backgroundColor: colors[i].value,
						  data: Object.values(dataserie)};
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
		
		var radarChart = new Chart($("#myChart"), {
		type: 'radar',
		data: marksData
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