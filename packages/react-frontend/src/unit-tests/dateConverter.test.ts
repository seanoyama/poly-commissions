import { expect, test } from "@jest/globals";
import { ReadableDate } from "../services/dateConverter";

test("formats the date", () => {
  const input = "2025-01-15T12:00:00Z";

  const expected = new Intl.DateTimeFormat().format(new Date(input));

  expect(ReadableDate({ iso_string: input })).toBe(expected);
});