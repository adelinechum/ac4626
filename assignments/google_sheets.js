
/*
* GOOGLE SHEETS INTERACTIONS
*/
// set up google visualization query
function setUpQuery(sheetLocation, queryStatement) {
   var promise = new Promise(function(resolve, reject) {
       google.charts.setOnLoadCallback(function(){
           query = new google.visualization.Query(sheetLocation);
           query.setQuery(queryStatement);
          resolve('done');
       }
);
   });
   return promise;
}

// send query and return the response
function getQuery(){
  var promise = new Promise(function(resolve, reject){
    query.send(function(response){
      resolve(response);
    })
  });
  return promise;
}

// transform google response into an array and format fractions
function createTable(response){
  var dataArray =[];
  var data = response.getDataTable();
  var columns = data.getNumberOfColumns();
  var rows = data.getNumberOfRows();
  var table = [];

  for (var r = 0; r < rows; r++) {
    var row = [];
    for (var c = 0; c < columns; c++) {
      row.push(data.getFormattedValue(r, c));
    }
    table.push(row)
  }

  return table;
}
