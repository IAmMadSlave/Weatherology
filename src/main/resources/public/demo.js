// 
// Here is how to define your module 
// has dependent on mobile-angular-ui
// 
var app = angular.module('MobileAngularUiExamples', [
  'myModule',
  'ngRoute',
  'mobile-angular-ui',
  
  // touch/drag feature: this is from 'mobile-angular-ui.gestures.js'
  // it is at a very beginning stage, so please be careful if you like to use
  // in production. This is intended to provide a flexible, integrated and and 
  // easy to use alternative to other 3rd party libs like hammer.js, with the
  // final pourpose to integrate gestures into default ui interactions like 
  // opening sidebars, turning switches on/off ..
  'mobile-angular-ui.gestures','ngSanitize','ngMessages'
]);

var SITE_KEY = '6LdY8QQTAAAAAGKlseGApcTDKkHVWEuy7odTW0Ib';

app.run(function($transform) {
  window.$transform = $transform;
});


// 
// You can configure ngRoute as always, but to take advantage of SharedState location
// feature (i.e. close sidebar on backbutton) you should setup 'reloadOnSearch: false' 
// in order to avoid unwanted routing.
// 
app.config(['$routeProvider','noCAPTCHAProvider',function($routeProvider,noCaptchaProvider) {
  $routeProvider.when('/',              {templateUrl: 'home.html', reloadOnSearch:false});
  noCaptchaProvider.setSiteKey(SITE_KEY);
  noCaptchaProvider.setTheme('dark');
}]);

