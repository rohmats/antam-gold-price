import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const buyPath = path.join(
      process.cwd(),
      "..",
      "antam_buy.json"
    );
    const sellPath = path.join(
      process.cwd(),
      "..",
      "antam_sell.json"
    );

    const buyData = JSON.parse(fs.readFileSync(buyPath, "utf-8"));
    const sellData = JSON.parse(fs.readFileSync(sellPath, "utf-8"));

    return NextResponse.json({
      buy: buyData,
      sell: sellData,
    });
  } catch (error) {
    console.error("Error loading data:", error);
    return NextResponse.json(
      { error: "Failed to load data" },
      { status: 500 }
    );
  }
}
