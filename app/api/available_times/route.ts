import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

// Load service account credentials from env
const credentials = JSON.parse(
  process.env.GOOGLE_SERVICE_ACCOUNT_KEY as string,
);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

const SPREADSHEET_ID = process.env.SPREADSHEET_ID as string;
const SHEET_NAME = "Options";

export async function GET(req: NextRequest) {
  try {
    const selectedDate = req.nextUrl.searchParams.get("date");

    if (!selectedDate) {
      return NextResponse.json(
        { status: "error", message: "Missing date parameter" },
        { status: 400 },
      );
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:I`,
    });

    const rows = response.data.values || [];
    const availableTimes = new Set<string>();

    for (const row of rows) {
      const [
        id,
        date,
        time,
        available,
        email,
        phone,
        timestamp,
        payment_status,
        confirm_email,
      ] = row;

      // Match selected date
      if (date !== selectedDate) continue;

      // Condition 1: active
      const isAvailable = String(available).toUpperCase() === "TRUE";

      // Condition 2: not booked
      const isNotBooked = !email || email.trim() === "";

      if (!isAvailable || !isNotBooked) continue;

      if (time) {
        availableTimes.add(time);
      }
    }

    return NextResponse.json({
      status: "success",
      times: Array.from(availableTimes).sort(),
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}
