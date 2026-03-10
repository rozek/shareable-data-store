import { useState } from 'react'

/*******************************************************************************
*  SDS Data Model Visualisation                                                *
*******************************************************************************/

const COLORS = {
  blue:        '#3b82f6',
  blueLight:   '#dbeafe',
  blueMid:     '#93c5fd',
  indigo:      '#6366f1',
  indigoLight: '#e0e7ff',
  green:       '#22c55e',
  greenLight:  '#dcfce7',
  amber:       '#f59e0b',
  amberLight:  '#fef3c7',
  rose:        '#f43f5e',
  roseLight:   '#ffe4e6',
  violet:      '#8b5cf6',
  violetLight: '#ede9fe',
  slate:       '#64748b',
  slateLight:  '#f1f5f9',
  slateMid:    '#e2e8f0',
  white:       '#ffffff',
  text:        '#1e293b',
  textMid:     '#475569',
  textLight:   '#94a3b8',
}

/* ── small helpers ──────────────────────────────────────────────────────── */

function Badge ({ label, color = COLORS.blue, bg = COLORS.blueLight }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
      padding: '1px 6px', borderRadius: 99,
      color, background: bg, whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

function Field ({ name, type, optional = false, note }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6,
                  padding: '2px 0', borderBottom: `1px solid ${COLORS.slateMid}` }}>
      <span style={{ fontFamily: 'monospace', fontSize: 12,
                     color: COLORS.text, fontWeight: 600 }}>{name}</span>
      {optional && <span style={{ fontSize: 10, color: COLORS.textLight }}>?</span>}
      <span style={{ fontFamily: 'monospace', fontSize: 11,
                     color: COLORS.violet, marginLeft: 'auto' }}>{type}</span>
      {note && <span style={{ fontSize: 10, color: COLORS.textLight, marginLeft: 4 }}>{note}</span>}
    </div>
  )
}

function ClassBox ({ title, subtitle, badge, badgeColor, badgeBg,
                     fields = [], headerColor, headerBg,
                     style = {}, width = 260 }) {
  return (
    <div style={{
      width, borderRadius: 10, overflow: 'hidden',
      border: `1.5px solid ${headerColor}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      background: COLORS.white, ...style,
    }}>
      <div style={{
        background: headerBg, padding: '8px 12px',
        borderBottom: `1.5px solid ${headerColor}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontWeight: 800, fontSize: 13, color: headerColor }}>{title}</span>
          {badge && <Badge label={badge} color={badgeColor} bg={badgeBg} />}
        </div>
        {subtitle && (
          <div style={{ fontSize: 10, color: COLORS.textMid, marginTop: 2 }}>{subtitle}</div>
        )}
      </div>
      {fields.length > 0 && (
        <div style={{ padding: '6px 12px 8px' }}>
          {fields.map((f, i) => (
            <Field key={i} {...f} />
          ))}
        </div>
      )}
    </div>
  )
}

function Section ({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{
      border: `1px solid ${COLORS.slateMid}`,
      borderRadius: 12, overflow: 'hidden', marginBottom: 24,
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '10px 16px',
          background: COLORS.slateLight, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
          fontWeight: 700, fontSize: 14, color: COLORS.text, textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 16 }}>{open ? '▾' : '▸'}</span>
        {title}
      </button>
      {open && (
        <div style={{ padding: 20 }}>
          {children}
        </div>
      )}
    </div>
  )
}

/* ── Arrow SVG connectors ─────────────────────────────────────────────────── */

function Arrow ({ x1, y1, x2, y2, color = COLORS.slate, label, dashed = false }) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx*dx + dy*dy)
  const ux = dx/len, uy = dy/len
  const ax = x2 - ux*12 - uy*6
  const ay = y2 - uy*12 + ux*6
  const bx = x2 - ux*12 + uy*6
  const by = y2 - uy*12 - ux*6
  const mx = (x1+x2)/2, my = (y1+y2)/2

  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color} strokeWidth={1.5}
        strokeDasharray={dashed ? '5,4' : undefined} />
      <polygon points={`${x2},${y2} ${ax},${ay} ${bx},${by}`}
        fill={color} />
      {label && (
        <text x={mx} y={my-6} textAnchor="middle"
          fontSize={10} fill={color} fontStyle="italic">{label}</text>
      )}
    </g>
  )
}

