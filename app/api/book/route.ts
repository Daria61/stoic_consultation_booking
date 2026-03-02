import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { sendEmail } from "@/lib/mailer";
import { getGoogleCredentials, getSpreadsheetId } from "@/lib/env";

// Load service account credentials from env with validation
const credentials = getGoogleCredentials();

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

const SPREADSHEET_ID = getSpreadsheetId();
// const SHEET_NAME = "Booked";

// ✅ Named export for POST method
export async function POST(req: NextRequest) {
  let sheetRow: number | null = null;
  let wasSlotClaimed = false;

  try {
    const body = await req.json();
    const { time, email, phone, date } = body;

    if (!time || !email || !phone || !date) {
      return NextResponse.json(
        { status: "error", message: "All fields are required" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { status: "error", message: "Invalid email format" },
        { status: 400 },
      );
    }

    // 1️⃣ Find the row index for the requested date and time
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `Options!A:I`,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(
      (row) => row[1] === date && row[2] === time,
    );

    if (rowIndex === -1) {
      return NextResponse.json(
        { status: "error", message: "Time slot not found." },
        { status: 404 },
      );
    }

    sheetRow = rowIndex + 1;
    const statusCell = `Options!D${sheetRow}`;

    // 2️⃣ Check current status before claiming
    const statusResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `Options!D${sheetRow}:E${sheetRow}`,
    });

    const currentStatus = statusResponse.data.values?.[0]?.[0];
    const currentEmail = statusResponse.data.values?.[0]?.[1];

    if (currentStatus !== "TRUE") {
      // Check if it's a duplicate request from the same user
      if (currentEmail === email) {
        return NextResponse.json(
          {
            status: "error",
            message: "You have already booked this time slot.",
          },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { status: "error", message: "Date and Time are already booked." },
        { status: 409 },
      );
    }

    // 3️⃣ Attempt to "claim" the slot
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Options!D${sheetRow}:I${sheetRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            "FALSE",
            email,
            phone,
            new Date().toISOString(),
            "not_paid",
            "pending_email",
          ],
        ],
      },
    });
    wasSlotClaimed = true;

    // 4️⃣ Append to "Booked" sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `Booked!A:F`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [date, time, email, phone, new Date().toISOString(), "just_booked"],
        ],
      },
    });

    // 5️⃣ Send confirmation email
    await sendEmail({
      to: email,
      subject: "Бүртгэл амжилттай боллоо",
      html: `<p>Сайн байна уу? Та ганцаарчилсан зөвлөгөөний цаг авсан байна.</p>
      <p><strong>Дэлгэрэнгүй мэдээлэл:</strong> ${date} ${time}</p>
      <p>1 цагийн төлбөр 150,000₮</p>
      <p>Та төлбөрийг дараах данс руу шилжүүлээд цагаа баталгаажуулна уу!</p>
      <p>Төлбөр төлөгдсөний дараа танд баталгаажсан майл очсоноор зөвлөгөөний цаг баталгаажна.</p>
      <p>IBAN: MN750004000452695184/ 452695184 ТӨГС-ОЧИР ЭНХБААТАР /Худалдаа Хөгжлийн Банк/ дансанд төлнө. <br /></p>
      <p>Гүйлгээний утга дээр суралцагчийн овог нэр болон бүртгүүлсэн утасны дугаарыг заавал бичнэ.</p>
      <p><strong>Хаяг:</strong><br />Улаанбаатар хот, Сүхбаатар дүүрэг, 8-р хороо,<br />Ulaanbaatar Galleria ард Perla office<br />2 давхарт, 14200</p>
      <p><strong>Утас:</strong> 99142833, 99131953</p>
      <p><strong>Google map:</strong> <a href="https://maps.app.goo.gl/9ubRA6VQMszqm3Ey8">https://maps.app.goo.gl/9ubRA6VQMszqm3Ey8</a></p>`,
    });

    // 6️⃣ Final update to the "Options" sheet to confirm email sent
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Options!I${sheetRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [["sent"]],
      },
    });

    await sendEmail({
      to: "ts.sarnai@stoicngo.org",
      subject: "Stoic Consultation Booking",
      html: `<p><strong>Detailed information:</strong> ${email} - ${phone} - ${date} - ${time}</p>`,
    });

    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    console.error("Booking error:", error);

    // Rollback: If we claimed the slot but failed to complete the booking, release it
    if (wasSlotClaimed && sheetRow) {
      try {
        console.log(`Rolling back claimed slot at row ${sheetRow}`);
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `Options!D${sheetRow}:I${sheetRow}`,
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [["TRUE", "", "", "", "", ""]],
          },
        });
        console.log("Rollback successful");
      } catch (rollbackError) {
        console.error("Failed to rollback claimed slot:", rollbackError);
        // Log this critical error - the slot is now stuck
      }
    }

    // Provide specific error messages
    let errorMessage = "An error occurred while booking.";
    if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      errorMessage = "Unable to connect to booking service. Please try again.";
    } else if (error.message?.includes("SMTP")) {
      errorMessage = "Booking saved but failed to send confirmation email.";
    }

    return NextResponse.json(
      { status: "error", message: errorMessage },
      { status: 500 },
    );
  }
}
