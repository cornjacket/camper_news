///////////////////////////////////////////////////////////////////////////////////
//
// This is my third draft of this project.
// This project uses Angular.
// It has been refactored to use a custom service, camperNews.
// It has been refactored to use a
// directive for displaying the news article tiles

/////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
// placed inside iife so we don't mess with global namespace
(function() {

  // defining a service - revealing module design pattern - provides an api
  var camperNews = function($http){

    var spinalCase = function (str) {  
      return str.toLowerCase().replace(/ +/g,'-').replace(/[^\w^\-]/gi, '').replace(/--+/g, '-')
    }    
    
    var camp_url = "http://www.freecodecamp.com/"
    var api_url = camp_url+"stories/hotStories"
    var news_url = camp_url+"news/"
        
    // returns a promise
    var getArticles = function() {
       return $http.get(api_url).
         then(function(response){
           return _.map(response.data, function(raw_article){
             var headline_no_punc = raw_article.headline.replace(/[\.,-\/#!|'$%\^&\*;:{}=\-_`~()]/g,"");
             return {
               headline:        raw_article.headline,
               link:            raw_article.link,
               upvotes:         raw_article.upVotes.length,
               discussion:      news_url+spinalCase(headline_no_punc),
               image:           (raw_article.image === "") ? raw_article.author.picture : raw_article.image,
               author_picture:  raw_article.author.picture
             }
           })
       });
    };
        
    return {
        getArticles: getArticles
    };
    
  };
  
  
var app = angular.module("app", []);
  
app.factory("camperNews", camperNews);  // register the camperNews service
  
app.controller("MainController", function($scope, $interval, camperNews) {
  
  $scope.art = {
    link: "http://sixrevisions.com/javascript/free-javascript-books/",
    image: "http://cdn.sixrevisions.com/0544-01-book-cover-eloquent-javascript.png",
    author_picture: "https://s3.amazonaws.com/freecodecamp/camper-image-placeholder.png",
    current_headline: "10 Free Javascript Books",
    headline: "10 Free Javascript Books",
    discussion: "http://www.freecodecamp.com/news/10-free-javascript-books",
    upvotes: "3"
    
  }
  
  var headline_max_characters = 0; // used to turn off $interval
  
  var onSuccess = function(articles){    
    articles.forEach(function(article) {
      article.current_heading = "" // attach a new field to keep track of current heading
      if (article.headline.length > headline_max_characters) {
        headline_max_characters = article.headline.length
      }
    });      
    
    var my_num = Math.max(_.map(articles, function(article) {
      return article.headline.length
    }))
    console.log("my_num = ", my_num)
    
    $scope.articles = articles
    $scope.count = 0
    startCountup() 
  }
  
  var onError = function(reason) {
    console.log("Unable to receive data from api")
  }
  
  var incrementHeadlines = function() {
    $scope.count +=1    
    $scope.articles.forEach(function(article) {
      article.current_headline = article.headline.substring(0,$scope.count)
    });      
  }
  
  var startCountup = function() {
    $interval(incrementHeadlines, 100, headline_max_characters)
  }
  
  camperNews.getArticles().then(onSuccess, onError);
});

  
app.directive('newsInfoCard', function() {
  return {
    replace:   true,
    restrict: 'E',
    scope: {
      article: '='
    },
    template: "<div class='cliente'>"+
              "<a href='{{article.link}}' class='top'>"+
              "<div class='imagetop'>"+
              "<img ng-src='{{article.image}}' err-src='{{ article.author_picture }}'>"+
              "</div>"+
              "<div class='headline'></div>"+
              "<p>{{article.headline}}</p></a>"+
              "<div class='bottom'><a href='{{article.discussion}}'>"+                
              "<div class='bot_l'>Discussion</div></a>"+
              "<div class='bot_r'>{{article.upvotes}} upvotes</div>"+
              "</div>"+
              "</div>"
    
  }
})  
  
// i got this off of SO. need to review how the following works
// http://stackoverflow.com/questions/16310298/if-a-ngsrc-path-resolves-to-a-404-is-there-a-way-to-fallback-to-a-default
app.directive('errSrc', function() {
  return {
    link: function(scope, element, attrs) {
      element.bind('error', function() {
        if (attrs.src != attrs.errSrc) {
          attrs.$set('src', attrs.errSrc);
        }
      });
    }
  }
});  
  
  /*
  angular.module('myApp.services', [])
  .factory('githubService', ['$http', function($http) {

    var doRequest = function(username, path) {
      return $http({
        method: 'JSONP',
        url: 'https://api.github.com/users/' + username + '/' + path + '?callback=JSON_CALLBACK'
      });
    }
    return {
      events: function(username) { return doRequest(username, 'events'); },
    };
  }]);
  */
  
}());