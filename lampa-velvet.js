(function () {
    'use strict';

    if (window.lampa_velvet_ready) return;
    window.lampa_velvet_ready = true;

    var THEME = 'lampa-velvet';
    var TMDB = 'https://image.tmdb.org/t/p/';
    var currentUrl = '';
    var currentCard = null;
    var activeLayer = 0;
    var bg;
    var layers = [];
    var scene;
    var sceneMedia;
    var sceneTitle;
    var sceneMeta;
    var sceneRating;
    var sceneYear;
    var scanTimer;
    var initialized = false;

    var css = [
        'body.%THEME%{background:#05070a!important;color:#f7f8fb!important;}',
        'body.%THEME% .background{opacity:0!important;}',
        '.vlt-bg{position:fixed;top:0;left:0;right:0;bottom:0;z-index:0;overflow:hidden;pointer-events:none;background:#05070a;}',
        '.vlt-bg__image{position:absolute;top:0;left:0;right:0;bottom:0;opacity:0;background-position:center;background-size:cover;transition:opacity .25s ease;}',
        '.vlt-bg__image.active{opacity:.38;}',
        '.vlt-bg__veil{position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(90deg,rgba(5,7,10,.98) 0%,rgba(5,7,10,.64) 42%,rgba(5,7,10,.84) 100%),linear-gradient(180deg,rgba(5,7,10,.72) 0%,rgba(5,7,10,.22) 38%,rgba(5,7,10,.82) 100%);}',
        '.vlt-bg__shine{position:absolute;left:0;right:0;top:0;height:58%;background:linear-gradient(110deg,rgba(255,255,255,.16),rgba(140,190,255,.08) 34%,rgba(255,255,255,0) 68%);opacity:.72;}',
        '.vlt-bg__texture{position:absolute;top:0;left:0;right:0;bottom:0;opacity:.07;background-image:linear-gradient(115deg,rgba(255,255,255,.08),rgba(255,255,255,0) 38%),repeating-linear-gradient(0deg,rgba(255,255,255,.035) 0 1px,rgba(255,255,255,0) 1px 3px);}',

        'body.%THEME% .head{top:1.45em;left:3.8vw;right:3.8vw;width:auto;z-index:38;}',
        'body.%THEME% .head__body{min-height:3.55em;padding:.46em .8em;border-radius:1.35em;background:rgba(14,17,23,.86);border:1px solid rgba(255,255,255,.14);}',
        'body.platform--browser.%THEME% .head__body{}',
        'body.%THEME% .head__title{font-size:1.18em;font-weight:800;color:rgba(255,255,255,.92);letter-spacing:0;}',
        'body.%THEME% .head__logo-icon{width:2em;height:2em;margin-right:.78em;border-radius:.66em;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;overflow:hidden;}',
        'body.%THEME% .head__logo-icon img{width:68%;height:68%;object-fit:contain;}',
        'body.%THEME% .head__menu-icon,body.%THEME% .head__backward{margin-right:.78em;color:#fff;position:relative;z-index:5;cursor:pointer;}',
        'body.%THEME% .head__menu-icon svg,body.%THEME% .head__backward svg{width:1.78em!important;height:1.78em!important;}',
        'body.%THEME% .head__action{width:2.34em;height:2.34em;margin-left:.4em;padding:.5em;border-radius:50%;color:rgba(255,255,255,.88);background:rgba(255,255,255,.08);transition:background .14s ease,color .14s ease;}',
        'body.%THEME% .head__action.focus,body.%THEME% .head__action.hover{background:#fff;color:#0b0f14;transform:scale(1.08);}',
        'body.%THEME% .head__time-now{font-size:1.56em;color:#fff;}',
        'body.%THEME% .head__time-date,body.%THEME% .head__time-week{color:rgba(255,255,255,.7);}',
        'body.%THEME% .head__markers{margin:0 .72em;}',

        '.vlt-scene{position:fixed;left:3.8vw;right:3.8vw;top:5.75em;height:11.3em;z-index:10;display:flex;align-items:stretch;pointer-events:none;}',
        '.vlt-scene__copy{min-width:0;width:42%;padding:1.15em 1.4em 1.1em 0;display:flex;flex-direction:column;justify-content:flex-end;}',
        '.vlt-scene__label{font-size:.68em;font-weight:900;letter-spacing:.24em;text-transform:uppercase;color:rgba(255,255,255,.44);margin-bottom:.62em;}',
        '.vlt-scene__title{font-size:2.58em;line-height:.98;font-weight:900;color:#fff;text-shadow:0 .35em 1.3em rgba(0,0,0,.5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
        '.vlt-scene__meta{display:flex;align-items:center;min-width:0;margin-top:.72em;color:rgba(255,255,255,.68);font-size:.96em;font-weight:800;}',
        '.vlt-scene__rating{display:none;margin-right:.65em;padding:.24em .62em;border-radius:999px;background:#fff;color:#0b0f14;font-weight:950;}',
        '.vlt-scene__rating.visible{display:inline-flex;}',
        '.vlt-scene__year{display:inline-block;margin-left:.45em;color:rgba(255,255,255,.52);}',
        '.vlt-scene__media{position:relative;flex:1;border-radius:1.35em;overflow:hidden;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);}',
        '.vlt-scene__media:before{content:"";position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(90deg,rgba(5,7,10,.72),rgba(5,7,10,.08) 44%,rgba(5,7,10,.42));z-index:1;}',
        '.vlt-scene__media:after{content:"";position:absolute;left:0;right:0;bottom:0;height:46%;background:linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,.46));z-index:2;}',
        '.vlt-scene__still{position:absolute;top:0;left:0;right:0;bottom:0;background-position:center;background-size:cover;transition:background-image .18s ease;}',

        'body.%THEME% .wrap{z-index:14;}',
        'body.%THEME% .wrap__content{padding-top:17.65em;}',
        'body.%THEME% .wrap,body.%THEME% .wrap__content,body.%THEME% .activity,body.%THEME% .activity__body,body.%THEME% .items-line,body.%THEME% .items-cards,body.%THEME% .scroll,body.%THEME% .scroll__body,body.%THEME% .scroll__content{background:transparent!important;}',
        'body.%THEME% .items-line{padding-bottom:3.15em;}',
        'body.%THEME% .items-line__head{padding-left:3.8vw;padding-right:3.8vw;margin-bottom:.9em;}',
        'body.%THEME% .items-line__title{font-size:1.14em;font-weight:900;color:rgba(255,255,255,.86);text-shadow:0 .4em 1.4em rgba(0,0,0,.35);}',
        'body.%THEME% .items-line__more{padding:.42em .88em;border-radius:999px;background:rgba(255,255,255,.11);color:rgba(255,255,255,.72);border:1px solid rgba(255,255,255,.06);}',
        'body.%THEME% .items-line__more.focus,body.%THEME% .items-line__more.hover{background:#fff;color:#0b0f14;}',
        'body.%THEME% .scroll__content{padding-left:3.8vw!important;padding-right:3.8vw!important;}',

        'body.%THEME% .card{width:11.35em;opacity:.82;transition:transform .16s ease,opacity .16s ease;}',
        'body.%THEME% .card__view{margin-bottom:.76em;}',
        'body.%THEME% .card__img{border-radius:1.08em;background:#131821;box-shadow:inset 0 0 0 1px rgba(255,255,255,.05);transition:box-shadow .12s ease;}',
        'body.%THEME% .card__view:before{content:"";position:absolute;left:0;right:0;bottom:0;height:40%;z-index:1;border-radius:0 0 1.08em 1.08em;background:linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,.55));pointer-events:none;}',
        'body.%THEME% .card__title{font-size:.96em;line-height:1.18;font-weight:900;color:rgba(255,255,255,.86);}',
        'body.%THEME% .card__age{font-size:.82em;color:rgba(255,255,255,.42);margin-top:.45em;}',
        'body.%THEME% .card.focus,body.%THEME% .card.hover{opacity:1;transform:translate3d(0,-.7em,0) scale(1.07);z-index:8;}',
        'body.%THEME% .card.focus .card__img,body.%THEME% .card.hover .card__img{box-shadow:0 0 0 .16em #fff;}',
        'body.%THEME% .card.focus .card__view::after,body.%THEME% .card.hover .card__view::after{display:none!important;}',
        'body.%THEME% .card.focus .card__title,body.%THEME% .card.hover .card__title{color:#fff;}',
        'body.%THEME% .card__vote{z-index:2;right:.52em;bottom:.52em;border-radius:999px;background:rgba(5,7,10,.74);color:#fff;}',
        'body.%THEME% .card__type{left:.52em;top:.52em;border-radius:999px;background:rgba(255,255,255,.9);color:#0b0f14;font-weight:900;}',
        'body.%THEME% .card__quality{left:.52em;bottom:.62em;border-radius:999px;background:rgba(255,255,255,.92);color:#0b0f14;font-weight:900;z-index:2;}',

        'body.%THEME% .wrap__left{z-index:90;}',
        'body.%THEME% .menu{padding:.55em;background:rgba(12,15,21,.94);border:1px solid rgba(255,255,255,.12);border-radius:1.25em;}',
        'body.platform--browser.%THEME% .menu{}',
        'body.%THEME% .menu__item{border-radius:.92em;color:rgba(255,255,255,.82);}',
        'body.%THEME% .menu__item.focus,body.%THEME% .menu__item.hover{background:#fff;color:#0b0f14;}',
        'body.%THEME%.menu--open:not(.light--version) .wrap__left{visibility:visible!important;width:18em!important;margin-left:-18em!important;transform:translate3d(18em,0,0)!important;}',
        'body.%THEME%.menu--open:not(.light--version) .wrap__content{transform:translate3d(18em,0,0)!important;}',
        'body.%THEME%.menu--open:not(.light--version) .vlt-scene{display:none!important;}',
        'body.%THEME%.menu--open:not(.light--version) .menu__text{display:block!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:10.8em;}',
        'body.%THEME%.search--open .vlt-scene,body.%THEME%.keyboard-input--visible .vlt-scene{display:none!important;}',
        'body.%THEME%.search--open .vlt-bg__image,body.%THEME%.keyboard-input--visible .vlt-bg__image{opacity:.28;}',
        'body.%THEME%.vlt--overlay-open .vlt-scene{display:none!important;}',
        'body.%THEME%.vlt--overlay-open .vlt-bg__image{opacity:.28;}',

        'body.%THEME% .selectbox__content,body.%THEME% .modal__content,body.%THEME% .settings__content{background:rgba(12,15,21,.96)!important;}',
        '@media screen and (max-width:790px){.vlt-scene{display:none;}body.%THEME% .head{top:.8em;left:.8em;right:.8em;}body.%THEME% .head__body{border-radius:1.05em;}body.%THEME% .wrap__content{padding-top:5.85em;}body.%THEME% .items-line__head,body.%THEME% .scroll__content{padding-left:1em!important;padding-right:1em!important;}body.%THEME% .card{width:10.7em;}}'
    ].join('').replace(/%THEME%/g, THEME);

    function closestByClass(node, className) {
        while (node && node !== document) {
            if (node.classList && node.classList.contains(className)) return node;
            node = node.parentNode;
        }
        return null;
    }

    function addStyle() {
        var style;
        if (document.getElementById('lampa-velvet-style')) return;
        style = document.createElement('style');
        style.id = 'lampa-velvet-style';
        style.textContent = css;
        document.head.appendChild(style);
    }

    function addBackground() {
        if (document.querySelector('.vlt-bg')) {
            bg = document.querySelector('.vlt-bg');
            layers = Array.prototype.slice.call(bg.querySelectorAll('.vlt-bg__image'));
            return;
        }

        bg = document.createElement('div');
        bg.className = 'vlt-bg';
        bg.innerHTML = [
            '<div class="vlt-bg__image active"></div>',
            '<div class="vlt-bg__image"></div>',
            '<div class="vlt-bg__veil"></div>',
            '<div class="vlt-bg__shine"></div>',
            '<div class="vlt-bg__texture"></div>'
        ].join('');
        document.body.insertBefore(bg, document.body.firstChild);
        layers = Array.prototype.slice.call(bg.querySelectorAll('.vlt-bg__image'));
    }

    function addScene() {
        if (document.querySelector('.vlt-scene')) {
            scene = document.querySelector('.vlt-scene');
        }
        else {
            scene = document.createElement('div');
            scene.className = 'vlt-scene';
            scene.innerHTML = [
                '<div class="vlt-scene__copy">',
                '<div class="vlt-scene__label">Now Selected</div>',
                '<div class="vlt-scene__title">Lampa</div>',
                '<div class="vlt-scene__meta">',
                '<span class="vlt-scene__rating"></span>',
                '<span class="vlt-scene__type">Фильм</span>',
                '<span class="vlt-scene__year"></span>',
                '</div>',
                '</div>',
                '<div class="vlt-scene__media"><div class="vlt-scene__still"></div></div>'
            ].join('');
            document.body.insertBefore(scene, document.body.firstChild);
        }

        sceneMedia = scene.querySelector('.vlt-scene__still');
        sceneTitle = scene.querySelector('.vlt-scene__title');
        sceneMeta = scene.querySelector('.vlt-scene__type');
        sceneRating = scene.querySelector('.vlt-scene__rating');
        sceneYear = scene.querySelector('.vlt-scene__year');
    }

    function absoluteUrl(url) {
        var anchor;
        if (!url || typeof url !== 'string') return '';
        if (url.indexOf('data:') === 0) return '';
        if (url.indexOf('./img/') === 0 || url.indexOf('img_load') >= 0 || url.indexOf('img_broken') >= 0) return '';
        anchor = document.createElement('a');
        anchor.href = url;
        return anchor.href || url;
    }

    function tmdb(path, size) {
        if (!path || typeof path !== 'string') return '';
        if (path.indexOf('http') === 0) return path;
        if (path.charAt(0) === '/') return TMDB + size + path;
        return path;
    }

    function dataFromCard(card) {
        if (!card) return null;
        if (card.card_data) return card.card_data;
        try {
            if (window.$) return $(card).data('card') || $(card).data('data') || null;
        }
        catch (e) {}
        return null;
    }

    function imageFromData(data) {
        if (!data) return '';
        if (data.backdrop_path) return tmdb(data.backdrop_path, 'w1280');
        if (data.background_image) return absoluteUrl(data.background_image);
        if (data.cover) return absoluteUrl(data.cover);
        if (data.poster_path) return tmdb(data.poster_path, 'w780');
        if (data.profile_path) return tmdb(data.profile_path, 'w780');
        if (data.poster) return absoluteUrl(data.poster);
        if (data.img) return absoluteUrl(data.img);
        return '';
    }

    function imageFromElement(card) {
        var img;
        var view;
        var bgImage;
        var match;
        if (!card) return '';
        img = card.querySelector('.card__img, img');
        if (img && img.src) return absoluteUrl(img.src);
        view = card.querySelector('.card__view') || card;
        bgImage = window.getComputedStyle ? window.getComputedStyle(view).backgroundImage : '';
        match = bgImage && bgImage.match(/url\(["']?(.+?)["']?\)/);
        return match ? absoluteUrl(match[1]) : '';
    }

    function textFromCard(card, selector) {
        var node = card && card.querySelector ? card.querySelector(selector) : null;
        return node ? (node.textContent || node.innerText || '').replace(/^\s+|\s+$/g, '') : '';
    }

    function yearFromData(data) {
        var date = data && (data.release_date || data.first_air_date || data.birthday || data.release_year);
        return date ? String(date).slice(0, 4) : '';
    }

    function ratingFromData(data, card) {
        var value = data && (data.cub_hundred_rating || data.vote_average || data.rating);
        var rating = value ? String(parseFloat(value).toFixed(1)) : textFromCard(card, '.card__vote');
        return rating && rating !== '0.0' ? rating : '';
    }

    function updateScene(data, card, url) {
        var title;
        var year;
        var rating;
        var type;

        if (!sceneTitle || !sceneMeta || !sceneRating || !sceneYear) return;

        title = data && (data.title || data.name || data.original_title || data.original_name);
        year = yearFromData(data) || textFromCard(card, '.card__age');
        rating = ratingFromData(data, card);
        type = data && data.original_name ? 'Сериал' : 'Фильм';
        title = title || textFromCard(card, '.card__title') || 'Lampa';

        sceneTitle.innerText = title;
        sceneMeta.innerText = type;
        sceneYear.innerText = year ? '• ' + year : '';

        if (rating) {
            sceneRating.innerText = rating;
            sceneRating.classList.add('visible');
        }
        else {
            sceneRating.innerText = '';
            sceneRating.classList.remove('visible');
        }

        if (sceneMedia && url) sceneMedia.style.backgroundImage = 'url("' + url.replace(/"/g, '\\"') + '")';
    }

    function setBackground(url) {
        var next;
        var prev;
        url = absoluteUrl(url);
        if (!url || url === currentUrl || !layers.length) return;
        currentUrl = url;
        activeLayer = activeLayer ? 0 : 1;
        next = layers[activeLayer];
        prev = layers[activeLayer ? 0 : 1];
        next.style.backgroundImage = 'url("' + url.replace(/"/g, '\\"') + '")';
        next.classList.add('active');
        prev.classList.remove('active');
    }

    function updateFromCard(card) {
        var data;
        var url;
        if (!card || !card.classList || !card.classList.contains('card')) return;
        if (card === currentCard) return;
        currentCard = card;
        data = dataFromCard(card);
        url = imageFromData(data) || imageFromElement(card);
        updateScene(data, card, url);
        setBackground(url);
    }

    function findFocusedCard() {
        return document.querySelector('.card.focus, .card.hover, .card.enter');
    }

    function scanFocus() {
        syncOverlayState();
        updateFromCard(findFocusedCard());
    }

    function scheduleScan(delay) {
        if (scanTimer) clearTimeout(scanTimer);
        scanTimer = setTimeout(function () {
            scanTimer = null;
            scanFocus();
        }, delay || 80);
    }

    function syncOverlayState() {
        var open = false;

        if (document.body.classList) {
            open = document.body.classList.contains('search--open') ||
                document.body.classList.contains('keyboard-input--visible') ||
                document.body.classList.contains('selectbox--open');
        }

        if (!open && document.querySelector('.search')) open = true;
        if (!open && document.querySelector('.search-box')) open = true;

        if (document.body.classList) {
            if (open) document.body.classList.add('vlt--overlay-open');
            else document.body.classList.remove('vlt--overlay-open');
        }
    }

    function toggleMenu() {
        try {
            if (window.Lampa && Lampa.Menu && Lampa.Menu.toggle) {
                Lampa.Menu.toggle();
                return;
            }
        }
        catch (e) {}

        try {
            if (window.Lampa && Lampa.Controller && Lampa.Controller.toggle) {
                Lampa.Controller.toggle('menu');
                document.body.classList.add('menu--open');
                return;
            }
        }
        catch (e2) {}

        document.body.classList.toggle('menu--open');
    }

    function bindEvents() {
        document.addEventListener('hover:focus', function (event) {
            updateFromCard(closestByClass(event.target, 'card'));
            scheduleScan(120);
        }, true);
        document.addEventListener('hover:hover', function (event) {
            updateFromCard(closestByClass(event.target, 'card'));
            scheduleScan(120);
        }, true);
        document.addEventListener('focusin', function (event) {
            updateFromCard(closestByClass(event.target, 'card'));
            scheduleScan(120);
        }, true);
        document.addEventListener('mouseover', function (event) {
            updateFromCard(closestByClass(event.target, 'card'));
        }, true);
        document.addEventListener('keydown', function () {
            scheduleScan(80);
        }, true);
        document.addEventListener('keyup', function () {
            scheduleScan(80);
        }, true);
        document.addEventListener('mousedown', function (event) {
            if (!closestByClass(event.target, 'head__menu-icon')) return;
            event.preventDefault();
            event.stopPropagation();
            if (event.stopImmediatePropagation) event.stopImmediatePropagation();
            toggleMenu();
        }, true);
        document.addEventListener('click', function (event) {
            if (!closestByClass(event.target, 'head__menu-icon')) return;
            event.preventDefault();
            event.stopPropagation();
            if (event.stopImmediatePropagation) event.stopImmediatePropagation();
        }, true);

        scheduleScan(350);
    }

    function init() {
        if (initialized) return;
        initialized = true;
        addStyle();
        addBackground();
        addScene();
        document.body.classList.add(THEME);
        bindEvents();
        scanFocus();
    }

    function ready() {
        if (document.body) init();
        else setTimeout(ready, 50);
    }

    if (window.appready) ready();
    else if (window.Lampa && Lampa.Listener) {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') ready();
        });
        ready();
    }
    else ready();

    window.lampa_velvet_destroy = function () {
        document.body.classList.remove(THEME);
        document.body.classList.remove('vlt--overlay-open');
        if (scene) scene.remove();
        if (bg) bg.remove();
        if (scanTimer) clearTimeout(scanTimer);
        initialized = false;
        window.lampa_velvet_ready = false;
    };
})();
