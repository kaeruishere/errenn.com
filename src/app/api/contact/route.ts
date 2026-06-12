import { NextResponse } from 'next/server';
import { db, isFirebaseEnabled } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    if (!isFirebaseEnabled || !db) {
      return NextResponse.json({ error: 'Firebase is not configured.' }, { status: 500 });
    }

    const newSubmission = {
      name,
      email,
      subject,
      message,
      createdAt: new Date().toISOString(),
    };

    // Save to Firebase Firestore
    await addDoc(collection(db, 'submissions'), newSubmission);
    console.log('New Contact Form Submission saved to Firebase Firestore');

    // Send to Telegram if tokens are configured
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;

    if (telegramToken && telegramChatId) {
      const telegramText = `📬 <b>Yeni İletişim Formu Mesajı</b>\n\n` +
        `👤 <b>Ad Soyad:</b> ${name}\n` +
        `✉️ <b>E-posta:</b> ${email}\n` +
        `📌 <b>Konu:</b> ${subject}\n\n` +
        `💬 <b>Mesaj:</b>\n${message}`;

      try {
        const telegramResponse = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: telegramText,
            parse_mode: 'HTML',
          }),
        });

        if (!telegramResponse.ok) {
          const errData = await telegramResponse.json();
          console.error('Telegram API error:', errData);
        } else {
          console.log('Telegram notification sent successfully!');
        }
      } catch (tgError) {
        console.error('Failed to send message to Telegram:', tgError);
      }
    }

    return NextResponse.json({ success: true, message: 'Message processed successfully' });
  } catch (error: any) {
    console.error('Contact API Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
