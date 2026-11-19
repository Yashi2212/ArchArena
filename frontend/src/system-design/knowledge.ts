export interface Reading {story:string;simple:string;pro:string;flow:string[];example:string;tradeoff:string;pitfall:string;sources:string[];status:string;ownerVerified:boolean}
export const sources:Record<string,{title:string;url:string}> = {
  "primer": {
    "title": "System Design Primer — Donne Martin",
    "url": "https://github.com/donnemartin/system-design-primer"
  },
  "http": {
    "title": "MDN: HTTP overview",
    "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview"
  },
  "pg": {
    "title": "PostgreSQL: transaction isolation",
    "url": "https://www.postgresql.org/docs/current/transaction-iso.html"
  },
  "replication": {
    "title": "PostgreSQL: standby servers",
    "url": "https://www.postgresql.org/docs/current/warm-standby.html"
  },
  "java": {
    "title": "Oracle Java 21: record classes",
    "url": "https://docs.oracle.com/en/java/javase/21/language/records.html"
  },
  "spring": {
    "title": "Spring: declarative transactions",
    "url": "https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative.html"
  },
  "h3": {
    "title": "Uber Engineering: H3 (2018)",
    "url": "https://www.uber.com/blog/h3/"
  },
  "fulfillment": {
    "title": "Uber Engineering: fulfillment rearchitecture (2021)",
    "url": "https://www.uber.com/blog/fulfillment-platform-rearchitecture/"
  },
  "javaObjects": {
    "title": "Dev.java: classes and objects",
    "url": "https://dev.java/learn/classes-objects/"
  },
  "concurrency": {
    "title": "Oracle Java 21: concurrency utilities",
    "url": "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/package-summary.html"
  }
};
export const readings:Record<string,Reading> = {
  "hld-1": {
    "story": "A clear order helps a team build the right thing.",
    "simple": "Requirements name users, core actions and qualities such as latency, privacy or availability. Scope also says what the design excludes. A system can only be evaluated meaningfully against these goals; a list of technologies is not a requirement.",
    "pro": "Convert important goals into observable acceptance conditions. Clarify the critical write invariant before splitting services or selecting storage.",
    "flow": [
      "Users",
      "Actions",
      "Quality goals",
      "Scope"
    ],
    "example": "A proposed ride-hailing interview can include assignment and cancellation while excluding pooled rides.",
    "tradeoff": "A narrow first release is easier to validate but postpones useful features.",
    "pitfall": "Do not replace business requirements with product names.",
    "sources": [
      "primer"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "hld-2": {
    "story": "Count the visitors before choosing the size of the room.",
    "simple": "Capacity estimation converts assumed usage into request rates, retained data and concurrency. Keep average and peak demand separate, and count reads and writes independently. Raw record bytes exclude indexes, replicas, backups and protocol overhead.",
    "pro": "In a stable workload, average in-flight work is approximately arrival rate multiplied by average time in the system. Bursts and tail latency need separate investigation.",
    "flow": [
      "Daily events",
      "Average and peak rates",
      "Retention",
      "Headroom"
    ],
    "example": "Assumption: 86,400 creates per day means one create per second on average. A peak multiplier is a separate assumption.",
    "tradeoff": "Headroom costs resources; insufficient headroom can turn bursts into queues and timeouts.",
    "pitfall": "A precise estimate is still an assumption, not company telemetry.",
    "sources": [
      "primer"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "hld-3": {
    "story": "A message needs an address, a route and a reply.",
    "simple": "A request crosses naming, transport, application and storage boundaries. HTTP defines request/response semantics; it does not guarantee that a repeated business action is harmless. Each boundary needs a timeout and an error contract.",
    "pro": "Separate transport failure, application rejection and uncertain outcomes after a timeout. Authentication identifies a caller; authorization permits an action on an object.",
    "flow": [
      "Client",
      "HTTP boundary",
      "Application",
      "Storage"
    ],
    "example": "A proposed create-trip API returns an operation id so a caller can check status after losing a response.",
    "tradeoff": "Synchronous calls simplify a flow but couple its response time to dependencies.",
    "pitfall": "A timeout does not prove the server did no work.",
    "sources": [
      "http"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "hld-4": {
    "story": "A receptionist sends work to an available desk.",
    "simple": "A load balancer distributes work across eligible backends. Its routing and health policies determine where requests go. Adding service replicas can help only when that tier is constrained; a shared database or external dependency can remain the bottleneck.",
    "pro": "Compare arrival demand and service capacity per tier. Treat health detection, stateful sessions and failover as explicit design decisions.",
    "flow": [
      "Clients",
      "Load balancer",
      "Service replicas",
      "Shared dependency"
    ],
    "example": "ArchArena branches uniformly. Change replicas with the same seed and inspect whether pressure moves to the database.",
    "tradeoff": "Routing adds operational work; locality-oriented policies can distribute load unevenly.",
    "pitfall": "More application servers do not automatically scale database writes.",
    "sources": [
      "primer"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "hld-5": {
    "story": "Keep a useful copy close to the reader.",
    "simple": "A cache stores reusable results so some reads avoid repeated work. A design needs a key, source of truth, expiry or invalidation policy, and acceptable freshness. A miss consults the source; cache failure must have an explicit recovery path.",
    "pro": "Cache-aside is one possible pattern: look up, load on a miss, then populate. Consider hot keys, simultaneous misses and stale entries.",
    "flow": [
      "Read",
      "Cache lookup",
      "Load on miss",
      "Return"
    ],
    "example": "A proposed catalog cache can tolerate description staleness; seat ownership should not rely on a cached count.",
    "tradeoff": "Caching reduces repeated reads while adding freshness and invalidation complexity.",
    "pitfall": "A high hit ratio does not eliminate writes or prove correctness.",
    "sources": [
      "primer"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "hld-6": {
    "story": "Organize a collection around the questions readers ask.",
    "simple": "A relational model connects entities, keys and constraints to access patterns. An index is another lookup structure that may avoid scanning every row for a suitable query. It consumes storage and adds write maintenance, so its value depends on filters, ordering and real data distribution.",
    "pro": "Choose uniqueness constraints from invariants. Review query plans with realistic workloads instead of assuming an index name proves efficiency.",
    "flow": [
      "Queries",
      "Keys and constraints",
      "Indexes",
      "Query plan"
    ],
    "example": "A proposed trip-history index can start with rider id and creation time; another access pattern may need another structure.",
    "tradeoff": "Normalization reduces duplication; derived read models can simplify queries but need repair and freshness rules.",
    "pitfall": "Adding an index to every column is not a storage strategy.",
    "sources": [
      "primer"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "hld-7": {
    "story": "A second copy may receive changes later than the first.",
    "simple": "Replication copies changes to another database instance. It may support failover or read workloads, but acknowledgment and replay rules determine what clients observe. Followers may lag. Read replicas do not automatically expand a single write authority.",
    "pro": "Specify acknowledgment, read freshness and failover behavior separately. The simulator models fixed lag on one synthetic record, not real WAL replay or durability.",
    "flow": [
      "Primary write",
      "Propagation",
      "Follower replay",
      "Read policy"
    ],
    "example": "A client who just changed a profile may need a read from the writer rather than an arbitrary follower.",
    "tradeoff": "Waiting for more acknowledgments changes latency and availability; asynchronous copies can be stale.",
    "pitfall": "Replication is not a tested backup.",
    "sources": [
      "replication"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "hld-8": {
    "story": "A waiting line absorbs a burst only while there is room.",
    "simple": "A queue separates acceptance from processing. Workers remove jobs as capacity becomes available. If demand stays above that capacity, backlog grows until a limit or rejection policy intervenes. Backpressure asks producers to slow down rather than assuming infinite buffering.",
    "pro": "Specify queue capacity, acknowledgment, duplicates, retries and poison-job handling. Acceptance into a queue is not completion of the business action.",
    "flow": [
      "Producer",
      "Bounded queue",
      "Workers",
      "Completion"
    ],
    "example": "A proposed image service can return an accepted job id and expose processing status separately.",
    "tradeoff": "Buffering smooths bursts but adds waiting and retained state.",
    "pitfall": "A queue cannot permanently fix insufficient downstream capacity.",
    "sources": [
      "primer"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "hld-9": {
    "story": "An entrance policy controls how quickly work is admitted.",
    "simple": "Rate limiting enforces an arrival budget for a caller or resource. Define the key, unit, observation rule and permitted burst. This differs from a concurrency limit, which bounds occupied slots rather than the arrival rate.",
    "pro": "A token budget can permit bursts while refilling over time. Distributed enforcement adds coordination and failure questions. Count policy rejections separately from processing errors.",
    "flow": [
      "Caller key",
      "Quota rule",
      "Allow or reject",
      "Retry guidance"
    ],
    "example": "A proposed guest demo can combine a global resource budget and a per-guest experiment quota.",
    "tradeoff": "Strict shared coordination improves consistency but creates another dependency; local estimates may overshoot in aggregate.",
    "pitfall": "An IP address is not always one user.",
    "sources": [
      "primer"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "hld-10": {
    "story": "A spare desk helps only if it can take over.",
    "simple": "Availability concerns whether users can complete an intended operation. Redundancy helps only when state, routing and failover work together. Identify shared failure domains and define acceptable degraded behavior for each important action.",
    "pro": "Use an explicit observation window and success definition. Recovery time and potential data loss are distinct requirements.",
    "flow": [
      "Critical action",
      "Failure domain",
      "Degraded mode",
      "Recovery"
    ],
    "example": "A proposed service may keep order-status reads available while refusing a new payment whose outcome is uncertain.",
    "tradeoff": "Redundancy adds cost and coordination; fail-open behavior can violate a security or business invariant.",
    "pitfall": "Component uptime is not automatically an end-to-end guarantee.",
    "sources": [
      "primer"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "hld-11": {
    "story": "A poor division can leave one desk overloaded.",
    "simple": "Partitioning divides data or work across owners. The key determines routing, locality and the scope of coordination. A hot key can overload an owner even when aggregate capacity looks sufficient. Moving ownership needs a migration protocol.",
    "pro": "Compare distribution, cross-partition queries and rebalancing. Consistent hashing is a placement technique, not a solution to every popularity imbalance.",
    "flow": [
      "Partition key",
      "Owner lookup",
      "Local work",
      "Rebalance"
    ],
    "example": "A proposed city partition keeps many trip actions local, but a very busy city may dominate one owner.",
    "tradeoff": "More partitions spread work while complicating joins, transactions and operations.",
    "pitfall": "Uniform identifiers do not imply uniformly popular requests.",
    "sources": [
      "primer"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "hld-12": {
    "story": "Two people must not both own the final seat.",
    "simple": "Consistency requirements describe allowed observations and concurrent outcomes. Transactions group work inside a database boundary; isolation governs concurrent interactions. The business invariant determines what requires coordination, not the database brand.",
    "pro": "Write a concrete race and its forbidden outcome. Database isolation semantics differ, and the chosen contract must handle conflicts or retries.",
    "flow": [
      "Invariant",
      "Concurrent requests",
      "Atomic decision",
      "Conflict"
    ],
    "example": "A proposed conditional driver-assignment transition lets one request win and returns a conflict to the loser.",
    "tradeoff": "Stronger coordination can introduce waiting; relaxed observations need an explicit freshness boundary.",
    "pitfall": "A local transaction does not roll back every remote side effect.",
    "sources": [
      "pg"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "hld-13": {
    "story": "A repeated instruction should not create a second purchase.",
    "simple": "A retry may repeat work whose earlier outcome is unknown. Idempotency gives one logical operation a stable identity and defined duplicate behavior. Durable records must handle in-progress, completed and conflicting reuse, not merely remember a key in memory.",
    "pro": "Bind the key to caller and canonical operation input. Define retention, bounded backoff, jitter and an overall deadline; retries consume capacity.",
    "flow": [
      "Operation id",
      "Durable claim",
      "Protected work",
      "Stored response"
    ],
    "example": "ArchArena stores a request hash and rejects a simulation key reused with changed input. This is not payment idempotency.",
    "tradeoff": "Remembering results costs storage; aggressive retries can amplify overload.",
    "pitfall": "A timeout does not authorize an unlimited retry loop.",
    "sources": [
      "primer"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "hld-14": {
    "story": "An envelope delivered and a task completed are different events.",
    "simple": "Messaging connects producers and consumers across time. An acknowledgment has a specific transport or processing meaning; it does not automatically prove a business effect happened once. Consumers need duplicate, ordering and replay rules.",
    "pro": "Assign stable event identities and versions. Explain the crash boundary between applying a result and acknowledging it.",
    "flow": [
      "Producer",
      "Broker",
      "Consumer effect",
      "Acknowledgment"
    ],
    "example": "A proposed projection can record the processed event identity with its state before acknowledging.",
    "tradeoff": "Durable buffering improves recovery while adding lag and operational state.",
    "pitfall": "Exactly-once wording without a named boundary is incomplete.",
    "sources": [
      "primer"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "hld-15": {
    "story": "A searchable catalog is a copy, not the original record.",
    "simple": "A search index or projection organizes authoritative data for another read pattern. Updates create a freshness boundary. Deletion, privacy changes and rebuilding need propagation rules; copies do not remain correct automatically.",
    "pro": "Define the source of truth, event ordering and a restartable backfill that tolerates concurrent changes.",
    "flow": [
      "Source",
      "Change stream",
      "Projection",
      "Query"
    ],
    "example": "A proposed job index may lag ordinary edits, while privacy restrictions require an authoritative access check.",
    "tradeoff": "Fast specialized reads duplicate state and need repair procedures.",
    "pitfall": "Search results do not bypass authorization.",
    "sources": [
      "primer"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "hld-16": {
    "story": "A live conversation must survive a lost connection.",
    "simple": "Real-time systems maintain sessions or repeatedly exchange updates. Connections drop and clients reconnect elsewhere. Specify connection ownership and how a client recovers missed updates; an open connection alone does not establish ordering, durability or access rights.",
    "pro": "Choose an ordering scope and resume cursor. Separate transient presence from authoritative state, and check access during reconnect.",
    "flow": [
      "Client",
      "Connection owner",
      "Updates",
      "Resume cursor"
    ],
    "example": "A proposed chat client resumes from its last acknowledged conversation sequence.",
    "tradeoff": "Long-lived connections reduce repeated setup but retain state and require recovery behavior.",
    "pitfall": "Presence is not proof of receipt.",
    "sources": [
      "http"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "hld-17": {
    "story": "Large packages need a delivery path separate from their labels.",
    "simple": "Media systems separate metadata from large object bytes. Upload validation, processing and delivery have different failure and resource profiles. Publishing must identify which version was accepted and processed rather than exposing incomplete or unauthorized objects.",
    "pro": "Define completion, ownership, processing retries and download authorization. An object key is not an access policy.",
    "flow": [
      "Upload",
      "Validate/process",
      "Object store",
      "Authorized delivery"
    ],
    "example": "A proposed video remains private until its processing state permits playback.",
    "tradeoff": "Separating byte delivery adds lifecycle, cleanup and access-control complexity.",
    "pitfall": "A guessable object URL cannot be the only protection for private media.",
    "sources": [
      "primer"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "hld-18": {
    "story": "Nearby is not the same as available for a job.",
    "simple": "Geospatial discovery narrows candidates by area or distance. Matching then applies availability and business rules. Late location updates require freshness checks separate from the exclusive assignment decision.",
    "pro": "A spatial index helps lookup, not the assignment transaction. Track timestamps or versions and reject offers that no longer match current state.",
    "flow": [
      "Location update",
      "Spatial candidates",
      "Availability",
      "Exclusive assignment"
    ],
    "example": "A proposed ride-hailing system checks driver freshness before an authoritative ownership transition.",
    "tradeoff": "Finer cells change query fan-out and update volume; larger cells return more irrelevant candidates.",
    "pitfall": "A geographic index does not prevent double assignment.",
    "sources": [
      "h3"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "hld-19": {
    "story": "Replacing the coordinator does not stop the old one instantly.",
    "simple": "Distributed coordination assigns a right to act across processes. Failure detection is uncertain: a slow or partitioned process may still run. Leadership and leases must explain how stale actors are prevented from changing authoritative state.",
    "pro": "A fencing epoch helps only if the target resource enforces it. Define the authority transition and recovery assumptions.",
    "flow": [
      "Claim",
      "Epoch",
      "Work",
      "Reject stale epoch"
    ],
    "example": "ArchArena lease tokens reject a stale worker completion. This is job fencing, not a consensus implementation.",
    "tradeoff": "Coordination simplifies ownership but adds availability and dependency concerns.",
    "pitfall": "A local lock does not coordinate independent JVMs.",
    "sources": [
      "primer"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "hld-20": {
    "story": "Two offices need a rule for conflicting edits.",
    "simple": "Multi-region design changes latency, failure domains and ownership. Define which region accepts a write and what happens during lost connectivity. A second region does not define conflict resolution, failover safety or a durable acknowledgment point by itself.",
    "pro": "Specify routing, replication, recovery objectives and authority transfer. Test failover and failback with writes before and during an incident.",
    "flow": [
      "Routing",
      "Write authority",
      "Regional copy",
      "Recovery"
    ],
    "example": "A proposed design can give an entity a home region and explicitly refuse writes when that authority is unreachable.",
    "tradeoff": "Remote coordination adds latency; independent writes require a conflict policy.",
    "pitfall": "A failover drawing without a state transition is incomplete.",
    "sources": [
      "primer"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "hld-21": {
    "story": "A useful alarm tells you where to look next.",
    "simple": "Observability connects user outcomes with selected internal evidence. Metrics aggregate behavior, logs record events, and instrumented traces link work across boundaries. Diagnose demand, successful throughput, errors and waiting as distinct signals.",
    "pro": "Bound label cardinality, sampling and retention. Correlation identifiers should connect evidence without exposing secrets or user content.",
    "flow": [
      "Symptom",
      "Outcomes",
      "Dependency signals",
      "Diagnosis"
    ],
    "example": "Compare arrivals, successful throughput and queue depth before concluding that a slow tier merely needs replicas.",
    "tradeoff": "More telemetry costs storage and may expose sensitive information.",
    "pitfall": "Averages can hide harmful tail latency.",
    "sources": [
      "primer"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "hld-22": {
    "story": "Knowing a visitor does not authorize every action.",
    "simple": "Authentication establishes a caller; authorization checks a particular operation and object. Review inputs and trust boundaries explicitly. Resource limits, parameterized access, safe rendering and secrets handling protect different boundaries.",
    "pro": "Enforce access on server-side reads, writes and exports. Review CSRF under the actual cookie/token model rather than a generic checklist.",
    "flow": [
      "Identity",
      "Ownership",
      "Validated action",
      "Audit signal"
    ],
    "example": "The local-owner ArchArena API needs a public principal-to-owner model before unrelated visitors share it.",
    "tradeoff": "Central policies reduce duplication but still need enforcement on every path.",
    "pitfall": "Hiding a button is not authorization.",
    "sources": [
      "primer"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "hld-23": {
    "story": "Grow the system where evidence shows pressure.",
    "simple": "Architecture evolution begins with a clear workload and a simpler deployable design. Separate estimates from actual cost and measured performance. A migration needs compatibility, rollback and observation so a changed boundary does not silently lose data or break callers.",
    "pro": "Use measured constraints and recovery requirements to justify added components. Explain an initial deployment and its next growth step.",
    "flow": [
      "Workload",
      "Constraint",
      "Migration",
      "Rollback"
    ],
    "example": "A proposed portfolio can separate public hosting from short-lived cloud practice and retain teardown evidence.",
    "tradeoff": "Additional services may isolate resources while increasing operational work.",
    "pitfall": "Illustrative model weights are not a cloud bill.",
    "sources": [
      "primer"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "hld-24": {
    "story": "Tell one complete story from the action to recovery.",
    "simple": "An end-to-end design connects scope, assumptions, APIs, data, flow and a difficult failure or concurrency decision. Explain why the boundaries fit. Component count is less useful than a coherent critical path and observable outcomes.",
    "pro": "Deep-dive one invariant and bottleneck. Defend an alternative and name evidence that would change your choice.",
    "flow": [
      "Scope",
      "Estimate",
      "HLD",
      "Deep dive/recovery"
    ],
    "example": "The ride-hailing reference connects location freshness, candidate lookup, assignment and trip-state transitions.",
    "tradeoff": "Limited interview time requires explicit exclusions and a focused deep dive.",
    "pitfall": "Throughput simulation does not prove business correctness.",
    "sources": [
      "primer"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "lld-1": {
    "story": "Give each teammate a clear job.",
    "simple": "Objects group state and behavior around a responsibility. A useful class boundary follows a rule or lifecycle, not merely a table. Keeping business decisions apart from transport and storage makes them easier to reason about and test.",
    "pro": "Separate application orchestration, domain invariants and adapters. A service coordinates a command; the domain rule decides whether it is allowed.",
    "flow": [
      "Controller",
      "Service",
      "Domain",
      "Repository"
    ],
    "example": "A trip-state rule should not depend on an HTTP response class.",
    "tradeoff": "Too many tiny classes obscure a flow; one class owning everything is hard to change.",
    "pitfall": "Layer names do not prove responsibilities are separate.",
    "sources": [
      "javaObjects"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "lld-2": {
    "story": "Agree on the handoff before selecting the tool.",
    "simple": "An interface expresses behavior a caller relies on. An adapter implements infrastructure behind that contract. Keep interfaces focused on meaningful operations and explicit outcomes rather than leaking storage mechanics everywhere.",
    "pro": "Use ports where substitution has a purpose. A fake adapter helps isolated testing but does not prove a real integration.",
    "flow": [
      "Caller",
      "Interface",
      "Adapter",
      "Resource"
    ],
    "example": "Proposed sketch: AssignmentResult tryAssign(DriverId driver, TripId trip, long expectedVersion).",
    "tradeoff": "Abstractions enable substitution while adding indirection.",
    "pitfall": "Identify the variation before introducing a pattern.",
    "sources": [
      "javaObjects",
      "primer"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "lld-3": {
    "story": "Make a ticket valid when it is created.",
    "simple": "Value objects represent meaningful identifiers, money or coordinates and enforce their rules at a boundary. Java records reduce data-carrier boilerplate, but a record can contain mutable objects and is not automatically deeply immutable.",
    "pro": "Use explicit types and units. Decide how nulls, ranges and nested mutable collections are handled.",
    "flow": [
      "Input",
      "Validation",
      "Value object",
      "Operation"
    ],
    "example": "Original sketch: record TripId(java.util.UUID value) {}. A real constructor must decide whether null is valid.",
    "tradeoff": "Precise types improve contracts but require deliberate conversions.",
    "pitfall": "Final record fields do not freeze a contained mutable list.",
    "sources": [
      "java"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "lld-4": {
    "story": "A contract explains both the reply and the refusal.",
    "simple": "An API contract names inputs, outputs, errors, ownership and duplicate behavior. Distinguish business conflicts from unexpected failures and explicitly map domain outcomes to transport responses.",
    "pro": "Decide validation, authorization and idempotency before implementation. An uncertain result can require reconciliation rather than blind retry.",
    "flow": [
      "DTO",
      "Authorization",
      "Domain result",
      "Response"
    ],
    "example": "A proposed accept-offer API distinguishes success, stale offer and assignment conflict.",
    "tradeoff": "Detailed errors help recovery but need safe disclosure and versioning.",
    "pitfall": "Internal exception text is not a public contract.",
    "sources": [
      "http"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "lld-5": {
    "story": "Store the state required to enforce the rule.",
    "simple": "Entities have identity and lifecycle. Mapping connects them to rows, keys and constraints. A repository should offer invariant-preserving operations rather than making every caller reconstruct a safe read/write sequence.",
    "pro": "Specify uniqueness, versioning and transaction scope. An ORM does not choose correct concurrency behavior automatically; ArchArena currently uses JDBC.",
    "flow": [
      "Entity",
      "Repository",
      "Constraint/version",
      "Stored row"
    ],
    "example": "A proposed assignment row includes driver, active trip and an expected version.",
    "tradeoff": "Object and relational boundaries need not match one-to-one.",
    "pitfall": "A field annotation alone does not establish ownership.",
    "sources": [
      "pg",
      "spring"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "lld-6": {
    "story": "Only some moves are legal from the current position.",
    "simple": "A state machine names states and allowed transitions. Commands must account for duplicates, races and late events. A state check without a protected transition can still be invalidated by another actor.",
    "pro": "Use a version or transition guard and define terminal-state behavior. Side effects need their own repeat/reconciliation boundary.",
    "flow": [
      "Current state",
      "Guard",
      "Transition",
      "Event"
    ],
    "example": "Proposed teaching states: requested, offered, assigned, in-progress, completed or canceled. These are not claims about Uber internals.",
    "tradeoff": "Explicit states help reasoning but require evolution for new workflows.",
    "pitfall": "A switch statement alone does not protect a concurrent transition.",
    "sources": [
      "javaObjects",
      "primer"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "lld-7": {
    "story": "Two hands reaching for one item need one winning decision.",
    "simple": "Concurrency starts with an invariant and an interleaving that breaks it. Check-then-act can race when state changes between the read and write. Choose an atomic boundary at the authority that owns the state.",
    "pro": "An in-memory lock does not protect independent instances. Return conflicts explicitly and test the losing path.",
    "flow": [
      "Commands",
      "Atomic boundary",
      "Winner",
      "Conflict"
    ],
    "example": "Two proposed riders can both read available, but only one conditional assignment should commit.",
    "tradeoff": "Coordination can add waiting or retries; avoiding it may weaken the invariant.",
    "pitfall": "One synchronized JVM is not the whole fleet.",
    "sources": [
      "concurrency",
      "pg"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "lld-8": {
    "story": "Remember the instruction rather than just the packet.",
    "simple": "Idempotent handling gives duplicates of one logical command consistent outcomes. Bind a key to caller and input, reserve it atomically, and record progress and result durably. Specify concurrent duplicates and conflicting reuse.",
    "pro": "The idempotency record and protected change need a consistent recovery boundary and explicit expiry semantics.",
    "flow": [
      "Caller/key",
      "Reservation",
      "Change",
      "Result"
    ],
    "example": "ArchArena rejects a simulation key reused with different input and keeps stored admission results.",
    "tradeoff": "Longer history improves replay protection but consumes storage.",
    "pitfall": "A cache-only deduplication flag can disappear in a crash.",
    "sources": [
      "pg",
      "primer"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "lld-9": {
    "story": "Agree which changes succeed together.",
    "simple": "A transaction boundary groups related local state changes. An application service often owns that boundary while repositories perform access. An external call does not normally join the same local transaction automatically.",
    "pro": "Spring declarative transactions rely on configured infrastructure and invocation behavior. Test rollback and real dependency behavior.",
    "flow": [
      "Command",
      "Local transaction",
      "Commit",
      "Follow-up"
    ],
    "example": "A proposed order transaction writes order state and an outgoing event record together.",
    "tradeoff": "Long transactions retain resources; splitting work needs a recovery protocol.",
    "pitfall": "Local rollback does not automatically refund an external charge.",
    "sources": [
      "spring"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "lld-10": {
    "story": "Store an outgoing message beside the state change.",
    "simple": "An outbox stores an event with a local business change. A relay publishes it later, narrowing the state-commit/notification gap. The relay may still duplicate publication; consumers need safe processing and replay behavior.",
    "pro": "Use event identity, aggregate version and schema version. Recover from a crash after publication but before recording relay completion.",
    "flow": [
      "State + outbox",
      "Relay",
      "Broker",
      "Consumer"
    ],
    "example": "A proposed trip transition atomically writes a new state version and its outgoing event.",
    "tradeoff": "A relay adds lag and operational state.",
    "pitfall": "An outbox is not universal exactly-once business execution.",
    "sources": [
      "primer",
      "pg"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "lld-11": {
    "story": "Choose a pattern because a real behavior varies.",
    "simple": "Patterns organize recurring responsibilities. Their value comes from a concrete variation or interaction, not their count. A strategy can isolate alternatives; a state model can clarify lifecycle decisions.",
    "pro": "Explain the varying behavior, caller contract and test boundary before adding indirection.",
    "flow": [
      "Variation",
      "Contract",
      "Implementations",
      "Tests"
    ],
    "example": "A proposed candidate-ranking strategy varies independently from exclusive assignment.",
    "tradeoff": "Indirection helps extension but can make the main flow harder to follow.",
    "pitfall": "Pattern names do not replace a request sequence.",
    "sources": [
      "javaObjects",
      "primer"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "lld-12": {
    "story": "A useful test tries to catch a broken rule.",
    "simple": "Test success, invalid input, unauthorized access, duplicates, conflicts and recovery. A test mirroring implementation steps can miss the business invariant. Control a concurrent interleaving instead of trusting a lucky race.",
    "pro": "Use independent oracles and real integrations for dependency semantics. An H2 test does not certify PostgreSQL locking.",
    "flow": [
      "Given state",
      "Action/failure",
      "Result",
      "Invariant"
    ],
    "example": "An assignment test expects one winner, one conflict and one active ownership row.",
    "tradeoff": "Fast isolated tests and slower integration tests answer different questions.",
    "pitfall": "Green cases are evidence for what ran, not universal correctness.",
    "sources": [
      "concurrency",
      "pg"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "lld-13": {
    "story": "A page boundary should not lose the next item.",
    "simple": "Pagination defines traversal under changing data and a declared sort order. A cursor continues that ordering. Schema evolution must preserve existing callers or provide an explicit migration.",
    "pro": "Define tie-breaking, cursor validity and access checks. Even additive changes can break strict readers, so test compatibility.",
    "flow": [
      "Ordering",
      "Cursor",
      "Next page",
      "Compatibility"
    ],
    "example": "A proposed history cursor pairs creation time and a unique id to resolve ties.",
    "tradeoff": "Opaque cursors permit evolution but require validation and lifecycle rules.",
    "pitfall": "A cursor must not authorize access to another owner.",
    "sources": [
      "http",
      "pg"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "lld-14": {
    "story": "A stopped wait can leave work running elsewhere.",
    "simple": "Resilience policies specify deadlines, bounded retries, cancellation and circuit behavior per dependency. The request-wide deadline constrains attempts. Repeating a non-idempotent external effect without an operation identity can repeat a charge.",
    "pro": "Distinguish local cancellation from confirmed remote cancellation, and preserve evidence for uncertain outcomes.",
    "flow": [
      "Deadline",
      "Attempt budget",
      "Retry",
      "Recovery"
    ],
    "example": "ArchArena models timed-out local work still consuming slots; it never calls a real external API.",
    "tradeoff": "Recovery mechanisms consume capacity and can reject useful work during incidents.",
    "pitfall": "Unbounded retries can sustain an overload.",
    "sources": [
      "concurrency",
      "primer"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "lld-15": {
    "story": "Check the visitor and the object on every route.",
    "simple": "Command handlers validate inputs and enforce object access before changing or returning protected state. Reads, writes, deletes and exports need the same model. Bounds and parameterized queries do not replace authorization.",
    "pro": "Resolve identity server-side and test cross-user denial; a browser-supplied owner id is not proof.",
    "flow": [
      "Identity",
      "Object access",
      "Bounded command",
      "Response"
    ],
    "example": "The local demo needs public principal-to-owner mapping before unrelated users share it.",
    "tradeoff": "Central policy helps only if every protected path enforces it.",
    "pitfall": "Hidden buttons are not access control.",
    "sources": [
      "http",
      "primer"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  },
  "lld-16": {
    "story": "Follow one command from the door to the result.",
    "simple": "A Java walkthrough connects DTOs, application orchestration, domain rules, ports and outcomes. Explain the sequence before class details, then follow a duplicate, conflict or dependency failure through the same boundaries.",
    "pro": "Separate contract sketches from executable implementations, and use actual tests for claims about behavior.",
    "flow": [
      "Controller",
      "Service",
      "Domain/repository",
      "Result"
    ],
    "example": "A proposed matching command names validation, conditional ownership, conflict outcome and a controlled concurrency test.",
    "tradeoff": "Layering is useful only while rules and responsibilities stay understandable.",
    "pitfall": "Do not call a signature sketch production code.",
    "sources": [
      "javaObjects",
      "spring"
    ],
    "status": "source-linked-local-preview",
    "ownerVerified": false
  }
};
