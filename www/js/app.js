var PhoneGapInit = function () {
  this.boot = function () {
    angular.bootstrap(document, ['myApp']);
  };

  if (window.phonegap !== undefined) {
    document.addEventListener('deviceready', function() {
      this.boot();
    });
  } else {
    console.log('PhoneGap not found, booting Angular manually');
    this.boot();
  }
};

angular.element(document).ready(function() {
  new PhoneGapInit();
});

var app = angular.module('myApp', ['onsen', "pubnub.angular.service"]);

app.service("nodeManager", function($rootScope, $q, $interval, $timeout, PubNub) {
    var nm ={};
    var nodeDataObserverCallbacks = [];
    
    var nodes ={};
    var deviceIds = [];
    nm.channel = "my_channel";
    nm.uuid = 0;
    nm.isPubNubInitialized = false;
    nm.pubnub = null;

    nm.init =function(){
        
        console.log('No uuid found', PUBNUB.db.get('session'));

        nm.uuid = PUBNUB.db.get('session') || (function(){ 
            console.log('No uuid found');
            var uuid = PUBNUB.uuid(); 
            PUBNUB.db.set('session', uuid); 
            return uuid; 
        })();

        if (nm.isPubNubInitialized==false) {

                console.log('Initialize the PubNub service');
                  nm.pubnub= PubNub.init({
                  publish_key: 'pub-c-eb51f4ff-6f64-48e5-a3d3-b154295d2323',
                  subscribe_key: 'sub-c-e65674c4-606a-11e5-b50b-0619f8945a4f'
                });
                nm.isPubNubInitialized = true;
        };

        console.log('Subscribing to my_channel');
        PubNub.ngSubscribe({ channel: nm.channel,
            state: {
                "deviceType" : "Controller",
                "status" : "Online"
            }
        });

        console.log('Registering Msg Event listener');
        $rootScope.$on(PubNub.ngMsgEv(nm.channel), function(ngEvent, payload) {
            //do nothing
        });
        
        // When Presence event occurs
        $rootScope.$on(PubNub.ngPrsEv(nm.channel), function(ngEvent, payload) {
            console.log('Device List:', payload);
        });
        };


    nm.getNodeList = function(){
        deviceIds = PubNub.ngListPresence(nm.channel);
        console.log('Getting Node lists', deviceIds.length);
    }

    nm.updateNodes = function(){
        console.log('Updating nodes:', deviceIds.length);
        nm.getNodeList();
        // the array is defined and has at least one element
        if (typeof deviceIds !== 'undefined' && deviceIds.length > 0) {
            var idxOfOwnUUID = deviceIds.indexOf(nm.uuid);
            deviceIds.splice(idxOfOwnUUID, 1);
            console.log('Total nodes detected:', deviceIds.length);
            
            for (var i=0; i<deviceIds.length; i++){
                $timeout(5);
                var currentId = deviceIds[i];
                console.log('currentId:', currentId);
                nodes[deviceIds[i]]={
                                'uuid' : deviceIds[i],
                                deviceType : '',
                        };
            };

            $rootScope.$broadcast('nodesUpdated');
    
        } else {
            //do nothing
        }

    };

    nm.initNodes = function(){
        //do nothing
    };

    nm.getNodes = function(){
        console.log('Nodes:', nm.nodes);

        return nodes;
    };
    console.log('Node Manager initialized');

    $interval(nm.updateNodes, 10000);

    nm.init();
    console.log('Self uuid: ', nm.uuid);
    
    return nm;
});


app.controller('pubNubViewController', ['$scope', "nodeManager", function($scope, nodeManager) {
    $scope.nodes={};

    $scope.$on('nodesUpdated', function() {
        $scope.nodes = nodeManager.getNodes();
        console.log('callback received by scope.on', $scope.nodes);
    });
    console.log('pubNubViewController intialized');
}]);


app.controller('pubNubDeviceViewController', ["nodeManager", '$scope', 'PubNub',function($rootScope, $scope, nodeManager, PubNub) {
  // $scope.page = myNavigator.getCurrentPage();
  $scope.nodeID = myNavigator.getCurrentPage().options.nodeID
      nodeManager.ngState({
       channel: "my_channel",
       // state: true,
       uuid: $scope.nodeID,
       callback: function(m){console.log("State Received",JSON.stringify(m))}
     });
  console.log('Initializing pubNubDeviceViewController');
  console.log($scope.nodeID);
}]);

// app.controller('pubNubController', function($rootScope, $scope, PubNub) {
//     $scope.channel = "my_channel";
//     $scope.deviceType = "controller";
//     $scope.deviceIds = [];



//     // Create popover when Onsen UI is loaded.
//     ons.ready(function() {
//         console.log('ons.ready:');
//         // $scope.onsready=true;       
//     });

//     console.log('Subscribed to channel', $scope);
    


//     // When Presence event occurs
//     $rootScope.$on(PubNub.ngPrsEv($scope.channel), function(ngEvent, payload) {
//         console.log('Presence Event recvd by pubNubController');
//         $scope.deviceIds = PubNub.ngListPresence($scope.channel);
//         var idxOfOwnUUID = $scope.deviceIds.indexOf($scope.UUID);
//         $scope.deviceIds.splice(idxOfOwnUUID, 1);
//         console.log('Updated node list:', $scope.deviceIds);
//     });

//     //Simple Print function
//     $scope.consolePrint = function(value) {
//         console.log(value);
//         console.log($scope.value);

//     };

//     //Publish a request
//     $scope.publish = function() {
//         console.log('publish', $scope);
//         PubNub.ngPublish({
//             channel: $scope.channel,
//             message: {
//                 origin : $scope.UUID,
//                 destination: "0000",
//                 request : { state: "on"}
//             }
//         });
//         return $scope.newMessage = '';
//     };

//     $scope.requestStateChange = function(dest) {
//         console.log('Requesting change', $scope);
//         PubNub.ngPublish({
//             channel: $scope.channel,
//             message: {
//                 origin  : $scope.UUID,
//                 dest    : dest,
//                 request : { state: "on"}
//             }
//         });
//         return $scope.newMessage = '';
//     };

//     $scope.setState = function(UUID) {
//             PubNub.ngState({
//                 channel  : "my_channel",
//                 state    : {
//                             "UUID" : UUID,
//                             "deviceType" : "Device",
//                             "status" : "Online"
//                             },
//                 callback : function(m){console.log(m)},
//                 error    : function(m){console.log(m)}
//             });
//             console.log("Set Controller Set")
//         };

//     $scope.getState = function(UUID) {
//         PubNub.ngState({
//             channel  : "my_channel",
//             uuid     : UUID,
//             callback : function(m){console.log(m)},
//             error    : function(m){console.log(m)}
//         });
//         console.log("Get Controller Set")
//     };

// });

