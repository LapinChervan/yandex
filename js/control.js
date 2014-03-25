'use strict'
var CONTROL = {};

CONTROL.user = {};

CONTROL.initialize = (function() {
    var doc = document,
        CONTR = CONTROL,
        user = CONTR.user,
        initMethods = {
            categories: function(data) {
                var tmp = doc.querySelector('.useraccounts').innerHTML,
                    key, html;

                user.login = data.name;

                for (key in data.categories) {
                    html = '';
                    data.categories[key].
                        forEach(function(elem) {
                            html += Mustache.render(tmp, {costs: elem, img: 'img/' + key + '.png'});
                        });
                    doc.querySelector('.' + key).innerHTML = html;
                }
                doc.querySelector('input[type=radio][value=' + data.mainCurr + ']').checked = true;
                CONTROL.responses.rebuildCurrency(data);
            },

            history: function(data) {
                var  objKey, objKey2, objKey3,
                     tmp = doc.querySelector('.history').innerHTML,
                     html = '',
                     history = data.history ? data.history : data,
                     thisData = {};

                for (objKey in history) {
                    for (objKey2 in  history[objKey]) {
                        for (objKey3 in history[objKey][objKey2]) {
                            thisData[objKey3] = history[objKey][objKey2][objKey3];
                        }
                        thisData['ico'] = 'img/' + thisData.type + '.png';
                        thisData.mainCurr = user.data.mainCurr;
                        html = html + Mustache.render(tmp, thisData);
                    }
                }
                doc.querySelector('.historyUl').innerHTML = html;
                CONTROL.responses.filterDate(history);
            },

            selectLoadSch: function(data) {
                var accounts = data.categories.accounts,
                    tmp = doc.querySelector('.schHist').innerHTML,
                    html = Mustache.render(tmp, {'histSch': 'Все счета', 'value': 'all'});

                accounts.forEach(function(elem) {
                    html = html + Mustache.render(tmp, {'histSch': elem, 'value': elem});
                });
                doc.querySelector('.history_sch_select').innerHTML = html;
            }
        };

    return  {
        init: function(data) {
            var key,
                methods = initMethods;

            for (key in methods) {
                methods[key](data);
            }
        },
        history: initMethods.history,
        selectLoadSch: initMethods.selectLoadSch
    }
})();

CONTROL.tools = (function() {
    function isNumber(n) {
        if (!isNaN(parseFloat(n.value)) && isFinite(n.value)) {
            n.placeholder = 'Сумма';
            return true;
        }
        n.value = '';
        n.placeholder = 'Ошибка ввода';
        return false;
    }

    function isDate(d) {
        var arr = d.value.split('.');

        if (arr.length !== 3) {
            d.value = '';
            d.placeholder = 'Ошибка ввода';
            return false;
        }

        if (+arr[0] > 0 && +arr[0] <= 31 && arr[0].length === 2) {
            if (+arr[1] > 1 && +arr[1] <= 12  && arr[1].length === 2) {
                if (+arr[2] > 1999 && +arr[2] < 3000 && arr[2].length === 4) {
                    d.placeholder = 'Дата';
                    return true;
                }
            }
        }

        d.value = '';
        d.placeholder = 'Ошибка ввода';
        return false;
    }

    function isEmptyOne(elem) {
        if (elem.value.trim().length === 0) {
            elem.placeholder = 'Ошибка ввода';
            return false;
        }
        elem.placeholder = 'Введите название';
        return true;
    }

    function getDateMs(date) {
        var arr = date.split('.');
        return Date.parse(new Date(arr[2],arr[1],arr[0]));
    }

    function getDateN(day) {
        var date = new Date();
        return day + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
    }

    function updateButton(elem, type, date) {
        if (type !== 'send' && ( getDateMs(getDateN('01')) <= getDateMs(date) ) && ( getDateMs(getDateN('30')) >= getDateMs(date)) ) {
            elem.classList.add('update');
            return true;
        }
        return false;
    }

    function findSelectedInput(collection, option) {
        var length = collection.length,
            i, item;

        for (i = 0; i < length; i++) {
            item = collection[i];
            if (item[option]) {
                return item;
            }
        }
    }

    function isBiggest(numb, biggest) {
        return (numb > biggest) ? numb : biggest;
    }

    function randomColor() {
        function getColor() {
            return Math.round(Math.random() * 200 + 30);
        }
        return 'rgb(' +getColor()+ ',' +getColor()+ ',' +getColor()+ ');';
    }

    function showDiagram(data) {
        var key, key2,
            biggest, biggestArr = [],
            html, i = 0;

        for (key in data) {
            biggest = 0;
            for (key2 in data[key]) {
                biggest = isBiggest(data[key][key2], biggest);
            }
            biggestArr.push(biggest);
        }

        for (key in data) {
            html = '';
            for (key2 in data[key]) {
                html = html + Mustache.render(doc.querySelector('.cats').innerHTML, {
                    proc: Math.round((data[key][key2] / biggestArr[i]) * 100),
                    category: key2,
                    price: data[key][key2],
                    rgb: randomColor()
                });
            }
            i++;
            doc.querySelector('.diag' + key).innerHTML = html;
        }
        CONTROL.layer.destroyLayer();
    }

    function showMessage(cls, parent, msg, img) {
        var elem = parent,
            style = elem.style;

        parent.innerHTML = Mustache.render(cls.innerHTML, {msg: msg, img: img});
        style.display = 'block';
        setTimeout(function() {
            style.display = 'none';
        }, 1500);
    }

    return {
        isNumber: isNumber,
        isDate: isDate,
        getDateMs: getDateMs,
        getDateN: getDateN,
        updateButton: updateButton,
        isBiggest: isBiggest,
        randomColor: randomColor,
        showDiagram: showDiagram,
        findSelectedInput: findSelectedInput,
        isEmptyOne: isEmptyOne,
        showMessage: showMessage
    }
})();

