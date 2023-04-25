var kwPanelUrl = "https://staging.knowwheregraph.org/graphdb/repositories/KWG-Lite";

//Use this to format financial values
const dollarFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
});

function getHazardEntity(entityUri) {
    var hazardQuery = "PREFIX kwgl-ont: <http://stko-kwg.geog.ucsb.edu/lod/lite-ontology/>\n" +
        "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
        "PREFIX kwglr: <http://stko-kwg.geog.ucsb.edu/lod/lite-resource/>\n" +
        "select ?hazard ?name ?fullentity ?type ?subtype ?start ?end (GROUP_CONCAT(?place ; separator=\"||\") AS ?places) " +
        "(GROUP_CONCAT(?pName ; separator=\"||\") AS ?pNames) ?area ?deaths ?infrastructuredamage ?cropdamage\n" +
        "where { \n" +
        "    ?hazard a kwgl-ont:HazardEvent.\n" +
        "    FILTER (?hazard = kwglr:" + entityUri + ") \n" +
        "    ?hazard kwgl-ont:hasName ?name.\n" +
        "    ?hazard kwgl-ont:hasKWGEntity ?fullentity.\n" +
        "    optional { \n" +
        "        ?hazard rdf:type ?type.\n" +
        "        FILTER(?type != kwgl-ont:HazardEvent) . \n" +
        "    }\n" +
        "    optional { ?hazard kwgl-ont:isOfFireType ?subtype. }\n" +
        "    optional { ?hazard kwgl-ont:hasStartDate ?start. }\n" +
        "    optional { ?hazard kwgl-ont:hasEndDate ?end. }\n" +
        "    optional {\n" +
        "        ?hazard kwgl-ont:hasImpacted ?place.\n" +
        "        ?place kwgl-ont:hasName ?pName.\n" +
        "        ?place kwgl-ont:hasKWGEntity ?pEntity.\n" +
        "    }\n" +
        "    optional { ?hazard kwgl-ont:affectedAreaInAcres ?area. }\n" +
        "    optional { ?hazard kwgl-ont:numberOfDeaths ?deaths. }\n" +
        "    optional { ?hazard kwgl-ont:damageToInfrastructureInDollars ?infrastructuredamage. }\n" +
        "    optional { ?hazard kwgl-ont:damageToCropsInDollars ?cropdamage. }\n" +
        "} GROUP BY ?hazard ?name ?fullentity ?type ?subtype ?start ?end ?area ?deaths ?infrastructuredamage ?cropdamage";

    submitQuery(hazardQuery, "drawHazardEntity");
}

function getRandomHazards() {
    var hazardQuery = "PREFIX kwgl-ont: <http://stko-kwg.geog.ucsb.edu/lod/lite-ontology/>\n" +
        "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
        "PREFIX kwglr: <http://stko-kwg.geog.ucsb.edu/lod/lite-resource/>\n" +
        "select ?hazard ?name ?fullentity ?type ?subtype ?start ?end (GROUP_CONCAT(?place ; separator=\"||\") AS ?places) " +
        "(GROUP_CONCAT(?pName ; separator=\"||\") AS ?pNames) ?area ?deaths ?infrastructuredamage ?cropdamage\n" +
        "where { \n" +
        "    ?hazard a kwgl-ont:HazardEvent.\n" +
        "    ?hazard kwgl-ont:hasName ?name.\n" +
        "    ?hazard kwgl-ont:hasKWGEntity ?fullentity.\n" +
        "    optional { \n" +
        "        ?hazard rdf:type ?type.\n" +
        "        FILTER(?type != kwgl-ont:HazardEvent) . \n" +
        "    }\n" +
        "    optional { ?hazard kwgl-ont:isOfFireType ?subtype. }\n" +
        "    optional { ?hazard kwgl-ont:hasStartDate ?start. }\n" +
        "    optional { ?hazard kwgl-ont:hasEndDate ?end. }\n" +
        "    optional {\n" +
        "        ?hazard kwgl-ont:hasImpacted ?place.\n" +
        "        ?place kwgl-ont:hasName ?pName.\n" +
        "        ?place kwgl-ont:hasKWGEntity ?pEntity.\n" +
        "    }\n" +
        "    optional { ?hazard kwgl-ont:affectedAreaInAcres ?area. }\n" +
        "    optional { ?hazard kwgl-ont:numberOfDeaths ?deaths. }\n" +
        "    optional { ?hazard kwgl-ont:damageToInfrastructureInDollars ?infrastructuredamage. }\n" +
        "    optional { ?hazard kwgl-ont:damageToCropsInDollars ?cropdamage. }\n" +
        "} GROUP BY ?hazard ?name ?fullentity ?type ?subtype ?start ?end ?area ?deaths ?infrastructuredamage ?cropdamage ORDER BY RAND() LIMIT 10";

    submitQuery(hazardQuery, "drawBrowseHazards");
}

