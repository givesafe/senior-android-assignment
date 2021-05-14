import validator from "validator";
import type * as functions from "firebase-functions";

export const validateCapture = (req: functions.Request) => {
  const errors: string[] = [];

  const input = req.body.pokemon;

  if (typeof input !== "object") {
    errors.push("$.pokemon is undefined");
    return errors;
  }

  if (!validator.isInt(input.id + "") || typeof input.id !== "number")
    errors.push("$.pokemon.id must be an integer");

  if (typeof input.name !== "string")
    errors.push("$.pokemon.name must be a string");

  if (!validator.isNumeric(input.lat + ""))
    errors.push("$.pokemon.lat must be numeric");

  if (!validator.isNumeric(input.long + ""))
    errors.push("$.pokemon.long must be numeric");

  return errors;
};
