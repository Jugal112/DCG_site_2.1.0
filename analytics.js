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
    'QoQ Rev Surprise',
]);
var currencyCols = new Set([
    "LTM Revenue",
    "NTM Revenue",
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
    "LTM Gross Margin",
    "LTM EBITDA Margin",
    "LTM FCF Margin",
    "Implied YoY Rev Growth",
    "Contribution Margin*"
]);
var floatCols = new Set([
    "Magic Number"
])
var numericCols = new Set([
    ...currencyCols, 
    ...multiplesCols, 
    ...percentCols, 
    ...floatCols
]);
var sliderCols = new Set([
    "EV/Revenue",
    "Avg QoQ Rev Growth",
    "LTM Gross Margin",
    "LTM FCF Margin"
]);

function myFormatter(column, value) {
    if (currencyCols.has(column)) {
        return numeral(value).format('$0.2a');
    } else if (multiplesCols.has(column)) {
        return d3.format(".2f")(value) + 'x';
    } else if (percentCols.has(column)) {
        return d3.format(".2%")(value);
    } else if (floatCols.has(column)) {
        return d3.format(".2f")(value);
    }
    return value;
    // return d3.format(".2s")(value);
}

var filters = {};

// /data.csv
d3.csv("https://drive.google.com/u/0/uc?id=1-1ZVKKdvR4vm28yIwv3Wz1jh4SOdspjr&export=download").then(function (data) {
    sliderCols.forEach(function (column) {
        createRangeSlider(data, column);
    });
})

function render() {
    d3.csv("https://drive.google.com/u/0/uc?id=1-1ZVKKdvR4vm28yIwv3Wz1jh4SOdspjr&export=download").then(function (data) {
        // Select the div with the "table" id.
        d3.selectAll("table").remove();
        var table_container = d3.select("#csv").append("table")
        var table = d3.select("table");
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
            .filter(function (row) {
                for (col in filters) {
                    min = filters[col][0];
                    max = filters[col][1];
                    value = parseFloat(row[col]);
                    between = (min <= value && value <= max)
                    if (!between) {
                        return false;
                    }
                }
                return true;
            })
            .append("tr");
        rows.exit().remove();

        var cells = rows.selectAll("td")
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
        cells.exit().remove();
    });    
};

render();

function createRangeSlider(data, column) {
    var settings_selection = d3.select("#settings");
    var div = settings_selection.append("div");
    div.append('p').text(column);

    var revs = data.map( function(d) {
        return parseFloat(d[column]);});
    
    minimum = d3.min(revs);
    maximum = d3.max(revs);
    var sliderRange = d3
        .sliderBottom()
        .min(minimum)
        .max(maximum)
        .width(300)
        .tickFormat(function(d) {
            return myFormatter(column, d)
        })
        .ticks(1)
        .default([minimum,maximum])
        .fill('#2196f3')
        .on('onchange', val => {
            filters[column] = val;
            render();
        });

    var gRange = div
        .append('svg')
        .attr('width', 500)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(90,30)');

    gRange.call(sliderRange);
}