(function () {
    // get all elements
    var oAvatar = document.getElementById('avatar'),
        oWelcomeMsg = document.getElementById('welcome-msg'),
        oLogoutBtn = document.getElementById('logout-link'),
        oRegisterFormBtn = document.getElementById('register-form-btn'),
        oLoginBtn = document.getElementById('login-btn'),
        oLoginForm = document.getElementById('login-form'),
        oLoginUsername = document.getElementById('username'),
        oLoginPwd = document.getElementById('password'),
        oLoginFormBtn = document.getElementById('login-form-btn'),
        oLoginErrorField = document.getElementById('login-error'),
        oRegisterBtn = document.getElementById('register-btn'),
        oRegisterUsername = document.getElementById('register-username'),
        oRegisterPwd = document.getElementById('register-password'),
        oRegisterFirstName = document.getElementById('register-first-name'),
        oRegisterLastName = document.getElementById('register-last-name'),
        oRegisterForm = document.getElementById('register-form'),
        oRegisterResultField = document.getElementById('register-result'),
        oNearbyBtn = document.getElementById('nearby-btn'),
        oRecommendBtn = document.getElementById('recommend-btn'),
        oNavBtnList = document.getElementsByClassName('main-nav-btn'),
        oItemNav = document.getElementById('item-nav'),
        oItemList = document.getElementById('item-list'),
        oTpl = document.getElementById('tpl').innerHTML,
        userId = '1111',
        userFullName = 'John',
        lng = -122.08,
        lat = 37.38;

    // init
    function init() {
        console.log('init');
    }


    // init
    function init() {
        // validate session
        validateSession();
        // bind event
        bindEvent();
    }

    function validateSession() {
        switchLoginRegister('login');
    }

    function bindEvent() {
        oRegisterFormBtn.addEventListener('click', function(){
            switchLoginRegister('register')
        }, false);
        oLoginFormBtn.addEventListener('click', function() {
            switchLoginRegister('login')
        }, false);
        // click login button
        oLoginBtn.addEventListener('click', loginExecutor, false);
        // click register button
        oRegisterBtn.addEventListener('click', registerExecutor, false);
    }

    function loginExecutor() {
        console.log('login');
        var username = oLoginUsername.value,
            password = oLoginPwd.value;

        if (username === "" || password == "") {
            oLoginErrorField.innerHTML = 'Please fill in all fields';
            return;
        }
        var encodedPwd = md5(username + md5(password));
        console.log(username, encodedPwd);
    }

    function registerExecutor() {
        console.log('register');
        var username = oRegisterUsername.value,
            password = oRegisterPwd.value,
            firstName = oRegisterFirstName.value,
            lastName = oRegisterLastName.value;
        console.log(username, password,firstName, lastName);

        if (username === "" || password == "" || firstName === ""
            || lastName === "") {
            oRegisterResultField.innerHTML = 'Please fill in all fields';
            return;
        }

        if (username.match(/^[a-z0-9_]+$/) === null) {
            oRegisterResultField.innerHTML = 'Invalid username';
            return;
        }
        password = md5(username + md5(password));
    }


    function switchLoginRegister(name) {
        // hide header elements
        showOrHideElement(oAvatar, 'none');
        showOrHideElement(oWelcomeMsg, 'none');
        showOrHideElement(oLogoutBtn, 'none');

        // hide item list area
        showOrHideElement(oItemNav, 'none');
        showOrHideElement(oItemList, 'none');

        if (name === 'login') {
            // hide register form
            showOrHideElement(oRegisterForm, 'none');
            // clear register error
            oRegisterResultField.innerHTML = ''

            // show login form
            showOrHideElement(oLoginForm, 'block');

        } else {
            // hide login form
            showOrHideElement(oLoginForm, 'none');
            // clear login error if existed
            oLoginErrorField.innerHTML = '';

            // show register form
            showOrHideElement(oRegisterForm, 'block');
        }
    }

    function showOrHideElement(ele, style) {
        ele.style.display = style;
    }

    init();
})();



