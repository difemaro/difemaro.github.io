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
        $('.select').select2();
    }

    function columnsUpdate() {

        var worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
        var worksheetName = $("#selectWorksheet").val();

        var worksheet = worksheets.find(function (sheet) {
            return sheet.name === worksheetName;
        });      

        
		
		worksheet.getSummaryDataAsync({ maxRows: 1 }).then(function (sumdata) {
            var worksheetColumns = sumdata.columns;
            $("#selectCategoryFrom").text("");
            $("#selectCategoryTo").text("");			
            $("#selectValue").text("");
			$("#selectFill").text("");
            var counter = 1;
            worksheetColumns.forEach(function (current_value) {
                $("#selectCategoryFrom").append("<option value='" + counter + "'>"+current_value.fieldName+"</option>");
                $("#selectCategoryTo").append("<option value='" + counter + "'>"+current_value.fieldName+"</option>");				
                $("#selectValue").append("<option value='" + counter + "'>"+current_value.fieldName+"</option>");
                counter++;
            });
			
			$("#selectFill").append("<option value='" + 1 + "'>"+"Yes"+"</option>");
			$("#selectFill").append("<option value='" + 2 + "'>"+"No"+"</option>");
			
            $("#selectCategory").val(tableau.extensions.settings.get("categoryColumnNumber"));
			$("#selectCategoryTo").val(tableau.extensions.settings.get("categoryColumnNumberTo"));
            $("#selectValue").val(tableau.extensions.settings.get("valueColumnNumber"));
			$("#selectFill").val(tableau.extensions.settings.get("filled"));
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
		tableau.extensions.settings.saveAsync().then((currentSettings) => {
			tableau.extensions.ui.closeDialog("10");
        });
    }
})();