function drawHazardEntity(result) {
    let hazard = result[0];
    console.log(hazard);

    $('.hazard-name-js').text(hazard['name']['value']);

    let cardHeader = hazard['name']['value'];

    if(hazard['subtype'] != null)
        cardHeader += " (" + hazard['subtype']['value'].split('/').slice(-1) + ")";
    else if(hazard['type'] != null)
        cardHeader += " (" + hazard['type']['value'].split('/').slice(-1) + ")";

    let hazardHtml = "<h2>" + cardHeader + "</h2>";

    let propertyString = "";
    if(hazard['start'] != null) {
        const date = new Date(hazard['start']['value']);
        propertyString += "<span><b>Start Date:</b> " + date.toString().split(' (')[0] + "</span>";
    }
    if(hazard['end'] != null) {
        const date = new Date(hazard['end']['value']);
        propertyString += "<span><b>End Date:</b> " + date.toString().split(' (')[0] + "</span>";
    }
    if(hazard['area'] != null)
        propertyString += "<span><b>Area affected:</b> " + hazard['area']['value'] + " acres</span>";
    if(hazard['deaths'] != null)
        propertyString += "<span><b>Death toll:</b> " + hazard['deaths']['value'] + "</span>";
    if(hazard['infrastructuredamage'] != null)
        propertyString += "<span><b>Loss of Infrastructure:</b> " + dollarFormatter.format(hazard['infrastructuredamage']['value']) + "</span>";
    if(hazard['cropdamage'] != null)
        propertyString += "<span><b>Loss of Crops:</b> " + dollarFormatter.format(hazard['cropdamage']['value']) + "</span>";
    if(propertyString != "")
        hazardHtml += "<p>" + propertyString + "</p>";

    $('.hazard-card-js').prepend(hazardHtml);

    $('.hazard-uri-js').attr("href", hazard['fullentity']['value']);

    let baseURL = location.protocol + '//' + location.host + location.pathname;
    let iframeText = '<iframe src="' + baseURL + 'embed/?hazard='
        + hazard['hazard']['value'].split('/').slice(-1)
        + '" title="' + hazard['name']['value'] + ' - KW Panel" style="height:'
        + $('.hazard-card-js').outerHeight()
        + 'px"></iframe>';

    $('.hazard-iframe-header-js').text("Embed " + hazard['name']['value']);
    $('.hazard-iframe-js').val(iframeText);

    let placesHtml = "";
    if(hazard['places'] != null && hazard['places']['value'] != '') {
        let places = hazard['places']['value'].split('||');
        let placeNames = hazard['pNames']['value'].split('||');
        for (var i = 0; i < places.length; i++) {
            let relatedName = places[i].split('/').slice(-1);
            placesHtml += '<div class="prototype-card"><h4>' + placeNames[i] + '</h4><a href="../place/?place=' + relatedName + '" class="hidden"></a> </div>';
        }
        $('.hazard-impacted-js').html(placesHtml);
    } else {
        $('.hazard-impacted-header-js').remove();
        $('.hazard-impacted-js').remove();
    }
}

function drawBrowseHazards(result) {
    console.log(result);
    let browseHtml = "";
    for (var i = 0; i < result.length; i++) {
        let entity = result[i];
        let relatedName = entity['hazard']['value'].split('/').slice(-1)
        browseHtml += '<div class="prototype-card"><h4>' + entity['name']['value'] + '</h4><a href="../hazard/?hazard=' + relatedName + '" class="hidden"></a> </div>';
    }
    $('.featured-hazards-js').html(browseHtml);
}

