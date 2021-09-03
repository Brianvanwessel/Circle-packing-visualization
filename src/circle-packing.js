import { circlePackingLegend } from "/src/circle-packing-legend.js";
import { colors } from "/src/colors_array.js";
import { hierarchy16S } from "/src/16S-hierarchy.js";
import { hierarchy18S } from "/src/18S-hierarchy.js";


/**
 * The function buildHierarchy is a function that transfroms filterd CSV file data into hierarchical format.
 * @param {*} csv A String containing the filterd CSV file
 * @param {*} layer A Integer containing the index of the last layer
 * @param {*} method A String containing the method that will be used to calculate the values
 * @returns 
 */
const filteredHierarchy = (csv, layer,method) => {
  // Helper function that transforms the given CSV into a hierarchical format.
  const root = { name: "root", children: [] };
  for (let i = 0; i < csv.length; i++) {
    const sequence = csv[i][0];
    let size = +csv[i][1];
    if (String(size)) {
      size = size * 10000000000000000000000000000;
    }
    const previousLayer = csv[i][2];
    if (isNaN(size)) {
      // e.g. if this is a header row
      continue;
    }
    const parts = sequence.split(";");
    let currentNode = root;
    for (let j = 0; j < parts.length; j++) {
      const children = currentNode["children"];
      const nodeName = parts[j];
      let childNode = null;
      if (j + 1 < parts.length) {
        // Not yet at the end of the sequence; move down the tree.
        let foundChild = false;
        for (let k = 0; k < children.length; k++) {
          if (children[k]["name"] == nodeName) {
            childNode = children[k];
            foundChild = true;
            break;
          }
        }
        // If we don't already have a child node for this branch, create it.
        if (!foundChild) {
          childNode = {
            name: nodeName,
            children: [],
            previousLayer: csv[i][2],
          };
          children.push(childNode);
        }
        currentNode = childNode;
      } else {
        // Reached the end of the sequence; create a leaf node.
        if (previousLayer != undefined) {
          childNode = {
            name: nodeName,
            value: size,
            previousLayer: previousLayer,
            phylogeny: csv[i][3],
          };
        } else {
          childNode = {
            name: nodeName,
            value: size,
            phylogeny: csv[i][3],
            previousLayer: csv[i][2],
          };
        }

        let exists = { status: false };

        children.forEach((element, index) => {
          let taxonomy = "";

          let splitPhylogeny = childNode.phylogeny.split(";");
          splitPhylogeny.forEach((element, index) => {
            if (index <= layer) taxonomy = taxonomy + element + ";";
          });
          if (element.phylogeny.includes(taxonomy.slice(0, -1))) {
            exists.status = true;
            exists.value = element.value;
            exists.index = index;
          }
        });

        if (!exists.status) {
          children.push(childNode);
        } else {
          if(method == "Sum"){
            childNode.value = childNode.value + exists.value;
          }
          else if(method == "Max"){
            if (exists.value > childNode.value){
              childNode.value = exists.value
            }
          }
          
          children[exists.index] = childNode;
        }
      }
    }
  }

  return root;
};

/**
 * The function buildHierarchy is a function that transfroms a CSV file into hierarchical format.
 * @param {*} csv A String containing the CSV file
 * @param {*} method A String containing the method that will be used to calculate the values
 * @returns An Object containing the hierarchical data.
 */
