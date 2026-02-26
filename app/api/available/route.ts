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
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:I`, // Date | Time | TotalSeats | IsActive
    });

    const rows = response.data.values || [];

    const availableDates = new Set<string>();

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

      // Condition 1: slot must be active
      const isAvailable = String(available).toUpperCase() === "TRUE";

      // Condition 2: not booked yet (email empty)
      const isNotBooked = !email || email.trim() === "";

      if (!isAvailable || !isNotBooked) continue;

      if (date) {
        availableDates.add(date);
      }
    }

    return NextResponse.json({
      status: "success",
      dates: Array.from(availableDates).sort(),
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}
