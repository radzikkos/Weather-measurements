$(document).ready(function() {

    $("#save_locally").click(function(event) {
        let data_from_form = $("#survey_form").serialize();
        var measure = QueryStringToJSON(data_from_form);
        addToLocalBase('measures', measure);
    })

    function QueryStringToJSON(queryString) {
        var pairs = queryString.split('&');

        var result = {};
        pairs.forEach(function(pair) {
            pair = pair.split('=');
            result[pair[0]] = decodeURIComponent(pair[1] || '');
        });

        return JSON.parse(JSON.stringify(result));
    }

    $("#get_results_offline").click(function(event) {
        // event.preventDefault();
        readDataFromLocal('measures', () => {
            console.log("Udało się pobrać");
        });
        $("#offline_results").html("");

        var output = '';
        if (typeof global_data !== 'undefined') {
            output += '<table class="table table-stripped">';
            output += '<thead class="thead-light"><tr>';

            for (var heading in global_data[0]) {
                output += '<th>' + heading + '</th>';
            }
            output += '</tr></thead>';
            output += '<tbody>';

            for (var i = 0; i < global_data.length; i++) {
                output += '<tr>';
                for (var field in global_data[i]) {
                    output += '<td>' + global_data[i][field] + '</td>';
                }
                output += '</tr>';
            }
            output += '</tbody>';
            output += '</table>';
        }
        $("#offline_results").append(output);
    })
});