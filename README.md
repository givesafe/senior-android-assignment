# Samaritan Android Developer Assignment

## Description

Create an app that simulates some of the functionalities of the successful mobile game PokemonGO using the official Android SDK and its frameworks.

The goal of this assignment is to test your abilities, knowledge and skills of the Android SDK so for the sake of time you don't need to create any 3D rendering models nor use any Game development SDK like Unity, Unreal or Android Game SDK, remember you are building an App not a game.

Make sure to use git a Source Code Version Manager and make a different commit for each of milestone and leave very descriptive commit messages.

You can use either github/gitlab/bitbucket as hosting service for git, make sure the repository is public to avoid any permissions issues.

App Metrics are not a requirement however they are encourage and huge plus

❗ **NOTE:** All code must be implemented using kotlin

## General Technical Specs

1. Create all the necesary repository and models classes to be able to fetch data from the pokemon API [The open Pokemon API](https://pokeapi.co/) using Retro fit and RxJava Plugin.
2. Use JetPacks ViewModel class to load data from your Repositories into LiveData attributes the UI can listen and react to changes
3. The entire project should only have 2 Activities.
   - The first and main One should have a ViewPager Component with four pages, the user should be able to change pages using either the controls in the upper part or swiping right or left, when the page change each controll should indicate the current page the exact same way is defined in the UI.
   - The second one is a detail view of the pokemon data, the user should be redirected from any of the points indicated in the wireframe.
4. Use Room ORM to store locally the data coming from [Open Pokemon API](https://pokeapi.co/docs/v2) since for some of the features we will be using a secondary API which only retrieves the id of the pokemon in the [Open Pokemon API](https://pokeapi.co/docs/v2) and the name given to the pokemon at the moment of the capture, so to avoid making to much http calls and improve the UX you'll need to cache the details of a pokemon
5. The entire project should include unit, integration and UI tests for the different classes, fragments and/or activities implemented

## Accessing Samaritan's assignment endpoints

- Parts of the assignment will require you to access a set of Firebase cloud function endpoints built specifically for this assignment.
- Samaritan's Assignment API base URL will be provided in an email correspondence.
- Samaritan's Assignment API endpoints require a authorization token to access.
- fetch a token from `POST https://{URL}/token?email={email}` and set that as your authorization Bearer token for all requests
  - you will be given the query email in an email correspondence.
  - set the header thusly: `Authorization: Bearer {token}`

## Wireframe Descriptions

### Explore

1. This screen is a MapView that displays random pokemons in random places in the map using the provided pokeball asset.
2. The pokemons should should appear as the map moves or changes its scale and when click the pokeball asset it should redirect to the **Wild Pokemon Detail Screen**
3. To load the pokemons you can make use of the [Open Pokemon API](https://pokeapi.co/docs/v2)
4. The UI should look something similar to this wireframe

![Explore Wireframe](https://github.com/givesafe/senior-android-assignment/blob/main/Explore.png?raw=true)

### Community

1. This screen displays the activity related to all the trainers that use the, it is grouped into two categories using horizontal recycler views.
2. Each element of the list should be redirected to **Captured by Other Detail Screen**
3. To load the data for this screen use the endpoint

`GET https://{URL}/activity`

**Response:**

```json
{
  "friends": [
    {
      "pokemon": {
        "id": 1,
        "name": "Bulbasaur",
        "captured_at": "2021-05-08T13:43:27-06:00"
      },
      "name": "Fake Trainer 1"
    },
    ....
  ],
  "foes": [
    {
      "pokemon": {
        "id": 1,
        "name": "Bulbasaur",
        "captured_at": "2021-05-08T13:43:27-06:00"
      },
      "name": "Fake Trainer 1"
    },
    ....
  ]
}
```

![Comunity](https://github.com/givesafe/senior-android-assignment/blob/main/Community.png?raw=true)

#### My Team

1. This screen displays the actual team of the trainer.
2. Each element of the list should be redirected to **Captured Pokemon Detail Screen**
3. The primary source for this data set should be Local Storage, make sure to use Room ORM to retrieve the data
4. The sencondary source for this data set is the endpoint described bellow, which should be used only when the team is not found locally

`GET https://{URL}/my-team`

**Response:**

```json
{
  "my-team": [
    {
      "id": 1,
      "name": "Bulbasaur",
      "captured_at": "2021-05-08T13:43:27-06:00",
      "captured_lat_at": 23.894940373,
      "captured_long_at": 23.894940373
    },
    {
      "id": 2,
      "name": "Bulbasaur",
      "captured_at": "2021-05-08T13:43:27-06:00",
      "captured_lat_at": 23.894940373,
      "captured_long_at": 23.894940373
    },
    {
      "id":3,
      "name": "Bulbasaur",
      "captured_at": "2021-05-08T13:43:27-06:00",
      "captured_lat_at": 23.894940373,
      "captured_long_at": 23.894940373
    }
    ....
  ]
}
```

![My Team](https://github.com/givesafe/senior-android-assignment/blob/main/My%20Team.png?raw=true)

### Captured

1. This screen displays all the captured pokemons thar are stored in your cloud.
2. Each element of the list should be redirected to **Captured Pokemon Detail Screen**
3. The data set should be displayed in a `RecyclerView` using `GridLayoutManager`
4. The source for this data set is the endpoint described bellow, which should be used only when the team is not found locally

`GET https://{URL}/captured`

**Response:**

```json
{
  "captured": [
    {
      "id": 1,
      "name": "Bulbasaur",
      "captured_at": "2021-05-08T13:43:27-06:00",
      "captured_lat_at": 23.894940373,
      "captured_long_at": 23.894940373
    },
    {
      "id": 2,
      "name": "Bulbasaur",
      "captured_at": "2021-05-08T13:43:27-06:00",
      "captured_lat_at": 23.894940373,
      "captured_long_at": 23.894940373
    },
    {
      "id":3,
      "name": "Bulbasaur",
      "captured_at": "2021-05-08T13:43:27-06:00",
      "captured_lat_at": 23.894940373,
      "captured_long_at": 23.894940373
    }
    ....
  ]
}
```

![Captured](https://github.com/givesafe/senior-android-assignment/blob/main/Captured.png?raw=true)

### Pokemon Detail

This should be a different `Activity` that can be initialized with a parametter that can take three different values and change the behavior of the UI Components

- **WILD**
  - This indicates that the detail view is for a pokemon found in the wild
  - Displays Capture Button
  - Hides small pokeball in Collapable Toolbar
  - It should show the geolocation where it was found
  - When Capture Button is clicked
    - Display a modal dialog asking for a name, if a name is given send that name as part of the Request Body if not, use the default name (the one obtained from [Open Pokemon API](https://pokeapi.co/docs/v2))
    - Send a `POST``request to the backend services to indicate the pokemon was captured check the API docs bellow for more information about the request body and response
  - After the `POST``request is done successfully, the pokemon should be stored in the local team using Room and it should show an animation using the pokeball asset
- **CAPTURED**
  - This indicates that the detail views is for a captured pokemon either in you local team or in your cloud storage
  - Hides Capture Button
  - Shoes small pokeball in Collapable Toolbar
  - It should show the geolocation where it was captured
- **CAPTURED_BY_OTHER**
  - This indicates that the detail views is for pokemon captured from other trainer (Friend or Foe)
  - Hides Capture Button
  - Hides small pokeball in Collapable Toolbar
  - It should the pictured and named of the trainer who captured it

`POST https://{URL}/capture`

**Request Body:**

```json
{
  "pokemon": {
    "id": 1,
    "name": "Bulbasaur",
    "lat": 23.567775654,
    "long": 23.498484802
  }
}
```

**Response:**

```json
{
  "success": true
}
```

![Pokemon Detail View](https://github.com/givesafe/senior-android-assignment/blob/main/Pokemon%20Detail.png?raw=true)

## Other Endpoints

### `POST https://{URL}/token?email={email}`

- you will be provided an email address to use
- endpoint returns a jwt valid for 1h
- the returned token should be set as Authorization header bearer token for access to all other endpoints.

#### response

```json
{
  "token": "generated jwt access token",
  "expiresAt: 1231535135 // milliseconds since epoch
}

```

### `DELETE https://{URL}/release?id={id}`

- use this endpoint to delete pokemon off your captured list.
- use this endpoint for debugging/development needs.

#### response

```json
{
  "success": true
}
```
