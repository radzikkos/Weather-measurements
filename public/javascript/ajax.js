$(document).ready(function() {

    $("#save_locally").click(function(event) {
        let data_from_form = $("#survey_form").serialize();
        var measure = QueryStringToJSON(data_from_form);
        // var flag = false;
        // if ((parseInt(measure['day']) < 1) || (parseInt(measure['day']) > 365)) {
        //     document.getElementById("result1").style.display = 'inline';
        //     $("#result1").html("Dzień może być między 1 a 365");
        //     flag = true;
        // }
        // if ((parseInt(measure['temp']) < -50) || (parseInt(measure['temp']) > 50)) {
        //     $("#result2").html("Temperatura może być między -50 a 50");
        //     flag = true;
        // }
        // if ((parseInt(measure['humidity']) < 0) || (parseInt(measure['humidity']) > 100)) {
        //     $("#result3").html("Wilgotność może być między 0 a 100");
        //     flag = true;
        //     return;
        // }
        // if (!flag) {
        //     $("#result3").html("");
        //     $("#result2").html("");
        //     $("#result1").html("");
        //     addToLocalBase('measures', measure);
        // }
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

    $("#login_form").on("submit", function(event) {
        event.preventDefault();
        $.ajax({
            type: "POST",
            url: "/login",
            data: $(this).serialize(),
            success: function(response) {
                sendFromLocalToServer();
                alert("Zalogowano");
            },
            error: function(response) {
                alert("Nie udało się zalogować");
            }
        })
    });


    $("#survey_form").on("submit", function(event) {
        event.preventDefault();
        $.ajax({
            type: "POST",
            url: "/survey",
            data: $(this).serialize(),
            success: function() {
                alert("Rekord dodano do bazy");
            },
            error: function() {
                alert('Rekord jest już w bazie lub użytkownik jest niezalogowany');
            }
        })
    });
});