const buildHierarchy = (csv,method) => {
  // Helper function that transforms the given CSV into a hierarchical format.
  const root = { name: "root", children: [] };
  for (let i = 0; i < csv.length; i++) {
    const sequence = csv[i][0];
    let size = +csv[i][1];
    if (String(size)) {
      size = size * 10000000000000000000000000000;
    }
    const previousLayer = csv[i][2];
    if (isNaN(size)) {
      // e.g. if this is a header row
      continue;
    }
    const parts = sequence.split(";");
    let currentNode = root;
    for (let j = 0; j < parts.length; j++) {
      const children = currentNode["children"];
      const nodeName = parts[j];
      let childNode = null;
      if (j + 1 < parts.length) {
        // Not yet at the end of the sequence; move down the tree.
        let foundChild = false;
        for (let k = 0; k < children.length; k++) {
          if (children[k]["name"] == nodeName) {
            childNode = children[k];
            foundChild = true;
            break;
          }
        }
        // If we don't already have a child node for this branch, create it.
        if (!foundChild) {
          childNode = { name: nodeName, children: [], phylogeny: sequence };
          children.push(childNode);
        }
        currentNode = childNode;
      } else {
        // Reached the end of the sequence; create a leaf node.
        if (previousLayer != undefined) {
          childNode = {
            name: nodeName,
            value: size,
            previousLayer: previousLayer,
            phylogeny: sequence,
          };
        } else {
          childNode = { name: nodeName, value: size, phylogeny: sequence };
        }

        let exists = { status: false };
        children.forEach((element, index) => {
          if (element.name == childNode.name) {
            exists.status = true;
            exists.value = element.value;
            exists.index = index;
          }
        });

        if (!exists.status) {
          children.push(childNode);
        } else {
          if(method == "Sum"){
            childNode.value = childNode.value + exists.value;
          }
          else if(method == "Max"){
            if (exists.value > childNode.value){
              childNode.value = exists.value
            }
          }
          children[exists.index] = childNode;
        }
      }
    }
  }

  return root;
};

/**
 * The function filterData filters the incomming data and only returns the layer that is given as an input.
 * @param {*} props An Object containing the csv data and the selected layer.
 * @returns An Object that contains the filterd data and the information needed to determine pervious layers.
 */
const filterData = (props) => {
  const { csv, layer } = props;
  const previousLayerObject = {};
  const layerData = csv
    .filter((element) => {
      const layers = element[0].split(";");
      return layers[layer] != undefined;
    })
    .map((element) => {
      if (element[0] != "#Template") {
        const layers = element[0].split(";");
        if (layers[layer - 1] != undefined) {
          if (previousLayerObject[layers[layer]] == undefined) {
            previousLayerObject[element[0]] = layers[layer - 1];
          }
        }

        return [layers[layer], element[1], element[0], element[0]];
      } else {
        return element;
      }
    });

  const filterdData = [];
  layerData.forEach((e) => {
    if (e[0] != "#Template") {
      const newValue = e;
      newValue[2] = previousLayerObject[e[2]];
      filterdData.push(newValue);
    } else {
      const newHeaders = e;
      newHeaders.push("PreviousLayer");
      filterdData.push(newHeaders);
    }
  });
  return { filterdData };
};

/**
 * The function getLastLayer collects the last layer of the phylogeny.
 * @param {*} props An Object containing that contains the csv data needed to get the last layer.
 * @returns A Number containg the last layer of the phylogeny.
 */
const getLastLayer = (props) => {
  const { csv } = props;
  let lastLayer = 0;

  csv.forEach((element) => {
    const layers = element[0].split(";");
    if (layers.length > lastLayer) {
      lastLayer = layers.length;
    }
  });
  return lastLayer;
};

/**
 * The function fillSelectionBox adds all possible layers to the selection box.
 * @param {*} props An Object containing the index of the last layer.
 * @returns -
 */
const FillSelectionBox = (lastLayer, hierarchy) => {
  if (hierarchy == undefined) {
    let select = document.getElementById("layer-select");
    select.options[select.options.length] = new Option("All", 0);
    for (let i = 0; i < lastLayer; i++) {
      select.options[select.options.length] = new Option(i + 1, i + 1);
    }
  } else {
    let select = document.getElementById("layer-select");
    select.options[select.options.length] = new Option("All", 0);
    for (let i = 0; i < lastLayer; i++) {
      select.options[select.options.length] = new Option(hierarchy[i], i + 1);
    }
  }
};

