"use client";

/**
 * The building, drawn as a cutaway volume rather than a flat section.
 *
 * A section says what is inside. A cutaway says what is inside *and* that the
 * thing has mass — which matters here, because the argument is about a signal
 * failing to pass through a solid object. Flat linework asks the reader to
 * take the roof on trust; a slab with visible thickness does not.
 *
 * Projection is oblique, not true isometric: the cut face stays square to the
 * viewer so the route, the storeys and the labels are read straight on, and
 * only the depth is thrown back. True isometric would rotate the one plane
 * carrying all the information, buying realism at the cost of legibility.
 *
 * Everything is generated from LEVELS and DEPTH. Add a storey and the flanks,
 * slabs, roof and route all follow.
 */

/* Sized to hold the volume AND its annotations: depth reaches X1+DX, the
   roof rises to ROOF+DY, and the satellite label sits beyond both. */
const W = 780;
const H = 620;

/** The cut face. */
const X0 = 132;
const X1 = 432;
const ROOF = 150;
const GROUND = 545;

/** Depth thrown back and up. The whole sense of volume is these two numbers. */
const DX = 78;
const DY = -46;

const SLAB = 9; // slab thickness, in the cut face

const LEVELS = [
  { id: "G", label: "LOBBY" },
  { id: "1", label: "LEVEL 01" },
  { id: "2", label: "LEVEL 02" },
  { id: "3", label: "LEVEL 03" },
] as const;

const FLOOR_H = (GROUND - ROOF) / LEVELS.length;
const slabY = (i: number) => GROUND - i * FLOOR_H;

const STAIR_X0 = 316;
const STAIR_X1 = 412;
const TARGET = LEVELS.length - 1;
const WALK = 7;

/** Project a cut-face point back along the depth axis. */
const back = (x: number, y: number, t = 1): [number, number] => [
  x + DX * t,
  y + DY * t,
];
const pt = ([x, y]: [number, number]) => `${x},${y}`;
const quad = (a: [number, number], b: [number, number], c: [number, number], d: [number, number]) =>
  [a, b, c, d].map(pt).join(" ");

function flight(i: number) {
  const rightward = i % 2 === 0;
  return {
    xFrom: rightward ? STAIR_X1 - 10 : STAIR_X0 + 10,
    xTo: rightward ? STAIR_X0 + 10 : STAIR_X1 - 10,
    yFrom: slabY(i) - WALK,
    yTo: slabY(i + 1) - WALK,
  };
}

function routeVertices(): [number, number][] {
  const pts: [number, number][] = [];
  const g = GROUND - WALK;
  pts.push([30, g]);
  pts.push([201, g]);
  pts.push([flight(0).xFrom, g]);
  for (let i = 0; i < LEVELS.length - 1; i++) {
    const f = flight(i);
    pts.push([f.xFrom, f.yFrom]);
    pts.push([f.xTo, f.yTo]);
  }
  pts.push([210, slabY(TARGET) - WALK]);
  return pts;
}

function routePoints(): string {
  return routeVertices().map(pt).join(" ");
}

/**
 * The same geometry as a path `d`, for the courier's `offset-path`.
 *
 * Derived from the one vertex list rather than written out again, so the
 * figure walks the line the route actually draws.
 */
function routeD(): string {
  const pts = routeVertices();
  const [head, ...tail] = pts;
  return `M ${head[0]} ${head[1]} ` + tail.map(([x, y]) => `L ${x} ${y}`).join(" ");
}

/**
 * Where each callout attaches, taken from the route so the two cannot disagree.
 *
 * The drawing was accurate and unreadable - it assumed the reader already knew
 * why indoor delivery is hard. These pin ordinary words to the exact point on
 * the building where the thing happens, which is what makes the picture
 * explain itself instead of needing the paragraph beside it.
 */
