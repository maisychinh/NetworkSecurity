import io from 'socket.io-client';
import dateformat from 'dateformat';
import routeMatcherLib from './routematcher.js';
import FileSaver from 'file-saver';
import './sweetalert.min.js';

const T = {
    title: title => {
        document.title = title && title != '' ? `${document.notification || ''} ${title} | Cholimex` : 'Cholimex';
    },
    FileSaver,
    rootUrl: window.location.origin,
    sexes: ['Nam', 'Nữ'],
    component: { '<empty>': null },
    pageTypes: [
        '<empty>'
    ],
    defaultPageSize: 50,
    defaultUserPageSize: 21,
    defaultUserSidebarSize: 3,
    newsFeedPageSize: 10,
    eventFeedPageSize: 5,

    randomPassword: length => Math.random(new Date()).toString(36).slice(2).slice(-length),

    debug: (location.hostname === 'localhost' || location.hostname === '127.0.0.1'),

    ready: (pathname, done) => $(document).ready(() => {
        T.clearSearchBox && T.clearSearchBox();
        T.hideSearchBox && T.hideSearchBox();

        setTimeout(() => {
            if (pathname == undefined) {
                done = null;
                pathname = window.location.pathname;
            } else if (typeof pathname == 'function') {
                done = pathname;
                pathname = window.location.pathname;
            }

            done && done();

            $('ul.pcoded-item.pcoded-left-item > li').removeClass('active pcoded-trigger');
            $('ul.pcoded-item.pcoded-left-item li.active').removeClass('active');
            let menuItem = $(`ul.pcoded-item.pcoded-left-item > li > a[href='${pathname}']`);
            if (menuItem.length != 0) { // Không có submenu
                menuItem.parent().addClass('active');
            } else {
                menuItem = $(`ul.pcoded-item.pcoded-left-item > li.pcoded-hasmenu ul.pcoded-submenu a[href='${pathname}']`);
                if (menuItem.length != 0) { // Có submenu
                    menuItem.parent().addClass('active');
                    const liHasMenu = menuItem.parent().parent().parent();
                    liHasMenu.addClass('active pcoded-trigger');
                }
            }
            // Update user url
            const userUrl = window.location.pathname;
            if (userUrl.startsWith('/user')) T.cookie('userUrl', userUrl);
        }, 500)
    }),

    url: (url) => url + (url.indexOf('?') === -1 ? '?t=' : '&t=') + new Date().getTime(),

    download: (url, name) => {
        let link = document.createElement('a');
        link.target = '_blank';
        link.download = name;
        link.href = url;
        link.click();
    },

    getCookiePage: (cookieName, key) => {
        const pageData = T.storage(cookieName);
        return (pageData && pageData[key]) ? pageData[key] : '';
    },

    cookie: (cname, cvalue, exdays) => {
        if (cvalue === undefined) {
            const name = cname + '=';
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i].trimStart();
                if (c.indexOf(name) === 0) {
                    try {
                        return JSON.parse(c.substring(name.length, c.length));
                    } catch {
                        return {};
                    }
                }
            }
            return {};
        } else {
            let d = new Date();
            d.setTime(d.getTime() + ((exdays === undefined ? 60 : exdays) * 24 * 60 * 60 * 1000));
            document.cookie = cname + '=' + JSON.stringify(cvalue) + ';expires=' + d.toUTCString() + ';path=/';
        }
    },

    storage: (cname, cvalue) => {
        if (cvalue != null) {
            window.localStorage.setItem(cname, JSON.stringify(cvalue));
        } else {
            try {
                return JSON.parse(window.localStorage.getItem(cname)) || {};
            } catch {
                return {};
            }
        }
    },

    pageKeyName: {
        pageNumber: 'N',
        pageSize: 'S',
        pageCondition: 'C',
        filter: 'F',
        advancedSearch: 'A'
    },

    initPage: (cookieName) => {
        let initData = T.storage(cookieName);
        if (initData[T.pageKeyName.pageNumber] == null) initData[T.pageKeyName.pageNumber] = 1;
        if (initData[T.pageKeyName.pageSize] == null) initData[T.pageKeyName.pageSize] = 50;
        if (initData[T.pageKeyName.pageCondition] == null) initData[T.pageKeyName.pageCondition] = '';
        if (initData[T.pageKeyName.filter] == null) initData[T.pageKeyName.filter] = '%%%%%%%%';
        if (initData[T.pageKeyName.advancedSearch] == null) initData[T.pageKeyName.advancedSearch] = false;
        T.storage(cookieName, initData);
    },

    updatePage: (cookieName, pageNumber, pageSize, pageCondition, filter, advancedSearch) => {
        const updateStatus = {}, oldStatus = T.storage(cookieName);
        updateStatus[T.pageKeyName.pageNumber] = pageNumber ? pageNumber : oldStatus[T.pageKeyName.pageNumber];
        updateStatus[T.pageKeyName.pageSize] = pageSize ? pageSize : oldStatus[T.pageKeyName.pageSize];
        updateStatus[T.pageKeyName.pageCondition] = pageCondition != null || pageCondition == '' ? pageCondition : oldStatus[T.pageKeyName.pageCondition];
        updateStatus[T.pageKeyName.filter] = filter ? filter : oldStatus[T.pageKeyName.filter];
        updateStatus[T.pageKeyName.advancedSearch] = advancedSearch != null ? advancedSearch : oldStatus[T.pageKeyName.advancedSearch];
        T.storage(cookieName, updateStatus);
        return {
            pageNumber: updateStatus[T.pageKeyName.pageNumber],
            pageSize: updateStatus[T.pageKeyName.pageSize],
            pageCondition: updateStatus[T.pageKeyName.pageCondition],
            filter: updateStatus[T.pageKeyName.filter],
            advancedSearch: updateStatus[T.pageKeyName.advancedSearch]
        };
    },

    validateEmail: email => (/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i).test(String(email).toLowerCase()),

    dateToText: (date, format = 'dd/mm/yyyy HH:MM:ss') => dateformat(date, format),

    numberDisplay: (number, replaceValue = '.') => {
        const decimalSplitter = replaceValue == '.' ? ',' : '.';
        let [integer, decimal] = number.toString().split('.');
        if (!decimal) [integer, decimal] = number.toString().split(',');
        return `${integer.toString().replace(/\B(?=(\d{3})+(?!\d))/g, replaceValue)}${decimal ? decimalSplitter : ''}${decimal || ''}`
    },

    // Libraries ----------------------------------------------------------------------------------
    routeMatcher: routeMatcherLib.routeMatcher,

    notify: (message, type) => {
        $.growl({
            // icon: icon,
            // title: ' Bootstrap Growl ',
            message: message,
            // url: ''
        }, {
            element: 'body',
            type: type,
            allow_dismiss: true,
            placement: {
                from: 'bottom',
                align: 'center'
            },
            offset: {
                x: 30,
                y: 30
            },
            spacing: 10,
            z_index: 999999,
            delay: 2500,
            timer: 500,
            // url_target: '_blank',
            mouse_over: false,
            animate: {
                // enter: animIn,
                // exit: animOut
            },
            icon_type: 'class',
            template: '<div data-growl="container" class="alert" role="alert">' +
                '<button type="button" class="close" data-growl="dismiss">' +
                '<span aria-hidden="true">&times;</span>' +
                '<span class="sr-only">Close</span>' +
                '</button>' +
                '<span data-growl="icon"></span>' +
                '<span data-growl="title"></span>' +
                '<span data-growl="message"></span>' +
                '<a href="#" data-growl="url"></a>' +
                '</div>'
        });
    },

    alert: (text, icon, button, timer) => {
        let options = {};
        if (icon) {
            if (typeof icon == 'boolean') {
                options.button = icon;
                options.icon = 'success';
                if (timer) options.timer = timer;
            } else if (typeof icon == 'number') {
                options.timer = icon;
                options.icon = 'success';
            } else {
                options.icon = icon;
            }

            if (button != undefined) {
                if (typeof button == 'number') {
                    options.timer = options.button;
                    options.button = true;
                } else {
                    options.button = button;
                    if (timer) options.timer = timer;
                }
            } else {
                options.button = true;
            }
        } else {
            options.icon = 'success';
            options.button = true;
        }
        options.text = text;
        swal(options);
    },

    confirm: (title, html, icon, dangerMode, done) => {
        if (typeof icon == 'function') {
            done = icon;
            icon = 'warning';
            dangerMode = false;
        } else if (typeof icon == 'boolean') {
            done = dangerMode;
            dangerMode = icon;
            icon = 'warning';
        }
        if (typeof dangerMode == 'function') {
            done = dangerMode;
            dangerMode = false;
        }
        const content = document.createElement('div');
        content.innerHTML = html;
        swal({
            icon, title, content, dangerMode, buttons: {
                cancel: { text: 'Huỷ', visible: true }, confirm: { text: 'Đồng ý' }
            }
        }).then(done);
    },

    randomHexColor: () => {
        let n = (Math.random() * 0xfffff * 1000000).toString(16);
        return '#' + n.slice(0, 6);
    },

    mobileDisplay: mobile => mobile ? (mobile.length == 10 ? mobile.toString().replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3') : mobile.toString().replace(/(\d{3})(\d{4})(\d{4})/, '($1) $2 $3')) : '',

    dateFormat: { format: 'dd/mm/yyyy hh:ii', autoclose: true, todayBtn: true },
    birthdayFormat: { format: 'dd/mm/yyyy', autoclose: true, todayBtn: true },
    formatDate: str => {
        try {
            let [strDate, strTime] = str.split(' '),
                [date, month, year] = strDate.split('/'),
                [hours, minutes] = strTime ? strTime.split(':') : [0, 0];
            return new Date(year, month - 1, date, hours, minutes);
        } catch (ex) {
            return null;
        }
    },

    linkNewsDetail: (item) => {
        if (item.link) {
            return `/tin-tuc/${item.link}?${T.language.getLanguage()}`;
        } else {
            return `/news/item/${item.id}?${T.language.getLanguage()}`;
        }
    },
    linkEventsDetail: (item) => {
        if (item.link) {
            return `/su-kien/${item.link}?${T.language.getLanguage()}`;
        } else {
            return `/event/item/${item.id}?${T.language.getLanguage()}`;
        }
    },

    //JSON Operate---------------------------------------------------------------------------------------------
    stringify: (value, defaultValue = '') => {
        try {
            return JSON.stringify(value);
        } catch (exception) {
            T.notify(`Lỗi stringify: ${exception}, đặt theo giá trị mặc định: ${defaultValue}`, 'danger');
            return defaultValue;
        }
    },

    parse: (value, defaultValue = {}) => {
        try {
            return JSON.parse(value);
        } catch (exception) {
            T.notify(`Lỗi parse: ${exception}, đặt theo giá trị mặc định: ${defaultValue}`, 'danger');
            return defaultValue;
        }
    },

    isObject: (value) => value && value.constructor == ({}).constructor
}


