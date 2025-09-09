// https://www.sitepoint.com/url-parameters-jquery/
urlParam = function(name){
    const results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
        return null;
    }
    else{
        return decodeURIComponent(results[1]) || 0;
    }
}

populateTrackerInfo = function(json) {
    $("#tracker-type").text(json.tracker.type);

    const tracker_uri = $("#tracker-uri");
    tracker_uri.attr("href", json.tracker.uri);
    tracker_uri.text(json.tracker.uri);

    $("#tracker-user-name").text(json.tracker.user_name);
}

populateNotes = function(json) {
    // leave if there are no notes
    if ((! ("notes" in json)) ||
        (Object.keys(json.notes).length === 0)) {
        return;
    }
    
    let ul = $('<ul></ul>');
    for (let idx in json.notes) {
        let note = json.notes[idx];
        console.log(note);
        let li = $('<li>'+note+'</li>');
        console.log(li);
        ul.append(li);
        console.log(ul);
    }
    
    $("#notes").append(ul);
    $("#notes").addClass("notes");
}

let assignees = {}
populateAssignees = function(json) {
    assignees = {}

    assignees[0] = {
        name: "unassigned",
        type: "unassigned",
        active: false
    };

    assignees[json.tracker.user_local_id] = {
        name: json.tracker.user_name,
        type: "user",
        active: true
    };

    for (let id in json.groups) {
        assignees[id] = {
            name: json.groups[id].name,
            type: "group",
            active: false
        };

    }
    
    // create dummy groups for unknown assignees
    for (let i in json.actionable) {
        let a = json.actionable[i];
        let issue = json.issues[a];
        let author_id = issue.assigned_to ? issue.assigned_to : 0;

        if (! (author_id in assignees)) {
            assignees[author_id] = {
                name: "Group " + author_id,
                type: "group",
                active: false
            }
        }
    }

    $("#assignees").empty();
    for (let id in assignees) {
        let div = $("<div></div>").html(assignees[id].name);
        div.addClass(assignees[id].type);
        div.addClass("unused");
        if (assignees[id].active) {
            div.addClass("active");
        }
        div.attr("assg", id);

        $("#assignees").append(div);
        assignees[id]['div'] = div;

        div.click(function(event) {
            if (! $(this).hasClass("unused") ){
                var assg = div.attr("assg");
                assignees[assg].active = ! assignees[assg].active;

                if (assignees[assg].active)
                    $(this).addClass("active");
                else
                    $(this).removeClass("active");

                updateActionableVisibility();
            }

            event.preventDefault();
        });
    }
}

let projects = {};
let projectDivs = {};
renderProjects = function(json) {
    projects = {}
    projectDivs = {}

    for (let id in json.projects) {
        projects[id] = json.projects[id];
    }

    for (let pId in projects) {
        const p = projects[pId];

        const pDiv = $('<div class="project"></div>');

        let title = $(`
            <a href="`+p.uri+`" target="_new"><span class="title">`+p.name+`</span></a>
        `);
        pDiv.append(title);

        projectDivs[p.local_id] = pDiv;
    }
}

renderActionable = function(issue) {
    let md = new Remarkable();
    
    let actionable = $('<div class="actionable"></div>');

    const pDiv = projectDivs[issue.project_local_id];
    actionable.append(pDiv.clone());

    let title = $(`
    <div class="title">
    <span><a href="`+issue.uri+`" class="issue" target="_new">#`+issue.local_id+`</a></span>
    <span>`+issue.subject+`</span>
    </div>
    `);
    actionable.append(title);

    let meta = $('<div class="meta"></div>')
    actionable.append(meta);

    let author_id = issue.assigned_to ? issue.assigned_to : 0;

    {
        let author = $("<span></span>");
        author.html(assignees[author_id]['name']);
        author.addClass(assignees[author_id].type);

        meta.append(author);

        assignees[author_id].div.removeClass("unused");
    }

    if (issue.deadline) {
        let deadline = $("<span></span>")
        deadline.addClass("deadline");
        deadline.html(issue.deadline)
        meta.append(deadline);
    }

    if (issue.description) {
        let desc = $('<div class="details"></div>');
        desc.html(md.render(issue.description));
        actionable.append(desc);
    }

    actionable.hide();
   
    return actionable;
}

