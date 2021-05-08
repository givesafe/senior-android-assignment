# Samaritan Android Developer Assignment

## Description
Create an app that simulates some of the functionalities of the successfull mobile game PokemonGO using the official Android SDK and its frameworks.

The goal of this assignment is to test your abilities, knowlege and skills of the Adroid SDK so for the sake of time you don't need to create any 3D rendiring models nor use any Game development SDK like Unity, Unreal or Android Game SDK, remember you are building an App not a game.

Make sure to use git a Source Code Version Manager and make a different commit for each of milestone and leave very descriptive commit messages.

You can use either github/gitlab/bitbucket as hosting service for git, make sure the repository is public to avoid any permissions issues.

App Stetics are not a requirement however they are encourage and huge plus

**NOTE:** All code must be implemented using kotlin

## Genral Technical Specs
1. Create all the necesary repository and models classes to be able to fetch data from the pokemon API [The open Pokemon API](https://pokeapi.co/) using Retro fit and RxJava Plugin.
2. Use JetPacks ViewModel class to load data from your Repositories into LiveData attributes the UI can listen and react to changes
3. The entire project should only have 2 Activities.
    - The first and main One should have a ViewPager Component with four pages, the user should be able to change pages using either the controls in the upper part or swiping right or left, when the page change each controll should indicate the current page the exact same way is defined in the UI.
    - The second one is a detail view of the pokemon data, the user should be redirected from any of the points indicated in the wireframe, take special considerati
4. The entire project should include unit, integration and UI tests for the different classes, fragments and/or activities implemented


## Wireframe Descriptions

### Explore

1. This screen is a MapView that displays random pokemons in random places in the map using the provided pokeball asset.

The pokemons should should appear as the map moves or changes its scale and when click the pokeball asset it should redirect to the **Wild Pokemon Detail Screen**

To load the pokemons you can make use of the [Open Pokemon API](https://pokeapi.co/docs/v2)



