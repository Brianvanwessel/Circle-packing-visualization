import "../style.css";
import { drawCirclePacking } from "/src/circle-packing.js";
import loadedData from "../Data.csv";

/**
 * The function getURLParameter collects the parameters used in the URL.
 * @param {*} sParam A String containing the name of the parameter that should be collected.
 * @returns A String containing the vlaue of the parameter.
 */
function getURLParameter(sParam) {
  const sPageURL = window.location.search.substring(1);
  const sURLVariables = sPageURL.split("&");
  for (let i = 0; i < sURLVariables.length; i++) {
    const sParameterName = sURLVariables[i].split("=");
    if (sParameterName[0] == sParam) {
      return sParameterName[1];
    }
  }
}

/**
 * The function exportSvg selects an svg and exports it.
 * @param {*} svgID A String containing the ID of the svg that has to be exported.
 * @param {*} chartName A String that will be used for the name of the file that will be exported.
 */
const exportSvg = (svgID, chartName) => {
  svgExport.downloadSvg(document.querySelector(`#${svgID}`), chartName);
};

/**
 * The function filSelectionBox takes given data and fills the selection box based on given ID,
 * the given value will always be the first value.
 * @param {*} valueOptions an Array containing all the value options that have to be displayed.
 * @param {*} value an String that is the value that has be the starting value.
 */
const fillSelectionBox = (valueOptions, value, ID) => {
  let select = document.getElementById(ID);
  select.options[select.options.length] = new Option(value, value);
  for (let i = 0; i < valueOptions.length; i++) {
    if (valueOptions[i] != value) {
      select.options[select.options.length] = new Option(
        valueOptions[i],
        valueOptions[i]
      );
    }
  }
};

/**
 * The function getCorrectDataset sepperates the given file from all the loaded data.
 * @param {*} loadedData An Array contaning all the imported data.
 * @param {*} inputFile A String containing the filename of the file that should be sepperated.
 * @returns An Array containing the data of the selected file.
 */
const getCorrectDataset = (loadedData, inputFile) => {
  const correctDataSet = [];
  const fileNames = [];
  let checkBoolean = false;
  loadedData.forEach((element, index) => {
    if (element.length == 1) {
      fileNames.push(element[0]);
      if (element[0] == inputFile) {
        checkBoolean = true;
      }
      if (element[0] != inputFile) {
        checkBoolean = false;
      }
    }
    if (checkBoolean == true) {
      correctDataSet.push(element);
    }
  });
  return { correctDataSet, fileNames };
};

/**
 * The function setURLParameter is gives a value to an URL parameter.
 * @param {*} parameter A String containing the name of a URL parameter. 
 * @param {*} value A String containing a value for the URL parameter.
 */
const setURLParameter = (parameter, value) => {
  // Construct URLSearchParams object instance from current URL querystring
  const queryParams = new URLSearchParams(window.location.search);

  // Set new or modify existing parameter value
  queryParams.set(parameter, value);

  // Replace current querystring with the new one
  history.replaceState(null, null, "?" + queryParams.toString());

  //Reload the page
  location.reload();
};

/**
 * The function render first filters the data so that correct value is used,
 * after that it generates the visualization.
 * @param {*} layer a Number that indicates which layer will be shown. If null no layer will be shown.
 * @param {*} svg an svg that is used to generate the circle-packing visualization.
 * @param {*} legend_svg an svg that is used to generate the legend
 * @param {*} csvData the data that is loaded from the CSV file.
 * @param {*} checkbox A boolen that indentificates if the checkbox has to be filled or not.
 * If true the checkbox will be filled if false not.
 * @param {*} value A string containing the value that will be used as the value in the visualization.
 */