function OpenArrow ({ x1, y1, x2, y2, color = COLORS.slate, label }) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color} strokeWidth={1.5} />
      <polyline
        points={`${x2-12},${y2-8} ${x2},${y2} ${x2-12},${y2+8}`}
        fill="none" stroke={color} strokeWidth={1.5} />
      {label && (
        <text x={(x1+x2)/2} y={(y1+y2)/2-6} textAnchor="middle"
          fontSize={10} fill={color} fontStyle="italic">{label}</text>
      )}
    </g>
  )
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Panel 1 — Class Hierarchy                                                */
/* ══════════════════════════════════════════════════════════════════════════ */

function ClassHierarchy () {
  return (
    <div>
      <p style={{ fontSize: 13, color: COLORS.textMid, marginBottom: 16 }}>
        <code>SDS_Entry</code> ist die gemeinsame Basisklasse.
        <code> SDS_Item</code> kann Werte und Kinder enthalten;
        <code> SDS_Link</code> verweist auf ein anderes Item.
      </p>
      <div style={{ position: 'relative', height: 380 }}>
        <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', overflow:'visible' }}>
          {/* SDS_Entry → SDS_Item */}
          <Arrow x1={340} y1={115} x2={160} y2={220} color={COLORS.blue} label="extends" />
          {/* SDS_Entry → SDS_Link */}
          <Arrow x1={380} y1={115} x2={560} y2={220} color={COLORS.blue} label="extends" />
        </svg>

        {/* SDS_Entry */}
        <div style={{ position:'absolute', left: 205, top: 0 }}>
          <ClassBox
            title="SDS_Entry"  badge="abstract"
            badgeColor={COLORS.indigo} badgeBg={COLORS.indigoLight}
            headerColor={COLORS.indigo} headerBg={COLORS.indigoLight}
            width={270}
            fields={[
              { name:'Id',    type:'string',                  note:'UUID' },
              { name:'Label', type:'string',                  note:'≤ 1024 chars' },
              { name:'Info',  type:'Record<string,unknown>',  note:'metadata' },
              { name:'outerItem',       type:'SDS_Item | undefined' },
              { name:'outerItemChain',  type:'SDS_Item[]' },
              { name:'mayBeDeleted',    type:'boolean' },
            ]}
          />
        </div>

        {/* SDS_Item */}
        <div style={{ position:'absolute', left: 0, top: 205 }}>
          <ClassBox
            title="SDS_Item"  badge="extends Entry"
            badgeColor={COLORS.blue} badgeBg={COLORS.blueLight}
            headerColor={COLORS.blue} headerBg={COLORS.blueLight}
            width={290}
            fields={[
              { name:'Type',      type:'string (MIME)',        note:'e.g. text/plain' },
              { name:'ValueKind', type:'ValueKind',            note:'see legend' },
              { name:'Value',     type:'string | Uint8Array?', note:'inline or ref' },
              { name:'innerEntryList', type:'SDS_Entry[]',     note:'children' },
            ]}
          />
        </div>

        {/* SDS_Link */}
        <div style={{ position:'absolute', left: 430, top: 205 }}>
          <ClassBox
            title="SDS_Link"  badge="extends Entry"
            badgeColor={COLORS.rose} badgeBg={COLORS.roseLight}
            headerColor={COLORS.rose} headerBg={COLORS.roseLight}
            width={220}
            fields={[
              { name:'Target', type:'SDS_Item', note:'fixed at creation' },
            ]}
          />
        </div>

        {/* ValueKind legend */}
        <div style={{
          position:'absolute', left: 0, top: 335,
          background: COLORS.amberLight, border:`1px solid ${COLORS.amber}`,
          borderRadius: 8, padding: '6px 12px', fontSize: 11, color: COLORS.text,
        }}>
          <strong>ValueKind</strong>: &nbsp;
          {["none","literal","binary","literal-reference","binary-reference","pending"].map(v => (
            <code key={v} style={{ marginRight: 8 }}>{v}</code>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Panel 2 — Store Tree Structure                                           */
/* ══════════════════════════════════════════════════════════════════════════ */

function TreeNode ({ x, y, label, sublabel, color, bg, radius = 28 }) {
  return (
    <g>
      <circle cx={x} cy={y} r={radius} fill={bg} stroke={color} strokeWidth={2} />
      <text x={x} y={y + (sublabel ? -4 : 4)} textAnchor="middle"
        fontSize={11} fontWeight={700} fill={color}>{label}</text>
      {sublabel && (
        <text x={x} y={y+12} textAnchor="middle"
          fontSize={9} fill={color} fontStyle="italic">{sublabel}</text>
      )}
    </g>
  )
}

function TreeEdge ({ x1, y1, x2, y2, label, dashed }) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={COLORS.slate} strokeWidth={1.5}
        strokeDasharray={dashed ? '4,3' : undefined} />
      {label && (
        <text x={(x1+x2)/2+6} y={(y1+y2)/2} fontSize={9}
          fill={COLORS.textMid} fontStyle="italic">{label}</text>
      )}
    </g>
  )
}

function StoreTree () {
  return (
    <div>
      <p style={{ fontSize: 13, color: COLORS.textMid, marginBottom: 12 }}>
        Der Store ist ein <strong>Baum</strong>. Jeder <code>SDS_Item</code> kann
        beliebig viele <code>SDS_Entry</code>-Kinder besitzen. Links zeigen auf Items
        an anderer Stelle im Baum. Drei Well-Known-Items existieren immer.
      </p>
      <svg width="700" height="320" style={{ overflow: 'visible' }}>

        {/* root → children */}
        <TreeEdge x1={350} y1={50} x2={200} y2={130} />
        <TreeEdge x1={350} y1={50} x2={350} y2={130} />
        <TreeEdge x1={350} y1={50} x2={500} y2={130} />

        {/* item A → children */}
        <TreeEdge x1={200} y1={158} x2={120} y2={225} />
        <TreeEdge x1={200} y1={158} x2={220} y2={225} />

        {/* item B has link child */}
        <TreeEdge x1={350} y1={158} x2={320} y2={225} />

        {/* link → target (dashed) */}
        <TreeEdge x1={320} y1={253} x2={220} y2={253} label="Target →" dashed />

        {/* trash → trashed entry */}
        <TreeEdge x1={500} y1={158} x2={500} y2={225} />

        {/* Root */}
        <TreeNode x={350} y={35}  label="Root" sublabel="00000000-…-0000"
          color={COLORS.indigo} bg={COLORS.indigoLight} radius={32} />

        {/* Item A */}
        <TreeNode x={200} y={145}  label="Item A" color={COLORS.blue} bg={COLORS.blueLight} />
        {/* Item B */}
        <TreeNode x={350} y={145}  label="Item B" color={COLORS.blue} bg={COLORS.blueLight} />
        {/* Trash */}
        <TreeNode x={500} y={145}  label="Trash"  sublabel="00000000-…-0001"
          color={COLORS.rose} bg={COLORS.roseLight} radius={32} />

        {/* Item A.1 */}
        <TreeNode x={120} y={240}  label="Item A.1" color={COLORS.blue} bg={COLORS.blueLight} radius={24} />
        {/* Item A.2 */}
        <TreeNode x={220} y={240}  label="Item A.2" color={COLORS.blue} bg={COLORS.blueLight} radius={24} />
        {/* Link → A.2 */}
        <TreeNode x={320} y={240}  label="Link" color={COLORS.rose} bg={COLORS.roseLight} radius={22} />
        {/* Trashed item */}
        <TreeNode x={500} y={240}  label="Item X" sublabel="(deleted)"
          color={COLORS.textLight} bg={COLORS.slateMid} radius={26} />

        {/* Lost & Found */}
        <rect x={570} y={240} width={100} height={44} rx={8}
          fill={COLORS.amberLight} stroke={COLORS.amber} strokeWidth={1.5} />
        <text x={620} y={258} textAnchor="middle" fontSize={10} fontWeight={700}
          fill={COLORS.amber}>Lost &amp; Found</text>
        <text x={620} y={274} textAnchor="middle" fontSize={9} fill={COLORS.amber}>
          00000000-…-0002
        </text>

        {/* Value blob (inline) */}
        <rect x={60} y={275} width={120} height={38} rx={6}
          fill={COLORS.greenLight} stroke={COLORS.green} strokeWidth={1.5} />
        <text x={120} y={292} textAnchor="middle" fontSize={10} fontWeight={700}
          fill={COLORS.green}>Value (inline)</text>
        <text x={120} y={306} textAnchor="middle" fontSize={9} fill={COLORS.green}>
          string | Uint8Array
        </text>
        <TreeEdge x1={120} y1={265} x2={120} y2={275} />

        {/* Blob store */}
        <rect x={200} y={285} width={130} height={30} rx={6}
          fill={COLORS.greenLight} stroke={COLORS.green} strokeWidth={1.5}
          strokeDasharray="5,3" />
        <text x={265} y={305} textAnchor="middle" fontSize={10}
          fill={COLORS.green}>Blob Store (hash-keyed)</text>
        <line x1={220} y1={265} x2={240} y2={285}
          stroke={COLORS.green} strokeWidth={1.5} strokeDasharray="4,3" />
      </svg>

      <div style={{
        display:'flex', gap:16, flexWrap:'wrap', marginTop: 8, fontSize: 12,
      }}>
        {[
          [COLORS.indigo, COLORS.indigoLight, 'SDS_Item (well-known)'],
          [COLORS.blue,   COLORS.blueLight,   'SDS_Item (user)'],
          [COLORS.rose,   COLORS.roseLight,   'SDS_Link'],
          [COLORS.green,  COLORS.greenLight,  'Value storage'],
          [COLORS.amber,  COLORS.amberLight,  'Lost & Found'],
        ].map(([c,bg,l]) => (
          <div key={l} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:14, height:14, borderRadius:'50%',
                          background:bg, border:`2px solid ${c}` }} />
            <span style={{ color: COLORS.textMid }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Panel 3 — Serialisation formats                                          */
/* ══════════════════════════════════════════════════════════════════════════ */

function SerialFormats () {
  const itemJSON = `{
  "Kind":         "item",
  "Id":           "uuid",
  "Label":        "My Document",
  "Type":         "text/plain",
  "ValueKind":    "literal",
  "Value":        "Hello World",
  "Info":         { "createdBy": "alice" },
  "innerEntries": [ /* recursive */ ]
}`

  const linkJSON = `{
  "Kind":     "link",
  "Id":       "uuid",
  "Label":    "Shortcut",
  "TargetId": "uuid-of-target-item",
  "Info":     {}
}`

  return (
    <div>
      <p style={{ fontSize:13, color:COLORS.textMid, marginBottom:12 }}>
        Entries können als <strong>JSON</strong> (human-readable) oder als
        <strong> gzip-komprimiertes Binary</strong> serialisiert werden.
        Der gesamte Baum ist über <code>asJSON()</code> / <code>asBinary()</code> exportierbar.
      </p>
      <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:260 }}>
          <div style={{
            fontWeight:700, fontSize:12, color:COLORS.blue,
            marginBottom:6, display:'flex', alignItems:'center', gap:8,
          }}>
            <span>SDS_ItemJSON</span>
            <Badge label="recursive" color={COLORS.blue} bg={COLORS.blueLight} />
          </div>
          <pre style={{
            background:'#1e293b', color:'#e2e8f0', borderRadius:8,
            padding:12, fontSize:11, lineHeight:1.6, overflow:'auto',
            margin:0,
          }}>{itemJSON}</pre>
        </div>
        <div style={{ flex:1, minWidth:240 }}>
          <div style={{
            fontWeight:700, fontSize:12, color:COLORS.rose,
            marginBottom:6,
          }}>SDS_LinkJSON</div>
          <pre style={{
            background:'#1e293b', color:'#e2e8f0', borderRadius:8,
            padding:12, fontSize:11, lineHeight:1.6, overflow:'auto',
            margin:0,
          }}>{linkJSON}</pre>

          <div style={{
            marginTop:16, background:COLORS.amberLight,
            border:`1px solid ${COLORS.amber}`, borderRadius:8,
            padding:10, fontSize:12,
          }}>
            <strong>Binärformat:</strong> gzip(JSON) — identische Feldstruktur,
            komprimiert. Große Binärwerte werden als{' '}
            <code>ValueKind: "binary-reference"</code> gespeichert
            und über den <strong>Blob-Store</strong> (FNV-1a-Hash-Key) referenziert.
          </div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Panel 4 — Provider Interfaces                                            */
/* ══════════════════════════════════════════════════════════════════════════ */

function Providers () {
  return (
    <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
      <ClassBox
        title="SDS_NetworkProvider"
        subtitle="impl: WebSocket · WebRTC"
        headerColor={COLORS.blue} headerBg={COLORS.blueLight}
        width={250}
        fields={[
          { name:'StoreId',         type:'string' },
          { name:'ConnectionState', type:'SDS_ConnectionState' },
          { name:'connect()',       type:'Promise<void>' },
          { name:'disconnect()',    type:'void' },
          { name:'sendPatch()',     type:'void' },
          { name:'sendValue()',     type:'void',  note:'blob upload' },
          { name:'requestValue()', type:'void',  note:'blob fetch' },
          { name:'onPatch()',       type:'() => void', note:'unsub fn' },
          { name:'onValue()',       type:'() => void' },
        ]}
      />
      <ClassBox
        title="SDS_PersistenceProvider"
        subtitle="impl: IndexedDB · SQLite"
        headerColor={COLORS.green} headerBg={COLORS.greenLight}
        width={260}
        fields={[
          { name:'loadSnapshot()',    type:'Promise<Uint8Array?>' },
          { name:'saveSnapshot()',    type:'Promise<void>' },
          { name:'loadPatchesSince()',type:'Promise<Uint8Array[]>' },
          { name:'appendPatch()',     type:'Promise<void>' },
          { name:'prunePatches()',    type:'Promise<void>' },
          { name:'loadValue()',       type:'Promise<Uint8Array?>', note:'blob' },
          { name:'saveValue()',       type:'Promise<void>' },
          { name:'releaseValue()',    type:'Promise<void>', note:'ref-count' },
          { name:'close()',           type:'Promise<void>' },
        ]}
      />
      <ClassBox
        title="SDS_PresenceProvider"
        subtitle="impl: WebSocket · WebRTC"
        headerColor={COLORS.violet} headerBg={COLORS.violetLight}
        width={240}
        fields={[
          { name:'PeerSet',          type:'Map<id,RemoteState>' },
          { name:'sendLocalState()', type:'void' },
          { name:'onRemoteState()',  type:'() => void', note:'unsub fn' },
        ]}
      />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Panel 5 — Sync Engine Architecture                                       */
/* ══════════════════════════════════════════════════════════════════════════ */

function SyncArch () {
  return (
    <div>
      <p style={{ fontSize:13, color:COLORS.textMid, marginBottom:16 }}>
        <code>SDS_SyncEngine</code> orchestriert alle vier Schichten.
        Er persistiert Snapshots + Patches, leitet CRDT-Patches ans Netz weiter
        und überträgt große Value-Blobs auf einem separaten Kanal.
      </p>
      <svg width="680" height="290" style={{ overflow:'visible' }}>

        {/* SyncEngine box */}
        <rect x={220} y={110} width={240} height={70} rx={10}
          fill={COLORS.amberLight} stroke={COLORS.amber} strokeWidth={2} />
        <text x={340} y={141} textAnchor="middle" fontSize={13}
          fontWeight={800} fill={COLORS.amber}>SDS_SyncEngine</text>
        <text x={340} y={158} textAnchor="middle" fontSize={10}
          fill={COLORS.amber}>PeerId · #OfflineQueue · checkpointing</text>
        <text x={340} y={172} textAnchor="middle" fontSize={10}
          fill={COLORS.amber}>BroadcastChannel · presence heartbeat</text>

        {/* DataStore */}
        <rect x={220} y={10} width={240} height={50} rx={10}
          fill={COLORS.indigoLight} stroke={COLORS.indigo} strokeWidth={2} />
        <text x={340} y={32} textAnchor="middle" fontSize={12}
          fontWeight={800} fill={COLORS.indigo}>SDS_DataStore</text>
        <text x={340} y={48} textAnchor="middle" fontSize={10}
          fill={COLORS.indigo}>core-jj · core-loro · core-yjs</text>

        {/* Persistence */}
        <rect x={10} y={200} width={180} height={50} rx={10}
          fill={COLORS.greenLight} stroke={COLORS.green} strokeWidth={2} />
        <text x={100} y={220} textAnchor="middle" fontSize={12}
          fontWeight={800} fill={COLORS.green}>Persistence</text>
        <text x={100} y={236} textAnchor="middle" fontSize={10}
          fill={COLORS.green}>IndexedDB · SQLite</text>

        {/* Network */}
        <rect x={250} y={220} width={180} height={50} rx={10}
          fill={COLORS.blueLight} stroke={COLORS.blue} strokeWidth={2} />
        <text x={340} y={240} textAnchor="middle" fontSize={12}
          fontWeight={800} fill={COLORS.blue}>Network</text>
        <text x={340} y={256} textAnchor="middle" fontSize={10}
          fill={COLORS.blue}>WebSocket · WebRTC</text>

        {/* Presence */}
        <rect x={490} y={200} width={180} height={50} rx={10}
          fill={COLORS.violetLight} stroke={COLORS.violet} strokeWidth={2} />
        <text x={580} y={220} textAnchor="middle" fontSize={12}
          fontWeight={800} fill={COLORS.violet}>Presence</text>
        <text x={580} y={236} textAnchor="middle" fontSize={10}
          fill={COLORS.violet}>peers · focus · cursor</text>

        {/* SyncEngine ↔ DataStore */}
        <line x1={340} y1={60} x2={340} y2={110}
          stroke={COLORS.indigo} strokeWidth={2} />
        <text x={355} y={90} fontSize={9} fill={COLORS.indigo}>onChangeInvoke</text>
        <text x={355} y={102} fontSize={9} fill={COLORS.indigo}>applyRemotePatch</text>

        {/* SyncEngine ↔ Persistence */}
        <line x1={250} y1={155} x2={150} y2={200}
          stroke={COLORS.green} strokeWidth={1.5} />
        <text x={165} y={178} fontSize={9} fill={COLORS.green}>snapshot / patch log</text>
        <text x={165} y={190} fontSize={9} fill={COLORS.green}>value blobs</text>

        {/* SyncEngine ↔ Network */}
        <line x1={340} y1={180} x2={340} y2={220}
          stroke={COLORS.blue} strokeWidth={1.5} />
        <text x={355} y={206} fontSize={9} fill={COLORS.blue}>sendPatch / onPatch</text>
        <text x={355} y={218} fontSize={9} fill={COLORS.blue}>sendValue / requestValue</text>

        {/* SyncEngine ↔ Presence */}
        <line x1={430} y1={155} x2={530} y2={200}
          stroke={COLORS.violet} strokeWidth={1.5} />
        <text x={470} y={178} fontSize={9} fill={COLORS.violet}>sendLocalState</text>
        <text x={470} y={190} fontSize={9} fill={COLORS.violet}>onRemoteState</text>

        {/* ChangeSet note */}
        <rect x={10} y={100} width={180} height={55} rx={8}
          fill={COLORS.amberLight} stroke={COLORS.amber} strokeWidth={1.5}
          strokeDasharray="5,3" />
        <text x={100} y={119} textAnchor="middle" fontSize={11}
          fontWeight={700} fill={COLORS.amber}>SDS_ChangeSet</text>
        <text x={100} y={133} textAnchor="middle" fontSize={9}
          fill={COLORS.amber}>Record&lt;EntryId, Set&lt;prop&gt;&gt;</text>
        <text x={100} y={148} textAnchor="middle" fontSize={9}
          fill={COLORS.amber}>origin: 'internal' | 'external'</text>
        <line x1={190} y1={133} x2={220} y2={140}
          stroke={COLORS.amber} strokeWidth={1.5} strokeDasharray="4,3" />
      </svg>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Panel 6 — JWT / Auth model (WebSocket server)                            */
/* ══════════════════════════════════════════════════════════════════════════ */

function AuthModel () {
  return (
    <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
      <div style={{ flex:1, minWidth:280 }}>
        <ClassBox
          title="Admin JWT"
          subtitle="created by generate-admin-token.mjs"
          headerColor={COLORS.rose} headerBg={COLORS.roseLight}
          width={300}
          fields={[
            { name:'sub',   type:'string', note:'arbitrary subject' },
            { name:'aud',   type:'string', note:'StoreId — inherited by client' },
            { name:'scope', type:'"admin"' },
            { name:'iat',   type:'number' },
            { name:'exp',   type:'number' },
            { name:'iss',   type:'string', optional:true, note:'must match SDS_ISSUER' },
          ]}
        />
        <div style={{
          marginTop:12, fontSize:11, color:COLORS.textMid,
          borderLeft:`3px solid ${COLORS.rose}`, paddingLeft:10,
        }}>
          Wird per <code>POST /api/token</code> übergeben →
          Server leitet <code>aud</code> in das Client-Token weiter.
        </div>
      </div>
      <div style={{ flex:1, minWidth:260 }}>
        <ClassBox
          title="Client JWT"
          subtitle="issued by POST /api/token"
          headerColor={COLORS.blue} headerBg={COLORS.blueLight}
          width={280}
          fields={[
            { name:'sub',   type:'string', note:'PeerId (random UUID)' },
            { name:'aud',   type:'string', note:'StoreId (from admin token)' },
            { name:'scope', type:'"client"' },
            { name:'iat',   type:'number' },
            { name:'exp',   type:'number' },
            { name:'iss',   type:'string', optional:true },
          ]}
        />
        <div style={{
          marginTop:12, fontSize:11, color:COLORS.textMid,
          borderLeft:`3px solid ${COLORS.blue}`, paddingLeft:10,
        }}>
          Wird als <code>Token</code> in <code>SDS_ConnectionOptions</code>{' '}
          übergeben → <code>SDS_SyncEngine.connect(url, &#123; Token &#125;)</code>.
        </div>
      </div>
      <div style={{ flex:1, minWidth:240 }}>
        <ClassBox
          title="SDS_ConnectionOptions"
          subtitle="passed to SyncEngine.connect()"
          headerColor={COLORS.green} headerBg={COLORS.greenLight}
          width={240}
          fields={[
            { name:'Token',              type:'string',  note:'client JWT' },
            { name:'reconnectDelayMs',   type:'number',  optional:true, note:'default 2000' },
          ]}
        />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Panel 7 — Presence State                                                 */
/* ══════════════════════════════════════════════════════════════════════════ */

function PresenceModel () {
  return (
    <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
      <ClassBox
        title="SDS_LocalPresenceState"
        subtitle="gesendet über sendLocalState()"
        headerColor={COLORS.violet} headerBg={COLORS.violetLight}
        width={280}
        fields={[
          { name:'PeerId',    type:'string',  optional:true, note:'injected by engine' },
          { name:'UserName',  type:'string',  optional:true },
          { name:'UserColor', type:'string',  optional:true, note:'CSS color' },
          { name:'UserFocus', type:'object',  optional:true },
          { name:'  EntryId',   type:'string' },
          { name:'  Property',  type:'"Value"|"Label"|"Info"' },
          { name:'  Cursor',    type:'{ from, to }', optional:true, note:'literal only' },
          { name:'custom',    type:'unknown', optional:true, note:'arbitrary JSON' },
        ]}
      />
      <ClassBox
        title="SDS_RemotePresenceState"
        subtitle="empfangen via onRemoteState()"
        headerColor={COLORS.violet} headerBg={COLORS.violetLight}
        width={280}
        fields={[
          { name:'PeerId',  type:'string',  note:'always set for remote' },
          { name:'lastSeen',type:'number',  note:'Date.now()' },
          { name:'…',       type:'(all LocalPresenceState fields)' },
        ]}
      />
      <div style={{
        padding:12, background:COLORS.violetLight,
        border:`1px solid ${COLORS.violet}`,
        borderRadius:8, fontSize:12, color:COLORS.text,
        alignSelf:'flex-start',
      }}>
        <div style={{ fontWeight:700, marginBottom:6, color:COLORS.violet }}>
          SDS_ConnectionState
        </div>
        {['disconnected','connecting','connected','reconnecting'].map(s => (
          <div key={s} style={{
            fontFamily:'monospace', fontSize:11,
            padding:'2px 0', borderBottom:`1px solid ${COLORS.slateMid}`,
          }}>{s}</div>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Root Component                                                           */
/* ══════════════════════════════════════════════════════════════════════════ */

export default function SDSDataModel () {
  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      background: '#f8fafc', minHeight: '100vh', padding: '24px',
      color: COLORS.text,
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          marginBottom: 28, paddingBottom: 16,
          borderBottom: `2px solid ${COLORS.slateMid}`,
        }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900,
                       color: COLORS.indigo }}>
            SDS — Shareable Data Store
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: COLORS.textMid }}>
            Datenmodell-Visualisierung · v0.0.3
          </p>
        </div>

        <Section title="① Klassenstruktur (Entries)">
          <ClassHierarchy />
        </Section>

        <Section title="② Baumstruktur des Store">
          <StoreTree />
        </Section>

        <Section title="③ Serialisierungsformate (JSON · Binary)">
          <SerialFormats />
        </Section>

        <Section title="④ Provider-Interfaces">
          <Providers />
        </Section>

        <Section title="⑤ SyncEngine — Architektur">
          <SyncArch />
        </Section>

        <Section title="⑥ Auth-Modell (WebSocket Server · JWT)">
          <AuthModel />
        </Section>

        <Section title="⑦ Presence-Modell (Co-Editing Awareness)">
          <PresenceModel />
        </Section>

      </div>
    </div>
  )
}
