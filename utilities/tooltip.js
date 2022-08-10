function showTooltip(x, y, text) {
    //var title = this.title;
    //this.title = '';
    //this.setAttribute("tooltip", title);
    var tooltipWrap = document.createElement("div"); //creates div
    tooltipWrap.className = 'tooltip'; //adds class
    const rows = text.split(/\r?\n/);
    for (var i = 0; i < rows.length; ++i) {
        tooltipWrap.appendChild(document.createTextNode(rows[i])); //add the text node to the newly created div.
        if (i != rows.length - 1)
            tooltipWrap.appendChild(document.createElement('br'));
    }
    var firstChild = document.body.firstChild;//gets the first elem after body
    firstChild.parentNode.insertBefore(tooltipWrap, firstChild); //adds tt before elem 
    var margin = 10;
    var wnd = getModuleWnd();
    if (wnd) {
        var wnd_rectangle = wnd.getBoundingClientRect();
        y = wnd_rectangle.y + wnd_rectangle.height - y;
        x += wnd_rectangle.x;
    }
    var tooltipWidth = tooltipWrap.offsetWidth;
    var tooltipHeight = tooltipWrap.offsetHeight;
    var left = x + margin;
    var top = y + margin;    
    if (left + tooltipWidth > document.documentElement.clientWidth) {
        left = x - tooltipWidth - margin ;
    }
    if (left < 0) {
        left = x + margin;
    }
    if (top + tooltipHeight > document.documentElement.clientHeight) {
        top = y - tooltipHeight - margin;
    }
    if (top < 0) {
        top = y + margin;
    }
    tooltipWrap.setAttribute('style', 'top:' + top + 'px;' + 'left:' + left + 'px;');
}

function hideTooltip()
{
    //var title = this.getAttribute("tooltip");
    //this.title = title;
    //this.removeAttribute("tooltip");
    var selector = document.querySelector(".tooltip");
    if (selector)
    {
        selector.remove();
    }
}