
const url = require("url");
const oauth2 = require("../discord_oauth2.js");
const webSessionsStore = require("../web_sessions_store.js");


exports.set = (expressApp) => 
{
    expressApp.get("/login", (req, res) =>
    {
        const urlObject = url.parse(req.url, true);

        oauth2.authenticate(urlObject)
        .then((userInfo) => 
        {
            const userId = userInfo.id;
            const sessionToken = webSessionsStore.createSession(userId);
            console.log(`Authenticated! userId: ${userId}, token: ${sessionToken}`);

            res.render("user_home.ejs", { userData: {
                token: sessionToken, 
                userId 
            } });
        })
        .catch((err) => res.send(`Error occurred: ${err.message}`));
    });
};