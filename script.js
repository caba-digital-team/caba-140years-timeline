jQuery(document).ready(function($){
    var timeline = $('.cd-horizontal-timeline'),
        eventsMinDistance = 150,
        leftPadding = 60; // FIX 1: Adds a buffer so 1880 isn't cut off

    if(timeline.length > 0) {
        var timelineComponents = {};
        timelineComponents['timelineWrapper'] = timeline.find('.events-wrapper');
        timelineComponents['eventsWrapper'] = timelineComponents['timelineWrapper'].children('.events');
        timelineComponents['fillingLine'] = timelineComponents['eventsWrapper'].children('.filling-line');
        timelineComponents['timelineEvents'] = timelineComponents['eventsWrapper'].find('a');
        timelineComponents['timelineNavigation'] = timeline.find('.cd-timeline-navigation');
        timelineComponents['eventsContent'] = timeline.children('.events-content');
        timelineComponents['progressCount'] = $('#progressCount');
        timelineComponents['progressFill'] = $('#progressFill');

        initTimeline(timelineComponents);
        timeline.addClass('loaded');
        updateProgressBar(timelineComponents);

        timelineComponents['timelineEvents'].on('click', function(event){
            event.preventDefault();
            updateSelectedEvent($(this), timelineComponents);
        });

        timelineComponents['timelineNavigation'].on('click', '.next', function(event){
            event.preventDefault();
            updateNavigation(timelineComponents, 'next');
        });

        timelineComponents['timelineNavigation'].on('click', '.prev', function(event){
            event.preventDefault();
            updateNavigation(timelineComponents, 'prev');
        });

        $(window).on('resize', function() {
            sendHeightToParent();
        });
    }

    function initTimeline(components) {
        var totalWidth = 0;
        components['timelineEvents'].each(function(index){
            // Apply the padding to the first element and space others accordingly
            var distance = leftPadding + (index * eventsMinDistance);
            $(this).css('left', distance + 'px');
            totalWidth = distance + eventsMinDistance;
        });
        
        components['eventsWrapper'].css('width', totalWidth + 'px');
        updateSelectedEvent(components['timelineEvents'].filter('.selected'), components);
    }

    function updateSelectedEvent(element, components) {
        var eventDate = element.data('date'),
            visibleContent = components['eventsContent'].find('.selected'),
            selectedContent = components['eventsContent'].find('[data-date="'+ eventDate +'"]');
        
        components['timelineEvents'].removeClass('selected');
        element.addClass('selected');
        
        visibleContent.removeClass('selected');
        selectedContent.addClass('selected');

        updateFillingLine(element, components['fillingLine'], components['eventsWrapper'].width());
        updateTimelinePosition(element, components);
        updateProgressBar(components);
        
        setTimeout(sendHeightToParent, 300);
    }

    function updateTimelinePosition(element, components) {
        var eventLeft = parseFloat(element.css('left')),
            timelineWidth = parseFloat(components['timelineWrapper'].css('width')),
            wrapperWidth = parseFloat(components['eventsWrapper'].css('width'));
        
        // FIX 2: Better math for centering the selected date
        var translateValue = timelineWidth/2 - eventLeft;
        
        if(translateValue > 0) translateValue = 0;
        if(translateValue < timelineWidth - wrapperWidth) translateValue = timelineWidth - wrapperWidth;

        components['eventsWrapper'].css('transform', 'translateX(' + translateValue + 'px)');
        
        // Update arrow button opacity based on position
        components['timelineNavigation'].find('.prev').toggleClass('inactive', (element.parent('li').is(':first-child')));
        components['timelineNavigation'].find('.next').toggleClass('inactive', (element.parent('li').is(':last-child')));
    }

    function updateFillingLine(selectedEvent, fillingLine, totalWidth) {
        var eventLeft = parseFloat(selectedEvent.css('left'));
        var scaleValue = eventLeft / totalWidth;
        fillingLine.css('transform', 'scaleX(' + scaleValue + ')');
    }

    function updateProgressBar(components) {
        var totalItems = components['timelineEvents'].length;
        var currentIndex = components['timelineEvents'].index(components['timelineEvents'].filter('.selected')) + 1;
        components['progressCount'].text(currentIndex + ' / ' + totalItems);
        var progressPercent = (currentIndex / totalItems) * 100;
        components['progressFill'].css('width', progressPercent + '%');
    }

    function updateNavigation(components, direction) {
        var selectedEvent = components['timelineEvents'].filter('.selected');
        var nextStep = (direction === 'next') 
            ? selectedEvent.parent('li').next('li').children('a') 
            : selectedEvent.parent('li').prev('li').children('a');
        
        if(nextStep.length > 0) {
            updateSelectedEvent(nextStep, components);
        }
    }

    function sendHeightToParent() {
        if (window.parent && window.parent.postMessage) {
            var height = document.body.scrollHeight;
            window.parent.postMessage({ 'height': height }, '*');
        }
    }
});