//
// For this trivial demo we have just a unique MainController 
// for everything
//
app.controller('UserController',function($rootScope, $scope, SharedState, $sanitize, $http){

  $scope.swiped = function(direction) {
    alert('Swiped ' + direction);
  };
  

  // User agent displayed in home page
  $scope.userAgent = navigator.userAgent;
  
  // Needed for the loading screen
  $rootScope.$on('$routeChangeStart', function(){
    $rootScope.loading = true;
  });

  $rootScope.$on('$routeChangeSuccess', function(){
    $rootScope.loading = false;
  });
  
  $scope.forecasts = [];
  $scope.zip='';
	  
  $scope.favoriteLocs = [];
  
  // 'Forms' screen
  //  
  $scope.zipCode = '';
  $scope.user=[];
  $scope.pass='';
  $scope.passConfirm='';
  $scope.email='';
  $scope.hideForecast = true;
  $rootScope.hideLogin = false;
  $rootScope.disableMenu=true;
  $scope.mindex='';
  $scope.response = '';
  $scope.favorites=[];
  $scope.tempUnit="true";
  $scope.unit='F';
  $scope.zipFav='';
  $scope.log={};
  $scope.oneDay={};
  $scope.flag=true;
  
	  
  $scope.$watch('gRecaptchaResponse', function (){
    $scope.expired = false;
  });


  $scope.expiredCallback = function expiredCallback(){
    $scope.expired = true;
  };


  $scope.logout = function(form) {
	    $scope.zipCode = '';
	    $scope.user=[];
	    $scope.pass='';
	    $scope.passConfirm='';
	    $scope.email='';
	    $scope.mindex='';
	    $scope.favorites=[];
	    $scope.err='';
	    $scope.err1='';
	    $scope.forecasts = [];
	    $scope.zip='';	  	  
	    $scope.favoriteLocs = [];
	    $scope.tempUnit="true";
	    $rootScope.hideLogin = false;
	    $rootScope.disableMenu = true;
	    //alert('You clicked on logout');
	    $scope.unit='F';
	    $scope.oneDay.zip='';
	    $scope.form1.$setUntouched();
		$scope.form1.$setPristine();
	    
		
  };
  
  $scope.fav=[];
  $scope.form='';
  
  
  $scope.login = function(value,value1,form,form1) {
	  
	  $scope.oneDay.zip='';
	  $scope.log={};	
	  $scope.flag=false;
	  $scope.form1=form1;
	  form.$setUntouched();
	  form.$setPristine();
	 
	  $scope.user={
			  	email:value,
			  	pass:value1
		 		};
	  
	  $scope.email=angular.copy(value);
	  
	 return $http.post("http://localhost:8080/api/v1/login",$scope.user)
		   .success(function (data, status, headers, config){
		      if(data.email=="exists")
		    	  $scope.err1="Invalid username/password";
		      else
		      		{
		    	  		//alert('You submitted the login form');
		    	  		$rootScope.hideLogin = true;
		    	  		$rootScope.disableMenu = false;
		     
		    	  		if(data.farenheit==true)
		    	  			{
		    	  			SharedState.turnOn('button2');
		    	  			$scope.tempUnit="true";
		    	  			}
		    	  		else
		    	  			{
		    	  			SharedState.turnOn('button1');
		    	  			$scope.tempUnit="false";
		    	  			}
		    
		    	  		if(data.favorites==null)
		    	  			$scope.favorites=[];
		    	  		else
		    	  			{
		    	  				$scope.favorites=data.favorites;
		    	  				$scope.fav=angular.copy($scope.favorites);
		    	  			}
		    	  		$scope.loadFav();
		      		}	
		   	})
		   	.error(function (data, status, headers, config){alert("Error Logging In")});
	  
		};

	
	$scope.loadFav=function(){
		if($scope.fav.length!=0)
			{
				$scope.value=$scope.fav[0].zip;
				$scope.val=$scope.fav[0].name;
				$scope.fav.splice(0,1);
				$http.get("http://localhost:8080/api/v1/weather/" + $scope.value)
					.success(function (response) {
						if($scope.tempUnit=="false")
	    	  			{
							$scope.favoriteLocs.push({
								zip: response.zip,
								name: response.forecasts[0].name,
								temp: ((response.forecasts[0].temperature-32)*5)/9,
								humid: response.forecasts[0].humidity,
								nickname: $scope.val
							});
	    	  				$scope.unit="C";
	    	  			}
						else
							{
								$scope.favoriteLocs.push({
									zip: response.zip,
									name: response.forecasts[0].name,
									temp: response.forecasts[0].temperature,
									humid: response.forecasts[0].humidity,
									nickname: $scope.val
								});
							}
					$scope.loadFav();
					})
					.error(function (response){alert("Error Loading Favorites")});
			}

		};
				
		
	$scope.oneDayForecast = function(zip,form,form1) {
			//alert('You called the oneDayForecast() function');
			$scope.zipCode =zip;
			$scope.oneDay={};	
			form.$setUntouched();
			form.$setPristine();
			form1.$setUntouched();
			form1.$setPristine();
			$http.get("http://localhost:8080/api/v1/weather/" + $scope.zipCode)
				.success(function (response) {
										
										$scope.zip = response.zip;
	    								$scope.forecasts = response.forecasts;
	    								if($scope.tempUnit=="false")
	    			    	  			{
	    									angular.forEach($scope.forecasts,function(value,key){
	    										value.temperature=((value.temperature-32)*5)/9;
	    									});
	    			    	  			
	    			    	  			}
	    						
				});
		};
		
  
	$scope.addFav = function(value, value1) {
			if($scope.favoriteLocs.length<3){
				
				$scope.favorites.push({name:value1,zip:value});
  				
				
				$scope.user={
							email:$scope.email,
							tempUnit:$scope.tempUnit,
							favorites:$scope.favorites
							}


				$http.put("http://localhost:8080/api/v1/users",$scope.user)
					.success(function (data, status, headers, config){
						if(data.email=="exists")
							alert("Error");
					})
					.error(function (data, status, headers, config){alert("Error Updating Database")});
				
				$http.get("http://localhost:8080/api/v1/weather/" + value)
					.success(function (response) {	
	    								
						if($scope.tempUnit=="false")
	    	  			{
							$scope.favoriteLocs.push({
								zip: response.zip,
								name: response.forecasts[0].name,
								temp: ((response.forecasts[0].temperature-32)*5)/9,
								humid: response.forecasts[0].humidity,
								nickname: value1
							});
	    	  			}
						else
							{
								$scope.favoriteLocs.push({
									zip: response.zip,
									name: response.forecasts[0].name,
									temp: response.forecasts[0].temperature,
									humid: response.forecasts[0].humidity,
									nickname: value1
								});
							}
					    	  		
					})
					.error(function (response) {alert("Error Adding Favorites")});
			}
			else
				alert("Cannot add more");
		};
  
		
		
	$scope.modify = function(value,value1) {
		
		    	$scope.favoriteLocs[$scope.mindex].zip= value;
		    	if(value1!=null)		    		
		    	$scope.favoriteLocs[$scope.mindex].nickname= value1;
		    
		    	$http.get("http://localhost:8080/api/v1/weather/" + value)
		    		.success(function (response) {
		    			if($scope.tempUnit=="false")
			  				$scope.favoriteLocs[$scope.mindex].temp= ((response.forecasts[0].temperature-32)*5)/9;
		    			else
		    				$scope.favoriteLocs[$scope.mindex].temp= response.forecasts[0].temperature;
		    			
		    			$scope.favoriteLocs[$scope.mindex].name= response.forecasts[0].name;
		    			$scope.favoriteLocs[$scope.mindex].humid= response.forecasts[0].humidity;
		    			})
		    			.error(function (response) {alert("Error Modifying Favorites")});
    	  		
		    	$scope.favorites[$scope.mindex].zip=value;
		    	if(value1!=null)
		    	$scope.favorites[$scope.mindex].name= value1;
		    
		    	$scope.user={
		    			email:$scope.email,
		    			tempUnit:$scope.tempUnit,
		    			favorites:$scope.favorites
		    				}
			    										
		    	$http.put("http://localhost:8080/api/v1/users",$scope.user)
			    	.success(function (data, status, headers, config){
			    		
			    			if(data.email=="exists")
			    				alert("Error");
			    								
			    		})
			    		.error(function (data, status, headers, config){alert("Error Updating Database")});
		    
  		};
		  
  			
  	$scope.deleteFav = function() {
  					
  					$scope.favoriteLocs.splice($scope.mindex,1);
  					$scope.favorites.splice($scope.mindex,1);
  					
  					$scope.user={
  							email:$scope.email,
  							tempUnit:$scope.tempUnit,
  							favorites:$scope.favorites
  							};
				    										
  					$http.put("http://localhost:8080/api/v1/users",$scope.user)
  						.success(function (data, status, headers, config){
  							if(data.email=="exists")
  								alert("Error");
				    })
				    .error(function (data, status, headers, config){alert("Error Deleting User")});
			 };

			  
	$scope.toggleF=function()
			 {
				if($scope.tempUnit=="false"){	
					angular.forEach($scope.favoriteLocs,function(value,key){
						value.temp= ((value.temp*9)/5)+32;
						});
						$scope.unit="F";
					}
				
				 $scope.unit="F";
				 $scope.tempUnit="true";
				 if($scope.favorites==[])
				 	{
					 
					 	$scope.user={
					 			email:$scope.email,
					 			tempUnit:$scope.tempUnit,
					 			favorites:"null"
					 			}
				 	}
				 else
				 	{
	  
					 $scope.user={
							 email:$scope.email,
							 tempUnit:$scope.tempUnit,
							 favorites:$scope.favorites
					 			}
	  
				 	}
				 
	    		$http.put("http://localhost:8080/api/v1/users",$scope.user)
				 	.success(function (data, status, headers, config){
				 		
				 		if(data.email=="exists")
				 			alert("Error");

				 	})
				 	.error(function (data, status, headers, config){alert("Error Updating Database")});
			};
  
	$scope.toggleC=function()
		{
			if($scope.tempUnit=="true"){
				angular.forEach($scope.favoriteLocs,function(value,key){
					value.temp= ((value.temp-32)*5)/9;
				});
				$scope.unit="C";
			}
			
			$scope.tempUnit="false";
			$scope.unit="C";
			if($scope.favorites==[])
				{
					$scope.user={
							email:$scope.email,
							tempUnit:$scope.tempUnit,
							favorites:"null"
					};
				}
			else
				{
					$scope.user={
							email:$scope.email,
							tempUnit:$scope.tempUnit,
							favorites:$scope.favorites
								};
				}
	
			
			$http.put("http://localhost:8080/api/v1/users",$scope.user)
				.success(function (data, status, headers, config){
	    	
						if(data.email=="exists")
							alert("Error");
	    								
				})
				.error(function (data, status, headers, config){alert("Error Updating Database")});
		};
  
		
	$scope.getIndex = function(index) {
			    $scope.mindex=index;
			  };
	
	$scope.set=function(form,form1){
		$scope.form1=form1;
		$scope.form=form;
	};
			  
	$scope.signUp = function(value,value1,response,form,form1){
		  	
		if(response == '')
			  $scope.err="Please verify Recaptcha";
		else
		  	{
				$scope.err="";
				$scope.user={
						email:value,
						pass:value1
				  			};
				
				$http.post("http://localhost:8080/api/v1/users",$scope.user)
					.success(function (data, status, headers, config){
						
						if(data.email=="exists")
							$scope.err="User already exists in database";
						else
							{
								SharedState.turnOff("modal8");
								$scope.login(value,value1,$scope.form,$scope.form1);
							}
					})
					.error(function (data, status, headers, config){
							$scope.err="Some error has occured during SignUp... Please try later...."
					});
		  	}
    	};
  
	  	
	 $scope.deleteAccount = function() {
		 
		 //alert('You clicked on the deleteAccount button!');
		 
		 $http.delete("http://localhost:8080/api/v1/users/" + $scope.email)
		 	.success(function (data, status, headers, config){
		 		$scope.logout();		
		 		})
		 	.error(function (data, status, headers, config){
		 		alert("Some error has occured while deleting account... Please try again later");
		 		});
		
	 };

	 
	 // 
	 // 'Drag' screen
	 // 
	 $scope.notices = [];
  
	 for (var j = 0; j < 10; j++) {
		 $scope.notices.push({icon: 'envelope', message: 'Notice ' + (j + 1) });
	 }
	 
	 $scope.deleteNotice = function(notice) {
		 var index = $scope.notices.indexOf(notice);
		 if (index > -1) {
			 $scope.notices.splice(index, 1);
		 }
	 };
});

var app1=angular.module('myModule',['noCAPTCHA']);

var compareTo = function() {
    return {
      require: "ngModel",
      scope: {
        otherModelValue: "=compareTo"
      },
      link: function(scope, element, attributes, ngModel) {

        ngModel.$validators.compareTo = function(modelValue) {
          return modelValue == scope.otherModelValue;
        };

        scope.$watch("otherModelValue", function() {
          ngModel.$validate();
        });
      }
    };
  };

  app.directive("compareTo", compareTo);