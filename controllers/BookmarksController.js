const Repository = require('../models/Repository');

module.exports = class BookmarksController extends require("./Controller.js") {
    constructor(req, res) {
        super(req, res);
        this.bookmarksRepository = new Repository('Bookmarks');
    }
    error(params, message) {
        params["error"] = message;
        this.response.JSON(params);
        return false;
    }

    result(params, value) {
        if (value === Infinity) value = "Infinity";
        if (isNaN(value)) value = "NaN";
        params["value"] = value;
        this.response.JSON(params);
    }
    operations(params) {
        let allBm = [];
        let bm = [];
        if ("sort" in params) {
            switch (params.sort) {
                case 'name':
                    allBm = this.bookmarksRepository.getAll();
                    allBm.sort((a, b) => {
                        //console.log(a.Name);
                        return (a.Name > b.Name) ? 1 : -1
                    })
                    this.response.JSON(allBm);
                    break;
                case 'category':
                    allBm = this.bookmarksRepository.getAll();
                    allBm.sort((a, b) => {
                        //console.log(a.Name);
                        return (a.Category > b.Category) ? -1 : 1
                    })
                    this.response.JSON(allBm);
                    break;
            }
        }
        if ("name" in params) {
            allBm = this.bookmarksRepository.getAll();
            let name = null;
            if (/\*$/.test(params["name"])) {    //name = ab*
                //console.log("1")
                name = params["name"].slice(0, -1);
                //console.log(name);
                for (let bookmark of allBm) {
                    if (bookmark.Name.startsWith(name))
                        bm.push(bookmark);
                }
            }
            else if (/^\*/.test(params["name"])) {    //name = *ab
                //console.log("2");
                name = params["name"].slice(1);
                for (let bookmark of allBm) {
                    if (bookmark.Name.endsWith(name))
                        bm.push(bookmark);
                }
            }
            else {
                for (let bookmark of allBm) {
                    if (bookmark.Name == params["name"])
                        bm.push(bookmark);
                }
            }
            this.response.JSON(bm);
        }
        if ("category" in params) {
            allBm = this.bookmarksRepository.getAll();
            for (let bookmark of allBm) {
                console.log(bookmark);
                if (bookmark.Category == params["category"])
                    bm.push(bookmark);
            }
            this.response.JSON(bm);
        }
    }
    help() {
        // expose all the possible query strings
        let content = "<div style=font-family:arial>";
        content += "<h3>GET : api/bookmarks endpoint  <br> List of possible query strings:</h3><hr>";
        content += "<h4>? sort = \"name\" <br>return {tous les bookmarks tries ascendant par Name}</h4>";
        content += "<h4>? sort = \"category\" <br>return {tous les bookmarks tries descendant par Category}</h4>";
        content += "<h4>? name = \"nom\" <br>return {le bookmark avec Name = nom}</h4>";
        content += "<h4>? name = \"ab*\" <br>return {tous les bookmarks avec Name commancant par ab}</h4>";
        content += "<h4>? category = \"sport\" <br>return {le bookmark avec Category = sport}</h4>";
        this.res.writeHead(200, { 'content-type': 'text/html' });
        this.res.end(content) + "</div>";

        //content += "<h4>? op = + & x = number & y = number <br>return {\"op\":\"+\", \"x\":number, \"y\":number, \"value\": x + y} </h4>";
    }
    get(id) {
        if (!isNaN(id))
            this.response.JSON(this.bookmarksRepository.get(id));
        else {
            let params = this.getQueryStringParams();
            if (params == null) 
                this.response.JSON(this.bookmarksRepository.getAll());
            else{
                // if we have no parameter, expose the list of possible query strings
                if (Object.keys(params).length === 0) {
                    this.help();
                } else {
                    this.operations(params);
                }
            }
        }

    }
    post(bookmark) {
        // todo : validate cour before insertion
        // todo : avoid duplicates
        let newBookmark = this.bookmarksRepository.add(bookmark);
        if (newBookmark)
            this.response.created(newBookmark);
        else
            this.response.internalError();
    }
    put(bookmark) {
        // todo : validate contact before updating
        if (this.bookmarksRepository.update(bookmark))
            this.response.ok();
        else
            this.response.notFound();
    }
    remove(id) {
        if (this.bookmarksRepository.remove(id))
            this.response.accepted();
        else
            this.response.notFound();
    }
}