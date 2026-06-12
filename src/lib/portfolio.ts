import { db, isFirebaseEnabled } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import fs from "fs";
import path from "path";

const getJsonPath = () => path.join(process.cwd(), "src/i18n/data.json");

export async function getPortfolioData(lang: "tr" | "en") {
  try {
    if (isFirebaseEnabled && db) {
      try {
        const docRef = doc(db, "portfolio", "data");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          return data[lang] || getLocalPortfolioData(lang);
        }
      } catch (fbError) {
        console.error("Firebase failed to fetch portfolio data in helper:", fbError);
      }
    }

    return getLocalPortfolioData(lang);
  } catch (error) {
    console.error("Error loading portfolio data:", error);
    return {};
  }
}

function getLocalPortfolioData(lang: "tr" | "en") {
  const filePath = getJsonPath();
  const fileContent = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(fileContent);
  return data[lang];
}
