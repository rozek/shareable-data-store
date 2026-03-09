# Test Cases — @rozek/sds-network-webrtc

## RC — Construction

| # | Description | Expected |
|---|---|---|
| RC-01 | construct with storeId; ConnectionState === 'disconnected' | `'disconnected'`; PeerSet empty |

## RF — Fallback

| # | Description | Expected |
|---|---|---|
| RF-01 | when signalling WS fails, Fallback.connect() is called with /ws/ URL | Fallback.connect() invoked |
| RF-02 | after fallback activation, sendPatch delegates to Fallback | Fallback.sendPatch() called |