function anchors(): Record<string, [number, number]> {
  const v = routeVertices();
  return {
    kerb: v[0],
    entrance: v[1],
    stair: [
      (flight(1).xFrom + flight(1).xTo) / 2,
      (flight(1).yFrom + flight(1).yTo) / 2,
    ],
    door: v[v.length - 1],
  };
}

type Callout = { id: string; at: string; title: string; body: string };

export function BuildingVolume({
  className = "",
  frame = "wide",
  callouts = [],
}: {
  className?: string;
  frame?: "wide" | "narrow";
  callouts?: readonly Callout[];
}) {
  // The narrow crop keeps the storeys and the climb, which is the story, but
  // must still contain the roof - the satellite stopping there is the point.
  const viewBox = frame === "narrow" ? "96 84 470 500" : `-20 0 ${W} ${H}`;

  const roofFront: [number, number] = [X0, ROOF];
  const roofFrontR: [number, number] = [X1, ROOF];

  return (
    <svg
      viewBox={viewBox}
      className={className}
      fill="none"
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Three tones only: the flank in shadow, the slab tops catching
            light, and the cut face open. Any more and the drawing starts
            competing with the route for attention. */}
        <linearGradient id="bv-flank" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-blueprint-mid)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="var(--color-blueprint)" stopOpacity="0.62" />
        </linearGradient>
        <linearGradient id="bv-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-surface)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--color-blueprint-wash)" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* ---- ground plane, thrown back so the building stands on something ---- */}
      <polygon
        points={quad([0, GROUND], [W, GROUND], back(W, GROUND), back(0, GROUND))}
        fill="var(--color-blueprint-wash)"
        opacity={0.5}
      />
      <line
        x1={0}
        y1={GROUND}
        x2={W}
        y2={GROUND}
        stroke="var(--color-rule-strong)"
        strokeWidth={1.2}
      />

      {/* ---- the far flank: the wall the cut reveals ---- */}
      <polygon
        points={quad(
          [X1, ROOF],
          back(X1, ROOF),
          back(X1, GROUND),
          [X1, GROUND]
        )}
        fill="url(#bv-flank)"
      />

      {/* ---- back wall, seen through the cutaway ---- */}
      <polygon
        points={quad(back(X0, ROOF), back(X1, ROOF), back(X1, GROUND), back(X0, GROUND))}
        fill="var(--color-blueprint-soft)"
        opacity={0.5}
      />

      {/* ---- roof: a top face with real thickness ---- */}
      <polygon
        points={quad(roofFront, roofFrontR, back(X1, ROOF), back(X0, ROOF))}
        fill="url(#bv-roof)"
        stroke="var(--color-blueprint-mid)"
        strokeWidth={0.8}
      />
      <polygon
        points={quad([X0, ROOF], [X1, ROOF], [X1, ROOF + SLAB], [X0, ROOF + SLAB])}
        fill="var(--color-blueprint-soft)"
        opacity={0.9}
      />

      {/* ---- storeys: each slab is a solid with a lit top and a shaded edge ---- */}
      {LEVELS.map((lvl, i) => {
        const y = slabY(i);
        return (
          <g key={lvl.id}>
            {/* slab top, receding */}
            <polygon
              points={quad([X0, y], [X1, y], back(X1, y), back(X0, y))}
              fill="var(--color-blueprint-soft)"
              opacity={0.62}
            />
            {/* slab edge, in the cut face - this is the thickness */}
            <polygon
              points={quad([X0, y], [X1, y], [X1, y + SLAB], [X0, y + SLAB])}
              fill="var(--color-blueprint)"
              opacity={0.72}
            />
            <line
              x1={X0}
              y1={y}
              x2={X1}
              y2={y}
              stroke="var(--color-blueprint)"
              strokeWidth={1}
              opacity={0.65}
            />
            {/* storey label, riding the receding slab so it reads as depth */}
            <text
              x={back(X1, y)[0] + 8}
              y={back(X1, y)[1] - 4}
              className="fill-[var(--color-faint)] font-mono"
              style={{ fontSize: 9, letterSpacing: "0.12em" }}
            >
              {lvl.label}
            </text>
          </g>
        );
      })}

      {/* ---- the stair core, boxed so it reads as a shaft not a zigzag ---- */}
      <polygon
        points={quad(
          [STAIR_X0, ROOF + SLAB],
          [STAIR_X1, ROOF + SLAB],
          back([STAIR_X1, GROUND][0], GROUND, 0.42),
          back([STAIR_X0, GROUND][0], GROUND, 0.42)
        )}
        fill="var(--color-surface)"
        opacity={0.35}
      />
      {[STAIR_X0, STAIR_X1].map((x) => (
        <line
          key={x}
          x1={x}
          y1={ROOF + SLAB}
          x2={x}
          y2={GROUND}
          stroke="var(--color-blueprint-mid)"
          strokeWidth={0.9}
          strokeDasharray="3 4"
        />
      ))}

      {/* ---- flights ---- */}
      {LEVELS.slice(0, -1).map((_, i) => {
        const f = flight(i);
        return (
          <line
            key={i}
            x1={f.xFrom}
            y1={f.yFrom + WALK}
            x2={f.xTo}
            y2={f.yTo + WALK}
            stroke="var(--color-blueprint)"
            strokeWidth={1.6}
            opacity={0.7}
          />
        );
      })}

      {/* ---- the cut face outline, drawn last so the volume reads as open ---- */}
      <polyline
        points={`${X0},${ROOF} ${X0},${GROUND}`}
        stroke="var(--color-blueprint)"
        strokeWidth={1.4}
      />
      <polyline
        points={`${X1},${ROOF} ${X1},${GROUND}`}
        stroke="var(--color-blueprint)"
        strokeWidth={1.4}
      />

      {/* ---- satellite: rays stop on the roof's top face ---- */}
      <g className="hero-rays">
        {[0.2, 0.45, 0.7].map((f, i) => {
          const x = X0 + (X1 - X0) * f;
          const [bx, by] = back(x, ROOF, 0.5);
          return (
            <line
              key={i}
              x1={bx - 62}
              y1={0}
              x2={bx}
              y2={by}
              stroke="var(--color-blueprint-mid)"
              strokeWidth={1}
              strokeDasharray="4 5"
            />
          );
        })}
        {/* The annotation belongs to the roof, so it is tied to it with a
            leader rather than floating in the sky above the building. The
            anchor sits on the roof's top face, which is the surface the fix
            actually lands on. */}
        <line
          x1={back(X1 - 40, ROOF, 0.55)[0]}
          y1={back(X1 - 40, ROOF, 0.55)[1]}
          x2={back(X1, ROOF)[0] + 6}
          y2={back(X1, ROOF)[1] - 2}
          stroke="var(--color-blueprint-mid)"
          strokeWidth={0.8}
        />
        <circle
          cx={back(X1 - 40, ROOF, 0.55)[0]}
          cy={back(X1 - 40, ROOF, 0.55)[1]}
          r={2.4}
          fill="var(--color-blueprint)"
        />
        <text
          x={back(X1, ROOF)[0] + 10}
          y={back(X1, ROOF)[1] - 4}
          className="fill-[var(--color-ink-2)] font-mono"
          style={{ fontSize: 9, letterSpacing: "0.12em" }}
        >
          SATELLITE FIX
        </text>
        <text
          x={back(X1, ROOF)[0] + 10}
          y={back(X1, ROOF)[1] + 8}
          className="fill-[var(--color-faint)] font-mono"
          style={{ fontSize: 8 }}
        >
          rooftop, outdoors
        </text>
      </g>

      {/* ---- the route: the only thing in signal colour, and the only thing
              that goes inside ---- */}
      <polyline
        points={routePoints()}
        stroke="var(--color-signal)"
        strokeWidth={3.2}
        strokeLinejoin="round"
        strokeLinecap="round"
        className="ascent-route"
      />

      {/* The courier, walking the route. Positioned entirely by `offset-path`,
          so the figure is drawn about its own origin - its feet. */}
      <g className="hero-courier" style={{ offsetPath: `path("${routeD()}")` }}>
        <Courier />
      </g>

      {/* where it starts: a satellite fix, at the kerb */}
      <g>
        <circle cx={30} cy={GROUND - WALK} r={9} fill="var(--color-blueprint)" opacity={0.16} />
        <circle cx={30} cy={GROUND - WALK} r={3} fill="var(--color-blueprint)" />
      </g>

      {/* where it ends: the detected drop-off, landing as the courier arrives */}
      <g className="hero-halo">
        <circle
          cx={210}
          cy={slabY(TARGET) - WALK}
          r={13}
          fill="var(--color-signal)"
          opacity={0.16}
        />
        <circle cx={210} cy={slabY(TARGET) - WALK} r={4} fill="var(--color-signal)" />
      </g>

      {/* ---- callouts: the drawing, explained in plain words ---- */}
      {callouts.map((c, i) => {
        const a = anchors()[c.at];
        if (!a) return null;
        const [ax, ay] = a;
        // Left of the building for the two low points, right for the two high
        // ones, so leaders never cross the route they are describing.
        const right = c.at === "stair" || c.at === "door";
        const lx = right ? X1 + DX + 14 : X0 - 150;
        const ly = ay - 6;

        return (
          <g
            key={c.id}
            className="volume-callout"
            style={{ "--callout-delay": `${900 + i * 260}ms` } as React.CSSProperties}
          >
            <line
              x1={ax}
              y1={ay}
              x2={right ? lx - 6 : lx + 138}
              y2={ly - 4}
              stroke="var(--color-signal)"
              strokeWidth={1}
              opacity={0.45}
            />
            <circle cx={ax} cy={ay} r={4.5} fill="var(--color-signal)" />
            <circle cx={ax} cy={ay} r={9} fill="var(--color-signal)" opacity={0.14} />
            <text
              x={lx}
              y={ly - 6}
              className="fill-[var(--color-ink)]"
              style={{ fontSize: 12, fontWeight: 500 }}
            >
              {c.title}
            </text>
            <text
              x={lx}
              y={ly + 9}
              className="fill-[var(--color-muted)]"
              style={{ fontSize: 10.5 }}
            >
              {c.body.length > 44 ? c.body.slice(0, 42) + "…" : c.body}
            </text>
          </g>
        );
      })}

      {/* ---- ground-level labels ---- */}
      <text
        x={30}
        y={GROUND + 22}
        className="fill-[var(--color-muted)] font-mono"
        style={{ fontSize: 9, letterSpacing: "0.12em" }}
      >
        STREET
      </text>
      <text
        x={201}
        y={GROUND + 22}
        className="fill-[var(--color-muted)] font-mono"
        style={{ fontSize: 9, letterSpacing: "0.12em" }}
      >
        ENTRANCE
      </text>
    </svg>
  );
}