/**
 * The function pareCsvData converts the data from a CSV file to a hierarchical format needed for the graph.
 * @param {*} props An Object containg all data needed to parse the csv file.
 * @returns An Object containg the parsed data.
 */
const parseCsvData = (props) => {
  const { csvData, layer, checkbox, value, fileName,method } = props;

  let csv = d3.csvParseRows(csvData);
  let data;
  const lastLayer = getLastLayer({ csv });

  if (checkbox) {
    if (fileName.toUpperCase().includes("18S")) {
      FillSelectionBox(lastLayer, hierarchy18S);
    } else if (fileName.toUpperCase().includes("16S")) {
      FillSelectionBox(lastLayer, hierarchy16S);
    } else {
      FillSelectionBox(lastLayer);
    }
  }
  if (layer != null) {
    const { filterdData } = filterData({ csv, layer });
    data = filteredHierarchy(filterdData, layer,method);
    return { data ,lastLayer};
  } else {
    data = buildHierarchy(csv,method);
    return { data,lastLayer };
  }
};

/**
 * The function pack generates the circle packing hierarchical layout.
 * @param {*} data an Object containg the parsed CSV data.
 * @param {*} width width used to generate the visualization.
 * @param {*} height height used to generate the visualization.
 * @returns an Object containing the generated hierarchical circle packing.
 */
const pack = (data, width, height) =>
  d3.pack().size([width, height]).padding(3)(
    d3
      .hierarchy(data)
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value)
  );

/**
 *The function createSortedColorScale creates an colorScale and sorts the domain.
 * @param {*} domain an array containing all values that are used for the domain.
 * @param {*} range an array containing the range that are used for the range.
 * @returns an function that functions as an colorscale.
 */
const createSortedColorScale = (domain, range) =>
  d3.scaleOrdinal().domain(domain.sort()).range(range);

/**
 * The function drawCirclePacking generates the circle packing visualization based on given data.
 * @param {*} props An Object containing the csv data, svg, legend svg, selected layer,
 * A boolean that describes if the checkbox has to be filled and the value that has to be used for the graph.
 * @returns -
 */
