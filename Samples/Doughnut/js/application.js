'use strict';

(function () {

  let unregisterFilterEventListener = null;
  let unregisterMarkSelectionEventListener = null;
  let worksheet = null;
  let worksheetName = null;
  let categoryColumnNumber = null;
  let valueColumnNumber = null;

  $(document).ready(function () {
    tableau.extensions.initializeAsync({ 'configure':configure }).then(function () {
      // Draw the chart when initialising the dashboard.
      getSettings();
      drawChartJS();
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
    valueColumnNumber = tableau.extensions.settings.get("valueColumnNumber");

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
    unregisterFilterEventListener = worksheet.addEventListener(tableau.TableauEventType.FilterChanged, (filterEvent) => {
      drawChartJS();
    });

    unregisterMarkSelectionEventListener = worksheet.addEventListener(tableau.TableauEventType.MarkSelectionChanged, (filterEvent) => {
      drawChartJS();
    });
  }

  function drawChartJS() {
    worksheet.getSummaryDataAsync().then(function (sumdata) {
      var labels = [];
      var data = [];
      var worksheetData = sumdata.data;
      for (var i=0; i<worksheetData.length; i++) {
        labels.push(worksheetData[i][categoryColumnNumber-1].formattedValue);
        data.push(worksheetData[i][valueColumnNumber-1].value);
      }
      
      var ctx = $("#myChart");
      myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9", "#c45850"],
            data: data
          }]
        }
      });
    });
  }

  function configure() {
    const popupUrl=`${window.location.origin}/extensions-api-master/Samples/Doughnut/dialog.html`;
    let defaultPayload="";
    tableau.extensions.ui.displayDialogAsync(popupUrl, defaultPayload, { height:300, width:500 }).then((closePayload) => {
      drawChartJS();
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