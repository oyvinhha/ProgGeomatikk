var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var layerNumber = 0;
var objectNameNumber = 0;
var layers = {};
var colours = [
    [255, 0, 0],
    [0, 255, 0],
    [0, 0, 255],
    [255, 255, 0],
    [0, 255, 255],
    [255, 0, 255]
];
var markers = [];
//navbarTop is the HTML element containing layers and buffer/union/difference/intersection
var navbarTop = document.getElementById("navbarTop");
var toolsDiv = document.createElement("div");
toolsDiv.id = "bufferDiv";
toolsDiv.style.display = "inline-flex";
//Buffer button
var bufferButton = document.createElement("button");
bufferButton.innerText = "Buffer";
bufferButton.style.display = "inline-flex";
bufferButton.onclick = function () {
    var value = layers[selectLayer1.value][0];
    var buffer = turf.buffer(value, parseFloat(bufferInput.value), { units: 'kilometers' }); //+objectNameNumber
    objectNameNumber += 1;
    buffer["properties"] = { "name": buffer["geometry"]["type"] + objectNameNumber };
    var clone = JSON.parse(JSON.stringify(layers));
    updateLayer(buffer);
    var leafletBuffer = L.geoJSON(buffer);
    leafletBuffer.dataForMapStuff = buffer["properties"]["name"];
    leafletBuffer.addTo(map);
};
//Union button
var unionButton = document.createElement("button");
unionButton.style.display = "inline-flex";
unionButton.innerText = "Union";
unionButton.onclick = function () {
    var earlier_thingy = turf.polygon([[
            [-82.560024, 35.585153],
            [-82.560024, 35.602602],
            [-82.52964, 35.602602],
            [-82.52964, 35.585153],
            [-82.560024, 35.585153]
        ]], { "fill": "#00f" });
    var poly1 = selectLayer1.value;
    var poly2 = selectLayer2.value;
    var union = turf.union(layers[poly1][0], layers[poly2][0]);
    objectNameNumber += 1;
    union["properties"]["name"] = union["geometry"]["type"] + objectNameNumber;
    updateLayer(union);
    //overlayMaps["lul"]=L.geoJSON(union);
    //layerControl.addOverlay(L.geoJSON(union), "lul");
    var leafletUnion = L.geoJSON(union);
    leafletUnion.dataForMapStuff = union["properties"]["name"];
    leafletUnion.addTo(map);
};
//Intersect button
var intersectButton = document.createElement("button");
intersectButton.style.display = "inline-flex";
intersectButton.innerText = "Intersect";
intersectButton.onclick = function () {
    var intersect1 = selectLayer1.value;
    var intersect2 = selectLayer2.value;
    var intersect = turf.intersect(layers[intersect1][0], layers[intersect2][0]);
    objectNameNumber += 1;
    intersect["properties"]["name"] = intersect["geometry"]["type"] + objectNameNumber;
    updateLayer(intersect);
    var leafletIntersect = L.geoJSON(intersect);
    leafletIntersect.dataForMapStuff = intersect["properties"]["name"];
    leafletIntersect.addTo(map);
};
//Difference button
var differenceButton = document.createElement("button");
differenceButton.style.display = "inline-flex";
differenceButton.innerText = "Difference";
differenceButton.onclick = function () {
    var difference1 = selectLayer1.value;
    var difference2 = selectLayer2.value;
    var difference = turf.difference(layers[difference1][0], layers[difference2][0]);
    objectNameNumber += 1;
    difference["properties"]["name"] = difference["geometry"]["type"] + objectNameNumber;
    updateLayer(difference);
    layers[difference["properties"]["name"]] = [difference, "visible"];
    var leafletDifference = L.geoJSON(difference);
    leafletDifference.dataForMapStuff = difference["properties"]["name"];
    leafletDifference.addTo(map);
};
//Add stuff to navbarTop
toolsDiv.appendChild(bufferButton);
toolsDiv.appendChild(unionButton);
toolsDiv.appendChild(intersectButton);
toolsDiv.appendChild(differenceButton);
navbarTop.appendChild(toolsDiv);
//Changing color of a layer
function changeColor(myString, color) {
    console.log("inside toggleVisibility");
    map.eachLayer(function (layer) {
        if ((layer instanceof L.Control)) {
            console.log('control layer');
        }
        else if (layer instanceof L.Layer) {
            console.log("hhhheere", layers, layer);
            if (layer["dataForMapStuff"] == myString) {
                console.log("yaaaaay");
                layers[myString][0]["style"] = { "color": "green" };
                console.log(layer);
                layer.setStyle({ color: color });
            }
            else {
                console.log("nooooo", layer["dataForMapStuff"]);
            }
        }
        else {
            console.log("not a layer nor control:", layer);
        }
    });
}
;
//Toggle Visibility of a layer
function toggleVisibility(myString) {
    var currentVisibility = layers[myString][1];
    console.log("inside toggleVisibility");
    console.log(layers);
    if (currentVisibility == "invisible") {
        var abc = L.geoJSON(layers[myString][0]);
        console.log("currentvisibility print", layers[myString][0]);
        map.addLayer(abc);
        layers[myString][1] = "visible";
    }
    else if (currentVisibility == "visible") {
        map.eachLayer(function (layer) {
            if ((layer instanceof L.Control)) {
                console.log('control layer');
            }
            else if (layer instanceof L.Layer && layer.feature && layer.feature.properties && layer.feature.properties.name) {
                console.log(layers);
                try {
                    if (layer.feature.properties.name == myString) {
                        console.log("here", layer);
                        console.log(layer.feature.properties);
                        if (1 == 1) {
                            console.log("We are actually removing this layer (which is a polygon)");
                            console.log(layers);
                            map.removeLayer(layer);
                            layers[myString][1] = "invisible";
                        }
                    }
                    console.log("it went ok!");
                }
                catch (err) {
                    console.log("something went wrong with changing color to yellow!", err);
                    console.log("layer: ", layer);
                }
            }
            else {
                console.log("not a layer nor control: ", layer);
            }
            ;
        });
    }
    else {
        console.log("Layer is neither visible nor invisible...");
    }
}
;
//Create a new layer including all of its components(visible-button, color-button,etc.)
function updateLayer(geoJSONObject, inputType, parameters) {
    if (inputType === void 0) { inputType = ""; }
    if (parameters === void 0) { parameters = []; }
    var geoJSONObjectName = "";
    if (inputType == "polyline") {
        inputType;
    }
    else if (Array.isArray(geoJSONObject)) {
        var lat = geoJSONObject[0];
        var lon = geoJSONObject[1];
        if (!markers) {
        }
        else {
        }
    }
    else {
        console.log("eeeeeeeeeeeeeeeee", geoJSONObject);
        geoJSONObjectName = geoJSONObject["properties"]["name"];
    }
    var clone = JSON.parse(JSON.stringify(layers));
    console.log("layers at the start of updateLayer: ", clone);
    console.log("all layers?", layers[geoJSONObjectName]);
    var cloneLayer = JSON.parse(JSON.stringify(layers));
    console.log("logging layers", cloneLayer);
    layers[geoJSONObjectName] = [geoJSONObject, "visible"];
    clone = JSON.parse(JSON.stringify(layers));
    console.log("layers at the start/middle of updateLayer: ", clone);
    var layerInNavbarList = document.createElement("li");
    layerInNavbarList.setAttribute("data-uniqueId", geoJSONObjectName);
    layerInNavbarList.className = "layersDisplayLayer";
    var buttonsDiv = document.createElement("div");
    buttonsDiv.style.display = "inline";
    buttonsDiv.style.marginLeft = "auto";
    buttonsDiv.style.marginRight = "5px";
    clone = JSON.parse(JSON.stringify(layers));
    console.log("middle of updateLayer", clone);
    console.log("I'm here. ", layersDisplay.children[0]);
    var myButton = document.createElement("button");
    myButton.innerHTML = "&#8593";
    var myButton2 = document.createElement("button");
    myButton2.innerHTML = "&#8595";
    var visibilityButton = document.createElement("button");
    var eye = document.createElement("i");
    eye.className = "fa fa-eye";
    visibilityButton.appendChild(eye);
    visibilityButton.addEventListener('click', function () {
        toggleVisibility(geoJSONObjectName);
        if (eye.style.color == "red") {
            eye.style.color = "black";
        }
        else {
            eye.style.color = "red";
        }
    });
    var colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.style.marginRight = "10px";
    var randomColorArray = [255, 255, 255];
    var randomColorString = "rgb(" + randomColorArray[0].toString() + "," + randomColorArray[1].toString() + "," + randomColorArray[2].toString() + ")";
    colorInput.style.backgroundColor = randomColorString;
    colorInput.onchange = function () {
        console.log("this", this);
        console.log(geoJSONObjectName);
        changeColor(geoJSONObjectName, colorInput.value);
    };
    colorInput.style.borderRadius = "2%";
    var deleteLayerButton = document.createElement("button");
    deleteLayerButton.className = "fa fa-trash-o";
    deleteLayerButton.style.color = "red";
    deleteLayerButton.addEventListener('click', function () {
        console.log("THIS DELETE BUTTON", this, this.parentNode, this.parentElement, this.parentElement);
        console.log("aiaiaaiia", layers);
        var parentElement = this.parentElement;
        map.eachLayer(function (layer) {
            console.log("I needed to print this layer", layer);
            try {
                if (layer.parentElement.querySelector("[data-uniqueid=\"".concat(layer.dataForMapStuff, "\"]"))) {
                    console.log("this went ok!!!!!!!!!!!");
                }
            }
            catch (err) {
                console.log("This did not go ok", err);
            }
        });
        var parentName = parentElement.dataset.uniqueid;
        console.log("layers are(before):", layers);
        console.log(parentName);
        if (!layers[parentName]) {
            console.log("...");
        }
        console.log("layers are(after):", layers);
        map.eachLayer(function (layer) {
            if (layer instanceof L.Layer && layer.feature && layer.feature.properties && layer.feature.properties.name) {
                console.log(layers);
                try {
                    if (layer.feature.properties.name == parentName) {
                        console.log("here here", layer);
                        console.log(layer.feature.properties);
                        if (1 == 1) {
                            console.log("We are actually removing this layer (which is a polygon)");
                            console.log(layers);
                            map.removeLayer(layer);
                            layers[parentName][1] = "supervisible";
                        }
                    }
                }
                catch (_a) {
                }
            }
        });
        delete layers[parentName];
        parentElement.remove();
        console.log("layers are(after):", layers);
        updateSelectLayer1();
        updateSelectLayer2();
    });
    try {
        layerInNavbarList.innerText = geoJSONObjectName;
    }
    catch (err) {
        layerInNavbarList.innerText = "Hard to find a good name";
    }
    buttonsDiv.appendChild(colorInput);
    buttonsDiv.appendChild(myButton);
    buttonsDiv.appendChild(myButton2);
    layerInNavbarList.appendChild(visibilityButton);
    layerInNavbarList.appendChild(buttonsDiv);
    layerInNavbarList.appendChild(deleteLayerButton);
    layersDisplay.appendChild(layerInNavbarList);
    console.log("layers after updateLayer:", layers); //we have duplicate names here!
    updateSelectLayer1();
    updateSelectLayer2();
}
//Initialize layersDisplay
var layersDisplay = document.createElement("ul");
layersDisplay.className = "layersDisplay";
for (var key in layers) {
    console.log("added thing");
    var a = document.createElement("li");
    a.innerText = "abc";
    a.className = "layersDisplayLayer";
    layersDisplay.appendChild(a);
}
navbarTop.appendChild(layersDisplay);
//Choose layers for geographical operations
var chooseLayersThing = document.getElementById("chooseLayers");
var selectLayer1Label = document.createElement('label');
selectLayer1Label.innerText = " Select layer 1: ";
var selectLayer1 = document.createElement('select');
selectLayer1.innerHTML = '';
chooseLayersThing.appendChild(selectLayer1Label);
chooseLayersThing.appendChild(selectLayer1);
function updateSelectLayer1() {
    selectLayer1.innerHTML = '';
    if (layers) {
        var keys = Object.keys(layers);
        console.log("keys", keys);
        for (var i = 0; i < keys.length; i++) {
            console.log("i", i, keys[i]);
            var layerOption = document.createElement('option');
            layerOption.value = keys[i];
            layerOption.text = keys[i];
            selectLayer1.add(layerOption);
            console.log("I am at this place now", layers);
        }
    }
}
updateSelectLayer1();
var chooseLayersThing2 = document.getElementById("chooseLayers");
var selectLayer2Label = document.createElement('label');
selectLayer2Label.innerText = " Select layer 2: ";
var selectLayer2 = document.createElement('select');
selectLayer2.innerHTML = '';
chooseLayersThing2.appendChild(selectLayer2Label);
chooseLayersThing2.appendChild(selectLayer2);
function updateSelectLayer2() {
    selectLayer2.innerHTML = '';
    if (layers) {
        var keys = Object.keys(layers);
        console.log("keys", keys);
        for (var i = 0; i < keys.length; i++) {
            console.log("i", i, keys[i]);
            var layerOption2 = document.createElement('option');
            layerOption2.value = keys[i];
            layerOption2.text = keys[i];
            selectLayer2.add(layerOption2);
            console.log("I am at this place now", layers);
        }
    }
}
updateSelectLayer2();
var bufferInputThing = document.getElementById("chooseLayers");
var bufferInputText = document.createElement('label');
bufferInputText.innerText = " Buffer size(km): ";
var bufferInput = document.createElement('input');
bufferInput.style.width = "100px";
bufferInput.value = "500";
bufferInputThing.appendChild(bufferInputText);
bufferInputThing.appendChild(bufferInput);
//Create the map with map tiles, zoom, scale
var map = L.map('map').setView([65.4, 10], 3);
var osmTiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
});
var baseMaps = {
    "OpenStreetMap": osmTiles,
};
var scale = L.control.scale();
scale.options.imperial = false;
scale.addTo(map);
map.addLayer(baseMaps["OpenStreetMap"]);
//Default data
var line = turf.lineString([[0, 60], [10, 65], [6, 68]]);
console.log("early_line", line);
line["properties"] = { "name": "Default test data" };
console.log(line);
updateLayer(line);
var myLine = L.geoJSON(line);
myLine.setStyle({ color: "red" });
myLine.dataForMapStuff = line["properties"]["name"];
myLine.addTo(map);
var line2 = turf.lineString([[-6.766173240758276, 62.17793745661497], [-15.75386698414654, 65.8235367707753]]); //I assume this is a geojson object? It looks like one when I print it.
line2["properties"] = { "name": "Default test data 2" };
console.log(line2);
updateLayer(line2);
var myLine2 = L.geoJSON(line2);
myLine2.setStyle({ color: "red" });
myLine2.dataForMapStuff = line2["properties"]["name"];
myLine2.addTo(map);
//File upload
function dropHandler(ev) {
    console.log("files have been uploaded");
    ev.preventDefault();
    if (ev.dataTransfer.items) {
        __spreadArray([], ev.dataTransfer.items, true).forEach(function (uploadedFile, i) {
            if (uploadedFile.kind === "file") {
                var file_as_file = uploadedFile.getAsFile();
                var abcdefgh = file_as_file.name.lastIndexOf(".") + 1;
                var format = file_as_file.name.substring(abcdefgh).toLowerCase();
                if (format != "json") {
                    throw new Error("Upload files on the format of JSON!");
                }
                var myFileReader = new FileReader();
                myFileReader.onload = function (event) {
                    var jsonOfFile = event.target.result;
                    try {
                        var jsonObject = JSON.parse(jsonOfFile);
                        if (jsonObject["type"] == "FeatureCollection") {
                            console.log("inside this part here.", jsonObject, jsonObject["features"], jsonObject["features"][i]);
                            for (var i_1 = 0; i_1 < jsonObject["features"].length; i_1++) {
                                var element = jsonObject["features"][i_1];
                                try {
                                    updateLayer(element);
                                    var geoElement = L.geoJSON(element);
                                    geoElement.dataForMapStuff = element["properties"]["name"];
                                    geoElement.addTo(map);
                                }
                                catch (err) {
                                    layerNumber += 1;
                                    updateLayer(element);
                                    var geoElement = L.geoJSON(element);
                                    geoElement.dataForMapStuff = element["properties"]["name"];
                                    geoElement.addTo(map);
                                }
                            }
                        }
                        else {
                            try {
                                jsonObject.addTo(map);
                                updateLayer(jsonObject);
                            }
                            catch (err) {
                                jsonObject.addTo(map);
                                layerNumber += 1;
                                updateLayer(jsonObject);
                            }
                        }
                    }
                    catch (_a) { }
                };
                myFileReader.readAsText(file_as_file);
            }
        });
    }
    else {
        __spreadArray([], ev.dataTransfer.files, true).forEach(function (file, i) {
            console.log("\u2026 file[".concat(i, "].name = ").concat(file.name));
        });
    }
}
function dragOverHandler(ev) {
    ev.preventDefault();
}
var dropZone = document.getElementById("dropZone");
dropZone.addEventListener("drop", dropHandler);
dropZone.addEventListener("dragover", dragOverHandler);
dropZone.style.backgroundColor = "darkgray";
//Settings button
var settings = document.getElementById("settings");
var settingsButton = document.getElementById("settingsButton");
function displaySettings() {
    var imperial = prompt("Use imperial units for scale? (Y/N): ", "N");
    if (imperial == "Y") {
        scale.options.imperial = true;
        scale.addTo(map);
    }
    else {
        scale.options.imperial = false;
        scale.addTo(map);
    }
}
settingsButton.addEventListener("click", displaySettings);
//Place points on the map.
var placePointMode = "black";
function togglePlacePointMode() {
    if (placePointMode == "green") {
        placePointMode = "black";
    }
    else {
        placePointMode = "green";
    }
    var a = document.getElementById("selectAreaButton");
    a.innerText = "Place a point on the map";
    a.style.color = placePointMode;
}
var selectAreaButton = document.createElement("button");
selectAreaButton.id = "selectAreaButton";
selectAreaButton.onclick = togglePlacePointMode;
selectAreaButton.innerText = "Place a point on the map";
var aaaa = document.getElementById("changeNameOfThis");
aaaa.appendChild(selectAreaButton);
map.on('click', function (e) {
    if (placePointMode == "green") {
        if (1 == 1) {
            var marker = L.marker([e.latlng["lat"], e.latlng["lng"]]).addTo(map);
            console.log("Here is the marker:", marker);
            markers.push("marker" + objectNameNumber);
            updateLayer([e.latlng["lat"], e.latlng["lng"]]);
            objectNameNumber += 1;
        }
    }
});
//Place polylines on the map.
var placePolylineMode = "black";
var polylines = [];
function togglePlacePolylineMode() {
    if (placePolylineMode == "green") {
        placePolylineMode = "black";
        var copiedThing = myPolyline;
        copiedThing.addTo(map);
        polylinePoints = [];
    }
    else {
        placePolylineMode = "green";
    }
    var asdfasdfasdasf = document.getElementById("togglePlacePolylineModeButton");
    asdfasdfasdasf.innerText = "Place a polyline on the map";
    asdfasdfasdasf.style.color = placePolylineMode;
}
var togglePlacePolylineModeButton = document.createElement("button");
togglePlacePolylineModeButton.id = "togglePlacePolylineModeButton";
togglePlacePolylineModeButton.onclick = togglePlacePolylineMode;
togglePlacePolylineModeButton.innerText = "Place a polyline on the map";
var bbbb = document.getElementById("togglePlacePolylineModeDiv");
bbbb.appendChild(togglePlacePolylineModeButton);
var polylinePoints = [];
var myPolyline;
map.on('click', function (e) {
    if (placePolylineMode == "green") {
        var newPolylinePoint = new L.LatLng(e.latlng["lat"], e.latlng["lng"]);
        if (polylinePoints.length != 0) {
            console.log("this should be printing");
            map.removeLayer(myPolyline);
            console.log("this should be printing too");
        }
        polylinePoints.push(newPolylinePoint);
        console.log(e.latlng["lat"], e.latlng["lng"], polylinePoints);
        myPolyline = new L.Polyline(polylinePoints, {
            color: 'red',
            weight: 3,
            opacity: 0.5,
        });
        myPolyline.addTo(map);
    }
});
//Place polygons on the map.
var placePolygonMode = "black";
function togglePlacePolygonMode() {
    if (placePolygonMode == "green") {
        placePolygonMode = "black";
        var copiedThing = myPolygon;
        copiedThing.addTo(map);
        polygonPoints = [];
    }
    else {
        placePolygonMode = "green";
    }
    var asdfasdfasdasf = document.getElementById("togglePlacePolygonModeButton");
    asdfasdfasdasf.innerText = "Place a polygon on the map ";
    asdfasdfasdasf.style.color = placePolygonMode;
}
var togglePlacePolygonModeButton = document.createElement("button");
togglePlacePolygonModeButton.id = "togglePlacePolygonModeButton";
togglePlacePolygonModeButton.onclick = togglePlacePolygonMode;
togglePlacePolygonModeButton.innerText = "Place a polygon on the map";
var cccc = document.getElementById("togglePlacePolygonModeDiv");
cccc.appendChild(togglePlacePolygonModeButton);
var polygonPoints = [];
var myPolygon;
map.on('click', function (e) {
    if (placePolygonMode == "green") {
        var newPolygonPoint = new L.LatLng(e.latlng["lat"], e.latlng["lng"]);
        if (polygonPoints.length != 0) {
            console.log("this should be printing");
            map.removeLayer(myPolygon);
            console.log("this should be printing too");
        }
        polygonPoints.push(newPolygonPoint);
        console.log(e.latlng["lat"], e.latlng["lng"], polygonPoints);
        myPolygon = new L.Polygon(polygonPoints, {
            color: 'red',
            weight: 3,
            opacity: 0.5,
        });
        myPolygon.addTo(map);
    }
});
