# Test Cases — @rozek/sds-network-websocket

## WC — Construction

| # | Description | Expected |
|---|---|---|
| WC-01 | construct with storeId; ConnectionState === 'disconnected' | `'disconnected'` |

## WF — Frame protocol

| # | Description | Expected |
|---|---|---|
| WF-01 | sendPatch sends 0x01 frame with patch bytes | first byte = 0x01; remaining bytes = patch |
| WF-02 | sendValue (small) sends 0x02 frame with hash + data | first byte = 0x02; next 32 bytes = hash; rest = data |
| WF-03 | sendValue (> 1 MB) sends multiple VALUE_CHUNK frames (0x05) | multiple frames, all with correct chunk header |
| WF-04 | requestValue sends 0x03 frame with 32-byte hash | first byte = 0x03; next 32 bytes = hash |
| WF-05 | sendLocalState sends 0x04 frame with JSON-encoded state | first byte = 0x04; JSON-parseable presence payload |
| WF-07 | sendLocalState with custom field includes custom data in JSON payload | parsed JSON contains `custom` key with correct value |
| WF-06 | incoming VALUE_CHUNK frames reassembled before firing onValue | single complete callback after all chunks arrive |

## WE — Events

| # | Description | Expected |
|---|---|---|
| WE-01 | onPatch callback invoked when 0x01 frame received | callback called with patch bytes |
| WE-02 | onValue callback invoked when 0x02 frame received | callback called with hash string + data |
| WE-03 | onConnectionChange fires on connect / disconnect transitions | called with 'connected' and 'disconnected' |
| WE-04 | unsubscribe return value stops further callbacks | callback not called after unsubscribe |
| WE-05 | onConnectionChange fires 'reconnecting' on unexpected close | called with 'reconnecting' |
| WE-06 | malformed frame (too short) is silently ignored | no exception |

## WP — Presence

| # | Description | Expected |
|---|---|---|
| WP-01 | PeerSet is empty on construction | empty Map |
| WP-02 | incoming 0x04 PRESENCE frame updates PeerSet | PeerSet contains the peer after frame received |
| WP-03 | onRemoteState handler is called with incoming presence | handler receives PeerId + state |
| WP-04 | incoming PRESENCE frame with custom field → PeerSet entry has correct custom data | `PeerSet.get(peerId)?.custom` equals the sent value |