function getPlaceEntity(entityUri) {
    var placeQuery = "PREFIX kwgl-ont: <http://stko-kwg.geog.ucsb.edu/lod/lite-ontology/>\n" +
        "PREFIX kwglr: <http://stko-kwg.geog.ucsb.edu/lod/lite-resource/>\n" +
        "select ?place ?name ?fullentity (GROUP_CONCAT(?within ; separator=\"||\") AS ?withins) (GROUP_CONCAT(?wName ; separator=\"||\") AS ?wNames) " +
        "(GROUP_CONCAT(?contain ; separator=\"||\") AS ?contains) (GROUP_CONCAT(?cName ; separator=\"||\") AS ?cNames) " +
        "(GROUP_CONCAT(?touch ; separator=\"||\") AS ?touches) (GROUP_CONCAT(?tName ; separator=\"||\") AS ?tNames) " +
        "(GROUP_CONCAT(?overlap ; separator=\"||\") AS ?overlaps) (GROUP_CONCAT(?oName ; separator=\"||\") AS ?oNames) " +
        "(GROUP_CONCAT(?hazard ; separator=\"||\") AS ?hazards) (GROUP_CONCAT(?hName ; separator=\"||\") AS ?hNames) " +
        "?avgTemp ?maxTemp ?minTemp ?obese ?poverty ?diabetic ?population ?households " +
        "where { \n" +
        "    ?place a kwgl-ont:Place.\n" +
        "    FILTER (?place = kwglr:" + entityUri + ") \n" +
        "    ?place kwgl-ont:hasName ?name.\n" +
        "    ?place kwgl-ont:hasKWGEntity ?fullentity.\n" +
        "    optional { " +
        "        ?place kwgl-ont:sfWithin ?within. " +
        "        ?within kwgl-ont:hasName ?wName.\n" +
        "        ?within kwgl-ont:hasKWGEntity ?wEntity.\n" +
        "    }\n" +
        "    optional { " +
        "        ?place kwgl-ont:sfContains ?contain. " +
        "        ?contain kwgl-ont:hasName ?cName.\n" +
        "        ?contain kwgl-ont:hasKWGEntity ?cEntity.\n" +
        "    }\n" +
        "    optional { " +
        "        ?place kwgl-ont:sfTouches ?touch. " +
        "        ?touch kwgl-ont:hasName ?tName.\n" +
        "        ?touch kwgl-ont:hasKWGEntity ?tEntity.\n" +
        "    }\n" +
        "    optional { " +
        "        ?place kwgl-ont:sfOverlaps ?overlap. " +
        "        ?overlap kwgl-ont:hasName ?oName.\n" +
        "        ?overlap kwgl-ont:hasKWGEntity ?oEntity.\n" +
        "    }\n" +
        "    optional { " +
        "        ?place kwgl-ont:impactedBy ?hazard. " +
        "        ?hazard kwgl-ont:hasName ?hName.\n" +
        "        ?hazard kwgl-ont:hasKWGEntity ?hEntity.\n" +
        "    }\n" +
        "    optional { ?place kwgl-ont:averageMonthlyTemperatureInCelcius ?avgTemp. }\n" +
        "    optional { ?place kwgl-ont:maximumMonthlyTemperatureInCelcius ?maxTemp. }\n" +
        "    optional { ?place kwgl-ont:minimumMonthlyTemperatureInCelcius ?minTemp. }\n" +
        "    optional { ?place kwgl-ont:percentObese ?obese. }\n" +
        "    optional { ?place kwgl-ont:percentBelowPovertyLine ?poverty. }\n" +
        "    optional { ?place kwgl-ont:percentDiabetic ?diabetic. }\n" +
        "    optional { ?place kwgl-ont:hasPopulation ?population. }\n" +
        "    optional { ?place kwgl-ont:hasNumberOfHouseHolds ?households. }\n" +
        "} GROUP BY ?place ?name ?fullentity ?avgTemp ?maxTemp ?minTemp ?obese ?poverty ?diabetic ?population ?households";

    submitQuery(placeQuery, "drawPlaceEntity");
}

