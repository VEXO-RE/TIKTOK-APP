# Demo Video Checklist

The final checklist must track the current official TikTok App Review
Guidelines.

Initial expectations:

- demonstrate the real application;
- use Sandbox when required for first review;
- show user interface;
- show user interactions;
- demonstrate each selected product;
- demonstrate each requested scope;
- use the same domain as the submitted website for web integration.

Do not record the final review video before the actual integration is
working end-to-end.

## Sandbox Upload draft sequence

1. Open `/review/` on the configured HTTPS Sandbox domain.
2. Select **Connect TikTok** and complete consent for
   `user.info.basic,video.upload`.
3. Return to the Review UI and show the connected state.
4. Select one supported local video and choose **Upload draft to TikTok**.
5. Show the returned `publish_id` without exposing tokens or `upload_url`.
6. Query status and show only the response returned by the application.
7. Open TikTok Inbox, select the notification, review/edit, and publish.

Visible disclosure:

> After upload, open TikTok Inbox to continue editing and publish.

The real Sandbox upload, Inbox receipt, and final publication were manually
confirmed by the user. The semiautomatic flow is validated end-to-end.
App Review is in review, as confirmed by the user on 2026-10-05. Real provider tests are deferred; approval is not asserted.