const render = (
  layer,
  svg,
  legend_svg,
  csvData,
  checkbox,
  value,
  correctDataSet,
  fileName,
  method,

) => {
  let valueIndex;
  // Parse input data to correct format
  const dataSet = correctDataSet.slice(1);
  dataSet[0].forEach((element, index) => {
    if (element == value) {
      valueIndex = index;
    }
  });

  const parsedData = dataSet.map((element) => {
    return [element[0], element[valueIndex]];
  });

  csvData = Papa.unparse(parsedData);

  d3.select("#download").on("click", () =>
    exportSvg("circle-packing", "circlePacking")
  );
  drawCirclePacking({
    csvData,
    svg,
    layer,
    checkbox,
    legend_svg,
    value,
    dataSet,
    fileName,
    method,
  });
};

/**
 * The function generateVisualization initializes the visualization.
 */
const generateVisualization = () => {
  let csvData;

  // Select svg for circle-packing visualization and add attributes
  const svg = d3.select("svg#circle-packing").attr("flex", 1);

  // Select svg for the legend and add attributes
  const legend_svg = d3
    .select("svg#circle-packing-legend")
    .attr("width", 925)
    .attr("background", "lightblue");

  // Set the starting value
  let value = "Depth";

  // Get filename from file parameter
  let fileName;
  fileName = getURLParameter("file");
  if (loadedData.some(r=> r.includes(fileName)) == false) {
    setURLParameter("file", loadedData[0][0]);
  }

  // // Get the value for the file URL parameter
  // fileName = getURLParameter("file");

  const { correctDataSet, fileNames } = getCorrectDataset(loadedData, fileName);
  
  // Fill the data selection box
  fillSelectionBox(correctDataSet[1].slice(1), value, "value-select");

  // Fill the file selection box
  fillSelectionBox(fileNames.sort(), fileName, "file-select");

  // Fill the method selection box
  fillSelectionBox(["Sum","Max"], "Sum", "method-select");

  // Add event listener for the layer selection box
  document.getElementById("layer-select").onchange = (e) => {
    if (Number(document.getElementById("layer-select").value) == 0) {
      render(
        null,
        svg,
        legend_svg,
        csvData,
        false,
        document.getElementById("value-select").value,
        correctDataSet,
        fileName,
        document.getElementById("method-select").value
      );
    } else {
      render(
        Number(document.getElementById("layer-select").value) - 1,
        svg,
        legend_svg,
        csvData,
        false,
        document.getElementById("value-select").value,
        correctDataSet,
        fileName,
        document.getElementById("method-select").value
      );
    }
  };

  // Add event listener for the file selection box
  document.getElementById("file-select").onchange = (e) => {
    setURLParameter("file", document.getElementById("file-select").value);
  };
  // Add event listener for the value selection box
  document.getElementById("value-select").onchange = (e) => {
    if (Number(document.getElementById("layer-select").value) == 0) {
      render(
        null,
        svg,
        legend_svg,
        csvData,
        false,
        document.getElementById("value-select").value,
        correctDataSet,
        fileName,
        document.getElementById("method-select").value
      );
    } else {
      render(
        Number(document.getElementById("layer-select").value) - 1,
        svg,
        legend_svg,
        csvData,
        false,
        document.getElementById("value-select").value,
        correctDataSet,
        fileName,
        document.getElementById("method-select").value
      );
    }
  };

  // Add event listener for the value selection box
  document.getElementById("method-select").onchange = (e) => {
    if (Number(document.getElementById("layer-select").value) == 0) {
      render(
        null,
        svg,
        legend_svg,
        csvData,
        false,
        document.getElementById("value-select").value,
        correctDataSet,
        fileName,
        document.getElementById("method-select").value
      );
    } else {
      render(
        Number(document.getElementById("layer-select").value) - 1,
        svg,
        legend_svg,
        csvData,
        false,
        document.getElementById("value-select").value,
        correctDataSet,
        fileName
        ,document.getElementById("method-select").value
      );
    }
  };

  // Render the initial visualization
  render(null, svg, legend_svg, csvData, true, value, correctDataSet, fileName,document.getElementById("method-select").value);
};

// Initialize the visualiztion
generateVisualization();