function getPlaceEntityYearData(entityUri) {
    var placeYearQuery = "PREFIX kwgl-ont: <http://stko-kwg.geog.ucsb.edu/lod/lite-ontology/>\n" +
        "PREFIX kwglr: <http://stko-kwg.geog.ucsb.edu/lod/lite-resource/>\n" +
        "select \n" +
        "?fireCnt18 ?fireCnt19 ?fireCnt20 ?fireCnt21 ?fireCnt22 \n" +
        "?hurricaneCnt18 ?hurricaneCnt19 ?hurricaneCnt20 ?hurricaneCnt21 ?hurricaneCnt22 \n" +
        "?earthquakeCnt18 ?earthquakeCnt19 ?earthquakeCnt20 ?earthquakeCnt21 ?earthquakeCnt22 \n" +
        "?tornadoCnt18 ?tornadoCnt19 ?tornadoCnt20 ?tornadoCnt21 ?tornadoCnt22 \n" +
        "?surgeCnt18 ?surgeCnt19 ?surgeCnt20 ?surgeCnt21 ?surgeCnt22 \n" +
        "?floodCnt18 ?floodCnt19 ?floodCnt20 ?floodCnt21 ?floodCnt22\n" +
        "?landslideCnt18 ?landslideCnt19 ?landslideCnt20 ?landslideCnt21 ?landslideCnt22\n" +
        "?debrisCnt18 ?debrisCnt19 ?debrisCnt20 ?debrisCnt21 ?debrisCnt22\n" +
        "?fireCost18 ?fireCost19 ?fireCost20 ?fireCost21 ?fireCost22 \n" +
        "?hurricaneCost18 ?hurricaneCost19 ?hurricaneCost20 ?hurricaneCost21 ?hurricaneCost22 \n" +
        "?earthquakeCost18 ?earthquakeCost19 ?earthquakeCost20 ?earthquakeCost21 ?earthquakeCost22 \n" +
        "?tornadoCost18 ?tornadoCost19 ?tornadoCost20 ?tornadoCost21 ?tornadoCost22 \n" +
        "?surgeCost18 ?surgeCost19 ?surgeCost20 ?surgeCost21 ?surgeCost22 \n" +
        "?floodCost18 ?floodCost19 ?floodCost20 ?floodCost21 ?floodCost22\n" +
        "?landslideCost18 ?landslideCost19 ?landslideCost20 ?landslideCost21 ?landslideCost22\n" +
        "?debrisCost18 ?debrisCost19 ?debrisCost20 ?debrisCost21 ?debrisCost22\n" +
        "where { \n" +
        "    ?place a kwgl-ont:Place.\n" +
        "    FILTER (?place = kwglr:" + entityUri + ") \n" +
        "    ?place kwgl-ont:hasName ?name.\n" +
        "    ?place kwgl-ont:hasKWGEntity ?fullentity.\n" +
        "    \n" +
        "    optional { ?place kwgl-ont:numberOfFiresImpactingPlace2018 ?fireCnt18. }\n" +
        "    optional { ?place kwgl-ont:numberOfFiresImpactingPlace2019 ?fireCnt19. }\n" +
        "    optional { ?place kwgl-ont:numberOfFiresImpactingPlace2020 ?fireCnt20. }\n" +
        "    optional { ?place kwgl-ont:numberOfFiresImpactingPlace2021 ?fireCnt21. }\n" +
        "    optional { ?place kwgl-ont:numberOfFiresImpactingPlace2022 ?fireCnt22. }\n" +
        "    \n" +
        "    optional { ?place kwgl-ont:numberOfHurricanesImpactingPlace2018 ?hurricaneCnt18. }\n" +
        "    optional { ?place kwgl-ont:numberOfHurricanesImpactingPlace2019 ?hurricaneCnt19. }\n" +
        "    optional { ?place kwgl-ont:numberOfHurricanesImpactingPlace2020 ?hurricaneCnt20. }\n" +
        "    optional { ?place kwgl-ont:numberOfHurricanesImpactingPlace2021 ?hurricaneCnt21. }\n" +
        "    optional { ?place kwgl-ont:numberOfHurricanesImpactingPlace2022 ?hurricaneCnt22. }\n" +
        "    \n" +
        "    optional { ?place kwgl-ont:numberOfEarthquakesImpactingPlace2018 ?earthquakeCnt18. }\n" +
        "    optional { ?place kwgl-ont:numberOfEarthquakesImpactingPlace2019 ?earthquakeCnt19. }\n" +
        "    optional { ?place kwgl-ont:numberOfEarthquakesImpactingPlace2020 ?earthquakeCnt20. }\n" +
        "    optional { ?place kwgl-ont:numberOfEarthquakesImpactingPlace2021 ?earthquakeCnt21. }\n" +
        "    optional { ?place kwgl-ont:numberOfEarthquakesImpactingPlace2022 ?earthquakeCnt22. }\n" +
        "    \n" +
        "    optional { ?place kwgl-ont:numberOfTornadoesImpactingPlace2018 ?tornadoCnt18. }\n" +
        "    optional { ?place kwgl-ont:numberOfTornadoesImpactingPlace2019 ?tornadoCnt19. }\n" +
        "    optional { ?place kwgl-ont:numberOfTornadoesImpactingPlace2020 ?tornadoCnt20. }\n" +
        "    optional { ?place kwgl-ont:numberOfTornadoesImpactingPlace2021 ?tornadoCnt21. }\n" +
        "    optional { ?place kwgl-ont:numberOfTornadoesImpactingPlace2022 ?tornadoCnt22. }\n" +
        "    \n" +
        "    optional { ?place kwgl-ont:numberOfStormSurgesImpactingPlace2018 ?surgeCnt18. }\n" +
        "    optional { ?place kwgl-ont:numberOfStormSurgesImpactingPlace2019 ?surgeCnt19. }\n" +
        "    optional { ?place kwgl-ont:numberOfStormSurgesImpactingPlace2020 ?surgeCnt20. }\n" +
        "    optional { ?place kwgl-ont:numberOfStormSurgesImpactingPlace2021 ?surgeCnt21. }\n" +
        "    optional { ?place kwgl-ont:numberOfStormSurgesImpactingPlace2022 ?surgeCnt22. }\n" +
        "    \n" +
        "    optional { ?place kwgl-ont:numberOfFloodsImpactingPlace2018 ?floodCnt18. }\n" +
        "    optional { ?place kwgl-ont:numberOfFloodsImpactingPlace2019 ?floodCnt19. }\n" +
        "    optional { ?place kwgl-ont:numberOfFloodsImpactingPlace2020 ?floodCnt20. }\n" +
        "    optional { ?place kwgl-ont:numberOfFloodsImpactingPlace2021 ?floodCnt21. }\n" +
        "    optional { ?place kwgl-ont:numberOfFloodsImpactingPlace2022 ?floodCnt22. }\n" +
        "    \n" +
        "    optional { ?place kwgl-ont:numberOfLandslidesImpactingPlace2018 ?landslideCnt18. }\n" +
        "    optional { ?place kwgl-ont:numberOfLandslidesImpactingPlace2019 ?landslideCnt19. }\n" +
        "    optional { ?place kwgl-ont:numberOfLandslidesImpactingPlace2020 ?landslideCnt20. }\n" +
        "    optional { ?place kwgl-ont:numberOfLandslidesImpactingPlace2021 ?landslideCnt21. }\n" +
        "    optional { ?place kwgl-ont:numberOfLandslidesImpactingPlace2022 ?landslideCnt22. }\n" +
        "    \n" +
        "    optional { ?place kwgl-ont:numberOfDebrisFlowEventsImpactingPlace2018 ?debrisCnt18. }\n" +
        "    optional { ?place kwgl-ont:numberOfDebrisFlowEventsImpactingPlace2019 ?debrisCnt19. }\n" +
        "    optional { ?place kwgl-ont:numberOfDebrisFlowEventsImpactingPlace2020 ?debrisCnt20. }\n" +
        "    optional { ?place kwgl-ont:numberOfDebrisFlowEventsImpactingPlace2021 ?debrisCnt21. }\n" +
        "    optional { ?place kwgl-ont:numberOfDebrisFlowEventsImpactingPlace2022 ?debrisCnt22. }\n" +
        "    \n" +
        "    optional { ?place kwgl-ont:dollarDamageOfFiresImpactingPlace2018 ?fireCost18. }\n" +
        "    optional { ?place kwgl-ont:dollarDamageOfFiresImpactingPlace2019 ?fireCost19. }\n" +
        "    optional { ?place kwgl-ont:dollarDamageOfFiresImpactingPlace2020 ?fireCost20. }\n" +
        "    optional { ?place kwgl-ont:dollarDamageOfFiresImpactingPlace2021 ?fireCost21. }\n" +
        "    optional { ?place kwgl-ont:dollarDamageOfFiresImpactingPlace2022 ?fireCost22. }\n" +
        "    \n" +
        "    optional { ?place kwgl-ont:dollarDamageOfHurricanesImpactingPlace2018 ?hurricaneCost18. }\n" +
        "    optional { ?place kwgl-ont:dollarDamageOfHurricanesImpactingPlace2019 ?hurricaneCost19. }\n" +
        "    optional { ?place kwgl-ont:dollarDamageOfHurricanesImpactingPlace2020 ?hurricaneCost20. }\n" +
        "    optional { ?place kwgl-ont:dollarDamageOfHurricanesImpactingPlace2021 ?hurricaneCost21. }\n" +
        "    optional { ?place kwgl-ont:dollarDamageOfHurricanesImpactingPlace2022 ?hurricaneCost22. }\n" +
        "    \n" +
        "    optional { ?place kwgl-ont:dollarDamageOfEarthquakesImpactingPlace2018 ?earthquakeCost18. }\n" +
        "    optional { ?place kwgl-ont:dollarDamageOfEarthquakesImpactingPlace2019 ?earthquakeCost19. }\n" +
        "    optional { ?place kwgl-ont:dollarDamageOfEarthquakesImpactingPlace2020 ?earthquakeCost20. }\n" +
        "    optional { ?place kwgl-ont:dollarDamageOfEarthquakesImpactingPlace2021 ?earthquakeCost21. }\n" +
        "    optional { ?place kwgl-ont:dollarDamageOfEarthquakesImpactingPlace2022 ?earthquakeCost22. }\n" +
        "    \n" +
        "    optional { ?place kwgl-ont:dollarDamageOfTornadoesImpactingPlace2018 ?tornadoCost18. }\n" +
        "    optional { ?place kwgl-ont:dollarDamageOfTornadoesImpactingPlace2019 ?tornadoCost19. }\n" +
        "    optional { ?place kwgl-ont:dollarDamageOfTornadoesImpactingPlace2020 ?tornadoCost20. }\n" +
        "    optional { ?place kwgl-ont:dollarDamageOfTornadoesImpactingPlace2021 ?tornadoCost21. }\n" +
        "    optional { ?place kwgl-ont:dollarDamageOfTornadoesImpactingPlace2022 ?tornadoCost22. }\n" +
        "    \n" +
        "    optional { ?place kwgl-ont:dollarDamageOfStormSurgesImpactingPlace2018 ?surgeCost18. }\n" +
        "    optional { ?place kwgl-ont:dollarDamageOfStormSurgesImpactingPlace2019 ?surgeCost19. }\n" +
        "    optional { ?place kwgl-ont:dollarDamageOfStormSurgesImpactingPlace2020 ?surgeCost20. }\n" +
        "    optional { ?place kwgl-ont:dollarDamageOfStormSurgesImpactingPlace2021 ?surgeCost21. }\n" +
        "    optional { ?place kwgl-ont:dollarDamageOfStormSurgesImpactingPlace2022 ?surgeCost22. }\n" +
        "    \n" +
        "    optional { ?place kwgl-ont:dollarDamageOfFloodsImpactingPlace2018 ?floodCost18. }\n" +
        "    optional { ?place kwgl-ont:dollarDamageOfFloodsImpactingPlace2019 ?floodCost19. }\n" +
        "    optional { ?place kwgl-ont:dollarDamageOfFloodsImpactingPlace2020 ?floodCost20. }\n" +
        "    optional { ?place kwgl-ont:dollarDamageOfFloodsImpactingPlace2021 ?floodCost21. }\n" +
        "    optional { ?place kwgl-ont:dollarDamageOfFloodsImpactingPlace2022 ?floodCost22. }\n" +
        "    \n" +
        "    optional { ?place kwgl-ont:dollarDamageOfLandslidesImpactingPlace2018 ?landslideCost18. }\n" +
        "    optional { ?place kwgl-ont:dollarDamageOfLandslidesImpactingPlace2019 ?landslideCost19. }\n" +
        "    optional { ?place kwgl-ont:dollarDamageOfLandslidesImpactingPlace2020 ?landslideCost20. }\n" +
        "    optional { ?place kwgl-ont:dollarDamageOfLandslidesImpactingPlace2021 ?landslideCost21. }\n" +
        "    optional { ?place kwgl-ont:dollarDamageOfLandslidesImpactingPlace2022 ?landslideCost22. }\n" +
        "    \n" +
        "    optional { ?place kwgl-ont:dollarDamageOfDebrisFlowEventsImpactingPlace2018 ?debrisCost18. }\n" +
        "    optional { ?place kwgl-ont:dollarDamageOfDebrisFlowEventsImpactingPlace2019 ?debrisCost19. }\n" +
        "    optional { ?place kwgl-ont:dollarDamageOfDebrisFlowEventsImpactingPlace2020 ?debrisCost20. }\n" +
        "    optional { ?place kwgl-ont:dollarDamageOfDebrisFlowEventsImpactingPlace2021 ?debrisCost21. }\n" +
        "    optional { ?place kwgl-ont:dollarDamageOfDebrisFlowEventsImpactingPlace2022 ?debrisCost22. }\n" +
        "}";

    submitQuery(placeYearQuery, "drawPlaceEntityYearData");
}