/**
 * The courier: a figure carrying a parcel.
 *
 * Drawn as an architectural SCALE FIGURE, which is the convention a section
 * drawing already has for putting a person in it — a simple filled silhouette,
 * there to give the storeys a human measure. That is exactly what is wanted
 * here, so the figure belongs to the drawing rather than sitting on top of it
 * as a cartoon.
 *
 * ORIGIN IS AT THE FEET. `offset-path` translates the element's origin along
 * the route, and the route is the line the courier walks on, so (0,0) has to
 * be the soles or the figure floats above the line or sinks through it.
 * Everything below is therefore built in negative y.
 *
 * Scale: a storey here is 105 user units. Taking that as roughly 3m puts a
 * person at about 50 units, which is what this is — it reads as a person
 * against these floors rather than as a marker that happens to be person-shaped.
 *
 * Facing is deliberately neutral. The route zigzags, so the courier travels
 * right on one flight and left on the next; a figure with a clear front would
 * need to flip at every landing, and a silhouette that reads from both sides
 * costs nothing and never looks wrong.
 */
function Courier() {
  return (
    <g>
      {/*
        A backing pass in the canvas colour, drawn wider and underneath.

        The figure and the route are both signal-coloured — the figure IS the
        route's subject, so they should not be two different colours — but that
        meant the figure walked along a line of its own colour and, at the size
        this actually renders, dissolved into a thickening of it. The backing
        pass gives it a hairline of ground on every side, so it separates from
        whatever it happens to be standing on without introducing a third
        colour into a two-colour system.

        Both passes carry the same walk classes, and CSS animations of equal
        name and duration started in the same frame stay in lockstep, so the
        outline never lags the figure.
      */}
      {/*
        Scaled about the origin — which is the feet — so the figure grows
        upward and stays planted on the route.

        1.2 puts it at roughly 56 of the 105 units a storey occupies. Read as a
        3m floor-to-floor that is a person a little under 1.7m, so it is still
        a truthful scale figure; below this it was correct but too quiet to
        notice, which defeats the point of having drawn a person at all.
      */}
      <g transform="scale(1.2)">
        <CourierBody colour="var(--color-canvas)" pad={3.2} />
        <CourierBody colour="var(--color-signal)" pad={0} />
      </g>
    </g>
  );
}

