jQuery(document).ready(function($){
    var timeline = $('.cd-horizontal-timeline'),
        eventsMinDistance = 150; // Spacing between dots on the line

    if(timeline.length > 0) {
        var timelineComponents = {};
        // Cache elements
        timelineComponents['timelineWrapper'] = timeline.find('.events-wrapper');
        timelineComponents['eventsWrapper'] = timelineComponents['timelineWrapper'].children('.events');
        timelineComponents['fillingLine'] = timelineComponents['eventsWrapper'].children('.filling-line');
        timelineComponents['timelineEvents'] = timelineComponents['eventsWrapper'].find('a');
        timelineComponents['timelineNavigation'] = timeline.find('.cd-timeline-navigation');
        timelineComponents['eventsContent'] = timeline.children('.events-content');
        timelineComponents['progressCount'] = $('#progressCount');
        timelineComponents['progressFill'] = $('#progressFill');

        // Initialize timeline positions and widths
        initTimeline(timelineComponents);
        timeline.addClass('loaded');
        updateProgressBar(timelineComponents);

        // Click on a date dot
        timelineComponents['timelineEvents'].on('click', function(event){
            event.preventDefault();
            var selectedItem = $(this);
            updateSelectedEvent(selectedItem, timelineComponents);
        });

        // Click on navigation arrows
        timelineComponents['timelineNavigation'].on('click', '.next', function(event){
            event.preventDefault();
            updateNavigation(timelineComponents, 'next');
        });

        timelineComponents['timelineNavigation'].on('click', '.prev', function(event){
            event.preventDefault();
            updateNavigation(timelineComponents, 'prev');
        });

        // Handle browser resize for the iframe height
        $(window).on('resize', function() {
            sendHeightToParent();
        });
    }

    function initTimeline(components) {
        var totalWidth = 0;
        for (i = 0; i < components['timelineEvents'].length; i++) { 
            var distance = i * eventsMinDistance;
            components['timelineEvents'].eq(i).css('left', distance + 'px');
            totalWidth = distance + eventsMinDistance;
        }
        components['eventsWrapper'].css('width', totalWidth + 'px');
        
        // Initial filling line and height check
        updateFillingLine(components['timelineEvents'].filter('.selected'), components['fillingLine'], totalWidth);
        setTimeout(sendHeightToParent, 500);
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
        
        // Notify parent iframe to resize
        setTimeout(sendHeightToParent, 300);
    }

    function updateTimelinePosition(element, components) {
        var eventLeft = parseFloat(element.css('left')),
            timelineWidth = parseFloat(components['timelineWrapper'].css('width'));
        
        var translateValue = timelineWidth/2 - eventLeft;
        
        // Constraint checking
        if(translateValue > 0) translateValue = 0;
        var maxTranslate = timelineWidth - components['eventsWrapper'].width();
        if(translateValue < maxTranslate) translateValue = maxTranslate;

        components['eventsWrapper'].css('transform', 'translateX(' + translateValue + 'px)');
        
        // Update arrow states
        components['timelineNavigation'].find('.prev').toggleClass('inactive', translateValue === 0);
        components['timelineNavigation'].find('.next').toggleClass('inactive', translateValue === maxTranslate);
    }

    function updateFillingLine(selectedEvent, fillingLine, totalWidth) {
        var eventLeft = parseFloat(selectedEvent.css('left'));
        var scaleValue = eventLeft / totalWidth;
        fillingLine.css('transform', 'scaleX(' + scaleValue + ')');
    }

    function updateProgressBar(components) {
        var totalItems = components['timelineEvents'].length;
        var currentIndex = components['timelineEvents'].index(components['timelineEvents'].filter('.selected')) + 1;
        
        // Update "1 / 19" text
        components['progressCount'].text(currentIndex + ' / ' + totalItems);
        
        // Update bottom progress bar fill percentage
        var progressPercent = (currentIndex / totalItems) * 100;
        components['progressFill'].css('width', progressPercent + '%');
    }

    function updateNavigation(components, direction) {
        var selectedEvent = components['timelineEvents'].filter('.selected');
        var nextEvent = (direction === 'next') ? selectedEvent.parent('li').next('li').children('a') : selectedEvent.parent('li').prev('li').children('a');
        
        if(nextEvent.length > 0) {
            updateSelectedEvent(nextEvent, components);
        }
    }

    // Dynamic Iframe Height function
    function sendHeightToParent() {
        if (window.parent && window.parent.postMessage) {
            var height = document.body.scrollHeight;
            window.parent.postMessage({ 'height': height }, '*');
        }
    }
});