function getRandomPlaces() {
    var placeQuery = "PREFIX kwgl-ont: <http://stko-kwg.geog.ucsb.edu/lod/lite-ontology/>\n" +
        "PREFIX kwglr: <http://stko-kwg.geog.ucsb.edu/lod/lite-resource/>\n" +
        "select ?place ?name ?fullentity (GROUP_CONCAT(?within ; separator=\"||\") AS ?withins) (GROUP_CONCAT(?wName ; separator=\"||\") AS ?wNames) " +
        "(GROUP_CONCAT(?contain ; separator=\"||\") AS ?contains) (GROUP_CONCAT(?cName ; separator=\"||\") AS ?cNames) " +
        "(GROUP_CONCAT(?touch ; separator=\"||\") AS ?touches) (GROUP_CONCAT(?tName ; separator=\"||\") AS ?tNames) " +
        "(GROUP_CONCAT(?overlap ; separator=\"||\") AS ?overlaps) (GROUP_CONCAT(?oName ; separator=\"||\") AS ?oNames) " +
        "(GROUP_CONCAT(?hazard ; separator=\"||\") AS ?hazards) (GROUP_CONCAT(?hName ; separator=\"||\") AS ?hNames) " +
        "?avgTemp ?maxTemp ?minTemp ?obese ?poverty ?diabetic ?population ?households " +
        "where { \n" +
        "    ?place a kwgl-ont:Place.\n" +
        "    ?place kwgl-ont:hasName ?name.\n" +
        "    ?place kwgl-ont:hasKWGEntity ?fullentity.\n" +
        "    optional { " +
        "        ?place kwgl-ont:sfWithin ?within. " +
        "        ?within kwgl-ont:hasName ?wName.\n" +
        "        ?within kwgl-ont:hasKWGEntity ?wEntity.\n" +
        "    }\n" +
        "    optional { " +
        "        ?place kwgl-ont:sfContains ?contain. " +
        "        ?contain kwgl-ont:hasName ?cName.\n" +
        "        ?contain kwgl-ont:hasKWGEntity ?cEntity.\n" +
        "    }\n" +
        "    optional { " +
        "        ?place kwgl-ont:sfTouches ?touch. " +
        "        ?touch kwgl-ont:hasName ?tName.\n" +
        "        ?touch kwgl-ont:hasKWGEntity ?tEntity.\n" +
        "    }\n" +
        "    optional { " +
        "        ?place kwgl-ont:sfOverlaps ?overlap. " +
        "        ?overlap kwgl-ont:hasName ?oName.\n" +
        "        ?overlap kwgl-ont:hasKWGEntity ?oEntity.\n" +
        "    }\n" +
        "    optional { " +
        "        ?place kwgl-ont:impactedBy ?hazard. " +
        "        ?hazard kwgl-ont:hasName ?hName.\n" +
        "        ?hazard kwgl-ont:hasKWGEntity ?hEntity.\n" +
        "    }\n" +
        "    optional { ?place kwgl-ont:averageMonthlyTemperatureInCelcius ?avgTemp. }\n" +
        "    optional { ?place kwgl-ont:maximumMonthlyTemperatureInCelcius ?maxTemp. }\n" +
        "    optional { ?place kwgl-ont:minimumMonthlyTemperatureInCelcius ?minTemp. }\n" +
        "    optional { ?place kwgl-ont:percentObese ?obese. }\n" +
        "    optional { ?place kwgl-ont:percentBelowPovertyLine ?poverty. }\n" +
        "    optional { ?place kwgl-ont:percentDiabetic ?diabetic. }\n" +
        "    optional { ?place kwgl-ont:hasPopulation ?population. }\n" +
        "    optional { ?place kwgl-ont:hasNumberOfHouseHolds ?households. }\n" +
        "} GROUP BY ?place ?name ?fullentity ?avgTemp ?maxTemp ?minTemp ?obese ?poverty ?diabetic ?population ?households ORDER BY RAND() LIMIT 10";

    submitQuery(placeQuery, "drawBrowsePlaces");
}

