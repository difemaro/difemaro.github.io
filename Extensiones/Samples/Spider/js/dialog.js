'use strict';

(function () {

    $(document).ready(function () {
        tableau.extensions.initializeDialogAsync().then(function (openPayload) {
			buildDialog();
        });
    });

    function buildDialog() {
        let dashboard = tableau.extensions.dashboardContent.dashboard;
        dashboard.worksheets.forEach(function (worksheet) {
            $("#selectWorksheet").append("<option value='" + worksheet.name + "'>" + worksheet.name + "</option>");
        });
        var worksheetName = tableau.extensions.settings.get("worksheet");
        if (worksheetName != undefined) {
            $("#selectWorksheet").val(worksheetName);
            columnsUpdate();
        }

        $('#selectWorksheet').on('change', '', function (e) {
            columnsUpdate();
        });
        $('#cancel').click(closeDialog);
        $('#save').click(saveButton);
        //$('.select').select2();
    }

    function columnsUpdate() {

        var worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
        var worksheetName = $("#selectWorksheet").val();

        var worksheet = worksheets.find(function (sheet) {
            return sheet.name === worksheetName;
        });       
		
		worksheet.getSummaryDataAsync({ maxRows: 1 }).then(function (sumdata) {
            var worksheetColumns = sumdata.columns;
			console.log(worksheetColumns);
            $("#selectCategoryFrom").text("");
            $("#selectCategoryTo").text("");			
            $("#selectValue").text("");
			$("#selectFill").text("");
			$("#selectLegend").text("");
			$("#selectAxisLabels").text("");
			$("#selectOpacity").text("");			
			
            var counter = 1;
            worksheetColumns.forEach(function (current_value) {
				if (current_value.dataType != "integer" && current_value.dataType != "float"){
					$("#selectCategoryFrom").append("<option value='" + counter + "'>" + current_value.fieldName + "</option>");
					$("#selectCategoryTo").append("<option value='" + counter + "'>" + current_value.fieldName + "</option>");				
				}else{
				$("#selectValue").append("<option value='" + counter + "'>"+current_value.fieldName+"</option>");
				}
                counter++;
            });
					
			//Llenar el box de rellenar o no			
			$("#selectFill").append("<option value='" + 1 + "'>"+"Yes"+"</option>");
			$("#selectFill").append("<option value='" + 2 + "'>"+"No"+"</option>");

			//Llenar el box de Legend
			$("#selectLegend").append("<option value='" + 1 + "'>"+"Yes"+"</option>");
			$("#selectLegend").append("<option value='" + 2 + "'>"+"No"+"</option>");

			//Llenar el box de Axis Labels
			$("#selectAxisLabels").append("<option value='" + 1 + "'>"+"Yes"+"</option>");
			$("#selectAxisLabels").append("<option value='" + 2 + "'>"+"No"+"</option>");

			//Llenar el box de Axis Reversed
			$("#reverseAxisLabels").append("<option value='" + 1 + "'>"+"Yes"+"</option>");
			$("#reverseAxisLabels").append("<option value='" + 2 + "'>"+"No"+"</option>");

			
			//Llenar el box de opacidad
			$("#selectOpacity").append("<option value='" + 0.1 + "'>"+"10"+"</option>");
			$("#selectOpacity").append("<option value='" + 0.2 + "'>"+"20"+"</option>");
			$("#selectOpacity").append("<option value='" + 0.3 + "'>"+"30"+"</option>");
			$("#selectOpacity").append("<option value='" + 0.4 + "'>"+"40"+"</option>");
			$("#selectOpacity").append("<option value='" + 0.5 + "'>"+"50"+"</option>");
			$("#selectOpacity").append("<option value='" + 0.6 + "'>"+"60"+"</option>");
			$("#selectOpacity").append("<option value='" + 0.7 + "'>"+"70"+"</option>");
			$("#selectOpacity").append("<option value='" + 0.8 + "'>"+"80"+"</option>");
			$("#selectOpacity").append("<option value='" + 0.9 + "'>"+"90"+"</option>");
			$("#selectOpacity").append("<option value='" + 1 + "'>"+"100"+"</option>");
			
			//Llenar las casillas si hay una configuración cargada
            $("#selectCategoryFrom").val(tableau.extensions.settings.get("categoryColumnNumber"));
			$("#selectCategoryTo").val(tableau.extensions.settings.get("categoryColumnNumberTo"));
            $("#selectValue").val(tableau.extensions.settings.get("valueColumnNumber"));
			$("#selectFill").val(tableau.extensions.settings.get("filled"));
			$("#selectLegend").val(tableau.extensions.settings.get("legend"));
			$("#selectAxisLabels").val(tableau.extensions.settings.get("axislabel"));
			$("#reverseAxisLabels").val(tableau.extensions.settings.get("reverseaxislabel"));
			$("#selectOpacity").val(tableau.extensions.settings.get("opacity"));
        });
    }

    function reloadSettings() {
        
    }

    function closeDialog() {
        tableau.extensions.ui.closeDialog("10");
    }

    function saveButton() {
		console.log($("#selectWorksheet").val()); 
        tableau.extensions.settings.set("worksheet", $("#selectWorksheet").val());
        tableau.extensions.settings.set("categoryColumnNumber", $("#selectCategoryFrom").val());
		tableau.extensions.settings.set("categoryColumnNumberTo", $("#selectCategoryTo").val());
        tableau.extensions.settings.set("valueColumnNumber", $("#selectValue").val());
		tableau.extensions.settings.set("filled", $("#selectFill").val());
		tableau.extensions.settings.set("legend", $("#selectLegend").val());
		tableau.extensions.settings.set("axislabel", $("#selectAxisLabels").val());
		tableau.extensions.settings.set("reverseaxislabel", $("#reverseAxisLabels").val());
		tableau.extensions.settings.set("opacity", $("#selectOpacity").val());
		tableau.extensions.settings.set("configured", 1);
		tableau.extensions.settings.saveAsync().then((currentSettings) => {
			tableau.extensions.ui.closeDialog("10");
        });
    }
})();