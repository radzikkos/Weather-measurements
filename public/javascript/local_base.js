var db;
var openRequest = indexedDB.open("db", 2);
var global_data;

openRequest.onupgradeneeded = function() {
    db = openRequest.result;
    if (!db.objectStoreNames.contains('measures')) {
        db.createObjectStore('measures', { keyPath: 'day' });
        console.log("Local database created");
    } else {
        console.log("Local base exists")
    }
}

openRequest.onsuccess = function() {
    db = openRequest.result;
}

openRequest.onerror = function() {
    alert("Cannot create local base -> " + openRequest.error);
}

var getId = function() {
    return '_' + Math.random().toString(36).substr(2, 9);
};

function addToLocalBase(baseName, object) {
    var trans = db.transaction(baseName, "readwrite");
    var measures = trans.objectStore(baseName);
    let request = measures.add(object, object['day']);
    request.onsuccess = () => {
        alert("Dodano pomiar do lokalnej bazy")

    };
    request.onerror = () => {
        alert("Nie można dodać pomiaru do lokalnej bazy -> taka data już istnieje ")

    }
}

function clearLocalBase(baseName) {
    var trans = db.transaction(baseName, "readwrite");
    var measures = trans.objectStore(baseName);
    let request = measures.clear();

    request.onsuccess = () => {
        console.log("Wyczyszczono lokalną bazę");
    };
    request.onerror = () => {
        console.log("Nie udało się wyczyścić lokalnej");
    }
}

function readDataFromLocal(baseName, callback) {
    var trans = db.transaction(baseName, "readwrite");
    var measures = trans.objectStore(baseName);

    var data = [];
    let request = measures.openCursor();
    request.onsuccess = () => {
        let cursor = request.result;
        if (cursor) {
            data.push(cursor.value);
            cursor.continue();
        } else {
            console.log("Brak wiecej danych")
        }
    }

    trans.oncomplete = () => {
        global_data = data;
        console.log("Pobranie danych udało się");
        callback();
    }
    trans.onerror = (error) => {
        console.log("Pobranie danych nie udało się")
    }

}

function sendToServer() {
    for (var i = 0; i < global_data.length; i++) {
        console.log(global_data[i]);
        $.ajax({
            type: "POST",
            url: "/survey",
            data: global_data[i],
            succes: function(data) {
                console.log('Wysłano na serwer');
            },
            error: function() {
                console.log("Nie udało się wysłać na serwer");
            }
        })
    }
    global_data = [];
    clearLocalBase('measures');
}

function sendFromLocalToServer() {
    readDataFromLocal('measures', sendToServer);
}