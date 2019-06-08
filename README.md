## Gohil Report

<br>

Collection of news links

<br>

#### HTTP endpoints

##### Column
Method | Endpoint | Auth | Request Body | Response
--- | --- | --- | --- | ---
GET | /column/ | - | - | { left, center, right }
GET | /column/single | - | { title } |  { articles }
POST | /column/ | ✓ | { title }| { createdColumn }
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
```javascript
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


##### TODO
- [ ] Complete [management system](https://github.com/hitesh-92/gohilReportManager) with Angular ( priority )
- [ ] Remove and refactor anonymous functions where appropriate ( easier debug )
- [ ] Add admin authentication
- [ ] Update ReadMe HTTP routes
- [ ] Add option to attach image link to article log
- [ ] Update article log patch to allow for image url edits
- [ ] Add GraphQL
- [ ] Set up docker container
- [ ] Add in logger ( monitor activity )
- [ ] Set up inital db structure
