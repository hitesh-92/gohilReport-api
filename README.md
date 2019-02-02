#GohilReport REST API


##User Routes

_/signup_
####REQ
POST body:{email, password}
####RES
status:200, {email, added: true}
status:400, {email, added: false, error}

_/login_
####REQ
POST body: {email, password}
####RES
status:200, {loggedIn:true}, header:{'x-auth':jwt}
status:400, {loggedIn:false}


##Article Routes

_/_
####REQ
GET -
####RES
status:200, {message:'working}

_/:articleId_
####REQ
GET body: {articleId}
####RES
status:200 {articleId, time, found:true, data:articleLog}
status:404 {articleId, time, found:false, data:articleLog}
status:500 {articleId, time, found: undefined, data:articleLog, error, status}

_/_
####REQ
POST body:{title, url}
####RES
status:201 {createdArticle:articleLog, articleSaved:true}
status:400 {createdArticle:null, articleSaved:false, error}

_/:articleId_
####REQ
DELETE body:{articleId}
####RES
status:200 {deleted:true, log:articleLog}
status:404 {delted:false, error:String}
status:501 {deleted:false, error}


##Column Routes
columns: left, center, right

_/_
####REQ
GET -
####RES
status:200 {message:String}

_/:column_
####REQ
GET body:{column}
####RES
status:200 {error:false, articles:articleLogs, columnData, requestedColumn, time, requestedColumn}
status:400 {error:true, message:String, requestedColumn, time, requestedColumn}

_/_
####REQ
POST body:{title, articleIDs:Array}
####RES
status:200 {createdColumn, message:String, title, articleIDs, time}
status:400 {error:{title||&&articleIDs}, title, articleIDs, message}

_/:column_
####REQ
PATCH body:{column, ids}
####RES
status:200 {message, columnSelected, columnArticlesToEnter}
status:400 {error.articleIDs}
status:404 {}