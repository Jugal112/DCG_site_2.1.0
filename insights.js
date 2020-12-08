function mySort(l, r) {
    return d3.ascending(l, r)
}

function mySortNumber(l, r) {
    let a = parseFloat(l);
    let b = parseFloat(r);
    if (isNaN(a) & isNaN(b)) {
        return 0;
    } else if (isNaN(a)) {
        return 1;
    } else if (isNaN(b)) {
        return -1;
    }
    return d3.ascending(b, a)
}

var colorCodedCols = new Set([
    '3mo %Chg', 
    '12mo %Chg', 
    'Avg QoQ Rev Growth', 
    'QoQ Rev Surprise'
])
var currencyCols = new Set([
    "Revenue",
    "Market Cap",
    "Enterprise Value (EV)"
]);
var multiplesCols = new Set([
    "EV/Revenue", 
    "EV/Profit", 
    "EV/EBITDA"
]);
var percentCols = new Set([
    "3mo %Chg",
    "12mo %Chg", 
    "Avg QoQ Rev Growth",
    "QoQ Rev Surprise",
    "Gross Margin",
    "LTM Gross Margin",
    "LTM EBITDA Margin",
    "LTM FCF Margin"
]);
var numericCols = new Set([...currencyCols, ...multiplesCols, ...percentCols]);

function myFormatter(column, value) {
    if (currencyCols.has(column)) {
        return numeral(value).format('$0.2a');
    } else if (multiplesCols.has(column)) {
        return d3.format(".2f")(value) + 'x';
    } else if (percentCols.has(column)) {
        return d3.format(".2%")(value);
    }
    return value;
    // return d3.format(".2s")(value);
}

d3.csv("/data.csv").then(function(data) {
    // Set data as global for debugging.
    console.log(numericCols);

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
            var order = sortAscending ? 1 : -1;
            rows.sort(function(a, b) {
                sortFn = numericCols.has(column) ? mySortNumber : mySort;
                return order * sortFn(a[column], b[column]);  
            });
            this.className = sortAscending ? 'aes' : 'des';
            sortAscending = !sortAscending;
        });
    var tablebody = table.append('tbody');
    var rows = tablebody
        .selectAll("tr")
        .data(data)
        .enter()
        .append("tr");

    d3.select("#mySlider").on("change", function(d){
        selectedValue = this.value;
        console.log(selectedValue);
        rows.filter(function(d) {
            
        });
        console.log(rows);
        })

    // We built the rows using the nested array - now each row has its own array.
    var cells = rows.selectAll("td")
        // each row has data associated; we get it and enter it for the cells.
        .data(function(row) {
            new_row = data.columns.map(function(col) {
                return { column: col, value: row[col], display: myFormatter(col, row[col])}
            })
            return new_row;
        })
        .enter()
        .append("td")
        .text(function(d) { return d.display; })
        .style("background-color", function(d){
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

    console.log(cells)
  });

//   function createRangeSlider(data, column, rows) {
//     // // Range

//     var revs = data.map( function(d) {
//         return parseFloat(d[column]);});
    
//     var sliderRange = d3
//     .sliderBottom()
//     .min(d3.min(revs, function(d) { return d; }))
//     .max(d3.max(revs, function(d) { return d; }))
//     .width(300)
//     .tickFormat(function(d) {
//         return myFormatter(column, d)
//     })
//     .ticks(5)
//     .default([0,1])
//     .fill('#2196f3')
//     .on('onchange', val => {
//         d3.select('p#value-range').text(val.map(d3.format('.2f')).join('-'));
//         rows.filter(function(r) {
//             return false;
//         })
//         console.log(val);
//     });

//     var gRange = d3
//     .select('div#slider-range')
//     .append('svg')
//     .attr('width', 500)
//     .attr('height', 100)
//     .append('g')
//     .attr('transform', 'translate(30,30)');

//     gRange.call(sliderRange);

//     d3.select('p#value-range').text(
//     sliderRange
//         .value()
//         .map(d3.format('.2f'))
//         .join('-')
//     );
// }