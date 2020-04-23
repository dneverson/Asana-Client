/*============================================================================
* @author Derry Everson
*============================================================================*/
var app = angular.module("SampleApp", []);
app.controller("SampleCtrl", function($scope, $http ){

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


  /*=======================================================================*
  * JSON Gets on AngularJS INIT
  *========================================================================*/
  $scope.$watch('$viewContentLoaded', function(event){
  });

  /*=======================================================================*
  * INIT
  *========================================================================*/
  function init(){

  };
  init();

});
