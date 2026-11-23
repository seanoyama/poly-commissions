import { expect, test } from "@jest/globals";
import { ReadableDate, DateWithTime } from "../services/dateConverter";

test("formats the date", () => {
  const input = "2025-01-15T12:00:00Z";

  const expected = new Intl.DateTimeFormat().format(new Date(input));

  expect(ReadableDate({ iso_string: input })).toBe(expected);
});

test("dateWithTime function", () => {
  expect(DateWithTime({
    iso_string: "2026-11-17 22:55:11.463782+00"
    }))
  .toBe("11/17/2026, 2:55 PM");

  expect(DateWithTime({
    iso_string: "2026-11-23T07:35:01.625Z"
  }))
  .toBe("11/22/2026, 11:35 PM");
})