CONTROL.reload = (function() {
    var doc = document;

    function loadSelectForm(data, formType) {
        var html, key;

        for (key in data.categories) {
            html = '';
            if (key === 'accounts' || key === formType) {
                data.categories[key].
                    forEach(function(elem) {
                        html = html + Mustache.render(doc.querySelector('.select__' + key).innerHTML, {'accounts': elem});
                });
                doc.querySelector('.select__' + key).innerHTML = html;

                if (formType === 'send') {
                    doc.querySelectorAll('.select__' + key)[1].innerHTML = html;
                }
            }
        }
    }

    return {
        loadSelectForm: loadSelectForm
    }
})();

CONTROL.requests = (function() {
    var host = 'http://localhost:1111/';

    function changeMainCurr(user, curr, price) {
        return host + 'currency?login=' + user + '&curr=' + curr + '&price=' + price;
    }

    function changeRates(user, currData) {
        return host + 'currency?login=' + user + '&valuta=' + currData;
    }

    function editCategory(user, type, old, cat) {
        return host + 'renameCategory?login=' + user + '&type=' + type + '&old=' + old + '&new=' + cat;
    }

    function removeCategory(user, type, old) {
        return host + 'removeCategory?login=' + user + '&type=' + type + '&old=' + old;
    }

    function newCategory(user, type, cat) {
        return host + 'newCategories?login=' + user + '&typ=' + type + '&cat=' + cat;
    }

    function registration(user, password) {
        return host + 'reg?login=' + user + '&password=' + password;
    }

    function auth(user, password, start, end) {
        return host + 'auth?login=' + user + '&password=' + password + '&start=' + start + '&end=' + end;
    }

    function newOper(user, type, data) {
        return host + 'historyNewOper?login=' + user + '&type=' + type + '&formData=' + data;
    }

    function removeOper(user, type, id) {
        return host + 'historyRemove?login=' + user + '&type=' + type + '&id=' + id;
    }

    function filterDate(user, start, end, type) {
        return host + 'findOperation?login=' + user + '&start=' + start + '&end=' + end + '&type=' + type;
    }

    function filterHistory(user, account, type, start, end) {
        return host + 'findOperation?login=' + user + '&account=' + account + '&type=' + type + '&start=' + start + '&end=' + end;
    }

    return {
        changeMainCurr: changeMainCurr,
        changeRates: changeRates,
        editCategory: editCategory,
        removeCategory: removeCategory,
        newCategory: newCategory,
        registration: registration,
        auth: auth,
        newOper: newOper,
        removeOper: removeOper,
        filterDate: filterDate,
        filterHistory: filterHistory
    }
})();