/**
 * The courier's geometry, drawn at a given colour and stroke padding.
 *
 * Split out so the backing pass and the figure itself cannot drift apart —
 * there is one description of the body, used twice.
 */
function CourierBody({ colour, pad }: { colour: string; pad: number }) {
  const ink = colour;

  return (
    <g>
      {/*
        Legs, in two poses.

        The stride is drawn as a CLIMB, not a walk on the flat: the leading leg
        is bent with the knee lifted, as if reaching the next tread, and the
        trailing leg is extended straight down behind. That silhouette is what
        makes the figure read as going up rather than sliding up, which matters
        because the route it follows is a smooth diagonal.

        A first attempt used two straight lines at nearly the same angle with a
        heavy stroke, and the pair merged into one thick blob against the
        torso — at this size it looked like a person hopping on one leg. Hence
        the bend, the wider splay, and a stroke thinner than the torso's.
      */}
      <g
        className="walk-a"
        stroke={ink}
        strokeWidth={2.9 + pad}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* trailing leg, extended down and behind */}
        <path d="M0 -22 L -7.5 -1" />
        {/* leading leg, knee up onto the next tread */}
        <path d="M0 -22 L 6 -13 L 4.5 -3" />
      </g>
      <g
        className="walk-b"
        stroke={ink}
        strokeWidth={2.9 + pad}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* passing position: one leg planted, the other swinging through */}
        <path d="M0 -22 L -3.5 -12 L -2.5 -1" />
        <path d="M0 -22 L 4.5 -1" />
      </g>

      {/* Torso, head and parcel rise and fall together on each step. */}
      <g className="walk-bob">
        <line
          x1={0}
          y1={-22}
          x2={0}
          y2={-38}
          stroke={ink}
          strokeWidth={5 + pad}
          strokeLinecap="round"
        />
        {/* head — kept near an eighth of the figure's height; the first pass
            was noticeably too big and read as a mascot */}
        <circle cx={0} cy={-43.6} r={4.1 + pad / 2} fill={ink} />
        {/* the parcel, carried at chest height. It is the one detail at this
            size that says delivery rather than pedestrian. */}
        <rect
          x={4.5}
          y={-34}
          width={9}
          height={9}
          rx={1}
          fill={pad ? ink : "var(--color-canvas)"}
          stroke={ink}
          strokeWidth={1.8 + pad}
        />
        {/* the arm under it */}
        <line
          x1={0}
          y1={-31}
          x2={5.5}
          y2={-28}
          stroke={ink}
          strokeWidth={2.5 + pad}
          strokeLinecap="round"
        />
      </g>
    </g>
  );
}
