## Gohil Report

<br>

Collection of news articles used for reference

<br>

#### HTTP endpoints

##### Column
Method | Endpoint | Private | Request Body | Response
--- | --- | --- | --- | ---
GET | /column/ | - | - | { left, center, right }
GET | /column/:title | - | - |  { articles }
POST | /column/ | true | { title, articleIDs }| { createdColumn }
PATCH | /column/:title | true | { column, ids } | { message }
DELETE | /column/:column | true | - | { deleted, message }

##### Article
Method | Endpoint | Private | Request Body | Response
--- | --- | --- | --- | ---
GET | /:articleId | true | - | { article }
POST | /article/ | true | { title, url } | { createdArticle, articleSaved }
POST | /article/archive | true | { id } | { archived }
PATCH | /article/:articleId | true | { title, url, createdAt } | { oldArticle, status }
DELETE | /article/:articleId | true | - | { deleted, log }


##### User
Method | Endpoint | Private | Request Body | Response
--- | --- | --- | --- | ---
POST | /user/signup | - | { email, password } | { email, added }
POST | /user/login | - | { email, password } | { loggedIn }

NOTE: login response header contains jwt

<br>

##### Config local server
Requiremnts:
* NodeJS
* MongoDB + client

add config file: ```server/config.json```
```json
{
    "development": {
      "PORT": 8000,
      "MONGODB_URI": "mongodb://localhost:27017/gReport",
      "jwtSecret": "jwtSecret"
    },
    "test": {
      "PORT": 8080,
      "MONGODB_URI": "mongodb://localhost:27017/gReportTest",
      "jwtSecret": "jwtSecretTest"
}
```

Run local server:
```
node start
```

<br>

##### TODO
- [ ] Complete frontend for management system with Angular ( priority )
- [ ] User validation / tests for jwt