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
    $scope.channel = "my_channel"
    $scope.messages = []


    // Create popover when Onsen UI is loaded.
    ons.ready(function() {
        console.log('ons.ready:');
        $scope.onsready=true;
        // PubNub.init({
        //   publish_key: 'pub-c-eb51f4ff-6f64-48e5-a3d3-b154295d2323',
        //   subscribe_key: 'sub-c-e65674c4-606a-11e5-b50b-0619f8945a4f',
        // });
        $scope.pubnubready = true;
        console.log('pubnubInit done:');        
    });

    if (!$rootScope.pubNubInitialized) {
        // Initialize the PubNub service
        PubNub.init({
          publish_key: 'pub-c-eb51f4ff-6f64-48e5-a3d3-b154295d2323',
          subscribe_key: 'sub-c-e65674c4-606a-11e5-b50b-0619f8945a4f',
        });
        console.log('Registered with Pubnub Service', $scope);
        $rootScope.pubNubInitialized = true;
    }

    PubNub.ngSubscribe({ channel: $scope.channel })
    console.log('Subscribed to channel', $scope);
    
      // Register for message events
    $rootScope.$on(PubNub.ngMsgEv($scope.channel), function(ngEvent, payload) {
        $scope.$apply(function() {
        console.log('Msg recvd:', payload.message);
        });
    });

      // Register for presence events (optional)
    $rootScope.$on(PubNub.ngPrsEv($scope.channel), function(ngEvent, payload) {
        $scope.$apply(function() {
        $scope.devices = PubNub.ngListPresence($scope.channel);
        console.log('Presence Msg recvd:', payload.message.occupancy);
        });
    });

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
  /* Publish a chat message */
    $scope.publish = function() {
        console.log('publish', $scope);
        PubNub.ngPublish({
            channel: $scope.channel,
            message: {
                uniqueId: "0000",
                requestState: "on"
            }
        });
        return $scope.newMessage = '';
    };

    $scope.requestStateChange = function(uuid, state) {
        PubNub.ngPublish({
            channel: $scope.channel,
            message: {
                uniqueId: uuid,
                requestState: state
              }
        });
    };



});