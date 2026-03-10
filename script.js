jQuery(document).ready(function($){
    var timeline = $('.cd-horizontal-timeline'),
        eventsMinDistance = 120;

    if(timeline.length > 0) {
        var tc = {};
        tc.timelineWrapper    = timeline.find('.events-wrapper');
        tc.eventsWrapper      = tc.timelineWrapper.children('.events');
        tc.fillingLine        = tc.eventsWrapper.children('.filling-line');
        tc.timelineEvents     = tc.eventsWrapper.find('a');
        tc.timelineNavigation = timeline.find('.cd-timeline-navigation');
        tc.eventsContent      = timeline.children('.events-content');

        var total = tc.timelineEvents.length;

        initTimeline(tc);
        timeline.addClass('loaded');

        tc.timelineEvents.on('click', function(e){
            e.preventDefault();
            updateSelectedEvent($(this), tc);
            updateNavigationState(tc);
        });
        tc.timelineNavigation.on('click', '.next', function(e){ e.preventDefault(); updateNavigation(tc, 'next'); });
        tc.timelineNavigation.on('click', '.prev', function(e){ e.preventDefault(); updateNavigation(tc, 'prev'); });
    }

    function initTimeline(c) {
        var totalWidth = 0;
        var offset = 20;
        for(var i = 0; i < c.timelineEvents.length; i++) {
            c.timelineEvents.eq(i).css('left', (offset + i * eventsMinDistance) + 'px');
            totalWidth += eventsMinDistance;
        }
        totalWidth += offset * 2;
        c.eventsWrapper.css('width', totalWidth + 'px');
        updateFillingLine(c.timelineEvents.eq(0), c.fillingLine, totalWidth, c);
        updateNavigationState(c);
        updateProgress(c);
    }

    function updateSelectedEvent(el, c) {
        var date = el.data('date');
        c.eventsContent.find('.selected').removeClass('selected');
        c.timelineEvents.removeClass('selected');
        el.addClass('selected');
        c.eventsContent.find('[data-date="'+ date +'"]').addClass('selected');
        updateFillingLine(el, c.fillingLine, c.eventsWrapper.width(), c);
        updateTimelinePosition(el, c);
        updateProgress(c);
    }

    function updateTimelinePosition(el, c) {
        var left  = parseFloat(window.getComputedStyle(el.get(0)).left),
            width = parseFloat(c.timelineWrapper.css('width'));
        var tx = width / 2 - left;
        if(tx > 0) tx = 0;
        var min = width - c.eventsWrapper.width();
        if(tx < min) tx = min;
        c.eventsWrapper.css('transform', 'translateX('+ tx +'px)');
    }

    function updateFillingLine(sel, line, totalWidth, components) {
        var idx = components.timelineEvents.index(sel);
        var total = components.timelineEvents.length;
        var scaleValue = idx === total - 1 ? 1 : parseFloat(sel.css('left')) / totalWidth;
        line.css('transform', 'scaleX(' + scaleValue + ')');
    }

    function updateNavigation(c, dir) {
        var sel  = c.eventsWrapper.find('.selected');
        var next = dir === 'next' ? sel.parent('li').next('li').children('a') : sel.parent('li').prev('li').children('a');
        if(next.length) { updateSelectedEvent(next, c); updateNavigationState(c); }
    }

    function updateNavigationState(c) {
        var sel = c.eventsWrapper.find('.selected');
        c.timelineNavigation.find('.prev').toggleClass('inactive', !sel.parent('li').prev('li').length);
        c.timelineNavigation.find('.next').toggleClass('inactive', !sel.parent('li').next('li').length);
    }

    function updateProgress(c) {
        var idx = c.timelineEvents.index(c.eventsWrapper.find('.selected'));
        var total = c.timelineEvents.length;
        var pct = total === 1 ? 100 : (idx / (total - 1)) * 100;
        $('#progressFill').css('width', pct + '%');
        $('#progressCount').text((idx + 1) + ' / ' + total);
    }
});