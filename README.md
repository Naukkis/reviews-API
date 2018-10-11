# reviews-API

API:

| method        | url           | parameters  |
| ------------- |:-------------:| -----:|
|POST      | /auth/register     | username, password       |
|GET       | /artists/         | Optional: name             |
|GET       | /albums/          | Optional: name             |
|GET       | /latest/          |                            |
|GET       | /reviewer/        | name                       |
|GET       | /reviews/between/ | start, end                 |
|POST      | /save-review/     | text, album, artist, token |
|DELETE    | /reviews/         | reviewID, token            |
