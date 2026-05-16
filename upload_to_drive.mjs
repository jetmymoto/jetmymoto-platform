import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const KEY = "AIzaSyCjdLN_NjZY03wnSGxO3ojKTmYoWcacxag";
const FOLDER_NAME = 'JetMyMoto_13clean_Archive';

// For Drive API using just an API key, we can only READ public data.
// We cannot CREATE folders or UPLOAD files without OAuth2 or a Service Account JSON.
// Let's verify what access we have.

const drive = google.drive({
  version: 'v3',
  auth: KEY // This only gives public read access.
});

async function run() {
  try {
    const res = await drive.files.list({
      pageSize: 10,
      fields: 'nextPageToken, files(id, name)',
    });
    console.log("Drive connection test (public list):");
    const files = res.data.files;
    if (files.length) {
      files.map((file) => console.log(`${file.name} (${file.id})`));
    } else {
      console.log("No files found.");
    }
  } catch (err) {
    console.error("The API returned an error: " + err.message);
  }
}
run();
