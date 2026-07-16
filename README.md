# V-WATCH AI-CORE: Vehicle Number Plate Identification & Cloned Plate Detection using AI/ML

V-WATCH is a fully-integrated AI-powered surveillance console designed for highway traffic divisions and municipal police forces. It consumes real-time video feeds from edge CCTV cameras, identifies vehicle bounding boundaries using **YOLOv8**, performs high-resolution license plate segmentation, reads characters using **EasyOCR**, extracts bodily property traits (dominant color, vehicle class, manufacturer, model), and executes a smart cross-referencing audit engine to identify duplicated/cloned license plates.

---

## 🚀 Key Architectural Modules

### 1. Computer Vision Pipeline (Edge Nodes)
- **Vehicle Detection & Tracking:** Uses a customized YOLOv8 structure to identify bounding boxes of vehicles and track them across frames (simulating DeepSORT trackers).
- **Plate Recognition & OCR:** Employs localized YOLO plate-segmentation models paired with **EasyOCR** text engines to accurately extract plate alpha-numerics under varying illumination constraints.
- **Visual Trait Profiler:** Fully extracts vehicle body classifications (`Car`, `Bike`, `Bus`, `Truck`, `Auto`, `Van`) and computes dominant color traits.

### 2. Dual-Verification Database Auditing (AI-CORE Engine)
- **RTO Registry Cross-Reference (Medium Risk):** Instantly cross-checks live-scanned traits (body type, manufacturer model, body color) against the official Regional Transport Office (RTO) registry database. Mismatches generate immediate Medium-Risk warnings.
- **Geodetic Velocity Audit (High Risk):** When a plate is scanned at Camera A and subsequently at Camera B within a timeframe, the system applies the geodetic **Haversine Formula** to compute exact physical distance in kilometers. If the required average speed (`Speed = Distance / Time`) exceeds a physical threshold (e.g. 180 km/h), the system flags a High-Risk **Cloned Vehicle Alert**.

---

## 🛠️ Technical Stack
- **Frontend Console:** React 19, TypeScript, Vite, Tailwind CSS, Lucide icons, Motion
- **Database:** SQLite (Relational SQL local DB simulator)
- **Backend Analytics Engine:** Python 3, Flask, SQLite3, Haversine, NumPy, Pandas, Scikit-Learn
- **Core ML Libraries:** PyTorch, Ultralytics YOLOv8, EasyOCR, OpenCV

---

## 📁 System Folder Structure
The workspace is laid out in a clean, professional, and modular pattern:
```text
├── /                       # Application root
│   ├── index.html          # Entry viewport HTML
│   ├── package.json        # Node.js dependencies configuration
│   ├── tsconfig.json       # TypeScript compiler parameters
│   ├── vite.config.ts      # Vite pipeline parameters
│   ├── requirements.txt    # Python backend ML library dependencies
│   ├── database.sql        # Core SQLite database schemas and seeds
│   ├── run.py              # Ready-to-run Python Pipeline simulator script
│   └── /src/               # Web Application codebase
│       ├── main.tsx        # Main entry bootstrap
│       ├── App.tsx         # Dashboard hub and business state manager
│       ├── types.ts        # Shared typescript models and entities
│       ├── mockData.ts     # Pre-loaded camera grids, RTO, and log datasets
│       ├── /utils/         
│       │   └── haversine.ts # Geodetic distance calculations
│       └── /components/    
│           ├── CCTVStream.tsx      # Dynamic visual canvas traffic stream simulation
│           ├── CloneAlertPanel.tsx # High-risk clone card comparison display
│           ├── RTORegistry.tsx     # Local database schema manager and record CRUD
│           ├── VehicleSearch.tsx   # Advanced audit logs explorer with filters
│           ├── StatisticsView.tsx  # Dynamic analytical bar-graphs and KPI charts
│           └── AIInvestigator.tsx  # Interactive Gemini-style Copilot chatbot investigator
```

---

## ⚙️ Setup & Installation Instructions

### Option A: Running the High-Fidelity Web UI Console (Vite + React)
No manual databases are needed; the React front-end compiles with full state persistence:
1. **Ensure Node.js v18+ is installed.**
2. **Install all frontend node modules:**
   ```bash
   npm install
   ```
3. **Run the local development server:**
   ```bash
   npm run dev
   ```
4. **Build the production static assets (`dist/` output):**
   ```bash
   npm run build
   ```

### Option B: Running the Python Pipeline Simulation Backend
If you want to run the python-native database ingestion scripts with simulated vehicle events:
1. **Prepare Python Environment:**
   ```bash
   pip install -r requirements.txt
   ```
2. **Provision local tables and execute traffic simulations:**
   ```bash
   python run.py
   ```
   This will immediately create `v_watch.db` inside your local directory, seed default cameras, insert starting RTO data, and simulate consecutive vehicle passings that trigger color-discrepancy (Medium Risk) and geodetic-time (High Risk) clone alerts.

---

## 📡 The Cloned Plate Engine Logic

### 1. Haversine Distance Formula
$$\text{haversine}(d) = \sin^2\left(\frac{\Delta\text{lat}}{2}\right) + \cos(\text{lat}_1)\cos(\text{lat}_2)\sin^2\left(\frac{\Delta\text{lon}}{2}\right)$$
$$d = 2R \cdot \text{arcsin}(\sqrt{\text{haversine}(d)})$$
*(Where $R = 6371\text{ km}$)*

### 2. Time-Velocity Impossibility Algorithm
- When plate `P` is detected at Camera $C_2$ at time $T_2$:
  1. Retrieve the immediate previous detection of plate `P` at any Camera $C_1$ at time $T_1$.
  2. Compute distance $d$ in km using the Haversine formula between GPS coordinates of $C_1$ and $C_2$.
  3. Compute elapsed time $\Delta T = T_2 - T_1$ in hours.
  4. Compute average required velocity $V = \frac{d}{\Delta T}$.
  5. If $V > 180\text{ km/h}$, generate a **High-Risk Clone Alert**.
