const express = require('express');
const { mondayClient } = require('@mondaycom/apps-sdk');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

// 1. Setup Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS // Your 16-digit App Password
  }
});

// 2. The Endpoint Monday will call
app.post('/send-digest', async (req, res) => {
  const { boardId } = req.body.payload.inputValues; // Monday sends the board ID here
  const monday = mondayClient({ token: process.env.MONDAY_SIGNING_SECRET });

  try {
    // GraphQL Query: Get items and the "Owner" column
    const query = `query { boards(ids: [${boardId}]) { items_page { items { name column_values(ids: ["owner"]) { ... on PeopleValue { persons_and_teams { id } } } } } } }`;
    const response = await monday.api(query);
    const items = response.data.boards[0].items_page.items;

    // Logic to group tasks by user and send emails (similar to previous script)
    // ... (Loop through items, find owners, fetch emails, and transporter.sendMail)

    res.status(200).send({ message: "Emails sent successfully" });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.listen(process.env.PORT || 8080);