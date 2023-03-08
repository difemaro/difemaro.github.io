'use strict';

(function () {
  let unregisterSettingsEventListener = null;	
  let unregisterFilterEventListener = null;
  let unregisterMarkSelectionEventListener = null;
  let worksheet = null;
  let worksheetName = null;
  let categoryColumnNumber = null;
  let categoryColumnNumberTo = null;
  let valueColumnNumber = null;
  let _unregisterHandlerFunctions = null;

  $(document).ready(function () {
    tableau.extensions.initializeAsync({ 'configure':configure }).then(function () {
      // Draw the chart when initialising the dashboard.
		  if (tableau.extensions.settings.get("worksheet") != null){
			  console.log("initialize2");
			  getSettings();
			  google.charts.setOnLoadCallback(drawChartJS);
			  drawChartJS();
		  }
		  if (tableau.extensions.settings.get("configured") != 1) {
				configure();
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
	
	_unregisterHandlerFunctions = [];
	tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(
        function (parameters) {
             parameters.forEach(function (parameter) {
                 var unregisterHandlerFunction = parameter.addEventListener(tableau.TableauEventType.ParameterChanged, function (selectionEvent) {
                       // When the selection changes, redraw
                       drawChartJS();
                 })
                 _unregisterHandlerFunctions.push(unregisterHandlerFunction);
             })
        }
	);
	
	
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
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'From');
        data.addColumn('string', 'To');
        data.addColumn('number', 'Weight');
        
        for (var i=0; i<worksheetData.length; i++) {
			data.addRow([worksheetData[i][categoryColumnNumber-1].formattedValue, worksheetData[i][categoryColumnNumberTo-1].formattedValue , worksheetData[i][valueColumnNumber-1].value ]);
		}

		var colors = ['#a6cee3', '#b2df8a', '#fb9a99', '#fdbf6f',
					  '#cab2d6', '#ffff99', '#1f78b4', '#33a02c'];	
					  
        // Sets chart options.
        var options = {
            width: $(sankey_basic).width()*0.99,
			height: $(sankey_basic).height()*0.99,
			sankey: {
				node: {
				  colors: colors
				},
				link: {
				  colorMode: 'gradient',
				  colors: colors
				}
			}
        };

        // Instantiates and draws our chart, passing in some options.
        var chart = new google.visualization.Sankey(document.getElementById('sankey_basic'));
        chart.draw(data, options);	
	})
  }

  function configure() {
    const popupUrl=`${window.location.origin}/Extensiones/Samples/Sankey/dialog.html`;
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