CONTROL.responses = (function() {
    var doc = document,
        CONTR = CONTROL,
        user = CONTR.user,
        tools = CONTR.tools;

    function newCategory(res) {
        var categories = doc.querySelector('.' + res.type);

        user.data.categories[res.type].push(res.cat);
        CONTR.initialize.selectLoadSch(user.data);

        categories.innerHTML = categories.innerHTML + Mustache.render(doc.querySelector('.useraccounts').innerHTML,
                                                                      {costs: res.cat, img: 'img/' + res.type + '.png'});
    }

    function renameCategory(res) {
        var parent = doc.querySelector('.' + res.type),
            parentHistSel = doc.querySelector('.history_sch_select'),
            cat = user.data.categories[res.type];

        cat[(cat.indexOf(res.oldName, 0))] = res.newName;
        parent.innerHTML = parent.innerHTML.replace('<div>' + res.oldName + '</div>', '<div>' + res.newName + '</div>');
        parentHistSel.innerHTML = parentHistSel.innerHTML.replace('<option>' + res.oldName + '</option>', '<option>' + res.newName + '</option>');
    }

    function removeCategory(res) {
        var parent = doc.querySelector('.' + res.type),
            parentHistSel = doc.querySelector('.history_sch_select'),
            html = parent.innerHTML,
            indexStart, subs,
            cat = user.data.categories[res.type];

        cat = cat.splice(cat.indexOf(res.cat, 0), 1);
        parentHistSel.innerHTML = parentHistSel.innerHTML.replace('<option>' + res.cat + '</option>', '');

        indexStart = html.indexOf('<div>' + res.cat + '</div>');
        subs = html.slice(html.lastIndexOf('<div>', indexStart - 1),
                          html.indexOf('<div>', indexStart + 1));
        parent.innerHTML = html.replace(subs, '');
    }

    function newOper(res) {
        var parent = doc.querySelector('.historyUl');

        res['ico'] = 'img/' + res.type + '.png';
        res.mainCurr = user.data.mainCurr;
        parent.innerHTML = parent.innerHTML + Mustache.render(doc.querySelector('.history').innerHTML, res);
        tools.showMessage(doc.querySelector('.form-mess'), doc.querySelector('.message'), 'Новая операция успешно добавлена!', 'img/yes.png');
        tools.updateButton(doc.querySelector('.apply_filter2'), res.type, res.date);
    }

    function filterDate(res) {
        var sum, key, data,
            i, len,
            diagram = {};

        for (key in res) {
            if (key === 'send') continue;
            sum = 0;
            len = res[key].length;

            diagram[key] = {};

            for (i = 0; i < len; i++) {
                data = res[key][i];
                sum += +data.sum;

                if (!diagram[key][data.cat]) {
                    diagram[key][data.cat] = 0;
                }
                diagram[key][data.cat] += +data.sum;
            }
            doc.querySelector('.' + key + '_sumfilter').innerHTML = sum + ' ' + user.data.mainCurr;
        }

        CONTR.tools.showDiagram(diagram);
    }

    function removeOper(res) {
        var parent = doc.querySelector('.historyUl'),
            html = parent.innerHTML,
            indexStart,
            subs;

        indexStart = html.indexOf(res);
        subs = html.slice(html.lastIndexOf('<li>', indexStart),
                          html.indexOf('</li>', indexStart) + 5);
        parent.innerHTML = html.replace(subs, '');
        CONTROL.layer.destroyLayer();
    }

    function rebuildCurrency (obj) {
        var mainCurrWrap = doc.querySelectorAll('.currency-radio')[1],
            mainCurr = obj.mainCurr,
            currency = obj.currency[mainCurr],
            templateInput = doc.querySelector('.template_curr').innerHTML,
            radio, key, input = '';

        for (key in currency) {
            input = input + Mustache.render(templateInput, {valuta: key, count: currency[key], main: mainCurr});
        }
        mainCurrWrap.innerHTML = input;
    }

    function registration(res) {
        var sett = {
            0: ['Регистрация успешно пройдена!', 'img/yes.png'],
            1: ['Пользователь с таким именем существует!','img/warn.png']
        }
        tools.showMessage(doc.querySelector('.form-mess'), doc.querySelector('.messageResponse'), sett[res][0], sett[res][1]);
    }

    return {
        newCategory: newCategory,
        rebuildCurrency: rebuildCurrency,
        renameCategory: renameCategory,
        removeCategory: removeCategory,
        newOper: newOper,
        removeOper: removeOper,
        filterDate: filterDate,
        registration: registration
    }
})();

