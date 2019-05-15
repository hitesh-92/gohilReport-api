## Gohil Report

<br>

Collection of news links

<br>

#### HTTP endpoints

##### Column
Method | Endpoint | Private | Request Body | Response
--- | --- | --- | --- | ---
GET | /column/ | - | - | { left, center, right }
GET | /column/single | - | { title } |  { articles }
POST | /column/ | true | { title }| { createdColumn }
PATCH | /column/:title |  ✓ | { column, ids } | { message }
DELETE | /column/:column |  ✓ | - | { deleted, message }

##### Article
Method | Endpoint | Private | Request Body | Response
--- | --- | --- | --- | ---
GET | /:articleId |  ✓ | - | { article }
POST | /article/ |  ✓ | { title, url } | { createdArticle, articleSaved }
POST | /article/archive |  ✓ | { id } | { archived }
PATCH | /article/:articleId |  ✓ | { title, url, createdAt } | { oldArticle, status }
DELETE | /article/:articleId |  ✓ | - | { deleted, log }


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
- [ ] Complete [management system](https://github.com/hitesh-92/gohilReportManager) with Angular ( priority )
- [ ] User validation / tests for jwt
- [ ] Remove and refactor anonymous functions where appropriate
- [ ] Restructure to include API controllers
- [ ] Add admin authentication
- [ ] Update HTTP routes
- [ ] Add option to attach link to article logs