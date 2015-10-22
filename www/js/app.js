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



app.controller('pubNubInitController', function($scope, PubNub) {
    $scope.onsrready=false;
    $scope.pubnubready = false;


});

app.controller('pubNubController', function($rootScope, $scope, PubNub) {
    $scope.channel = "my_channel";
    $scope.deviceType = "controller";
    $scope.devices = [];

    $scope.UUID = PUBNUB.db.get('session') || (function(){ 
        var uuid = PUBNUB.uuid(); 
        PUBNUB.db.set('session', uuid); 
        return uuid; 
    })();

    // Create popover when Onsen UI is loaded.
    ons.ready(function() {
        console.log('ons.ready:');
        $scope.onsready=true;       
    });

    if (!$rootScope.pubNubInitialized) {
        // Initialize the PubNub service
        PubNub.init({
          publish_key: 'pub-c-eb51f4ff-6f64-48e5-a3d3-b154295d2323',
          subscribe_key: 'sub-c-e65674c4-606a-11e5-b50b-0619f8945a4f',
          uuid: $scope.UUID,
        });
        console.log('Registered with Pubnub Service', $scope);
        $rootScope.pubNubInitialized = true;
    }

    PubNub.ngSubscribe({ channel: $scope.channel,
        state: {
            "deviceType" : "Controller",
            "status" : "Online"
        }
    })

    console.log('Subscribed to channel', $scope);
    
      // Register for message events
    $rootScope.$on(PubNub.ngMsgEv($scope.channel), function(ngEvent, payload) {
        $scope.$apply(function() {
        console.log('Msg recvd:', payload.message);
        });
    });

    // When Presence event occurs
    $rootScope.$on(PubNub.ngPrsEv($scope.channel), function(ngEvent, payload) {
        console.log('Presence Event recvd');
        
        $scope.$apply(function() {
            
        $scope.devices = PubNub.ngListPresence($scope.channel);
        var idxOfOwnUUID = $scope.devices.indexOf($scope.UUID);
        $scope.devices.splice(idxOfOwnUUID, 1);
        console.log(idxOfOwnUUID);
        console.log('Updated node list:', $scope.devices);
        });
    });

    //Simple Test function
    $scope.testDevice = function(device_name) {
        PubNub.ngPublish({
            channel: $scope.channel,
            message: {
                uniqueId: device_name,
                requestState: "on"
            }
        });
        console.log(device_name);
    };

    //Publish a request
    $scope.publish = function() {
        console.log('publish', $scope);
        PubNub.ngPublish({
            channel: $scope.channel,
            message: {
                origin : $scope.UUID,
                destination: "0000",
                request : { state: "on"}
            }
        });
        return $scope.newMessage = '';
    };

    $scope.requestStateChange = function(dest) {
        console.log('Requesting change', $scope);
        PubNub.ngPublish({
            channel: $scope.channel,
            message: {
                origin  : $scope.UUID,
                dest    : dest,
                request : { state: "on"}
            }
        });
        return $scope.newMessage = '';
    };

    $scope.setState = function() {
        PubNub.ngState({
            channel  : "my_channel",
            state    : {
                        "UUID" : UUID,
                        "deviceType" : "Controller",
                        "status" : "Online"
                        },
            callback : function(m){console.log("State Change Callback")},
            error    : function(m){console.log(m)}
        });
        console.log("Set Controller Set")
    };

    $scope.filterOwnUUID = function(items) {
        var testArray = ["2"];
        var index = $items.indexOf($scope.UUID);
        console.log(index);
        return function(items) {
            return (testArray);
        };
    };

});