CONTROL.ajax = (function() {
    function toServer(link, callback) {
		var xhr = new XMLHttpRequest();

        xhr.open('GET', link); 
        xhr.onreadystatechange = function() {
            if (xhr.readyState != 4) return;

            if (xhr.status != 200) {
                alert('Ошибка ' + xhr.status + ': ' + xhr.statusText);
                return;
            }

            if (typeof callback === 'function') {
                try {
                    callback(JSON.parse(xhr.responseText));
                } catch (e){
                    callback(xhr.responseText);
                }
            }
            xhr = null;
        };
        xhr.send();
	}
	return {
		toServer: toServer
	}
})();

CONTROL.access = (function() {
    var CONTR = CONTROL,
        ajax = CONTR.ajax,
        response = CONTR.responses,
        request = CONTR.requests,
        user = CONTR.user,
        tools = CONTR.tools,
        doc = document;

	function showContent(responseData) {
        if (responseData == '0') {
            tools.showMessage(doc.querySelector('.form-mess'), doc.querySelector('.messageResponse'), 'Логин или пароль указаны неверно!', 'img/warn.png');
            return false;
        }
        user.data  = responseData;

		doc.querySelector('.main').innerHTML = doc.getElementById('user-form').innerHTML;
        CONTR.initialize.init(responseData);

        // ДЕЛЕГИРОВАНИЕ ФИЛЬТР ПО ДАТАМ В СТАТИСТИКЕ
        doc.querySelector('.statistics').addEventListener('click', function(e) {
            var event = e || window.event,
                target = event.target || event.srcElement;

            if (target.classList.contains('apply_filter1')) {
                event.preventDefault();

              if (tools.isDate(doc.querySelector('.dateFrom')) && tools.isDate(doc.querySelector('.dateTo'))) {
                  ajax.toServer(request.filterDate(user.login, tools.getDateMs(doc.querySelector('.dateFrom').value), tools.getDateMs(doc.querySelector('.dateTo').value)),
                                response.filterDate);
              }
            }

            if (target.classList.contains('apply_filter2')) {
                target.classList.remove('update');
                event.preventDefault();
                ajax.toServer(request.filterDate(user.login, tools.getDateMs(tools.getDateN('01')), tools.getDateMs(tools.getDateN('30'))),
                    response.filterDate);
            }
        }, false);

        //фильтр история
        doc.querySelector('.add_cat_sch.marginL5').addEventListener('click', function(e) {
            var event = e || window.event,
                target = event.target || event.srcElement,
                parent = target.parentNode,
                date = parent.querySelectorAll('input[type=text]'),
                activeOption = tools.findSelectedInput(parent.querySelectorAll('option'), 'selected'),
                activeRadio = tools.findSelectedInput(parent.querySelectorAll('input[type=radio'), 'checked');

            event.stopPropagation();

            if (tools.isDate(date[0]) && tools.isDate(date[1])) {
                ajax.toServer(request.filterHistory(user.login, activeOption.value, activeRadio.value, tools.getDateMs(date[0].value), tools.getDateMs(date[1].value)), CONTR.initialize.history);
                CONTR.layer.createLayer({clsContentLayer: 'layer gif-layer'});
            } else {
                ajax.toServer(request.filterHistory(user.login, activeOption.value, activeRadio.value, undefined, undefined), CONTR.initialize.history);
                CONTR.layer.createLayer({clsContentLayer: 'layer gif-layer'});
            }
        });

        // ДЕЛЕГИРОВАНИЯ КНОПОК ВЫЗОВА ФОРМ ДЛЯ ОПЕРАЦИЙ (ТАБ 1)
        doc.querySelector('.first__ul__button').addEventListener('click', function(e) {
            var event = e || window.event,
                target = event.target || event.srcElement,
                key, formType, type;

            if (target.tagName !== 'DIV') return;

            formType = {
                'Доходы': 'gain',
                'Расходы': 'costs',
                'Переводы': 'send'
            };

            for (key in formType) {
                if (target.innerHTML === key) {
                    type = formType[key];
                    event.stopPropagation();

                    CONTROL.layer.createLayer({content: doc.querySelector('.form__' + type).innerHTML});
                    CONTROL.reload.loadSelectForm(CONTROL.user.data, type);

                    doc.querySelector('.form__' + type + '__add').addEventListener('click', function(e) {
                        var event = e || window.event,
                            form = doc.querySelector('.form__' + type  + '__blockInputs').children,
                            len = form.length,
                            arr = ['date', 'sch', 'cat', 'sum', 'comm'],
                            i, item, data = {};

                        event.preventDefault();
                        if (tools.isNumber(doc.querySelector('.sumCheck')) && tools.isDate(doc.querySelector('.dateCheck'))) {
                            for (i = 0; i < len; i++) {
                                item = form[i];
                                data[arr[i]] = item.value;
                            }
                            data['type'] = type;
                            data['id'] = 'id' + Math.round(Math.random() * 1000000);
                            data.time = tools.getDateMs(data.date);

                            ajax.toServer(request.newOper(user.login, type, JSON.stringify(data)), response.newOper);
                            CONTROL.layer.destroyLayer();
                        }
                    }, false);
                }
            }
        }, false);

        // ДЕЛЕГИРОВАНИЯ (ТАБ 3)
        doc.getElementsByClassName('indentation')[2].addEventListener('click', function(e) {
            var event = e || window,
                target = event.target || event.srcElement,
                key;

            //КНОПКИ ДОБАВЛЕНИЯ НОВЫХ КАТЕГОРИЙ (СЧЕТОВ, ДОХОДОВ, РАСХОДОВ)
            if (target.classList.contains('addCategoryButton')) {
                event.preventDefault();

                var txtInput,
                    types = {
                    add_cat_sch: ['edit_cat_sch', 'accounts'],
                    add_cat_plus: ['edit_cat_plus', 'gain'],
                    add_cat_minus: ['edit_cat_minus', 'costs']
                    };

                for (key in types) {
                    if (target.classList.contains(key)) {
                        txtInput = doc.querySelector('.' + types[key][0]);

                        if (CONTROL.tools.isEmptyOne(txtInput)) {
                            ajax.toServer(request.newCategory(user.login, types[key][1], txtInput.value), response.newCategory);
                            txtInput.value = '';
                        }
                    }
                }
            }

            //КНОПКИ РЕДАКТИРОВАНИЯ КАТЕГОРИЙ (СЧЕТОВ, ДОХОДОВ, РАСХОДОВ)
            if (target.classList.contains('edit')) {
                ['accounts', 'gain', 'costs'].
                    forEach(function(elem) {
                        if (target.parentNode.parentNode.classList.contains(elem)) {
                            event.stopPropagation();
                            CONTROL.layer.createLayer({content: Mustache.render(doc.querySelector('.editCatForm').innerHTML,
                                {edit: target.parentNode.lastElementChild.innerHTML,
                                    caption: 'Изменить',
                                    img: 'img/edit2.png'})});

                            doc.querySelector('.butRenameCat').addEventListener('click', function(e) {
                                var event = e || window.event,
                                    input = doc.querySelector('.editCatInput'),
                                    old = input.placeholder;

                                event.preventDefault();
                                if (CONTROL.tools.isEmptyOne(input)) {
                                    ajax.toServer(request.editCategory(user.login, elem, old, input.value),
                                                  response.renameCategory);
                                    CONTROL.layer.destroyLayer();
                                }
                            });
                        }
                    });
            }

            //КНОПКИ УДАЛЕНИЯ КАТЕГОРИЙ (СЧЕТОВ, ДОХОДОВ, РАСХОДОВ)
            if (target.classList.contains('delete')) {
                ['accounts', 'gain', 'costs'].
                    forEach(function(elem) {
                        if (target.parentNode.parentNode.classList.contains(elem)) {
                            event.stopPropagation();
                            CONTROL.layer.createLayer({content: Mustache.render(doc.querySelector('.editCatForm').innerHTML,
                                {edit: target.parentNode.lastElementChild.innerHTML,
                                    caption: 'Удалить',
                                    img: 'img/close2.png',
                                    readonly: 'readonly'})});

                            doc.querySelector('.butRenameCat').addEventListener('click', function(e) {
                                var event = e || window.event,
                                    input = doc.querySelector('.editCatInput');

                                event.preventDefault();
                                ajax.toServer(request.removeCategory(user.login, elem, input.placeholder),
                                    response.removeCategory);
                                CONTROL.layer.destroyLayer();
                            });
                        }
                    });
            }

            if (target.classList.contains('buttonValuta')) {
                var inputCurr = target.parentNode.getElementsByClassName('value'),
                    len = inputCurr.length, i, item,
                    data = {};

                for (i = 0; i < len; i++) {
                    item = inputCurr[i];
                    data[item.name] = item.value;
                }
                CONTROL.ajax.toServer(request.changeRates(user.login, JSON.stringify(data)));
            }
        }, false);

        document.querySelector('.currency-radio').addEventListener('change', function() {
            var target = event.target || event.srcElement,
                price;

            price = +doc.querySelector('.curr-value input[name=' + target.value + ']').value;
            CONTROL.ajax.toServer(request.changeMainCurr(user.login, target.value, price), CONTR.responses.rebuildCurrency);
        });

        //УДАЛЕНИЕ ИЗ ИСТОРИИ
        doc.querySelector('.historyUl').addEventListener('click', function(e) {
            var event = e || window.event,
                target = event.target || event.srcElement,
                parent, type, src,
                id;

            if (!target.classList.contains('delete')) return;

            parent = target.parentNode;
            src = parent.querySelector('.icoHist').src;

            type = src.slice(src.lastIndexOf('/') + 1, src.length - 4);

            id = parent.querySelector('.id').innerHTML;
            event.stopPropagation();
            CONTROL.layer.createLayer({content: doc.querySelector('.remHistForm').innerHTML});

            doc.querySelector('.butRemoveHist').addEventListener('click', function(e) {
               var event = e || window.event;

               event.preventDefault();
               ajax.toServer(request.removeOper(user.login, type, id), response.removeOper);
            });

        }, false);
    }

    function registration(user, password) {
        if (user && password) {
            ajax.toServer(request.registration(user, password), response.registration);
        }
    }

    function authorization(user, password) {
        if (user && password) {
            ajax.toServer(request.auth(user, password, tools.getDateMs(tools.getDateN('01')), tools.getDateMs(tools.getDateN('30'))), showContent);
        }
        return false;
    }

    return {
        registration: registration,
        authorization: authorization,
        showContent: showContent
    }
})();

