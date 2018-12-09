var config = {
  apiKey: "AIzaSyCajd9ofZEtRI_zT1gzmmBPCxK20TZyf64",
  authDomain: "replication-project.firebaseapp.com",
  databaseURL: "https://replication-project.firebaseio.com",
  projectId: "replication-project",
  storageBucket: "replication-project.appspot.com",
  messagingSenderId: "324031249440"
};
firebase.initializeApp(config);
//console.log("firebase initialized 1420");
try {
  var app = firebase.app();
  var features = ['auth', 'database', 'messaging', 'storage'].filter(feature => typeof app[feature] === 'function');
} catch (e) {
  //console.error(e);
}
var db = firebase.database();


function initializeData(type,id) {

  var date = new Date(id);
  //console.log("hello from  data initializer  " + date);
  db.ref('experiments/' + type + "_" + id).set({
    type: type,
    date: date.toString(),
    iterations: []
  });

}

function saveData(type,id, firstValue, secondValue) {
  //console.log("saving");
  //console.log(firebase);
  db.ref('experiments/' +type+ "_" + id).once('value').then(function(snapshot) {
    var updates = {};
    //console.log(snapshot.val());
    var updateValues = [];
    updateValues = snapshot.val().iterations ? snapshot.val().iterations : [];

    updateValues.push([firstValue, secondValue]);
    updates['experiments/' + type+ "_" + id] = {
      type: type,
      iterations: updateValues
    }
    db.ref().update(updates);
  })
}


angular.module('todoApp', [])

  .controller('TodoListController', function($scope,$timeout, $interval, $location) {
    //console.log("initializing module");
    var todoList = this;
    $scope.number = "";
    $scope.title = "rrmm";
    $scope.answer = "";
    $scope.iterationRunning = false;
    $scope.canShowCross = false;
    $scope.canAnswer = false;
    $scope.typeOfTest = "";
    $scope.testTypeIdentifier = "";
    $scope.validCode = false;
    $scope.experimentEnded = false;
    var promise = null;
    var nLetters = 2;
    var nExperiments = 30;
    var nCharactersInArray = 20;
    var arrayOfCharacters = [];

    var displayTime = 40; // time in millis
    var currentId = 0;

    var date = new Date().getTime();

    $scope.currentExperiment = 0;
    $scope.nExperiments = nExperiments;

    function initializeArray() {

      arrayOfCharacters.push([]);

      for (var j = 0; j < nExperiments; j++) {
        arrayOfCharacters.push([]);
      }

      for (var j = 0; j < nExperiments; j++) {
        var nCharactersIntroduced = 0;
        for (var i = 0; i < nCharactersInArray; i++) {
          var candidate = String.fromCharCode(Math.floor(Math.random() * (57 - 48)) + 48);
          while (candidate == arrayOfCharacters[arrayOfCharacters.length - 1]) {
            candidate = String.fromCharCode(Math.floor(Math.random() * (57 - 48)) + 48);
          }
          arrayOfCharacters[j].push(candidate);
        }

        var firstCell = Math.floor(Math.random() * (nCharactersInArray / 2));
        arrayOfCharacters[j][firstCell] = (String.fromCharCode(Math.floor(Math.random() * 2) + 83));

        var secondCell = Math.floor(Math.random() * (nCharactersInArray / 2) + nCharactersInArray / 2);
        while (secondCell <= firstCell) {
          secondCell = Math.floor(Math.random() * (nCharactersInArray));
        }

        arrayOfCharacters[j][secondCell] = (String.fromCharCode(Math.floor(Math.random() * 2) + 83));
        while (arrayOfCharacters[j][firstCell] == arrayOfCharacters[secondCell]) {
          arrayOfCharacters[j][secondCell] = (String.fromCharCode(Math.floor(Math.random() * 2) + 83));
        }
      }


    }

    initializeArray();

    function tick() {
      if (currentId < nCharactersInArray) {
        if(Number.isInteger(currentId)){
            $scope.number = arrayOfCharacters[$scope.currentExperiment][currentId];
        }else{
              $scope.number = " ";
        }

        currentId+= 0.5;
      } else {
        $interval.cancel(promise);
        $scope.iterationRunning = false;
        $scope.canAnswer = true;
        $scope.number = " ";
      }
    }

    function initializeTicking() {
      $scope.canShowCross = true;
      $timeout(function(){
        $scope.canShowCross = false;

        if ($scope.currentExperiment == 0) {
          initializeData($scope.testTypeIdentifier,date);
        }
        currentId = 0;
        $scope.iterationRunning = true;
        $scope.$apply();
        promise = $interval(tick, displayTime);
      },2000);

    }



    function answerT() {
      $scope.answer += "T";
    }

    function answerS() {
      $scope.answer += "S";
    }

    function answerT() {
      $scope.answer += "T";
    }

    function erase() {
      if ($scope.answer.length > 0) {
        $scope.answer = $scope.answer.substring(0, $scope.answer.length - 1);
      }
    }

    function submitCode() {
      db.ref('codeTypes/' ).once('value').then(function(snapshot){
        //console.log("validating....  " + $scope.typeOfTest);
        $scope.$apply();
        //console.log(snapshot.val());
        if(snapshot.val()[0] == $scope.typeOfTest || snapshot.val()[1]== $scope.typeOfTest){
          //console.log("valid code dev");
          $scope.validCode = true;

          $scope.testTypeIdentifier =(snapshot.val()[0] == $scope.typeOfTest)?"bilingual":"monolingual";
          //console.log("***result***");
          //console.log($scope.testTypeIdentifier );
          //console.log("*************");
          $scope.$apply();

        }else{
          //console.log("error in the code, resubmit");
          $scope.typeOfTest = "";
          $scope.$apply();
        }
      });
    }

    function done() {
      var firstCorrect = false;
      var secondCorrect = false;
      let nAnswers = 0;
      //console.log("DONE iteration  "  + $scope.currentExperiment);
      if($scope.currentExperiment < nExperiments  ){
        for (var i = 0; i < nCharactersInArray; i++) {
          if (arrayOfCharacters[$scope.currentExperiment][i] == "S" || arrayOfCharacters[$scope.currentExperiment][i] == "T") {
            if (nAnswers == 0) {
              nAnswers++;
              if (arrayOfCharacters[$scope.currentExperiment][i] == $scope.answer[0]) {
                firstCorrect = true;
              } else {
              }
            } else {
              if (arrayOfCharacters[$scope.currentExperiment][i] == $scope.answer[1]) {
                secondCorrect = true;
              } else {
              }
            }
          }
        }
        //console.log("savig...");
        saveData($scope.testTypeIdentifier,date, firstCorrect, secondCorrect);
        $scope.answer = "";
        $scope.canAnswer = false;
        $scope.currentExperiment++;
      }
      if($scope.currentExperiment ==nExperiments){

        //console.log("experiment finished");
        $scope.experimentEnded = true;
      }
    }

    this.initializeArray = initializeArray;
    this.tick = tick;
    this.initializeTicking = initializeTicking;
    this.answerT = answerT;
    this.answerS = answerS;
    this.erase = erase;
    this.done = done;
    this.submitCode = submitCode;
  });