function drawPlaceEntity(result) {
    let place = result[0];
    console.log(place);

    $('.place-name-js').text(place['name']['value']);

    let placeHtml = "<h2>" + place['name']['value'] + "</h2>";

    let propertyString = "";
    if(place['population'] != null)
        propertyString += "<span><b>Population:</b> " + place['population']['value'] + "</span>"
    if(place['households'] != null)
        propertyString += "<span><b>Households:</b> " + place['households']['value'] + "</span>"
    if(place['poverty'] != null)
        propertyString += "<span><b>Population Below Poverty Line:</b> " + place['poverty']['value'] + "%</span>"
    if(place['obese'] != null)
        propertyString += "<span><b>Obesity:</b> " + place['obese']['value'] + "%</span>"
    if(place['diabetic'] != null)
        propertyString += "<span><b>Diabetes:</b> " + place['diabetic']['value'] + "%</span>"
    if(propertyString != "")
        placeHtml += "<p>" + propertyString + "</p>";

    $('.place-card-js').prepend(placeHtml);

    $('.place-uri-js').attr("href", place['fullentity']['value']);

    let baseURL = location.protocol + '//' + location.host + location.pathname;
    let iframeText = '<iframe src="' + baseURL + 'embed/?place='
        + place['place']['value'].split('/').slice(-1)
        + '" title="' + place['name']['value'] + ' - KW Panel" style="height:'
        + $('.place-card-js').outerHeight()
        + 'px"></iframe>';

    $('.place-iframe-header-js').text("Embed " + place['name']['value']);
    $('.place-iframe-js').val(iframeText);

    let withinHtml = "";
    if(place['withins'] != null && place['withins']['value'] != '') {
        let withins = place['withins']['value'].split('||');
        let withinNames = place['wNames']['value'].split('||');
        for (var i = 0; i < withins.length; i++) {
            let relatedName = withins[i].split('/').slice(-1)
            withinHtml += '<div class="prototype-card"><h4>' + withinNames[i] + '</h4><a href="../place/?place=' + relatedName + '" class="hidden"></a> </div>';
        }
        $('.place-within-js').html(withinHtml);
    } else {
        $('.place-within-header-js').remove();
        $('.place-within-js').remove();
    }

    let containsHtml = "";
    if(place['contains'] != null && place['contains']['value'] != '') {
        let contains = place['contains']['value'].split('||');
        let containNames = place['cNames']['value'].split('||');
        for (var i = 0; i < contains.length; i++) {
            let relatedName = contains[i].split('/').slice(-1)
            containsHtml += '<div class="prototype-card"><h4>' + containNames[i] + '</h4><a href="../place/?place=' + relatedName + '" class="hidden"></a> </div>';
        }
        $('.place-surround-js').html(containsHtml);
    } else {
        $('.place-surround-header-js').remove();
        $('.place-surround-js').remove();
    }

    let surroundHtml = "";
    if((place['touches'] != null && place['touches']['value'] != '') || (place['overlaps'] != null && place['overlaps']['value'] != '')) {
        if(place['touches'] != null && place['touches']['value'] != '') {
            let touches = place['touches']['value'].split('||');
            let touchNames = place['tNames']['value'].split('||');
            for (var i = 0; i < touches.length; i++) {
                let relatedName = touches[i].split('/').slice(-1)
                surroundHtml += '<div class="prototype-card"><h4>' + touchNames[i] + '</h4><a href="../place/?place=' + relatedName + '" class="hidden"></a> </div>';
            }
        }
        if(place['overlaps'] != null && place['overlaps']['value'] != '') {
            let overlaps = place['overlaps']['value'].split('||');
            let overlapNames = place['oNames']['value'].split('||');
            for (var i = 0; i < overlaps.length; i++) {
                let relatedName = overlaps[i].split('/').slice(-1)
                surroundHtml += '<div class="prototype-card"><h4>' + overlapNames[i] + '</h4><a href="../place/?place=' + relatedName + '" class="hidden"></a> </div>';
            }
        }
        $('.place-nearby-js').html(surroundHtml);
    } else {
        $('.place-nearby-header-js').remove();
        $('.place-nearby-js').remove();
    }

    let hazardsHtml = "";
    if(place['hazards'] != null && place['hazards']['value'] != '') {
        let hazards = place['hazards']['value'].split('||');
        let hazardNames = hazard['hNames']['value'].split('||');
        for (var i = 0; i < hazards.length; i++) {
            let relatedName = hazards[i].split('/').slice(-1)
            hazardsHtml += '<div class="prototype-card"><h4>' + hazardNames[i] + '</h4><a href="../hazard/?hazard=' + relatedName + '" class="hidden"></a> </div>';
        }
        $('.place-hazard-js').html(hazardsHtml);
    } else {
        $('.place-hazard-header-js').remove();
        $('.place-hazard-js').remove();
    }
}

