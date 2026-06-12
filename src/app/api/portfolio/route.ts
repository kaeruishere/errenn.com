import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { db, isFirebaseEnabled } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const getJsonPath = () => path.join(process.cwd(), 'src/i18n/data.json');

function getLocalPortfolioData() {
  const filePath = getJsonPath();
  const fileContent = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContent);
}

export async function GET() {
  try {
    if (isFirebaseEnabled && db) {
      try {
        const docRef = doc(db, 'portfolio', 'data');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          return NextResponse.json(docSnap.data());
        } else {
          // AUTO-MIGRATION: Upload local data.json content to Firestore automatically
          console.log('Portfolio data not found in Firestore. Starting auto-migration...');
          const localData = getLocalPortfolioData();
          await setDoc(docRef, localData);
          console.log('Portfolio data successfully migrated to Firestore!');
          return NextResponse.json(localData);
        }
      } catch (fbError) {
        console.error('Firebase failed to fetch portfolio data, falling back to local JSON:', fbError);
        return NextResponse.json(getLocalPortfolioData());
      }
    }

    return NextResponse.json(getLocalPortfolioData());
  } catch (error: any) {
    console.error('Failed to read portfolio data:', error);
    return NextResponse.json({ error: 'Failed to read portfolio data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
  
  if (authHeader !== `Bearer ${adminPassword}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Validate that it has the correct root keys
    if (!body.tr || !body.en) {
      return NextResponse.json({ error: 'Invalid data structure. Missing "tr" or "en" keys.' }, { status: 400 });
    }

    // Save to Firebase Firestore if enabled
    if (isFirebaseEnabled && db) {
      try {
        const docRef = doc(db, 'portfolio', 'data');
        await setDoc(docRef, body);
        console.log('Portfolio data successfully updated in Firestore');
        return NextResponse.json({ message: 'Portfolio data updated in Firestore successfully' });
      } catch (fbError) {
        console.error('Firebase failed to save portfolio data, falling back to local JSON:', fbError);
      }
    }

    // Save to local data.json
    const filePath = getJsonPath();
    fs.writeFileSync(filePath, JSON.stringify(body, null, 2), 'utf8');
    return NextResponse.json({ message: 'Portfolio data updated in local file successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save portfolio data' }, { status: 500 });
  }
}
