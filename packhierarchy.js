/* jshint -W095 */
{
  id: "oracle.xdo.d3.packhierarchy.sample",
  component: {
    name: "Pack Hierarchy",
    tooltip: "Insert Pack"
  },
  fields: [
    {name: "parent", caption: "Drop Labale Field Here", fieldType: "label", dataType: "string"},
    {name: "child", caption: "Drop Labale Field Here", fieldType: "label", dataType: "string"},
    {name: "grandchild", caption: "Drop Labale Field Here", fieldType: "label", dataType: "string"},
    {name: "data", caption: "Drop Metric Field Here", fieldType: "measure", dataType: "number", formula: "summation"}
  ],
  remoteFiles: [
    {type:"js", location:"http://d3js.org/d3.v3.min.js"},
    {type:"css", location:"https://dl.dropboxusercontent.com/u/162239/d3style.css"}
  ],
  properties: [
    {key: "width", label: "Width", type: "length", value: "500px"},
    {key: "height", label: "Height", type: "length", value: "400px"}
  ],
  dataType: "d3hierarchy",
  render: function (context, containerElem, jsonNode, fields, props) {
    // make sure d3 lib is loaded
    if (!window.d3) {
      var args = arguments;
      var func = args.callee;
      var _this = this;
      setTimeout(function() {
        func.apply(_this, args);
      }, 300);
      return;
    }

    jsonNode.name = "All";

    var w = xdo.lang.Length.getPixelValue(props["width"]);
    var h = xdo.lang.Length.getPixelValue(props["height"]);
    var r;

    w = h = r =Math.min(w, h);

    var x = d3.scale.linear().range([0, r]),
    y = d3.scale.linear().range([0, r]),
    node,
    root;

    var pack = d3.layout.pack()
    .size([r, r])
    .value(function(d) { return d.value; })

    d3.select(containerElem).html("");

    var vis = d3.select(containerElem).insert("svg:svg", "h2")
    .attr("width", w)
    .attr("height", h)
    .append("svg:g")
    .attr("transform", "translate(" + (w - r) / 2 + "," + (h - r) / 2 + ")");

    function render(data) {
      node = root = data;

      var nodes = pack.nodes(root);

      vis.selectAll("circle")
      .data(nodes)
      .enter().append("svg:circle")
      .attr("class", function(d) { return d.children ? "parent" : "child"; })
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", function(d) { return d.r; })
      .on("click", function(d) { return zoom(node == d ? root : d); });

      vis.selectAll("text.name")
      .data(nodes)
      .enter().append("svg:text")
      .attr("class", function(d) { return d.children ? "name parent" : "name child"; })
      .attr("x", function(d) { return d.x; })
      .attr("y", function(d) { return d.children ? d.y - d.r + 15 : d.y - d.r + 15; })
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .style("opacity", function(d) {
        d.w = this.getComputedTextLength();
        return 1.8*d.r > d.w ? 0 : 1; })
      .text(function(d) { return d.name });

      vis.selectAll("text.value")
      .data(nodes)
      .enter().append("svg:text")
      .attr("class", function(d) { return d.children ? "value parent" : "value child"; })
      .attr("x", function(d) { return d.x; })
      .attr("y", function(d) { return d.y; })
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .style("opacity", function(d) {
        d.w = this.getComputedTextLength();
        return d.children || 1.8*d.r > d.w ? 0 : 1;
      })
      .text(function(d) { return d.value.toFixed(2); });


      // hack to forcely update opacity of <text>s
      setTimeout(function() {
        vis.selectAll("text.name")
        .style("opacity", function(d) { return 1.8*d.r < this.getComputedTextLength() ? 0 : 1; })

        vis.selectAll("text.value")
        .style("opacity", function(d) { return d.children || 1.8*d.r < this.getComputedTextLength() ? 0 : 1; })
      }, 300);


      d3.select(window).on("click", function() { zoom(root); });
    };

    function zoom(d, i) {
      var k = r / d.r / 2;
      x.domain([d.x - d.r, d.x + d.r]);
      y.domain([d.y - d.r, d.y + d.r]);

      var t = vis.transition()
      .duration(d3.event.altKey ? 7500 : 750);

      t.selectAll("circle")
      .attr("cx", function(d) { return x(d.x); })
      .attr("cy", function(d) { return y(d.y); })
      .attr("r", function(d) { return k * d.r; });

      t.selectAll("text.name")
      .attr("x", function(d) { return x(d.x); })
      .attr("y", function(d) { return d.children ? y(d.y - d.r + 15) : y(d.y - d.r + 15); })
      .style("opacity", function(d) { return k * 1.8*d.r < this.getComputedTextLength() ? 0 : 1; })

      t.selectAll("text.value")
      .attr("x", function(d) { return x(d.x); })
      .attr("y", function(d) { return y(d.y); })
      .style("opacity", function(d) { return d.children || k * 1.8*d.r < this.getComputedTextLength() ? 0 : 1; })

      node = d;
      d3.event.stopPropagation();
    }

    render(jsonNode);

  }

}