let issues = {}
populateActionables = function(json) {
    let md = new Remarkable();

    issues = {}
    for (let id in json.issues) {
        issues[id] = json.issues[id];
    }


    let ul = $("#actionables").empty();
    for (let i in json.actionable) {
        let a = json.actionable[i];
        let issue = issues[a];

        const actionable = renderActionable(issue);
        issues[a].div = actionable;

        $("#actionables").append(actionable);
    }

    updateActionableVisibility();
}

populateResult = function(json) {
    renderProjects(json)
    populateTrackerInfo(json)
    populateNotes(json)
    populateAssignees(json)
    populateActionables(json)
}

updateActionableVisibility = function() {
    for (let i in issues) {
        const issue = issues[i];
        if (! issue.div)
            continue;

        let assignee_id = issue.assigned_to ? issue.assigned_to : 0;

        if (assignees[assignee_id].active) {
            issue.div.show("slow");
        } else {
            issue.div.hide("slow");
        }
    }
}

displayError = function(xhr, status, errorThrown) {
    $("#errors").prepend(`
    <div class="error">
    <span class="status">`+status+" "+xhr.status+`:</span>
    <span class="message">`+errorThrown+`</span>
    </div>
    `);
}

clearErrors = function() {
    $("#errors").empty();
}

loadActionables = function(url, apikey, service) {
    clearErrors();
    $.ajax({
        url: service,
        data: {
            url: url,
            apikey: apikey
        },
        type: "GET",
        dataType: "json"
    })
    .done(function(json) {
        populateResult(json);
    })
    .fail(function(xhr, status, errorThrown) {
        displayError(xhr, status, errorThrown);
        console.log( "Error: " + errorThrown );
        console.log( "Status: " + status );
        console.dir( xhr );
    })
    .always(function(xhr, status) {
        console.log("AJAX complete.");
    });
}

setLink = function(type, url) {
    const el = $('#' + type + '-link-url');
    const cp = $('#' + type + '-link-copy');

    if (url) {
        el.attr("href", url);
        el.removeClass("disabled");
        cp.attr("href", "javascript:copyToClipboard('"+type+"');");
        cp.css('visibility', 'visible');
    } else {
        el.removeAttr("href");
        el.addClass("disabled");
        cp.removeAttr("href");
        cp.css('visibility', 'hidden');
    }
}

getAbsolutePath = function() {
    // https://stackoverflow.com/a/2864169/3888050
    const loc = window.location;
    const pathName = loc.pathname.substring(0, loc.pathname.lastIndexOf('/') + 1);
    return loc.href.substring(0, loc.href.length - ((loc.pathname + loc.search + loc.hash).length - pathName.length));
}


populateLinks = function(url, apikey) {
    const path = getAbsolutePath();

    if (url) {
        const shareLink = path + '?url=' + encodeURIComponent(url);
        setLink('share', shareLink);

        if (apikey) {
            const personalLink = path + '?url=' + encodeURIComponent(url) + '&apikey=' + encodeURIComponent(apikey);
            setLink('personal', personalLink);
        } else {
            setLink('personal', null);
        }
    } else {
        setLink('share', null);
    }
}

copyToClipboard = function(type) {
    const el = $('#' + type + '-link-url');
    navigator.clipboard.writeText(el.attr("href"));
}

configAvailable = function(config) {
    const service = config.ACTIONABLES_URL;
    console.log("Using actionable service at " + service);

    let url = urlParam('url');
    let apikey = urlParam('apikey');
    populateLinks(url, apikey);

    $("#callparams [name='tr_tracker']").val(url)
    $("#callparams [name='tr_apikey']").val(apikey)

    loadActionables(url, apikey, service);

    $("#load").click(function(event) {
        let url = $("#callparams [name='tr_tracker']").val()
        let apikey = $("#callparams [name='tr_apikey']").val()
        populateLinks(url, apikey);

        loadActionables(url, apikey, service);

        event.preventDefault();
    });
}

$( document ).ready(function() {
    // load configuration
    $.getJSON("/config.json", configAvailable).
    fail(function(xhr, status, errorThrown) {
        console.log("Failed to load configuration!");
        displayError(xhr, status, errorThrown);
    });
});