function drawPlaceEntityYearData(result) {
    console.log(result);
    var yearData = result[0];
    let labels = ["Hazard Type","'18 #","'18 $","'19 #","'19 $","'20 #","'20 $","'21 #","'21 $","'22 #","'22 $"];
    let hazards = ['fire','hurricane','earthquake','tornado','surge','flood','landslide','debris'];
    let hazardFormatted = ['Fires','Hurricanes','Earthquakes','Tornadoes','Storm Surges','Floods','Landslides','Debris Flow Events'];
    let years = ['18','19','20','21','22'];

    let hazardTable = document.createElement('table');

    let labelRow = hazardTable.insertRow();
    for(let l=0; l<labels.length; l++) {
        labelRow.insertCell().textContent = labels[l];
    }

    for(let h=0; h<hazards.length; h++) {
        let hazardRow = hazardTable.insertRow();
        hazardRow.insertCell().textContent = hazardFormatted[h];

        for(let y=0; y<years.length; y++) {
            let cntIndex = hazards[h] + 'Cnt' + years[y];
            let costIndex = hazards[h] + 'Cost' + years[y];

            hazardRow.insertCell().textContent =yearData[cntIndex] != null ? yearData[cntIndex]['value'] : '';
            hazardRow.insertCell().textContent =yearData[costIndex] != null ? dollarFormatter.format(yearData[costIndex]['value']) : '';
        }
    }

    document.getElementsByClassName("place-card-js")[0].appendChild(hazardTable);
}