// T.socket = T.debug ? io('http://localhost:7020', { transports: ['websocket'] }) : io(T.rootUrl, { secure: true, transports: ['websocket'] });

// Language
let languages = ['vi', 'en'];
T.language = texts => {
    let lg = 'vi', pathname = window.location.pathname, query = new URLSearchParams(window.location.search);
    const lang = query.get('lang');

    if (pathname.endsWith('/en') || pathname.startsWith('/news-en') || pathname.startsWith('/article')) {
        lg = 'en';
    } else if (lang && languages.includes(lang.toLowerCase())) {
        lg = lang.toLowerCase();
    } else {
        for (let _lang of languages) {
            if (pathname.includes('/' + _lang + '/') || pathname.endsWith('/' + _lang)) {
                lg = _lang;
            }
        }
    }

    return texts ? (texts[lg] ? texts[lg] : '') : lg;
};

T.language.setLanguages = _languages => {
    languages = _languages && Array.isArray(_languages) && _languages.length ? _languages : ['vi', 'en'];
};

T.language.next = () => {
    const lg = T.language();
    if (!lg) return languages[0];
    let index = languages.indexOf(lg);
    if (index == -1) index = 0; // No language
    else index++; // Next language
    if (index >= languages.length) index -= languages.length; // If larger than length, reset
    return languages[index];
};