CONTROL.layer = (function() {
    var doc = document,
        layerElements = {},
        createLayer;

    createLayer = (function() {
        layerElements.modal = doc.createElement('div');
        layerElements.layer = doc.createElement('div');

        var optionsObject = getDefaultOptions(),
            modal = layerElements.modal,
            layer = layerElements.layer;

        layerElements.parent = optionsObject.parent;
        modal.className = optionsObject.clsOpacityLayer;

        layer.addEventListener('click', function(e) {
            var event = e || window.event;
            event.stopPropagation();
        });

        return function (options) {
            var fragment = doc.createDocumentFragment();
       //     optionsObject = getDefaultOptions();
            Object.keys(options).
                forEach(function(key) {
                    optionsObject[key] = options[key];
                });
            if (optionsObject.removeDestroy == true) {
                document.removeEventListener('click', destroyLayer);
                layerElements.destroy = true;
            }
            layer.innerHTML = optionsObject.content;
            layer.className = optionsObject.clsContentLayer;
            fragment.appendChild(modal);
            fragment.appendChild(layer);
            layerElements.parent.appendChild(fragment);
            layerElements.isCreated = true;
        }
    })();

    function getDefaultOptions() {
        return {
            parent: document.body,
            clsOpacityLayer: 'modal',
            clsContentLayer: 'layer',
            content: '',
            removeDestroy: false
        }
    }

    function destroyLayer() {
        var parent = layerElements.parent;
        if (layerElements.isCreated) {
            parent.removeChild(layerElements.modal);
            parent.removeChild(layerElements.layer);
            layerElements.isCreated = false;
            if (layerElements.destroy) {
                document.addEventListener('click', destroyLayer);
            }
        }
    }

    document.addEventListener('click', destroyLayer);

    return {
        createLayer: createLayer,
        destroyLayer: destroyLayer
    }
})();
