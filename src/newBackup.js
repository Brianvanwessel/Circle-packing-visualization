import "../style.css";
import { drawCirclePacking } from "/src/circle-packing.js";
import loadedData from "../batch-test.csv";
import { hierarchy16S } from "/src/16S-hierarchy.js";
import { hierarchy18S } from "/src/18S-hierarchy.js";


// function GetURLParameter(sParam)
// {
//     const sPageURL = window.location.search.substring(1);
//     const sURLVariables = sPageURL.split('&');
//     for (let i = 0; i < sURLVariables.length; i++) 
//     {
//         const sParameterName = sURLVariables[i].split('=');
//         if (sParameterName[0] == sParam) 
//         {
//             return "../" + sParameterName[1];
//         }
//     }
// }

/**
 * The function exportSvg selects an svg and exports it.
 * @param {*} svgID A String containing the ID of the svg that has to be exported
 * @param {*} chartName A String that will be used for the name of the file that will be exported.
 */
const exportSvg = (svgID, chartName) => {
  svgExport.downloadSvg(document.querySelector(`#${svgID}`), chartName);
};

/**
 * The function fillDataValueSelectionBox takes given data and fills the selection box that shows data types,
 * the given value will always be the first value.
 * @param {*} valueOptions an Array containing all the value options that have to be displayed.
 * @param {*} value an String that is the value that has be the starting value.
 */
const fillDataValueSelectionBox = (valueOptions, value) => {
  let select = document.getElementById("value-select");
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

const getCorrectDataset = (loadedData,inputFile) =>{
  const selectedFileData = []
  let checkBoolean = false
  loadedData.forEach((element,index) =>{
    if(element.length == 1){
      if(element[0] == inputFile ){
        checkBoolean = true
      }
      if(element[0] != inputFile ){
        checkBoolean = false
      }
    }
    if(checkBoolean == true){
      selectedFileData.push(element)
    }
  })
  return selectedFileData
}

/**
 * The function render first filers the data so that correct value is used,
 * after that it generates the visualization,
 * @param {*} layer a Number that indicates which layer will be shown. If null no layer will be shown.
 * @param {*} svg an svg that is used to generate the circle-packing visualization.
 * @param {*} legend_svg an svg that is used to generate the legend
 * @param {*} csvData the data that is loaded from the CSV file.
 * @param {*} checkbox A boolen that indentificates if the checkbox has to be filled or not.
 * If true the checkbox will be filled if false not.
 * @param {*} value A string containing the value that will be used as the value in the visualization.
 */
const render = async (layer, svg, legend_svg, csvData, checkbox, value,correctDataSet) => {
  let valueIndex;
 

  const dataSet =  correctDataSet.slice(1)
  console.log(dataSet)
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
  drawCirclePacking({ csvData, svg, layer, checkbox, legend_svg, value,correctDataSet });
};

const generateVisualization = () => {
  let csvData;
  
  // Select svg for circle-packing visualization and add attributes.
  const svg = d3.select("svg#circle-packing").attr("flex", 1);

  // Select svg for the legend and add attributes
  const legend_svg = d3
    .select("svg#circle-packing-legend")
    .attr("width", 925)
    .attr("background", "lightblue");

  // Set the starting value
  let value = "Depth";

  const correctDataSet = getCorrectDataset(loadedData,"18S-01.res")
  console.log(correctDataSet[1])

  // Fill the data selection box
  fillDataValueSelectionBox(correctDataSet[1].slice(1), value);

  // Add event listener for the layer selection box.
  document.getElementById("layer-select").onchange = (e) => {
    if (Number(document.getElementById("layer-select").value) == 0) {
      render(
        null,
        svg,
        legend_svg,
        csvData,
        false,
        document.getElementById("value-select").value,
        correctDataSet
        
      );
    } else {
      render(
        Number(document.getElementById("layer-select").value) - 1,
        svg,
        legend_svg,
        csvData,
        false,
        document.getElementById("value-select").value,
        correctDataSet
      );
    }
  };

  // Add event listener for the value selection box.
  document.getElementById("value-select").onchange = (e) => {
    if (Number(document.getElementById("layer-select").value) == 0) {
      render(
        null,
        svg,
        legend_svg,
        csvData,
        false,
        document.getElementById("value-select").value,
        correctDataSet
      );
    } else {
      render(
        Number(document.getElementById("layer-select").value) - 1,
        svg,
        legend_svg,
        csvData,
        false,
        document.getElementById("value-select").value,
        correctDataSet
      );
    }
  };

  // Render the initial visualization
  render(null, svg, legend_svg, csvData, true, value,correctDataSet);
};

// Initialize the visualiztion
generateVisualization();
