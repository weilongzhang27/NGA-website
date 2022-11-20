const config = require('./config.json')
const mysql = require('mysql');
const e = require('express');


const connection = mysql.createConnection({
    host: config.rds_host,
    user: config.rds_user,
    password: config.rds_password,
    port: config.rds_port,
    database: config.rds_db
});
connection.connect();


// Route 1 (handler)
async function hello(req, res) {
    if (req.query.name) {
        res.send(`Hello, ${req.query.name}! Welcome to the NGA server!`)
    } else {
        res.send(`Hello! Welcome to the NGA server!`)
    }
}

// Route 2 (handler) done
async function all_artworks(req, res) {
    const classification = req.params.classification ? req.params.classification : 'painting'
    const page = req.query.page
    const pagesize = req.query.pagesize ? req.query.pagesize : '10'
    const start = (page - 1) * pagesize

    if (req.query.page && !isNaN(req.query.page)) {
        connection.query(`select DISTINCT o.objectID, o.title as title, o.visualBrowserClassification as classification, o.beginYear as beginYear,o.endYear as endYear, c.forwardDisplayName as artist, c.nationality as nation, c.constituentID, im.iiifThumbURL
        from objects o join objects_constituents oc on o.objectID = oc.objectID join constituents c on c.constituentID = oc.constituentID join published_images im on im.depictstmsobjectid = o.objectID
        where oc.roleType='artist' and o.visualBrowserClassification='${classification}' 
        order by o.title
        LIMIT ${start},${pagesize}`, function (error, results, fields) {

            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        });


    } else {
        connection.query(`select DISTINCT o.objectID, o.title as title, o.visualBrowserClassification as classification, o.beginYear as beginYear,o.endYear as endYear, c.forwardDisplayName as artist, c.nationality as nation, c.constituentID, im.iiifThumbURL
        from objects o join objects_constituents oc on o.objectID = oc.objectID join constituents c on c.constituentID = oc.constituentID join published_images im on im.depictstmsobjectid = o.objectID
        where oc.roleType='artist' and o.visualBrowserClassification='${classification}' 
        order by o.title`, function (error, results, fields) {

            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        });
    }
}

// Route 3 (handler) done
async function all_artists(req, res) {
    const page = req.query.page
    const pagesize = req.query.pagesize ? req.query.pagesize : '10'
    const start = (page - 1) * pagesize

    if (req.query.page && !isNaN(req.query.page)) {
        connection.query(`SELECT constituentID, forwardDisplayName, nationality, constituentType
        FROM constituents
        ORDER BY forwardDisplayName
        LIMIT ${start},${pagesize}`, function (error, results, fields) {

            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        });


    } else {

        connection.query(`SELECT constituentID, forwardDisplayName,nationality,constituentType
        FROM constituents
        ORDER BY forwardDisplayName`, function (error, results, fields) {

            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        });
    }


}

// ********************************************
//             ARTWORK-SPECIFIC ROUTES
// ********************************************

// Route 4 (handler) to do
async function artworkDetail(req, res) {
    const artworkID = req.params.artworkID
    // const page = req.query.page
    // const pagesize = req.query.pagesize ? req.query.pagesize : '10'
    // const start = (page - 1) * pagesize

    var sqlStatement = `select DISTINCT o.objectID, o.visualBrowserClassification as classification, c.forwardDisplayName as artist, c.constituentID, im.iiifThumbURL, l.detail as location, o.visualBrowserTimeSpan, o.creditLine
    from objects o join objects_constituents oc on o.objectID = oc.objectID join constituents c on c.constituentID = oc.constituentID join published_images im on im.depictstmsobjectid = o.objectID left outer join locations l on l.locationID = o.locationID
    where o.objectID = ${artworkID} and oc.roleType='artist'`

    console.log(sqlStatement)

    connection.query(sqlStatement, function (error, results, fields) {

        if (error) {
            console.log(error)
            res.json({ error: error })
        } else if (results) {
            res.json({ results: results })
        }
    });


}