function drawBrowsePlaces(result) {
    console.log(result);
    let browseHtml = "";
    for (var i = 0; i < result.length; i++) {
        let entity = result[i];
        let relatedName = entity['place']['value'].split('/').slice(-1)
        browseHtml += '<div class="prototype-card"><h4>' + entity['name']['value'] + '</h4><a href="../place/?place=' + relatedName + '" class="hidden"></a> </div>';
    }
    $('.featured-places-js').html(browseHtml);
}

function getEntitiesForSearch() {
    var entityQuery = "PREFIX kwgl-ont: <http://stko-kwg.geog.ucsb.edu/lod/lite-ontology/>\n" +
        "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
        "PREFIX kwglr: <http://stko-kwg.geog.ucsb.edu/lod/lite-resource/>\n" +
        "select distinct ?entity ?type ?name ?fullentity\n" +
        "where { \n" +
        "\t?entity rdf:type ?type.\n" +
        "    FILTER(?type = kwgl-ont:HazardEvent || ?type =  kwgl-ont:Place)\n" +
        "    ?entity kwgl-ont:hasName ?name.\n" +
        "    ?entity kwgl-ont:hasKWGEntity ?fullentity.\n" +
        "}";

    submitQuery(entityQuery, "searchEntities");
}

function searchEntities(result) {
    console.log(result);
    var pageUrl = new URL(window.location.toString());
    let search_params = pageUrl.searchParams;
    if(search_params.get('searchbar') != null) {
        let searchTerm = search_params.get('searchbar');

        const options = {
            includeScore: true,
            useExtendedSearch: true,
            keys: ['name.value']
        };
        const fuse = new Fuse(result, options);
        const searchResults = fuse.search(searchTerm);

        console.log(searchResults);
        let searchHtml = '';
        let searchCnt = searchResults.length > 100 ? 100 : searchResults.length;
        for (var i = 0; i < searchCnt; i++) {
            let result = searchResults[i]['item'];
            let typeLabel = "";
            if(result["type"]["value"].split('/').slice(-1) == "HazardEvent")
                typeLabel = "../../hazard/?hazard=";
            else if(result["type"]["value"].split('/').slice(-1) == "Place")
                typeLabel = "../../place/?place=";
            let entityLink = typeLabel + result["entity"]["value"].split('/').slice(-1);

            searchHtml += '<div class="prototype-card"><h4>' + result["name"]["value"] + '</h4><a href="' + entityLink + '" class="hidden"></a> </div>';
        }

        $('.search-results-header-js').text('Search Results for "' + searchTerm + '"');
        $('.search-results-js').append(searchHtml);
    }
}

function submitQuery(query, callBackFunction) {
    $.ajax({
        url: kwPanelUrl,
        headers: {
            "Accept" : "application/sparql-results+json"
        },
        type: 'POST',
        data: {
            "query": query,
            "infer": false
        },
        success: function (result) {
            window[callBackFunction](result["results"]["bindings"]);
        },
        error: function (err) {
            console.log(err);
        }
    });
}