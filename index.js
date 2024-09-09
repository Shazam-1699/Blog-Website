import express from "express";
import bodyParser from "body-parser";
import fs from "fs";

const app = express();
const port = 3000;
const currentTitle="";
const currentBlog="";
let blogs = [];
let titles = [];


app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/create", (req, res) => {
    res.render("creation.ejs");
});

app.post("/submit", (req, res) => {
    const title = req.body.authorName;
    const blogData = req.body.blogInput;

    if (!blogData) {
        res.status(400).send("Blog content is required.");
        return;
    }

    fs.readFile('webdata/Blog.json', 'utf-8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            console.error("Error reading Blog.json:", err);
            res.status(500).send("An error occurred while posting the blog.");
            return;
        }

        let blogs = [];
        if (data) {
            try {
                blogs = JSON.parse(data);
            } catch (parseErr) {
                console.error("Error parsing Blog.json:", parseErr);
                res.status(500).send("An error occurred while posting the blog.");
                return;
            }
        }

        fs.readFile('webdata/Titles.json', 'utf-8', (err, data) => {
            if (err && err.code !== 'ENOENT') {
                console.error("Error reading Titles.json:", err);
                res.status(500).send("An error occurred while posting the blog.");
                return;
            }

            let titles = [];
            if (data) {
                try {
                    titles = JSON.parse(data);
                } catch (parseErr) {
                    console.error("Error parsing Titles.json:", parseErr);
                    res.status(500).send("An error occurred while posting the blog.");
                    return;
                }
            }

            blogs.push({ content: blogData });
            titles.push({ content: title });

            fs.writeFile('webdata/Blog.json', JSON.stringify(blogs, null, 2), (err) => {
                if (err) {
                    console.error("Error writing Blog.json:", err);
                    res.status(500).send("An error occurred while posting the blog.");
                    return;
                }

                fs.writeFile('webdata/Titles.json', JSON.stringify(titles, null, 2), (err) => {
                    if (err) {
                        console.error("Error writing Titles.json:", err);
                        res.status(500).send("An error occurred while posting the blog.");
                        return;
                    }

                    res.render("submit.ejs");
                });
            });
        });
    });
});


app.get("/browse", (req, res) => {
    fs.readFile("webdata/Blog.json", "utf-8", (err, blogData) => {
        if (err) {
            console.error("Error reading Blog.json:", err);
            res.status(500).send("Error reading blogs.");
            return;
        }

        try {
            blogs = JSON.parse(blogData);
        } catch (parseErr) {
            console.error("Error parsing Blog.json:", parseErr);
            res.status(500).send("Error parsing blogs.");
            return;
        }

        fs.readFile("webdata/Titles.json", "utf-8", (err, titleData) => {
            if (err) {
                console.error("Error reading Titles.json:", err);
                res.status(500).send("Error reading titles.");
                return;
            }

            try {
                titles = JSON.parse(titleData);
            } catch (parseErr) {
                console.error("Error parsing Titles.json:", parseErr);
                res.status(500).send("Error parsing titles.");
                return;
            }

            res.render("browse.ejs", {
                BlogData: blogs,
                TitleData: titles,
            });
        });
    });
});

app.get("/search", (req, res) => {
    res.render("search.ejs");
});

app.get("/result", (req, res) => {
    const titleName = req.query.titleName; // Retrieve title from query params in GET request
    console.log("Title is:", titleName); 

    fs.readFile("webdata/Blog.json", "utf-8", (err, blogData) => {
        if (err) {
            console.error("Error reading Blog.json:", err);
            res.status(500).send("Error reading blogs.");
            return;
        }

        let blogs;
        try {
            blogs = JSON.parse(blogData);
        } catch (parseErr) {
            console.error("Error parsing Blog.json:", parseErr);
            res.status(500).send("Error parsing blogs.");
            return;
        }

        fs.readFile("webdata/Titles.json", "utf-8", (err, titleData) => {
            if (err) {
                console.error("Error reading Titles.json:", err);
                res.status(500).send("Error reading titles.");
                return;
            }

            let titles;
            try {
                titles = JSON.parse(titleData);
            } catch (parseErr) {
                console.error("Error parsing Titles.json:", parseErr);
                res.status(500).send("Error parsing titles.");
                return;
            }

            let currentTitle = "Title not found";
            let currentBlog = "Blog not found";

            for (let i = 0; i < titles.length && i < blogs.length; i++) {
                if (titles[i].content === titleName) {
                    currentTitle = titles[i].content;
                    currentBlog = blogs[i].content;
                    break;
                }
            }

            res.render("result.ejs", {
                Title: currentTitle,
                Blog: currentBlog,
            });
        });
    });
});

app.get("/about", (req, res) => {
    res.render("about.ejs");
});

app.listen(port, () => {
    console.log(`Server running on port: ${port}.`);
});
