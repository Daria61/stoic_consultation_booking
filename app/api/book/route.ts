import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { sendEmail } from "@/lib/mailer";

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
// const SHEET_NAME = "Booked";

// ✅ Named export for POST method
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { time, email, phone, date } = body;

    if (!time || !email || !phone || !date) {
      return NextResponse.json(
        { status: "error", message: "All fields are required" },
        { status: 400 },
      );
    }

    // 1️⃣ Get all rows
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `Options!A:I`,
    });

    const rows = response.data.values || [];

    // 2️⃣ Find the row index (date + time match)
    const rowIndex = rows.findIndex(
      (row) => row[1] === date && row[2] === time && row[3] === "TRUE",
    );

    if (rowIndex === -1) {
      return NextResponse.json(
        { status: "error", message: "Date and Time are already booked." },
        { status: 404 },
      );
    }

    // Google Sheets rows start at 1, plus header row
    const sheetRow = rowIndex + 1;

    // Append row to Google Sheet
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

    await sendEmail({
      to: email,
      subject: "Бүртгэл амжилттай боллоо",
      // text: `Та амжилттай бүртгэгдлээ! Цаг: ${time},`,
      html: `<p>Сайн байна уу? Та ганцаарчилсан зөвлөгөөний цаг авсан байна.</p>

    <p>
      <strong>Дэлгэрэнгүй мэдээлэл:</strong>
      ${date} ${time}
    </p>

    <p>1 цагийн төлбөр 150,000₮</p>

    <p>Та төлбөрийг дараах данс руу шилжүүлээд цагаа баталгаажуулна уу!</p>

    <p>
      Төлбөр төлөгдсөний дараа танд баталгаажсан майл очсоноор зөвлөгөөний цаг
      баталгаажна.
    </p>

    <p>
      IBAN: MN750004000452695184/ 452695184 ТӨГС-ОЧИР ЭНХБААТАР /Худалдаа
      Хөгжлийн Банк/ дансанд төлнө. <br />
    </p>

    <p>
      Гүйлгээний утга дээр суралцагчийн овог нэр болон бүртгүүлсэн утасны
      дугаарыг заавал бичнэ.
    </p>

    <p>
      <strong>Хаяг:</strong><br />
      Улаанбаатар хот, Сүхбаатар дүүрэг, 8-р хороо,<br />
      Ulaanbaatar Galleria ард Perla office<br />
      2 давхарт, 14200
    </p>

    <p>
      <strong>Утас:</strong>
      99142833, 99131953
    </p>

    <p>
      <strong>Google map:</strong>
      <a href="https://maps.app.goo.gl/9ubRA6VQMszqm3Ey8">
        https://maps.app.goo.gl/9ubRA6VQMszqm3Ey8
      </a>
    </p>
    `,
    });

    // 3️⃣ Update the row
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Options!D${sheetRow}:I${sheetRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          ["FALSE", email, phone, new Date().toISOString(), "not_paid", "sent"],
        ],
      },
    });

    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}
