require('dotenv').config();
const admin = require('firebase-admin');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

// 1. Initialize Firebase Admin
// WARNING: You must download your serviceAccountKey.json from Firebase Console -> Project Settings -> Service Accounts
// and place it in this server/ directory for this to work.
let db;
try {
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    console.log("✅ Firebase Admin Initialized.");
} catch (error) {
    console.error("❌ Failed to initialize Firebase. Did you create serviceAccountKey.json?");
    console.error(error.message);
    process.exit(1);
}

// 2. Configure Nodemailer (Using Ethereal for safe testing by default)
// You can replace these with your actual SMTP credentials (e.g., SendGrid, Gmail)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
        user: process.env.SMTP_USER || 'ethereal.user', // Replace in .env
        pass: process.env.SMTP_PASS || 'ethereal.pass'  // Replace in .env
    }
});

// Helper: Format Currency
const formatCurrency = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`;

// Helper: Calculate highest category
const getHighestCategory = (bills) => {
    if (bills.length === 0) return 'None';
    const totals = {};
    bills.forEach(b => totals[b.category] = (totals[b.category] || 0) + Number(b.amount));
    return Object.keys(totals).reduce((a, b) => totals[a] > totals[b] ? a : b);
};

// 3. The Core Job Logic
const generateAndSendDigests = async () => {
    console.log(`\n[${new Date().toISOString()}] 🚀 Starting Weekly Digest Job...`);

    try {
        // Find all users who want the weekly digest
        const usersSnapshot = await db.collection('users').where('preferences.weeklyDigest', '==', true).get();
        
        if (usersSnapshot.empty) {
            console.log("ℹ️ No users opted in for the Weekly Digest.");
            return;
        }

        console.log(`Found ${usersSnapshot.docs.length} users to email.`);

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const isoOneWeekAgo = oneWeekAgo.toISOString(); // For comparison with string dates if stored that way

        for (const userDoc of usersSnapshot.docs) {
            const userData = userDoc.data();
            const { userId, email } = userData;

            if (!email) continue; // Skip if no email is attached

            // Fetch the user's bills from the last 7 days
            // Note: In our current app, billDate is a string (YYYY-MM-DD). 
            // We'll fetch all bills for the user and filter in memory since string comparison might be tricky depending on how it's saved.
            // In a huge production app, you'd store Timestamp objects.
            const billsSnapshot = await db.collection('bills').where('userId', '==', userId).get();
            
            const weeklyBills = [];
            let totalSpent = 0;

            billsSnapshot.forEach(bDoc => {
                const bill = bDoc.data();
                const billDateObj = new Date(bill.billDate);
                
                // If the bill was within the last 7 days
                if (billDateObj >= oneWeekAgo && billDateObj <= new Date()) {
                    weeklyBills.push(bill);
                    totalSpent += Number(bill.amount);
                }
            });

            // Build HTML Email
            const highestCategory = getHighestCategory(weeklyBills);
            const htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #6366f1;">Your HomeLedger Weekly Digest 📊</h2>
                    <p>Hello! Here is your spending summary for the past 7 days.</p>
                    
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #0f172a;">Weekly Overview</h3>
                        <p style="font-size: 18px;"><strong>Total Spent:</strong> <span style="color: #ef4444;">${formatCurrency(totalSpent)}</span></p>
                        <p><strong>Transactions:</strong> ${weeklyBills.length}</p>
                        <p><strong>Top Category:</strong> ${highestCategory}</p>
                    </div>

                    ${weeklyBills.length > 0 ? `
                        <h4 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Recent Expenses</h4>
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                            ${weeklyBills.slice(0, 5).map(b => `
                                <tr>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${b.item}</td>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${b.category}</td>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">${formatCurrency(b.amount)}</td>
                                </tr>
                            `).join('')}
                        </table>
                        ${weeklyBills.length > 5 ? `<p style="font-size: 12px; color: #64748b;">+ ${weeklyBills.length - 5} more transactions.</p>` : ''}
                    ` : '<p>You had no recorded expenses this week. Great job saving!</p>'}
                    
                    <p style="font-size: 12px; color: #64748b; margin-top: 30px;">
                        To unsubscribe from these summaries, disable the Weekly Digest in your <a href="http://localhost:3001/settings">HomeLedger Settings page</a>.
                    </p>
                </div>
            `;

            // Send Email
            try {
                const info = await transporter.sendMail({
                    from: '"HomeLedger App" <no-reply@homeledger.test>',
                    to: email,
                    subject: `Your Weekly Spending Digest: ${formatCurrency(totalSpent)}`,
                    html: htmlContent
                });
                console.log(`✅ Email sent efficiently to ${email}. Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
            } catch (err) {
                console.error(`❌ Error sending email to ${email}:`, err.message);
            }
        }
    } catch (error) {
        console.error("❌ Fatal Error during Weekly Digest:", error);
    }
};

// 4. Schedule the Job!
// The user requested exactly Sundays at 00:00 AM (Midnight)
// Cron expression: "0 0 * * 0" = At 00:00 on Sunday.
console.log("⏰ Scheduling Weekly Digest Cron Job for Sundays at 00:00 AM...");
cron.schedule('0 0 * * 0', () => {
    generateAndSendDigests();
});

// Optional: for manual testing, uncomment the line below to run it once immediately on boot:
// generateAndSendDigests();

console.log("✨ Server worker successfully started and listening for schedule!");
