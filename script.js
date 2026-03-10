jQuery(document).ready(function($){
    var timelines = $('.cd-horizontal-timeline'),
        eventsMinDistance = 60; // Minimum distance in pixels between dates

    if(timelines.length > 0) initTimeline(timelines);

    function initTimeline(timelines) {
        timelines.each(function(){
            var timeline = $(this),
                timelineComponents = {};
            
            timelineComponents['timelineWrapper'] = timeline.find('.events-wrapper');
            timelineComponents['eventsWrapper'] = timelineComponents['timelineWrapper'].children('.events');
            timelineComponents['fillingLine'] = timelineComponents['eventsWrapper'].children('.filling-line');
            timelineComponents['timelineEvents'] = timelineComponents['eventsWrapper'].find('a');
            timelineComponents['timelineDates'] = parseDate(timelineComponents['timelineEvents']);
            timelineComponents['eventsMinLapse'] = minLapse(timelineComponents['timelineDates']);
            timelineComponents['timelineNavigation'] = timeline.find('.cd-timeline-navigation');
            timelineComponents['eventsContent'] = timeline.children('.events-content');

            // Set positions based on date distance
            setPosition(timelineComponents, eventsMinDistance);
            var timelineTotalWidth = setTimelineWidth(timelineComponents, eventsMinDistance);
            timeline.addClass('loaded');

            // Navigation clicks
            timelineComponents['timelineEvents'].on('click', function(event){
                event.preventDefault();
                var selectedItem = $(this);
                selectNewEvent(selectedItem, timelineComponents);
            });

            // Arrow navigation
            timelineComponents['timelineNavigation'].on('click', '.next', function(event){
                event.preventDefault();
                updateTimelinePosition(timelineComponents, timelineTotalWidth, 'next');
            });

            timelineComponents['timelineNavigation'].on('click', '.prev', function(event){
                event.preventDefault();
                updateTimelinePosition(timelineComponents, timelineTotalWidth, 'prev');
            });
        });
    }

    function selectNewEvent(element, components) {
        var eventDate = element.data('date'),
            visibleContent = components['eventsContent'].find('.selected'),
            selectedContent = components['eventsContent'].find('[data-date="'+ eventDate +'"]');
        
        visibleContent.removeClass('selected');
        selectedContent.addClass('selected');
        components['timelineEvents'].removeClass('selected');
        element.addClass('selected');
        updateFillingLine(element, components['fillingLine'], components['eventsWrapper'].width());
    }

    function updateFillingLine(selectedEvent, fillingLine, totalWidth) {
        var eventLeft = parseFloat(selectedEvent.css('left')) + selectedEvent.width()/2;
        var scaleValue = eventLeft/totalWidth;
        fillingLine.css('transform', 'scaleX(' + scaleValue + ')');
    }

    function parseDate(events) {
        var dateArrays = [];
        events.each(function(){
            var dateComp = $(this).data('date').split('/'),
                newDate = new Date(dateComp[2], dateComp[1]-1, dateComp[0]);
            dateArrays.push(newDate);
        });
        return dateArrays;
    }

    function minLapse(dates) {
        var dateDistances = [];
        for (i = 1; i < dates.length; i++) { 
            var distance = Math.abs(dates[i] - dates[i-1]);
            dateDistances.push(distance);
        }
        return Math.min.apply(null, dateDistances);
    }

    function setPosition(components, min) {
        for (i = 0; i < components['timelineEvents'].length; i++) { 
            var distance = i * 120; // Default spacing
            components['timelineEvents'].eq(i).css('left', distance+'px');
        }
    }

    function setTimelineWidth(components, width) {
        var totalWidth = (components['timelineEvents'].length) * 120;
        components['eventsWrapper'].css('width', totalWidth+'px');
        updateFillingLine(components['timelineEvents'].filter('.selected'), components['fillingLine'], totalWidth);
        return totalWidth;
    }
});
