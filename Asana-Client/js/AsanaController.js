/*============================================================================
* @author Derry Everson
*============================================================================*/
var app = angular.module("AsanaApp", []);
app.controller("AsanaCtrl", function($scope, $http ){

  /*=========================================================================
  * Used for diffrent browser adjustments
  *========================================================================*/
  var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
  var isFirefox = typeof InstallTrigger !== 'undefined';
  var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
  var isIE = /*@cc_on!@*/false || !!document.documentMode;
  var isEdge = !isIE && !!window.StyleMedia;
  var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

  /*=======================================================================*
  * Globals
  *========================================================================*/
  var BaseReq = {
    method: "",
    url: "https://app.asana.com/api/1.0/",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer 0/00000000000000000",
      "Accept": "application/json"
    },
    data: {}
  };
  $scope.encounterTypes = ["Allergy","Appt Status","Behavioral Health","Care Management","Clinical List Update","Coumadin Clinic","Dermatology","Dexa Report","Diabetic Foot Disease Screening","EKG Interpretation Report","ENT"," eSM Rx Refill","Express Care","Family Practice","Foot & Ankle Surgery","Gynecology","Immunizations","Internal Medicine","MCR - Medicare Visit","Medical Records Update","Nurse Only","Nursing Home Facility Visit","Nutritional Education","OB Encounter","Occupational Medicine","On Call","OOC Billing","OOC Order Form (All)","Opioid Treatment","Pain Management","Pediatric Primary Care","Peds Sports Exam","Phone Note","Portal Message","Post Partum","PPD Screening","Preauthorization","Pre-Operative Patient Information","QMAF","Radiology","Referrals","RS Order","Rx Refill"," SOAP Note","Sports Physical","TeleMedicine","UBA","Urology"];

  $scope.getTasks = function(obj){
    getAllTasksInSection(obj);
  };
  $scope.getTaskInfo = function(obj){
    getTaskInformation(obj);
  };
  $scope.report = function(obj){
    updateTaskInformation(obj);
  };
  $scope.resetForm = function(){
    $scope.form = {encounter:{val:""},formName:{val:""},description:{val:""},btn:{val:"Submit", status: false},show:false,success:false};
  };
  $scope.validateForm = function(){
    var valid = 0;
    var form = $scope.form;
    if(form.encounter.val){valid++;form.encounter.valid=1;}else{form.encounter.valid=0;}
    if(form.formName.val){valid++;form.formName.valid=1;}else{form.formName.valid=0;}
    if(form.description.val){
      if(form.description.val.length >= 40){valid++;form.description.valid=1;}
    }else{form.description.valid=0;}
    if(form.agreed){valid++}else{}
    if(valid==4){form.btn.status=0}else{form.btn.status=1}
    try{$scope.$digest()}catch(e){}
  };

  /*=======================================================================*
  * Sets information to ready the task creation function
  *========================================================================*/
  $scope.submitTicket = function(){
    var md = getInfo();
    var date = new Date();
    var type = $scope.form.isRequest?"Request":"Issue"
    var title = type+": "+$scope.form.encounter.val+" - "+$scope.form.formName.val+"";
    var username = md.username;
    var notes = ""+md.fullname+" ("+md.username+") "+$scope.form.description.val+"\nIssue with pid: "+md.pid+"\nSumbited on "+date;
    createTask("52881378746895", ["1145870908001225"], title, username, notes)
  };

  /*=======================================================================*
  * Gets User and Patient Information
  *========================================================================*/
  function getInfo(){
    var result = {};
    var usr = isMel()?GetCurrentUserInfo():{FullName:"Demo Data",LoginName:"dData"};
    var pat = isMel()?GetDemographics():{patientKey:"1000000000000000"};
    var doc = isMel()?GetChartData(GetPatientId(),true).PatientData.chart.documentList[0]:{documentTypeDetail:{description:"Demo Description"},documentType:"Demo Type",summary:"Demo Summary"};
    result.docType = doc.documentTypeDetail.description;
    result.docTypeID = doc.documentType;//Get the Encounter Type SELECT * FROM ENCTYPE WHERE DOCTYPEID = '1878934079517780'
    result.docSum = doc.summary;
    result.fullname = usr.FullName;
    result.username = usr.LoginName;
    result.useremail = usr.LoginName+"@valleymedicalcenter.com";
    result.pid = pat.patientKey;
    return result;
  };

  /*=======================================================================*
  * Creates a task in the bud tracking project
  * Example: createTask("52881378746895", ["1145870908001225"], "Test Title", "Test User", "Test Notes");
  *========================================================================*/
  function createTask(workspace_GID, projects_Arr, title, username, notes){
    var NewReq = angular.copy(BaseReq);
    NewReq.method = "POST";
    NewReq.url = "https://app.asana.com/api/1.0/tasks";
    NewReq.data = {
      "data": {
        "name": title,
        "approval_status": "pending",
        "assignee_status": "upcoming",
        "completed": false,
        "notes": notes,
        "custom_fields": {"1169068050771347": username,"1145870908001249":1},
        "projects": projects_Arr,
        "workspace": workspace_GID
      }
    };
    $http(NewReq).then(function(response){
      console.log(response.data)
    });
  };

  /*=======================================================================*
  * Sets Update Note
  *========================================================================*/
  function createUpdateNote(){
    var md = getInfo();
    var date = new Date();
    var result = "\n - "+md.fullname+" ("+md.username+") confirms issue with pid: "+md.pid+"\n   Sumbited on "+date;
    return result;
  };

  /*=======================================================================*
  * Sets Update Field(s)
  *========================================================================*/
  function parseUpdateFields(obj){
    var fields = obj.info.custom_fields;
    var result = {}
    for(var i=0; i<fields.length; i++){
      if(fields[i].gid == "1145870908001249") result[fields[i].gid] = fields[i].number_value+1;
    }
    return result;
  };

  /*=======================================================================*
  * Updates a task
  *========================================================================*/
  function updateTaskInformation(obj){
    var fields = parseUpdateFields(obj);
    var notes = createUpdateNote();
    var NewReq = angular.copy(BaseReq);
    NewReq.method = "PUT";
    NewReq.url = "https://app.asana.com/api/1.0/tasks/"+obj.info.gid;
    NewReq.data = {
      "data": {
        "notes": obj.info.notes+" "+notes,
        "custom_fields": fields,
      }
    };
    $http(NewReq).then(function(response){
      refreshTaskInformation(obj);
      obj.reported = true;
    });

  };

  /*=======================================================================*
  * Gets Sections in the project GID
  *========================================================================*/
  function getAllSections(project_GID){
    var NewReq = angular.copy(BaseReq);
    NewReq.method = "GET";
    NewReq.url = "https://app.asana.com/api/1.0/projects/"+project_GID+"/sections";
    $http(NewReq).then(function(response){
      console.log(response.data)
      $scope.data = response.data.data;
    });
  };

  /*=======================================================================*
  * Gets Tasks in section OBJ
  *========================================================================*/
  function getAllTasksInSection(obj){
    var NewReq = angular.copy(BaseReq);
    NewReq.method = "GET";
    NewReq.url = "https://app.asana.com/api/1.0/sections/"+obj.gid+"/tasks";
    $http(NewReq).then(function(response){
      obj.tasks = response.data.data;
    });
  };

  /*=======================================================================*
  * Gets Task Information by task OBJ
  *========================================================================*/
  function getTaskInformation(obj){
    var NewReq = angular.copy(BaseReq);
    NewReq.method = "GET";
    NewReq.url = "https://app.asana.com/api/1.0/tasks/"+obj.gid;
    $http(NewReq).then(function(response){
      obj.info = response.data.data;
    });
  };

  /*=======================================================================*
  * RefreshesTask Information by task OBJ
  *========================================================================*/
  function refreshTaskInformation(obj){
    var NewReq = angular.copy(BaseReq);
    NewReq.method = "GET";
    NewReq.url = "https://app.asana.com/api/1.0/tasks/"+obj.gid;
    $http(NewReq).then(function(response){
      obj.info = response.data.data;
    });
  }

  /*=======================================================================*
  * Gets base64 data from image
  * Example: var yess = toDataURL('images/unnamed.jpg', function(dataUrl) {yess = dataUrl;})
  *========================================================================*/
  function toDataURL(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      var reader = new FileReader();
      reader.onloadend = function() {
        callback(reader.result);
      }
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  }

  /*=======================================================================*
  * Needs Worked on - Asana API for attachments is underconstruction
  * Uploads Attachment to task
  * Example: uploadAttachment("1169197389695681",yess);
  *========================================================================*/
  function uploadAttachment(task_GID, image){
    //console.log(image.split(','))
    //var base64 = getBase64Image();
    var body = btoa("--ASANA_BOUNDARY Content-Disposition: form-data; name=file; filename='unnamed.jpg'; Content-Type: image/jpeg "+image+" --ASANA_BOUNDARY--");
    // Binary conversiion
    // var yesss = "";
    // for (i=0; i < body.length; i++) {
    //   yesss+=body[i].charCodeAt(0).toString(2) + "";
    // }
    //console.log(body)
    var NewReq = angular.copy(BaseReq);
    NewReq.method = "POST";
    NewReq.url = "https://app.asana.com/api/1.0/tasks/"+task_GID+"/attachments";
    NewReq.headers["Content-Type"] = "multipart/form-data; boundary="+body;
    //NewReq.headers["Content-Disposition"] = "form-data; name=file; filename='unnamed.jpg'";
    // NewReq.formData = {
    //   "file":image.split(",")[1]
    // }
    //console.log(NewReq)
    $http(NewReq).then(onComplete, onError);
    return onComplete;
  };

  /*=======================================================================*
  * Checks if App is attached to Centricity EHR Software
  *========================================================================*/
  function isMel(){
    return window.external.CurrentUserInfo?true:false;
  };

  $scope.btnSubmit = function(){
    $scope.submitTicket();
    $scope.form.btn.val = "Submitted!"
    $scope.form.btn.status=true;
    $scope.form.success=true;
    try{$scope.$digest()}catch(e){}
    setTimeout(function(){
      $scope.resetForm();
      try{$scope.$digest()}catch(e){}
      window.location.reload(true);
    }, 5000);
  };



  /*=======================================================================*
  * JSON Gets on AngularJS INIT
  *========================================================================*/
  $scope.$watch('$viewContentLoaded', function(event){
  });

  /*=======================================================================*
  * INIT
  *========================================================================*/
  function init(){
    getAllSections("1145870908001225");
  };
  init();

});
