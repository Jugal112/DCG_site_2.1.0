var df;
var globalArray = [];

function createArray(data) {
    var result = [];
    data.forEach(function(record, index) {
        var row = [];
        for (i = 0; i < data.columns.length; i++) {
            column = data.columns[i];
            row.push(record[column]);
        }
        result.push(row);
    });
    globalArray = result;
    return result;
}

function tabulate(data) {

}

var colorCodedCols = new Set(['3mo %Chg', '12mo %Chg', 'δₜRevenue', 'δₜ²Revenue'])

d3.csv("/data.csv").then(function(data) {
    // console.log(data);
    // Set data as global for debugging.
    df = data;
    // Create array of data

    var myArray = createArray(data);
    // Select the div with the "table" id.
    var table = d3.select("#table")
    table.append("table")
    // Append a header created from the data's columns.
    var header = table.append("thead").append("tr");
    var sortAscending = true;
    header
        .selectAll("th")
        .data(data.columns)
        .enter()
        .append("th")
        .text(function(d) { return d; })
        .on('click', function (d) {
            header.attr('class', 'header');
            column = this.textContent;
            if (sortAscending) {
              rows.sort(function(a, b) {
                  return d3.ascending(
                    parseFloat(b[column]), 
                    parseFloat(a[column])
                    );  
                });
              sortAscending = false;
              this.className = 'aes';
            } else {
              rows.sort(function(a, b) {
                  return d3.descending(
                    parseFloat(b[column]), 
                    parseFloat(a[column])
                  );  
                });
              sortAscending = true;
              this.className = 'des';
            }

        });
    var tablebody = table.append('tbody');
    var rows = tablebody
        .selectAll("tr")
        .data(data)
        .enter()
        .append("tr");
    // We built the rows using the nested array - now each row has its own array.
    var cells = rows.selectAll("td")
        // each row has data associated; we get it and enter it for the cells.
        .data(function(row) {
            new_row = data.columns.map(function(col) {
                return { column: col, value: row[col]}
            })
            return new_row;
        })
        .enter()
        .append("td")
        .text(function(d) {
            return d.value;
        }).style("background-color", function(d){
            if (!colorCodedCols.has(d.column)) {
                return
            }
            let x = parseFloat(d.value);
            if (x > 0) {
                return '#BBFFBB';
            } else if (x < 0) {
                return '#FFBBBB';
            };
        });
  });