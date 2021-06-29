/**
 * The function createDataArray creates an Array containing the data that will be shown in the legend.
 * @param {*} dataSet An Array containing data used to create the visualization.
 * @param {*} data An Object containing the data of the selected circle in the visualization.
 * @returns legendData an Array containing the data that will be shown in the legend.
 */
const createDataArray = (dataSet, data) => {
  const legendData = [];
  let header = [];
  dataSet.forEach((element, index) => {
    if (index == 0) {
      header = element;
      legendData.push(element.slice(1));
    } else {
      if (element[0].includes(data.data.name)) {
        let object = {};
        header.forEach((e, index) => {
          object[header[index]] = element[index];
        });
        legendData.push(object);
      }
    }
  });
  return legendData;
};

/**
 * The function generateLegendData generates the data that will be shown in the legend
 * @param {*} data An Object containing the data of the selecte circle in the visualization.
 * @param {*} dataSet An Array containing data used to create the visualization.
 * @returns legendData an Array containing the data that will be shown in the legend.
 */
const generateLegendData = (data, dataSet) => {
  // Generate data that will be shown in the legend
  let legendData;
  if (data.children == undefined) {
    if (data.length == 0) {
      legendData = [];
    } else {
      legendData = createDataArray(dataSet, data);
    }
  } else {
    legendData = createDataArray(dataSet, data);
  }
  return legendData;
};

/**
 * The function generateTaxonomyData collects the taxonomy data based on the currently selected circle.
 * @param {*} legendData an Array containing the data that will be shown in the legend.
 * @param {*} layer A String containing the index of the current selected layeer
 * @param {*} data An Object containing the data of the selecte circle in the visualization.
 * @returns An Array containing the taxonomy data of the current;y selected circle.
 */
const generateTaxonomyData = (legendData, layer, data) => {
  let taxonmyData = [];

  if (legendData.length != 0) {
    if (layer == null) {
      let check = true;
      legendData[1]["#Template"].split(";").forEach((element, id) => {
        if (element == data.data.name) {
          taxonmyData.push(element);
          check = false;
        } else {
          if (check == true) {
            taxonmyData.push(element);
          }
        }
      });
    } else {
      legendData[1]["#Template"].split(";").forEach((element, id) => {
        if (id <= layer) {
          taxonmyData.push(legendData[1]["#Template"].split(";")[id]);
        }
      });
    }
  }
  return taxonmyData;
};

/**
 * The function compareValue returns a function that compares input values.
 * @param {*} value A String containing the value that has to be compared
 * @returns A function that checks the which compares input values
 */
const compareValue = (value) => {
  return (a, b) => {
    if (a[value] < b[value]) {
      return 1;
    }
    if (a.Depth > b.Depth) {
      return -1;
    }
    return 0;
  };
};

/**
 * The function circlePackingLegend generates a legend that shows information for a selected circle.
 * @param {*} legend_svg an svg that is used to generate the legend.
 * @param {*} props an Object containing the data needed to generate the legend
 */