// ********************************************
//            ARTIST-SPECIFIC ROUTES
// ********************************************

// Route 5 (handler) done
async function artist(req, res) {
    const id = req.query.id

    if (req.query.id && !isNaN(req.query.id)) {
        connection.query(`SELECT O.objectID AS artID, O.title AS title, C.constituentID AS artistID, C.forwardDisplayName AS name, C.nationality AS nationality, 
        O.beginYear AS beginYear, O.endYear AS endYear
        FROM objects O
        JOIN objects_constituents O_C ON O.objectID = O_C.objectID
        JOIN constituents C ON O_C.constituentID = C.constituentID 
        WHERE C.constituentID = '${id}'
        ORDER BY O.objectID`, function (error, results, fields) {

            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        });

    } else {
        var array = []
        res.json({ results: array })
    }



}


// ********************************************
//             SEARCH ROUTES
// ********************************************

// Route 6 (handler) to do
async function search_matches(req, res) {
    const home = req.query.Home
    const away = req.query.Away
    const page = req.query.page
    const pagesize = req.query.pagesize ? req.query.pagesize : '10'
    const start = (page - 1) * pagesize

    if (req.query.page && !isNaN(req.query.page)) {
        if (req.query.Home && req.query.Away) {
            var home_conct = '%' + home + '%'
            var away_conct = '%' + away + '%'
            connection.query(`SELECT MatchId, Date, Time, HomeTeam AS Home, AwayTeam AS Away, FullTimeGoalsH AS HomeGoals, FullTimeGoalsA AS AwayGoals
            FROM Matches  
            WHERE HomeTeam LIKE '${home_conct}' and AwayTeam LIKE '${away_conct}'
            ORDER BY HomeTeam, AwayTeam
            LIMIT ${start},${pagesize}`, function (error, results, fields) {
                if (error) {
                    var array = []
                    res.json({ results: array })
                } else if (results) {
                    res.json({ results: results })
                }
            });
        } else if (req.query.Home && !req.query.Away) {
            var home_conct = '%' + home + '%'
            connection.query(`SELECT MatchId, Date, Time, HomeTeam AS Home, AwayTeam AS Away, FullTimeGoalsH AS HomeGoals, FullTimeGoalsA AS AwayGoals
            FROM Matches  
            WHERE HomeTeam LIKE '${home_conct}'
            ORDER BY HomeTeam, AwayTeam
            LIMIT ${start},${pagesize}`, function (error, results, fields) {
                if (error) {
                    var array = []
                    res.json({ results: array })
                } else if (results) {
                    res.json({ results: results })
                }
            });
        } else if (!req.query.Home && req.query.Away) {
            var away_conct = '%' + away + '%'
            connection.query(`SELECT MatchId, Date, Time, HomeTeam AS Home, AwayTeam AS Away, FullTimeGoalsH AS HomeGoals, FullTimeGoalsA AS AwayGoals
            FROM Matches  
            WHERE AwayTeam LIKE '${away_conct}'
            ORDER BY HomeTeam, AwayTeam
            LIMIT ${start},${pagesize}`, function (error, results, fields) {
                if (error) {
                    var array = []
                    res.json({ results: array })
                } else if (results) {
                    res.json({ results: results })
                }
            });
        } else {
            connection.query(`SELECT MatchId, Date, Time, HomeTeam AS Home, AwayTeam AS Away, FullTimeGoalsH AS HomeGoals, FullTimeGoalsA AS AwayGoals
            FROM Matches
            ORDER BY HomeTeam, AwayTeam
            LIMIT ${start},${pagesize}`, function (error, results, fields) {
                if (error) {
                    var array = []
                    res.json({ results: array })
                } else if (results) {
                    res.json({ results: results })
                }
            });
        }


    } else {
        if (req.query.Home && req.query.Away) {
            var home_conct = '%' + home + '%'
            var away_conct = '%' + away + '%'
            connection.query(`SELECT MatchId, Date, Time, HomeTeam AS Home, AwayTeam AS Away, FullTimeGoalsH AS HomeGoals, FullTimeGoalsA AS AwayGoals
            FROM Matches  
            WHERE HomeTeam LIKE '${home_conct}' and AwayTeam LIKE '${away_conct}'
            ORDER BY HomeTeam, AwayTeam`, function (error, results, fields) {
                if (error) {
                    var array = []
                    res.json({ results: array })
                } else if (results) {
                    res.json({ results: results })
                }
            });
        } else if (req.query.Home && !req.query.Away) {
            var home_conct = '%' + home + '%'
            connection.query(`SELECT MatchId, Date, Time, HomeTeam AS Home, AwayTeam AS Away, FullTimeGoalsH AS HomeGoals, FullTimeGoalsA AS AwayGoals
            FROM Matches  
            WHERE HomeTeam LIKE '${home_conct}'
            ORDER BY HomeTeam, AwayTeam`, function (error, results, fields) {
                if (error) {
                    var array = []
                    res.json({ results: array })
                } else if (results) {
                    res.json({ results: results })
                }
            });
        } else if (!req.query.Home && req.query.Away) {
            var away_conct = '%' + away + '%'
            connection.query(`SELECT MatchId, Date, Time, HomeTeam AS Home, AwayTeam AS Away, FullTimeGoalsH AS HomeGoals, FullTimeGoalsA AS AwayGoals
            FROM Matches  
            WHERE AwayTeam LIKE '${away_conct}'
            ORDER BY HomeTeam, AwayTeam`, function (error, results, fields) {
                if (error) {
                    var array = []
                    res.json({ results: array })
                } else if (results) {
                    res.json({ results: results })
                }
            });
        } else {
            connection.query(`SELECT MatchId, Date, Time, HomeTeam AS Home, AwayTeam AS Away, FullTimeGoalsH AS HomeGoals, FullTimeGoalsA AS AwayGoals
            FROM Matches
            ORDER BY HomeTeam, AwayTeam`, function (error, results, fields) {
                if (error) {
                    var array = []
                    res.json({ results: array })
                } else if (results) {
                    res.json({ results: results })
                }
            });
        }
    }


}

