# Gmail filter for AH order emails

> **⚠️ IMPORTANT DISCLAIMER**: This is an independent project and is not affiliated with, endorsed by, or connected to Albert Heijn or Ahold Delhaize in any way. This is a personal tool created to help manage email notifications. All trademarks and registered trademarks mentioned are the property of their respective owners.

This Google Apps Script automatically manages order confirmation emails from AH's delivery service. It helps keep your inbox organized by maintaining only the most recent version of each order confirmation while archiving older versions.

## Features

- Automatically processes AH order confirmation emails in your Gmail inbox
- Identifies unique orders by their order number (bestelnummer)
- For each order:
  - Keeps the most recent email and stars it for easy reference
  - Moves older versions of the same order to trash
  - Automatically marks newer order confirmations as read if the previous version was read
- Processes up to 50 email threads at a time
- Can be set up to run automatically at regular intervals

## Installation

1. Visit [Google Apps Script](https://script.google.com) and sign in with your Google account
2. Click "New Project"
3. Delete any existing code in the editor
4. Copy and paste the entire contents of `google-script.js` into the editor
5. Click "Save" and give your project a name (e.g., "AH Order Emails")

## Setting Up Automatic Execution

1. In the Google Apps Script editor, click on the clock icon (⏰) in the left sidebar to open the triggers page
2. Click the "+ Add Trigger" button in the bottom right
3. Configure the trigger with these settings:
   - Choose which function to run: `deleteOldAHOrderEmails`
   - Choose which deployment should run: `Head`
   - Select event source: `Time-driven`
   - Select type of time based trigger: `Minutes timer`
   - Select minute interval: `Every 5 minutes` (or your preferred interval)
4. Click "Save"
5. You'll be prompted to authorize the script. Follow the authorization steps.

## Security Note

When authorizing the script, you'll need to grant it permission to:
- Read and modify your Gmail messages
- Move messages to trash
- Modify labels (for starring/unstarring)

These permissions are necessary for the script to function properly.

## How It Works

1. The script searches for emails from AH bezorging in your inbox
2. It extracts the order number (bestelnummer) from each email
3. For emails with the same order number:
   - The most recent email is kept and starred
   - Older emails are unstarred and moved to trash
   - If a previous version was read and starts with "Bedankt voor jouw bestelling voor", the newest version is automatically marked as read
4. Single emails for unique orders are simply starred for reference

## Troubleshooting

If you encounter issues:
1. Check the script's execution logs in the Google Apps Script editor
2. Verify that the trigger is properly set up and running
3. Ensure the script has the necessary permissions
4. Check that your Gmail inbox is accessible and not full

## Support

This script is designed specifically for AH delivery confirmation emails. If the email format changes, the script may need to be updated accordingly.