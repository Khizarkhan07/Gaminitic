async function fetchData(url, id, method) {



    $(document).ready(function() {


        $("#btn-login").attr("disabled", true);

        document.getElementById("btn-login").style.display = "none";

        document.getElementById("btn-spinner").style.display = "block";

    });

    event.preventDefault();

    const formData = document.getElementById(id);
    var body = JSON.stringify(Object.fromEntries(new FormData(formData)));
    console.log(body);
    let response = await fetch("https://gaminatic.hexaadev.com" + url, {
        method: method,
        body,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    });
    let result = await response.json();

    if (response.status >= 400 && response.status < 600) {
        result.errors.forEach((err) => {
            console.log(err.msg)
            $(document).ready(function() {
                $("#btn-login").show();

            });

            document.getElementById("btn-login").style.display = "none";

            document.getElementById("btn-spinner").style.display = "none";
            diplayAlerts(err.msg, "danger");

        });
    } else {

        if (typeof(Storage) !== "undefined") {
            // Store
            const token = result.user.token;
            const _id = result.user._id;
            const name = result.user.name;
            const email = result.user.email;
            const role = result.user.role;
            localStorage.setItem("token", token)
            localStorage.setItem("_id", _id)
            localStorage.setItem("name", name)
            localStorage.setItem("email", email)
            localStorage.setItem("role", role)

            window.location.href= '/disputes'
            // Retrieve

            if(localStorage.getItem("token")){
                var a = document.createElement('a');
                var linkText = document.createTextNode("Logout");
                a.appendChild(linkText);
                a.classList.add("list-group-item")
                a.classList.add("list-group-item-action")
                a.classList.add("bg-light")
                a.href = "https://www.gaminatic.hexaadev.com/login";
                document.getElementById('side-menu').appendChild(a);
            }

            if(localStorage.getItem("name")) {
                // Store
                var Username = localStorage.getItem("name")
                // Retrieve
                document.getElementById("name-tag").innerHTML = "Welcome " + Username;


            }
        }

    }
}



async function postData(url, id, method) {



    /*$(document).ready(function() {


        $("#btn-login").attr("disabled", true);

        document.getElementById("btn-login").style.display = "none";

        document.getElementById("btn-spinner").style.display = "block";

    });*/

    event.preventDefault();

    const formData = document.getElementById(id);
    var body = JSON.stringify(Object.fromEntries(new FormData(formData)));
    console.log(body);
    console.log(localStorage.getItem("token"));
    let response = await fetch("http://localhost:8080" + url, {
        method: method,
        body,
        headers: {
            Accept: "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json",
        },
    });
    let result = await response.json();

    if (response.status >= 400 && response.status < 600) {
        result.errors.forEach((err) => {
            console.log(err.msg)

            diplayAlerts(err.msg, "danger");

        });
    } else {

            // Retrieve
            diplayAlerts("Role assigned successfully", 'success')

    }
}


function diplayAlerts(err, classy){

    $(document).ready(function() {
        document.getElementById("spinner").style.display = "none";
        $("#btn-login").attr("disabled", false);
    });

    let node = document.createElement("p");
    node.setAttribute("class","alert alert-"+classy);
    let t = document.createTextNode(err);
    node.appendChild(t);
    document.getElementById("alert-tab").appendChild(node);
    //setTimeout(function(){ document.getElementById("alert-tab").removeChild(node) }, 5000);
}

function hideme() {
    $(document).ready(function() {

    });
}