// Route 7 (handler) done
async function search_artists(req, res) {
    if (req.query.Name) {
        var name = '%' + req.query.Name + '%'
    } else {
        var name = '%'
    }

    if (req.query.Nationality) {
        var nationality = '%' + req.query.Nationality + '%'
    } else {
        var nationality = '%'
    }

    const page = req.query.page
    const pagesize = req.query.pagesize ? req.query.pagesize : '10'
    const start = (page - 1) * pagesize

    if (req.query.page && !isNaN(req.query.page)) {
        connection.query(`SELECT constituentID, forwardDisplayName, nationality, constituentType
            FROM constituents
            WHERE forwardDisplayName LIKE '${name}' and
            nationality LIKE '${nationality}'
            ORDER BY constituentID
            LIMIT ${start},${pagesize}`, function (error, results, fields) {
            if (error) {
                var array = []
                res.json({ results: array })
            } else if (results) {
                res.json({ results: results })
            }
        });


    } else {

        connection.query(`SELECT constituentID, forwardDisplayName, nationality, constituentType
            FROM constituents
            WHERE forwardDisplayName LIKE '${name}' and
            nationality LIKE '${nationality}'
            ORDER BY constituentID`, function (error, results, fields) {
            if (error) {
                var array = []
                res.json({ results: array })
            } else if (results) {
                res.json({ results: results })
            }
        });

    }



}

module.exports = {
    hello,
    all_artworks,
    all_artists,
    artworkDetail: artworkDetail,
    artist,
    search_matches,
    search_artists
}