T.language.getLanguage = () => T.language.current() == 'vi' ? '' : `lang=${T.language.current()}`;

T.language.current = () => {
    const lg = T.language();
    return lg ? lg : languages[0];
};

T.language.switch = () => {
    const language = T.language.next();
    return { language };
};

T.language.parse = (text, getAll, parseLanguages) => {
    let obj = {};
    try { obj = JSON.parse(text); } catch (e) { obj = {}; }
    const objLength = Object.keys(obj).length;
    (parseLanguages && Array.isArray(parseLanguages) ? parseLanguages : languages).forEach(language => {
        if (obj[language] == null && !objLength) obj[language] = text;
    });
    if (typeof getAll == 'string' && (parseLanguages && Array.isArray(parseLanguages) ? parseLanguages : languages).includes(getAll)) {
        return obj[getAll];
    } else {
        return getAll ? obj : obj[T.language()];
    }
};

T.language.getMonth = () => ({
    vi: ['Tháng một', 'Tháng hai', 'Tháng ba', 'Tháng tư', 'Tháng năm', 'Tháng sáu', 'Tháng bảy', 'Tháng tám', 'Tháng chín', 'Tháng mười', 'Tháng mười một', 'Tháng mười hai'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
}[T.language()]);


T.get2 = x => ('0' + x).slice(-2);

// T.socket.on('connect', () => {
//     if (T.connected === 0) {
//         T.connected = true;
//     } else if (T.debug) {
//         location.reload();
//     }
// });

// if (T.debug) {
//     T.connected = 0;
//     T.socket.on('reconnect_attempt', attemptNumber => T.connected = -attemptNumber);
//     T.socket.on('debug', type => (type === 'reload') && location.reload());
// }

const getOracleErrorMessage = errorNum => {
    if (Number.isInteger(errorNum)) {
        switch (errorNum) {
            case 1:
                return 'ORA-00001: Unique constraint violated.';
            case 904:
                return 'ORA-00904: Invalid identifier.';
            case 942:
                return 'ORA-00942: Table or view does not exist.';
            case 1438:
                return 'ORA-01438: Value larger than specified precision allows for this column.';
            case 1722:
                return 'ORA-01722: Invalid number.';
            case 3113:
                return 'ORA-03113: End-of-file on communication channel';
            case 3114:
                return 'ORA-03114: Not Connected to Oracle';
            case 6550:
                return 'ORA-06550: Invalid block of PL/SQL code';
            case 12899:
                return 'ORA-12899: Value too large';
            default:
                return 'ORA-' + errorNum;
        }
    } else return null;
};

['get', 'post', 'put', 'delete'].forEach(method => T[method] = (url, data, success, error) => {
    if (typeof data === 'function') {
        error = success;
        success = data;
    }
    $.ajax({
        url: T.url(url),
        data,
        type: method.toUpperCase(),
        success: response => {
            if (response.error) {
                if (typeof response.error === 'string') response.error = {
                    message: response.error
                };
                else if (response.error.constructor === ({}).constructor) {
                    if (response.error.errorNum) response.error.message = getOracleErrorMessage(response.error.errorNum);
                }
            }
            success && success(response);
        },
        error: (jqXHR, textStatus, errorThrown) => {
            const data = {
                error: {}
            };
            if (jqXHR.responseJSON && jqXHR.responseJSON.error) {
                if (typeof jqXHR.responseJSON.error === 'string') data.error.message = jqXHR.responseJSON.error;
                else if (jqXHR.responseJSON.error.errorNum) data.error.message = getOracleErrorMessage(jqXHR.responseJSON.error.errorNum);
            } else if (jqXHR.responseText) data.error.message = jqXHR.responseText;
            else if (jqXHR.readyState == 4) {
                if (jqXHR.status === 401) data.error.message = 'Không thể truy cập tài nguyên, vui lòng đăng nhập lại.';
                if (jqXHR.status === 403) data.error.message = 'Không thể truy cập tài nguyên.';
                if (jqXHR.status === 404) data.error.message = 'Không tìm thấy tài nguyên.';
                if (jqXHR.status < 500) data.error.message = 'Yêu cầu bị lỗi!';
                data.error.message = 'Server gặp lỗi. Hãy liên hệ logngười quản trị trang web.';
            } else if (jqXHR.readyState == 0) data.error.message = 'Mạng có vấn đề, xin hãy kiểm tra lại đường truyền.';
            else data.error.message = errorThrown;
            console.error('Ajax (' + method + ' => ' + url + ') has error. Error:', data.error.message || jqXHR);
            error && error(data);
        }
    })
});

export default T;

String.prototype.getText = function () {
    return T.language.parse(this);
};

String.prototype.viText = function () {
    return T.language.parse(this, true).vi;
};

String.prototype.replaceAll = function (search, replacement) {
    return this.replace(new RegExp(search, 'g'), replacement);
};

String.prototype.upFirstChar = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.lowFirstChar = function () {
    return this[0].toLowerCase() + this.slice(1);
}

String.prototype.normalizedName = function () {
    let convertToArray = this.toLowerCase().split(' ');
    let result = convertToArray.map(function (val) {
        return val.replace(val.charAt(0), val.charAt(0).toUpperCase());
    });
    return result.join(' ');
}

String.prototype.getFirstLetters = function () {
    return this
        .toUpperCase()
        .split(' ')
        .map(word => word[0])
        .join('');
}

String.prototype.numberDisplay = function (replaceValue = '.') {
    const decimalSplitter = replaceValue == '.' ? ',' : '.';
    let [integer, decimal] = this.split('.');
    if (!decimal) [integer, decimal] = this.split(',');
    return `${integer.toString().replace(/\B(?=(\d{3})+(?!\d))/g, replaceValue)}${decimal ? decimalSplitter : ''}${decimal || ''}`;
};
//Array prototype -----------------------------------------------------------------------------------------------------
Array.prototype.contains = function (...pattern) {
    return pattern.reduce((result, item) => result && this.includes(item), true);
};

Array.prototype.groupBy = function (key) {
    return this.reduce(
        (result, item) => ({
            ...result,
            [item[key]]: [...(result[item[key]] || []), item]
        }),
        {}
    );
};

Array.prototype.removeByValue = function (value) {
    let tmp = this;
    const index = tmp.indexOf(value);
    if (index >= 0) {
        tmp.splice(index, 1);
    }
    return tmp;
};

Date.prototype.getText = function () {
    return T.language.getMonth()[this.getMonth()] + ' ' + T.get2(this.getDate()) + ', ' + this.getFullYear() + ' ' + T.get2(this.getHours()) + ':' + T.get2(this.getMinutes());
};
Date.prototype.getDateText = function () {
    return T.language.getMonth()[this.getMonth()] + ' ' + T.get2(this.getDate()) + ', ' + this.getFullYear();
};
Date.prototype.strNgay = function () {
    return T.get2(this.getDate()) + '/' + T.get2(this.getMonth() + 1) + '/' + this.getFullYear();
};
Date.prototype.getTimeText = function () {
    return T.get2(this.getHours()) + ':' + T.get2(this.getMinutes());
};
Date.prototype.getShortText = function () {
    return this.getFullYear() + '/' + T.get2(this.getMonth() + 1) + '/' + T.get2(this.getDate()) + ' ' + T.get2(this.getHours()) + ':' + T.get2(this.getMinutes());
};
Date.prototype.ddmmyyyy = function () {
    return this.getDate() ? (T.get2(this.getDate()) + '/' + T.get2(this.getMonth() + 1) + '/' + this.getFullYear()) : '';
};
Date.prototype.mmyyyy = function () {
    return this.getDate() ? (T.get2(this.getMonth() + 1) + '/' + this.getFullYear()) : '';
};
Date.prototype.roundDate = function () {
    this.setHours(0, 0, 0, 0);
    return this;
};
Date.prototype.roundMonth = function () {
    this.setHours(0, 0, 0, 0);
    return this;
};
Date.prototype.roundYear = function () {
    this.setHours(0, 0, 0, 0);
    return this;
};
Date.prototype.nextDate = function (n = 1) {
    this.setDate(this.getDate() + n);
    return this;
};
Date.newDate = function (n = 0) {
    let date = new Date();
    date.setDate(date.getDate() + n);
    return date;
};
Date.nextYear = function (n = 1) {
    let nextYear = new Date().roundDate();
    nextYear.setFullYear(nextYear.getFullYear() + n);
    return nextYear;
};
Date.lastYear = function (n = 1) {
    let lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - n);
    return lastYear;
};
Date.getDateInputDefaultMin = function () {
    return 0;
};
Date.getDateInputDefaultMax = function () {
    return Date.nextYear().roundDate().getTime();
};

Number.prototype.intToRoman = function () {
    let num = parseInt(this);
    const map = {
        M: 1000,
        CM: 900,
        D: 500,
        CD: 400,
        C: 100,
        XC: 90,
        L: 50,
        XL: 40,
        X: 10,
        IX: 9,
        V: 5,
        IV: 4,
        I: 1
    };
    let result = '';

    for (let key in map) {
        const repeatCounter = Math.floor(num / map[key]);

        if (repeatCounter !== 0) {
            result += key.repeat(repeatCounter);
        }

        num %= map[key];

        if (num === 0) return result;
    }

    return result;
};

(function () {
    // https://stackoverflow.com/questions/20989458/select2-open-dropdown-on-focus
    $(document).on('focus', '.select2-selection.select2-selection--single', function (e) {
        $(this).closest('.select2-container').siblings('select:enabled').select2('open');
    });
    $('select.select2').on('select2:closing', function (e) {
        $(e.target).data('select2').$selection.one('focus focusin', function (e) {
            e.stopPropagation();
        });
    });
})()