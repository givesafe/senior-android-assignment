import { randomLatLong, randomDate } from "./utils";

export default [
  {
    id: 1,
    name: "Bulbasaur",
    lat: randomLatLong(),
    long: randomLatLong(),
    captured_at: randomDate(),
  },
  {
    id: 4,
    name: "Charmander",
    lat: randomLatLong(),
    long: randomLatLong(),
    captured_at: randomDate(),
  },
  {
    id: 7,
    name: "Squirtle",
    lat: randomLatLong(),
    long: randomLatLong(),
    captured_at: randomDate(),
  },
  {
    id: 10,
    name: "Caterpie",
    lat: randomLatLong(),
    long: randomLatLong(),
    captured_at: randomDate(),
  },
] as const;
