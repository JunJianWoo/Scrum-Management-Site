const express = require('express');
const path = require('path');
const {boardRouter, burndownChartValues} = require("./controllers/board-controller")
const { Script } = require('vm');
const VIEWS_PATH = path.join(__dirname,"/views/")
const PORT_NUMBER = 8080;

const app = express();
app.use(express.static("node_modules/bootstrap/dist/css"));

//Setup the view Engine
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('images'));
app.use(express.static('css'));
app.use(express.json())
app.use('/controllers', express.static('controllers'));

app.use("",boardRouter)

app.get('/', function (req, res) {
    res.sendFile(VIEWS_PATH + "index.html")
});

app.get('/group', function (req, res) {
    res.sendFile(VIEWS_PATH + "groupmaking.html")
});

app.get('/burndown-chart', function(req,res) {
    let bcValues = burndownChartValues()    
    res.render(VIEWS_PATH + "burndown_chart.html", {burndownChartValues: bcValues})
})

app.get('/login', function(req,res) {
    res.sendFile(VIEWS_PATH + "login_page.html")
})

app.get('/settings', function(req,res) {
    res.sendFile(VIEWS_PATH + "settings_page.html")
})

app.get('/sprint', function(req,res) {
    res.sendFile(VIEWS_PATH + "sprint.html")
})

app.get('/my-tasks', function(req,res) {
    res.sendFile(VIEWS_PATH + "my_tasks.html")
})

app.listen(PORT_NUMBER, function () {
    console.log(`listening on port number http://localhost:${PORT_NUMBER}`);
});

app.use((req, res) => {
    res.render(__dirname + "/views/error.html");
  });