export const circlePackingLegend = (legend_svg, props) => {
  const { data, dataSet, layer, value } = props;

  // Width used for the legend
  const width = 400;

  // Select all existing group elements with the ID "legend" and bind the data to it.
  const g = legend_svg.selectAll("#legend").data([data]);

  // Create enter selection and add group elements and give them the ID "legend".
  const gEnter = g.enter().append("g").attr("id", "legend");

  // Merge selection for the the groups.
  gEnter.merge(g);

  // Exit selection that removes old elements.
  g.exit().remove();

  // Create the rect elements needed for the legend and set needed attributes.
  gEnter
    .append("rect")
    .attr("id", "firstLegend")
    .merge(g.select("#firstLegend"))
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", (d) => {
      if (d.data != undefined) {
        return width;
      }
    })
    .attr("height", 1000)
    .attr("stroke", "black")
    .style("stroke-width", 5)
    .attr("fill", "rgb(163, 245, 207)");

  // Exit selection that removes old rect elements with the id "firstLegend".
  g.exit().selectAll("#firstLegend").remove();

  // Exit selection that removes old elements.
  g.exit().remove();

  // Create the rect elements needed for the legend and set needed attributes.
  gEnter
    .append("rect")
    .attr("id", "secondLegend")
    .merge(g.select("#secondLegend"))
    .attr("x", (d) => width - 125)
    .attr("y", 0)
    .attr("width", (d) => {
      if (d.data != undefined) {
        return width + 225;
      }
    })
    .attr("height", 1000)
    .attr("stroke", "black")
    .style("stroke-width", 5)
    .attr("fill", "rgb(163, 245, 207)");

  // Exit selection that removes old rect elements with the ID "secondLegend".
  g.exit().selectAll("#secondLegend").remove();

  // Create enter and merge selection for text elements and add attributes to it.
  gEnter
    .append("text")
    .attr("id", "firstHeader")
    .merge(g.select("#firstHeader"))
    .attr("x", width / 4)
    .attr("y", 50)
    .attr("dy", ".5 em")
    .attr("text-align", "left")
    .text((d) => {
      if (d.data != undefined) {
        return "Taxonomy";
      }
    });

  // Exit selection that removes old text elements with the ID "firstHeader".
  g.exit().selectAll("#firstHeader").remove();

  // Create enter and merge selection for text elements and add attributes to it.
  gEnter
    .append("text")
    .attr("id", "secondHeader")
    .merge(g.select("#secondHeader"))
    .attr("x", width + width / 2)
    .attr("y", 50)
    .attr("dy", ".5 em")
    .attr("text-align", "left")
    .text((d) => {
      if (d.data != undefined) {
        return "Data";
      }
    });

  //Exit selection that removes old text elements with the ID "secondHeader".
  g.exit().selectAll("#secondHeader").remove();

  // Create enter and merge selection for line elements and add attribites to it.
  gEnter
    .append("line")
    .merge(g.select("line"))
    .style("stroke", "black")
    .style("stroke-width", 5)
    .attr("x1", 0)
    .attr("y1", 100)
    .attr("x2", (d) => {
      if (d.data != undefined) {
        return width * 2 + 100;
      }
    })
    .attr("y2", 100);

  //Exit selection that removes old line elements.
  g.exit().selectAll("line").remove();

  // Generate data needed for the legend and sort it based on the given value
  const legendData = generateLegendData(data, dataSet).sort(
    compareValue(value)
  );

  // Generate taxonomy data needed for the legend
  const taxonomyData = generateTaxonomyData(legendData, layer, data);

  // Select all existing gtaroup elements with the ID "data" and bind the data to it.
  const datag = legend_svg.selectAll("#data").data([null]);

  // Create enter selection and add group elements with the ID "data".
  const datagEnter = datag.enter().append("g").attr("id", "data");

  // Merge selection.
  datagEnter.merge(datag);

  // Exit selection that removes old elements.
  datag.exit().remove();

  // Select group with the ID "data" and select all text elements in the group, after that bind the data to it.
  const legendTaxonomyText = legend_svg
    .select("#data")
    .selectAll("#taxonomyData")
    .data(taxonomyData);

  // Create enter selection that adds text elements.
  const legendTaxonomyTextEnter = legendTaxonomyText
    .enter()
    .append("text")
    .attr("id", "taxonomyData");

  // Create merge selection that adds all attributes.
  legendTaxonomyTextEnter
    .merge(legendTaxonomyText)
    .attr("x", width / 20)
    .attr("y", (d, i) => {
      if (d != undefined) {
        return 150 + i * 50;
      }
    })
    .text((d) => {
      return d;
    });

  // Exit selection that removes old elements.
  legendTaxonomyText.exit().remove();

  // Select group with the ID "data" and select all text elements in the group, after that bind the data to it.
  const legendText = legend_svg
    .select("#data")
    .selectAll("#legendValues")
    .data(legendData.slice(0, 16));

  // Create enter selection that adds text elements.
  const legendTextEnter = legendText
    .enter()
    .append("text")
    .attr("id", "legendValues");

  // Create merge selection that adds all attributes.
  legendTextEnter
    .merge(legendText)
    .attr("x", width - 100)
    .attr("y", (d, i) => {
      if (d != undefined) {
        return 150 + i * 50;
      }
    })
    .style("font-size", (d, i) => {
      if (i == 0) {
        return "8.6px";
      } else {
        return "15px";
      }
    })
    .text((d) => {
      let dataFormat = "";
      for (const [key, value] of Object.entries(d)) {
        if (key != "#Template") {
          dataFormat = dataFormat + String(value) + ", ";
        }
      }
      return dataFormat.slice(0, -2);
    });

  // Create exit selection that removes all old elements
  legendText.exit().remove();
};
