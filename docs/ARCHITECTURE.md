# Architecture

## Objective

Build a reusable organic social publishing foundation beginning with TikTok.

Current priority:

TikTok organic content.

Future integration:

- Tiendanube;
- WhatsApp;
- additional social platforms;
- shared creative agents;
- shared calendar;
- shared publishing orchestration.

## Flow

Tiendanube / Editorial Calendar / Important Dates
                  |
                  v
            Content Engine
                  |
       +----------+----------+
       |                     |
       v                     v
 Creative Rules        Publishing Rules
       |                     |
       +----------+----------+
                  |
                  v
               TikTok
                  |
                  v
        ShopinistaMeta traffic
              /        \
             v          v
        Tiendanube   WhatsApp

## Separation

TikTok for Developers != TikTok for Business != TikTok Shop.

Credentials, OAuth flows and permissions remain isolated.

## Future shared project

The creative/media generation and cross-network scheduler should
eventually become an independent shared service.

TikTok will be the first platform adapter.

This prevents future Instagram, Facebook, YouTube, Pinterest or other
integrations from duplicating the content engine.
