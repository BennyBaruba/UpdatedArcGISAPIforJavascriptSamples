/**
 * Created by ben3029 on 10/29/14.
 */
var map, gp, toolbar, mapClick;

require(["esri/map",
        "esri/tasks/Geoprocessor",

        "esri/symbols/PictureMarkerSymbol",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/Color",
        "esri/graphic",
        "esri/tasks/FeatureSet",

        "dojo/on",
        "dojo/dom",
        "dojo/domReady!"],

    function (Map, Geoprocessor, Draw, PictureMarkerSymbol, SimpleMarkerSymbol, SimpleLineSymbol, Color, Graphic, FeatureSet, on, dom) {
        map = new Map("map", {
            basemap: "oceans",
            center: [-43.682, 32.99], // longitude, latitude
            zoom: 3
        });

        //setup the geoprocessor task
        gp = new Geoprocessor("http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_Currents_World/GPServer/MessageInABottle");
        gp.setOutputSpatialReference({
            wkid: 102100
        });

        function setMapClick() {
            mapClick = map.on("click", executeParticleTrack);
        }

        function removeMapClick() {
            mapClick.remove();
        }

        //Connect the GP Tool to the map click event
        on(dom.byId("gpSet"), "click", setMapClick);

        //Dis-connect the GP Tool from the map click event
        on(dom.byId("gpRemove"), "click", removeMapClick);

        function executeParticleTrack(evt) {
            //Clear graphics layer
            map.graphics.clear();

            //Create marker symbol to display when user clicks on map
            var pointSymbol = new SimpleMarkerSymbol();
            pointSymbol.setSize(14);
            pointSymbol.setStyle(SimpleMarkerSymbol.STYLE_DIAMOND);
            pointSymbol.setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 0, 255]), 1));
            pointSymbol.setColor(new Color([0, 255, 0, 0.50]));

            //Create graphic
            var graphic = new Graphic(evt.mapPoint, pointSymbol);

            //Add graphic to the map
            map.graphics.add(graphic);

            //Create feature set to pass into GP Task
            var features = [];
            features.push(graphic);
            var featureSet = new FeatureSet();
            featureSet.features = features;

            //set the input parameters.  View the task in the services explorer to see the input variables required to run the model.
            //see http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_Currents_World/GPServer/MessageInABottle
            var params = {"Input_Point": featureSet, "Days": dojo.byId("days").value};

            //Execute GP Task - synchronous gp service
            gp.execute(params, displayTrack);

        }

        function displayTrack(results, messages) {

            //Create line symbol for GP result
            var simpleLineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 255, 0]), 3);

            //Take features returned in a feature set from the server and place them in a variable
            var features = results[0].value.features;

            //Loop through all the features, add symbology and add to graphics layer
            dojo.forEach(features, function (feature) {
                feature.setSymbol(simpleLineSymbol);
                map.graphics.add(feature);
            });

        }

    });