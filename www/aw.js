// https://www.sitepoint.com/url-parameters-jquery/
urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
        return null;
    }
    else{
        return decodeURIComponent(results[1]) || 0;
    }
}

populateTrackerInfo = function(json) {
    $("#tracker").html(`
    <table>
    <tr><th>Type: </th><td>`+json.tracker.type+`</td></tr>
    <tr><th>URI: </th><td><a href="`+json.tracker.uri+`" target="_new">`+json.tracker.uri+`</a></td></tr>
    <tr><th>User Name: </th><td>`+json.tracker.user_name+`</td></tr>
    </table>
    `);
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

    for (var id in json.groups) {
        assignees[id] = {
            name: json.groups[id].name,
            type: "group",
            active: false
        };

    }

    $("#assignees").empty();
    for (id in assignees) {
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

let issues = {}
populateActionables = function(json) {
    let md = new Remarkable();

    issues = {}
    for (var id in json.issues) {
        issues[id] = json.issues[id];
    }


    let ul = $("#actionables").empty();
    for (var i in json.actionable) {
        let a = json.actionable[i];
        let issue = issues[a];

        let actionable = $('<div class="actionable"></div>');


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

        $("#actionables").append(actionable);
        issues[a].div = actionable;
    }

    updateActionableVisibility();
}

populateResult = function(json) {
    populateTrackerInfo(json)
    populateAssignees(json)
    populateActionables(json)
}

updateActionableVisibility = function() {
    for (var i in issues) {
        let issue = issues[i];
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

loadActionables = function(url, apikey) {
    clearErrors();
    $.ajax({
        url: "https://redmine-ac.pingtech.de/v0/redmine/actionables",
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

$( document ).ready(function() {
    let url = urlParam('url');
    let apikey = urlParam('apikey');

    $("#callparams [name='tr_tracker']").val(url)
    $("#callparams [name='tr_apikey']").val(apikey)

    loadActionables(url, apikey);

    $("#load").click(function(event) {
        let url = $("#callparams [name='tr_tracker']").val()
        let apikey = $("#callparams [name='tr_apikey']").val()

        var newurl = '?url='+encodeURIComponent(url)+ '&apikey='+encodeURIComponent(apikey);
        window.history.pushState({}, '', newurl);

        loadActionables(url, apikey);

        event.preventDefault();
    });

});
