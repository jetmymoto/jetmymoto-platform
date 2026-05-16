# Vertex AI Cloud Function Setup Status

## 1. Codebase Changes
- **SDK Installed**: `@google-cloud/vertexai` added to `functions/package.json`.
- **New Implementation**: Created `functions/src/admin/vertexAiGenerator.js` with `generateText` and `filterImages`.
- **Exported**: Added exports to `functions/index.js`.

## 2. Deployment
- **Status**: Successfully deployed to `movie-chat-factory`.
- **Endpoints**:
  - `https://us-central1-movie-chat-factory.cloudfunctions.net/generateText`
  - `https://us-central1-movie-chat-factory.cloudfunctions.net/filterImages`

## 3. IAM Configuration (Action Required)
The functions are currently returning a 403 error because the service account lacks the `Vertex AI User` role. Please run the following command to grant the necessary permissions:

```bash
gcloud projects add-iam-policy-binding movie-chat-factory \
  --member="serviceAccount:778225783812-compute@developer.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

*Note: For 2nd Gen functions, the default service account is `778225783812-compute@developer.gserviceaccount.com`.*