function ajax(opt) {
    var opt = opt || {},
        method = (opt.method || 'GET').toUpperCase(),
        url = opt.url,
        data = opt.data || null,
        success = opt.success || function () {
        },
        error = opt.error || function () {
        },
        xhr = new XMLHttpRequest();

    if (!url) {
        throw new Error('missing url');
    }

    xhr.open(method, url, true);

    if (!data) {
        xhr.send();
    } else {
        xhr.setRequestHeader('Content-type', 'application/json;charset=utf-8');
        xhr.send(JSON.stringify(data));
    }

    xhr.onload = function () {
        if (xhr.status === 200) {
            success(JSON.parse(xhr.responseText))
        } else {
            error()
        }
    }

    xhr.onerror = function () {
        throw new Error('The request could not be completed.')
    }
}


//Step2: update Login
function loginExecutor() {
    var username = oLoginUsername.value,
        password = oLoginPwd.value;

    if (username === "" || password == "") {
        oLoginErrorField.innerHTML = 'Please fill in all fields';
        return;
    }
    password = md5(username + md5(password));

    ajax({
        method: 'POST',
        url: './login',
        data: {
            user_id: username,
            password: password,
        },
        success: function (res) {
            // case1: login success
            if (res.status === 'OK') {
                console.log('login')
                console.log(res);
                // show welcome message
                welcomeMsg(res);
                // fetch data
                fetchData();
            } else {
                // case2: login failed
                oLoginErrorField.innerHTML = 'Invalid username or password';
            }
        },
        error: function () {
            //show login error
            throw new Error('Invalid username or password');
        }
    })
}

//Step3: fetch geolocation + nearby data
function welcomeMsg(info) {
    userId = info.user_id || userId;
    userFullName = info.name || userFullName;
    oWelcomeMsg.innerHTML = 'Welcome ' + userFullName;

    // show welcome, avatar, item area, logout btn
    showOrHideElement(oWelcomeMsg, 'block');
    showOrHideElement(oAvatar, 'block');
    showOrHideElement(oItemNav, 'block');
    showOrHideElement(oItemList, 'block');
    showOrHideElement(oLogoutBtn, 'block');

    // hide login form
    showOrHideElement(oLoginForm, 'none');
}

function fetchData() {
    // get geo-location info
    initGeo(loadNearbyData);
}

function initGeo(cb) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
                // lat = position.coords.latitude || lat;
                // lng = position.coords.longitude || lng;
                cb();
            },
            function () {
                throw new Error('Geo location fetch failed!!')
            }, {
                maximumAge: 60000
            });
        // show loading message
        oItemList.innerHTML = '<p class="notice"><i class="fa fa-spinner fa-spin"></i>Retrieving your location...</p>';
    } else {
        throw new Error('Your browser does not support navigator!!')
    }
}

function loadNearbyData() {
    // active side bar buttons
    activeBtn('nearby-btn');

    var opt = {
        method: 'GET',
        url: './search?user_id=' + userId + '&lat=' + lat + '&lon=' + lng,
        data: null,
        message: 'nearby'
    }
    serverExecutor(opt);
}


//Step4: update index.html


//Step5: add helper function
function serverExecutor(opt) {
    oItemList.innerHTML = '<p class="notice"><i class="fa fa-exclamation-triangle"></i>Loading ' + opt.message + ' item...</p>';
    ajax({
        method: opt.method,
        url: opt.url,
        data: opt.data,
        success: function (res) {
            // case1: data set is empty
            if (!res || res.length === 0) {
                oItemList.innerHTML = '<p class="notice"><i class="fa fa-exclamation-triangle"></i>No ' + opt.message + ' item!</p>';
            } else {
                // case2: data set is not empty
                render(res);
                itemArr = res;
            }
        },
        error: function () {
            throw new Error('No ' + opt.message + ' items!');
        }
    })
}