export function drawCirclePacking(props) {
  const {
    csvData,
    svg,
    legend_svg,
    layer,
    checkbox,
    value,
    dataSet,
    fileName,
    method,
  } = props;

  // Parse the CSV data
  const { data,lastLayer } = parseCsvData({
    csvData,
    layer,
    checkbox,
    value,
    fileName,
    method,
  });

  // If needed create a color scale for the previous layer
  let previousLayerColor;
  if (layer != null) {
    const allLayers = [];
    data.children.forEach((element, index) => {
      allLayers.push(element.previousLayer);
    });
    const uniqueElements = [...new Set(allLayers)];
    const color_scale = chroma.scale(colors);
    previousLayerColor = createSortedColorScale(
      uniqueElements,
      color_scale.colors(uniqueElements.length)
    );
  }
  // Define constants
  const width = 800;
  const height = 800;

  // Calculate packing data
  const root = pack(data, width, height);
  let focus = root;
  let view;

  // Calculate color scale
  const color = d3
    .scaleLinear()
    .domain([0, root.height])
    .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
    .interpolate(d3.interpolateHcl);

  // Set svg attributes
  svg
    .attr("width", 925)
    .attr("height", 1000)
    .style("display", "block")
    .style("margin", "0 -14px")
    .style("background", color(0))
    .style("cursor", "pointer")
    .on("click", (event) => {
      zoom(event, root)
    });

  // Create a data binding that adds a single element.
  const circlePackingg = svg.selectAll("#container").data([null]);

  // create an enter selection thatt adds a group element.
  const circlePackinggEnter = circlePackingg
    .enter()
    .append("g")
    .attr("id", "container");

  // Create a merge selection for the group element.
  circlePackinggEnter.merge(circlePackingg);

  // Create an exit selection that removes old elements.
  circlePackinggEnter.exit().selectAll("#container").remove();

  // Select all existing cirlce elements with the id "container" and bind the data to it.
  const circlePackingSelection = svg
    .select("#container")
    .selectAll("circle")
    .data(root.descendants().slice(1), (data) => data.r);

  // Create enter selection and add circle elements.
  const circlePackingEnter = circlePackingSelection.enter().append("circle");

  // Merge selection that sets attributes of cirlcle.
  circlePackingEnter
    .merge(circlePackingSelection)
    .attr("fill", (d) => {
      if (d.data.previousLayer != undefined) {
        return previousLayerColor(d.data.previousLayer);
      }
      return d.children ? color(d.depth) : "white";
    })
    .on("mouseover", function (event, d) {
      const data = d;
      circlePackingLegend(legend_svg, { data, dataSet, layer, value,lastLayer });
      d3.select(this).attr("stroke", "#000");
    })
    .on("mouseout", function () {
      const data = [];
      d3.select(this).attr("stroke", null);
      circlePackingLegend(legend_svg, { data, layer, value,lastLayer });
    })
    .on("click", (event, d) => {
      !d.children
        ? "none"
        : focus !== d && (zoom(event, d), event.stopPropagation());
    });

  // Exit selection that removes old elements.
  circlePackingSelection.exit().remove();

  // Create a data binding that creates a single element.
  const labelg = svg.selectAll("#label").data([null]);

  // Create enter selection and add group element with the ID "label".
  const labelgEnter = labelg.enter().append("g").attr("id", "label");

  // Create merge selection and add all attributes.
  labelgEnter
    .merge(labelg)
    .style("font", "10px sans-serif")
    .attr("pointer-events", "none")
    .attr("text-anchor", "middle");

  // Select all existing text elements with the ID "label" and bind the data to it.
  const labelSelection = svg
    .select("#label")
    .selectAll("text")
    .data(root.descendants());

  // Create enter selection and add text elements with needed attributes.
  const labelEnter = labelSelection
    .enter()
    .append("text")
    .merge(labelSelection)
    .style("fill-opacity", (d) => (d.parent === root ? 1 : 0))
    .style("display", (d) => (d.parent === root ? "inline" : "none"))
    .text((d) => {
      if (d.value > 100) {
        return d.data.name;
      }
    });

  // Create exit selection and remove old elements.
  labelSelection.exit().remove();

  // Creating the start zoom to get the right starting overview.
  zoomTo([root.x, root.y, root.r * 2]);

  /**
   * The function zoomTo handels the shown positions for the cirlces and nodes aswell as the r of the circle.
   * @param {*} v Array containing the data of the view that has to be shown.
   */
  function zoomTo(v) {
    const k = width / v[2];
    view = v;

    labelEnter.attr(
      "transform",
      (d) => `translate(${(d.x - v[0]) * k + 500},${(d.y - v[1]) * k + 500})`
    );
    circlePackingEnter.attr(
      "transform",
      (d) => `translate(${(d.x - v[0]) * k + 500},${(d.y - v[1]) * k + 500})`
    );
    circlePackingEnter.attr("r", (d) => {
      return d.r * k;
    });
  }

  /**
   * The function zoom handles the circle transition and label filtering.
   * @param {*} event click event.
   * @param {*} d Object containig hierarchical data.
   */
  function zoom(event, d) {
    focus = d;

    const transition = svg
      .transition()
      .duration(event.altKey ? 7500 : 750)
      .tween("zoom", (d) => {
        const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
        return (t) => zoomTo(i(t));
      });

    labelEnter
      .filter(function (d) {
        return d.parent === focus || this.style.display === "inline";
      })
      .transition(transition)
      .style("fill-opacity", (d) => (d.parent === focus ? 1 : 0))
      .on("start", function (d) {
        if (d.parent === focus) this.style.display = "inline";
      })
      .on("end", function (d) {
        if (d.parent !== focus) this.style.display = "none";
      });
  }
}
