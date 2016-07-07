var app = angular.module('drf-angular', ['ui.router','ngResource','textAngular']);
var api_url = "/api/";
    // configure our routes
    app.config(function($stateProvider,$urlRouterProvider) {
       $stateProvider
	    .state('/root', {
            url: "/",
            templateUrl : 'static/templates/home.html',
            controller : 'homeController',
        })
        .state('/profile', {
            url: "/profile",
            params: {
                action_state: null,
            },
            templateUrl : 'static/templates/userProfile.html',
            controller : 'profileController',
        })
        .state('/posts', {
            url: "/posts",
            params: {
                action_state: null,
                title: null,
            },
            templateUrl : 'static/templates/userPosts.html',
            controller : 'itemsController',
        })
        .state('user', {
            url: "/user/:id/:action",
            templateUrl : 'static/templates/user.html',
            controller : 'userController',
        })
        .state('singlepost', {
            url: "/post/:id/:action",
            templateUrl : 'static/templates/singlePost.html',
            controller : 'singlepostController',
        })
        // Social stuff
        // .state('/fb', {
        //     url : '/fb',
        //     controller : 'fbAuthController',
        // })
        ;
	    
        $urlRouterProvider.otherwise('/');
	});

    app.filter('removeHTMLTags', function() {
        return function(text) {
            return  text ? String(text).replace(/<[^>]+>/gm, '') : '';
        };
    });

    // Show tabs correctly
    app.directive('showtab',
        function () {
            return {
                link: function (scope, element, attrs) {
                    element.click(function(e) {
                        e.preventDefault();
                        $(element).tab('show');
                    });
                }
            };
        });
    app.config(['$httpProvider', function($httpProvider){
        // django and angular both support csrf tokens. This tells
        // angular which cookie to add to what header.
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
        // $httpProvider.defaults.useXDomain = true;
        // $httpProvider.defaults.headers.common = {};
        // $httpProvider.defaults.headers.post = {};
        // $httpProvider.defaults.headers.put = {};
        // $httpProvider.defaults.headers.patch = {};
    }]).
    factory('api', function($resource,$stateParams){
        return {
            auth_login: $resource('/api-auth/login\\/', {}, {
                login: {method: 'POST'},
            }),
            auth_logout : $resource('/api-auth/logout\\/',{},{
            	logout: {method: 'POST'},
            }),
            profile : $resource('/api-auth/user\\/',{},{
                get_profile_info: {method: 'get'},
                update_profile_info: {method: 'put'},
            }),
            users: $resource('/api/users\\/', {}, {
                create: {method: 'POST'},
                list: {method: 'GET',isArray:true}
            }),
            posts : $resource('/api/posts\\/',{},{
                list_all : {method:'GET',isArray:true},
                create : {method:'POST'},
            }),
            singlepost : $resource('/api/posts/:id\\/',{},{
                detail : {method:'GET'},
                update : {method:'PUT'},
                delete : {method:'DELETE'}
            }),
            user : $resource('/api/users/:id\\/',{},{
                detail : {method:'GET'},
                update : {method:'PUT'}
            })
        };
    }).
    controller('homeController', function($scope,$location,$timeout,$http,$window, api) {
        $scope.user = api.profile.get_profile_info();

        $scope.getCredentials = function(){
            return {username: $scope.username, password: $scope.password};
        };
        $scope.login = function(){
            api.auth_login.login($scope.getCredentials()).
                $promise.
                    then(function(data){
                        $scope.key = data.key;
                        $scope.get_profile_info();
                    }).catch(function(data){
                        // on incorrect username and password
                        console.log(data.data.detail);
                    });
        };
 
        $scope.logout = function(){
            api.auth_logout.logout(function(){
                $scope.user = undefined;
                $scope.key = undefined;
            });
        };

        $scope.get_profile_info = function(){
            api.profile.get_profile_info().
                $promise.
                    then(function(data){
                        $('#username-label').append(data.username);
                    })
        };
        $scope.fbLogin = function(){
            // todo login facebook            
        };
        $scope.twitterLogin = function(){
            // todo login twitter            
        };
    }).
    controller('profileController',function($scope,$state,$stateParams,api){

        $scope.state = $stateParams;

    	api.profile.get_profile_info().
            $promise.
                then(function(data){
                    $scope.user = data
                    if($scope.user.is_staff == true){
                            api.users.list().
                                $promise.
                                    then(function(data){
                                        $scope.all_users = data;
                                    });
                            api.posts.list_all().
                                $promise.
                                    then(function(data){
                                        $scope.posts = data;
                                    });
                        }
                });

        
        $scope.updateProfile = function($data){
            api.profile.update_profile_info({
                username : $scope.user.username,
                first_name : $scope.fname,
                last_name : $scope.lname,
                posts : $scope.user.posts
            });
        };
        $scope.addPost = function($data){
            var form = $('form[name=postForm]');
            api.posts.create({
                title : $scope.newPost.title,
                content : $scope.newPost.content,
                author : $scope.newPost.author
            }).
                $promise.
                    then(function($data){
                        $scope.content  = '';
                        form.find('label').css('border-bottom','none');
                        form.find('input,textarea').val('');
                        form.find('.alert-success')
                            .fadeIn('slow')
                            .fadeOut('slow');
                        $('.table.posts').append(
                                '<tr>'
                                +'<td>'+$data.title+'</td>'
                                +'<td><a href="#/user/'+$data.author+'">'+$data.author_name+'</a></td>'
                                +'<td>'+$data.content.substring(0, 40)+'</td>'
                                +'<td>'
                                +'<a href="#/post/'+$data.id+'/view" class="glyphicon glyphicon-search"></a>'
                                +'<a href="#/post/'+$data.id+'/delete" class="glyphicon glyphicon-trash"></a>'
                                +'</td></tr>'
                            );

                    }).catch(function(data){
                        form.find('label').css('border-bottom','none');

                        $.each(data.data,function(k,v){
                            console.log(k);
                            form.find('label[id='+k+']').css('border-bottom','solid red');
                        })
                    });
        };
        $scope.addUser = function($data){
            var form = $('form[name=userForm]');
            console.log($scope.newUser);
            api.users.create({
                username : $scope.newUser.username,
                email : $scope.newUser.email,
                first_name : $scope.newUser.first_name,
                last_name : $scope.newUser.last_name,
            }).
                $promise.
                    then(function($data){
                        $scope.content  = '';
                        form.find('label').css('border-bottom','none');
                        form.find('input,textarea').val('');
                        form.find('.alert-success')
                            .fadeIn('slow')
                            .fadeOut('slow');
                        $('.table.users').append(

                                '<tr> '
                                +'<td><a href="#/user/'+$data.id+'">'+$data.username+'</a></td>'
                                +'<td></td>'
                                +'<td>'
                                +'<a href="#/user/'+$data.id+'" class="glyphicon glyphicon-search"></a>'
                                +'<a href="#/user/'+$data.id+'/delete" class="glyphicon glyphicon-trash"></a>'
                                +'</td></tr>'
                            );

                    }).catch(function(data){
                        form.find('label').css('border-bottom','none');

                        $.each(data.data,function(k,v){
                            console.log(k);
                            form.find('label[id='+k+']').css('border-bottom','solid red');
                        })
                    });
        };
    }).
    controller('itemsController',function($scope,$stateParams,api){
        $scope.state = $stateParams;
        api.profile.get_profile_info().
            $promise.
                then(function(data){
                    $scope.user = data;
                });
        api.posts.list_all().
            $promise.
                then(function(data){
                    $scope.posts = data;
                });
        $scope.postAuthorFilter = function(item){
            return item.author_name == $scope.user.username
        }
        $scope.addPost = function($data){
            api.posts.create({
                title : $scope.title,
                content : $scope.content,
                author : $scope.user.username
            }).
                $promise.
                    then(function($data){
                        var form = $('form[name=postForm]');
                        $scope.content  = '';
                        form.find('input,textarea').val('');
                        form.find('.alert-success')
                            .fadeIn('slow')
                            .fadeOut('slow');
                        $('.list-group').append('<a href="#/post/'+$data.id+'/" class="list-group-item">'
                            +'<h4 class="list-group-item-heading">'+$data.title+'</h4>'
                            +'<p class="list-group-item-text">'+$data.content.substring(0, 40)+'</p></a>'
                            );

                    });
        }
    }).
    controller('userController',function($scope,$state,$stateParams,api){
        // for some reasons this controller is calling two times, first time without param
        if($stateParams.id){
            if($stateParams.action == 'delete'){
                api.user.delete({id:$stateParams.id});
                $state.go('/profile',{'action_state': 'deleted'}, {location: 'replace'});
            }
            else{
                api.user.detail({id:$stateParams.id}).
                    $promise.
                        then(function($data){
                            console.log($scope);
                            $scope.user = {'username':$data.username,'first_name':$data.first_name,'last_name':$data.last_name}
                        });
            }
        }

        $scope.updateUser = function($data){
            api.user.update({id:$stateParams.id},{
                username : $scope.user.username,
                first_name : $scope.fname,
                last_name : $scope.lname,
            });
        };

    }).
    controller('singlepostController',function($scope,$state,$stateParams,api){
        // for some reasons this controller is calling two times, first time without param
        if($stateParams.id){
            if($stateParams.action == 'delete'){
                api.singlepost.delete({id:$stateParams.id});
            }
            else{
                api.singlepost.detail({id:$stateParams.id}).
                    $promise.
                        then(function($data){

                            $scope.post = $data;

                        });
            }
        }
        $scope.delete = function(){
            api.singlepost.delete({id:$stateParams.id});
            $state.go('/posts',{'title' : $scope.post.title,'action_state': 'deleted'}, {location: 'replace'});
        };
    }).
    controller('wysiwygeditor', function($scope,$stateParams, api) {
            api.singlepost.detail({id:$stateParams.id}).
                $promise.
                    then(function($data){
                        $scope.htmlcontent = $data.content;
                        $scope.title = $data.title;
                    });
            $scope.submit = function() {
                api.singlepost.update({id:$stateParams.id},{
                    title : $scope.title,
                    content : $scope.htmlcontent,
                }).
                    $promise.
                        then(function($data){
                            // update title
                            var cache = $('.page-header h1 ').children();
                            $('.page-header h1 ').text($data.title).append(cache);
                            // update content
                            $('#view .panel-body').html($data.content);
                        });
            };
    });
